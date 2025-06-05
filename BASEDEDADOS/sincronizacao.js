import { CRIARBD } from './databaseInstance';
import {
  criarFaturaAPI,
  atualizarFaturaAPI,
  deletarFaturaAPI
} from '../APIs/faturas';
import { uploadImagemParaImgur } from '../APIs/upload_imgbb';
import {
  criarMovimentoAPI,
  atualizarMovimentoAPI,
  deletarMovimentoAPI
} from '../APIs/movimentos';

import {
  criarSubCategoriaAPI,
  atualizarSubCategoriaAPI,
  deletarSubCategoriaAPI
} from '../APIs/sub_categorias';

async function criarTabelaSincronizacoes() {
  const db = await CRIARBD();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sincronizacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,            -- ex: 'sub_categorias', 'movimentos', etc.
      operacao TEXT NOT NULL,        -- ex: 'create', 'update', 'delete'
      payload TEXT NOT NULL,         -- conteúdo do dado em JSON
      remote_id INTEGER,             -- se aplicável (update/delete)
      created_at TEXT NOT NULL       -- para garantir ordem de execução
    );
  `);
}
async function listarSincronizacoes() {
  try {
    const db = await CRIARBD();
    const resultado = await db.getAllAsync('SELECT * FROM sincronizacoes ORDER BY created_at DESC');
    return resultado;
  } catch (error) {
    console.error('Erro ao listar sincronizações:', error);
    return [];
  }
}

async function adicionarNaFila(tipo, operacao, dados, remoteId = null) {
  const db = await CRIARBD();
  const payload = JSON.stringify(dados);
  const createdAt = new Date().toISOString();

  await db.runAsync(`
    INSERT INTO sincronizacoes (tipo, operacao, payload, remote_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [tipo, operacao, payload, remoteId, createdAt]);
  console.log('📥 Adicionado à fila de sincronizações:', {
    tipo,
    operacao,
    remoteId,
    created_at: createdAt,
    payload: dados
  });
}

async function processarItemDeSincronizacao(item) {
  const db = await CRIARBD();
  const { id, tipo, operacao, payload, remote_id } = item;
  const dados = JSON.parse(payload);

  try {
    if (tipo === 'faturas') {
      if (tipo === 'faturas') {
        if (operacao === 'create') {

          // 🖼️ Se a imagem ainda não for um link (não começa com http)
          if (dados.imagem_fatura && !dados.imagem_fatura.startsWith('http')) {
            const urlImgur = await uploadImagemParaImgur(dados.imagem_fatura);

            if (urlImgur) {
              dados.imagem_fatura = urlImgur;
            } else {
              console.warn('⚠️ Falha ao fazer upload para Imgur');
            }
          }

          const faturaCriada = await criarFaturaAPI(dados);

          await db.runAsync(
            `UPDATE faturas SET remote_id = ?, sync_status = 'synced' WHERE id = ?`,
            [faturaCriada.id, dados.id]
          );
        }
      }
      else if (operacao === 'update') {
        await atualizarFaturaAPI(remote_id, dados);
      } else if (operacao === 'delete') {
        await deletarFaturaAPI(remote_id);
      }
    }

    else if (tipo === 'movimentos') {
      if (operacao === 'create') {
        const movimentoCriado = await criarMovimentoAPI(dados);
        await db.runAsync(
          `UPDATE movimentos SET remote_id = ?, sync_status = 'synced' WHERE id = ?`,
          [movimentoCriado.id, dados.id]  // <- dados.id é o id local que estava no payload
        );
        // 2. Atualiza payloads de faturas na fila que usam esse movimento local
        const faturasPendentes = await db.getAllAsync(
          `SELECT id, payload FROM sincronizacoes
   WHERE tipo = 'faturas' AND operacao = 'create'`
        );

        for (const f of faturasPendentes) {
          const payload = JSON.parse(f.payload);

          if (payload.movimento_id === dados.id) {
            const novoPayload = {
              ...payload,
              movimento_id: movimentoCriado.id  // ← agora usa o remote_id do movimento
            };

            await db.runAsync(
              `UPDATE sincronizacoes SET payload = ? WHERE id = ?`,
              [JSON.stringify(novoPayload), f.id]
            );

            console.log(`🔄 Atualizado movimento_id da fatura (sync ID ${f.id}) para remote_id ${movimentoCriado.id}`);
          }
        }
      } else if (operacao === 'update') {
        await atualizarMovimentoAPI(remote_id, dados);
      } else if (operacao === 'delete') {
        await deletarMovimentoAPI(remote_id);
      }
    }

    else if (tipo === 'sub_categorias') {
      if (operacao === 'create') {
        // 1. Cria remotamente a subcategoria
        const subcatCriada = await criarSubCategoriaAPI(dados);

        // 2. Atualiza a subcategoria local com o remote_id
        await db.runAsync(
          `UPDATE sub_categorias SET remote_id = ?, sync_status = 'synced' WHERE id = ?`,
          [subcatCriada.id, dados.id]
        );

        const subcategoriaAtualizada = await db.getFirstAsync(
          `SELECT * FROM sub_categorias WHERE remote_id = ?`,
          [subcatCriada.id]
        );

        console.log('📦 Subcategoria atualizada:', subcategoriaAtualizada);

        // 3. Atualiza fila de sincronização de subcategorias (update/delete)
        const filaReferente = await db.getAllAsync(
          `SELECT id, payload FROM sincronizacoes
     WHERE tipo = 'sub_categorias' AND operacao IN ('update', 'delete')`
        );

        for (const item of filaReferente) {
          const payload = JSON.parse(item.payload);

          if (payload.id === dados.id) {
            await db.runAsync(
              `UPDATE sincronizacoes SET remote_id = ? WHERE id = ?`,
              [subcatCriada.id, item.id]
            );
            console.log(`🔁 remote_id atualizado para ${subcatCriada.id} em sincronização pendente (ID sync: ${item.id})`);
          }
        }

        // 4. Atualiza fila de sincronização de movimentos que referem à subcategoria local
        const filaMovimentos = await db.getAllAsync(
          `SELECT id, payload FROM sincronizacoes
     WHERE tipo = 'movimentos' AND operacao IN ('create', 'update')`
        );

        for (const item of filaMovimentos) {
          const payload = JSON.parse(item.payload);

          if (payload.sub_categoria_id === dados.id) {
            payload.sub_categoria_id = subcatCriada.id; // substitui pelo remote_id

            await db.runAsync(
              `UPDATE sincronizacoes SET payload = ? WHERE id = ?`,
              [JSON.stringify(payload), item.id]
            );

            console.log(`🔁 sub_categoria_id atualizado para ${subcatCriada.id} na sincronização de movimento (ID sync: ${item.id})`);
          }
        }
      }
      else if (operacao === 'update') {
        await atualizarSubCategoriaAPI(remote_id, dados);
      } else if (operacao === 'delete') {
        await deletarSubCategoriaAPI(remote_id);
      }
    }

    // ✅ Remove da fila após sucesso
    await db.runAsync('DELETE FROM sincronizacoes WHERE id = ?', [id]);
    console.log(`✅ Item sincronizado e removido da fila (${tipo}/${operacao})`);
    return true;

  } catch (err) {
    console.warn(`❌ Falha ao sincronizar item (${tipo}/${operacao} - ID ${id}):`, err.message);
    return false;
  }
}

async function limparFilaDeSincronizacao() {
  try {
    const db = await CRIARBD();
    await db.runAsync('DELETE FROM sincronizacoes');
    console.log('🧹 Fila de sincronização limpa com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao limpar fila de sincronização:', error);
  }
}

async function atualizarPayloadCreateNaFila(tipo, idLocal, novoPayload) {
  const db = await CRIARBD();

  // 1. Buscar o payload antigo
  const antigo = await db.getFirstAsync(
    `SELECT payload FROM sincronizacoes 
     WHERE tipo = ? AND operacao = 'create' 
       AND json_extract(payload, '$.id') = ?`,
    [tipo, idLocal]
  );

  if (!antigo) {
    console.warn(`⚠️ Nenhuma entrada encontrada para atualizar payload de tipo=${tipo} e id=${idLocal}`);
    return;
  }

  const payloadAntigo = JSON.parse(antigo.payload);
  console.log('🔎 Payload antes da atualização:', payloadAntigo);

  // 2. Fazer merge (mantém dados antigos e sobrescreve só os novos)
  const payloadAtualizado = {
    ...payloadAntigo,
    ...novoPayload,
    id: idLocal // garante que o ID permaneça
  };

  // 3. Atualiza na base
  await db.runAsync(
    `UPDATE sincronizacoes SET payload = ? 
     WHERE tipo = ? AND operacao = 'create' 
       AND json_extract(payload, '$.id') = ?`,
    [JSON.stringify(payloadAtualizado), tipo, idLocal]
  );

  console.log('✅ Payload atualizado para:', payloadAtualizado);
}



export {
  criarTabelaSincronizacoes,
  adicionarNaFila,
  processarItemDeSincronizacao,
  listarSincronizacoes,
  limparFilaDeSincronizacao,
  atualizarPayloadCreateNaFila

};