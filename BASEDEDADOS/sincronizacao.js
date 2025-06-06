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
import NetInfo from '@react-native-community/netinfo';
import { buscarUsuarioAtual } from './user';
import {
  criarSubCategoriaAPI,
  atualizarSubCategoriaAPI,
  deletarSubCategoriaAPI
} from '../APIs/sub_categorias';
import { baixarImagemParaLocal } from '../APIs/upload_imgbb';
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
    else if (tipo === 'user') {
      if (operacao === 'update') {
        const userAtual = await buscarUsuarioAtual();
        const token = userAtual?.token;

        if (!token) {
          throw new Error('Token não encontrado para sincronizar o usuário.');
        }

        let imagemUrl = dados.imagem;

        // 📤 Se a imagem for local (não for link), faz upload para Imgur
        if (imagemUrl && !imagemUrl.startsWith('http')) {
          const urlUpload = await uploadImagemParaImgur(imagemUrl);
          if (urlUpload) {
            imagemUrl = urlUpload;
          } else {
            console.warn('⚠️ Falha no upload da imagem. Sincronização cancelada.');
            return false; // ou jogar erro, conforme sua lógica
          }
        }

        // Prepara payload final
        const payload = {
          nome: dados.nome,
          ...(imagemUrl && { imagem: imagemUrl }),
          ...(dados.password && {
            password: dados.password,
            password_confirmation: dados.password
          })
        };

        const resposta = await fetch(`${API_BASE_URL}/perfil`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
          const texto = await resposta.text();
          throw new Error(`Erro da API ao atualizar perfil: ${texto}`);
        }

        console.log('✅ Perfil do usuário sincronizado com sucesso.');
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

async function listarSincronizacoesPendentes() {
  try {
    const db = await CRIARBD();
    const resultado = await db.getAllAsync('SELECT * FROM sincronizacoes');
    return resultado; // retorna todas as pendentes
  } catch (error) {
    console.error('Erro ao listar sincronizações pendentes:', error);
    return [];
  }
}


const API_BASE_URL = 'https://faturas-backend.onrender.com/api';

async function sincronizar_api_app_subcategorias() {
  const estado = await NetInfo.fetch();
  if (!estado.isConnected || !estado.isInternetReachable) {
    console.warn('⚠️ Sem internet. Não é possível sincronizar com a API.');
    return;
  }

  try {
    const db = await CRIARBD();
    const user = await buscarUsuarioAtual();

    const resposta = await fetch(`${API_BASE_URL}/listar_categorias_user?updated_since=2020-01-01T00:00:00Z`, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      }
    });

    const subcategoriasApi = await resposta.json();
    if (!Array.isArray(subcategoriasApi)) {
      console.log('ℹ️ Nenhuma subcategoria nova na API.');
      return;
    }
    for (const sub of subcategoriasApi) {
      const existente = await db.getFirstAsync(
        `SELECT * FROM sub_categorias WHERE remote_id = ?`,
        [sub.id]
      );

      const updatedApi = new Date(sub.updated_at);
      const updatedLocal = existente ? new Date(existente.updated_at) : null;

      if (!existente) {
        // Inserir nova subcategoria
        await db.runAsync(
          `INSERT INTO sub_categorias 
            (remote_id, nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [sub.id, sub.nome_subcat, sub.icone_nome, sub.cor_subcat, sub.categoria_id, sub.updated_at, 'synced']
        );
        console.log('🆕 Subcategoria inserida da API → app:', sub.nome_subcat);
      } else if (updatedApi > updatedLocal) {
        // Atualizar subcategoria existente
        await db.runAsync(
          `UPDATE sub_categorias SET 
            nome_subcat = ?, icone_nome = ?, cor_subcat = ?, categoria_id = ?, updated_at = ?, sync_status = ?
           WHERE remote_id = ?`,
          [sub.nome_subcat, sub.icone_nome, sub.cor_subcat, sub.categoria_id, sub.updated_at, 'synced', sub.id]
        );
        console.log('🔄 Subcategoria atualizada da API → app:', sub.nome_subcat);
      } else {
        console.log('✅ Subcategoria local já atualizada:', sub.nome_subcat);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao sincronizar subcategorias da API → app:', error);
    throw error;
  }
}
async function sincronizar_api_app_movimentos() {
  const estado = await NetInfo.fetch();
  if (!estado.isConnected || !estado.isInternetReachable) {
    console.warn('⚠️ Sem internet. Não é possível sincronizar com a API.');
    return;
  }

  try {
    const db = await CRIARBD();
    const user = await buscarUsuarioAtual();

    const resposta = await fetch(`${API_BASE_URL}/listar_movimentos_user?updated_since=2020-01-01T00:00:00Z`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        Accept: 'application/json'
      }
    });

    const conteudo = await resposta.json();
    if (!Array.isArray(conteudo)) {
      console.log('ℹ️ Nenhum movimento novo encontrado na API.');
      return;
    }

    for (const mov of conteudo) {
      const existente = await db.getFirstAsync(
        `SELECT * FROM movimentos WHERE remote_id = ?`,
        [mov.id]
      );

      const updatedApi = new Date(mov.updated_at);
      const updatedLocal = existente ? new Date(existente.updated_at) : null;

      if (!existente) {
        await db.runAsync(
          `INSERT INTO movimentos 
            (remote_id, valor, data_movimento, categoria_id, sub_categoria_id, nota, updated_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            mov.id,
            parseFloat(mov.valor),
            mov.data_movimento,
            mov.categoria_id,
            mov.sub_categoria_id,
            mov.nota ?? null,
            mov.updated_at,
            'synced'
          ]
        );
        console.log('🆕 Movimento inserido da API → app (ID remoto):', mov.id);
      } else if (updatedApi > updatedLocal) {
        await db.runAsync(
          `UPDATE movimentos SET 
            valor = ?, data_movimento = ?, categoria_id = ?, sub_categoria_id = ?, nota = ?, updated_at = ?, sync_status = ?
           WHERE remote_id = ?`,
          [
            parseFloat(mov.valor),
            mov.data_movimento,
            mov.categoria_id,
            mov.sub_categoria_id,
            mov.nota ?? null,
            mov.updated_at,
            'synced',
            mov.id
          ]
        );
        console.log('🔄 Movimento atualizado da API → app (ID remoto):', mov.id);
      } else {
        console.log('✅ Movimento local já está atualizado:', mov.id);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao sincronizar movimentos da API → app:', error);
    throw error;
  }
}

async function sincronizar_api_app_faturas() {
  const estado = await NetInfo.fetch();
  if (!estado.isConnected || !estado.isInternetReachable) {
    console.warn('⚠️ Sem internet. Não é possível sincronizar com a API.');
    return;
  }

  try {
    const db = await CRIARBD();
    const user = await buscarUsuarioAtual();

    const resposta = await fetch(`${API_BASE_URL}/listar_faturas_user?updated_since=2020-01-01T00:00:00Z`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        Accept: 'application/json'
      }
    });

    const conteudo = await resposta.json();
    if (!Array.isArray(conteudo)) {
      console.log('ℹ️ Nenhuma fatura nova encontrada na API.');
      return;
    }

    for (const fat of conteudo) {
      // 📥 Baixa a imagem da fatura
      const imagemLocal = fat.imagem_fatura
        ? await baixarImagemParaLocal(fat.imagem_fatura)
        : null;

      const existente = await db.getFirstAsync(
        `SELECT * FROM faturas WHERE remote_id = ?`,
        [fat.id]
      );

      const updatedApi = new Date(fat.updated_at);
      const updatedLocal = existente ? new Date(existente.updated_at) : null;

      if (!existente) {
        await db.runAsync(
          `INSERT INTO faturas (
            remote_id, movimento_id, tipo_documento, numero_fatura, codigo_ATCUD, data_fatura,
            nif_emitente, nome_empresa, nif_cliente, descricao,
            total_iva, total_final, imagem_fatura,
            updated_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fat.id,
            fat.movimento_id,
            fat.tipo_documento,
            fat.numero_fatura,
            fat.codigo_ATCUD,
            fat.data_fatura,
            fat.nif_emitente,
            fat.nome_empresa ?? 'Empresa',
            fat.nif_cliente,
            fat.descricao,
            parseFloat(fat.total_iva),
            parseFloat(fat.total_final),
            imagemLocal,
            fat.updated_at,
            'synced'
          ]
        );
        console.log('🆕 Fatura inserida da API → app (ID remoto):', fat.id);
      } else if (updatedApi > updatedLocal) {
        await db.runAsync(
          `UPDATE faturas SET 
            tipo_documento = ?, numero_fatura = ?, codigo_ATCUD = ?, data_fatura = ?,
            nif_emitente = ?, nome_empresa = ?, nif_cliente = ?, descricao = ?,
            total_iva = ?, total_final = ?, imagem_fatura = ?, updated_at = ?, sync_status = ?
           WHERE remote_id = ?`,
          [
            fat.tipo_documento,
            fat.numero_fatura,
            fat.codigo_ATCUD,
            fat.data_fatura,
            fat.nif_emitente,
            fat.nome_empresa ?? 'Empresa',
            fat.nif_cliente,
            fat.descricao,
            parseFloat(fat.total_iva),
            parseFloat(fat.total_final),
            imagemLocal,
            fat.updated_at,
            'synced',
            fat.id
          ]
        );
        console.log('🔄 Fatura atualizada da API → app (ID remoto):', fat.id);
      } else {
        console.log('✅ Fatura local já está atualizada:', fat.id);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao sincronizar faturas da API → app:', error);
    throw error;
  }
}
async function sincronizar_api_app_user() {
  const estado = await NetInfo.fetch();
  if (!estado.isConnected || !estado.isInternetReachable) {
    console.warn('⚠️ Sem internet. Não é possível sincronizar o perfil.');
    return;
  }

  try {
    const db = await CRIARBD();
    const user = await buscarUsuarioAtual();
    const token = user?.token;

    if (!token) throw new Error('Token do usuário não encontrado.');

    const ultimaSync = user?.ultima_sincronizacao || new Date().toISOString();

    const resposta = await fetch(`${API_BASE_URL}/perfil?updated_since=${encodeURIComponent(ultimaSync)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const dados = await resposta.json();

    if (dados?.mensagem) {
      console.log('ℹ️ Nenhuma atualização de perfil.');
      return;
    }

    const { nome, email, imagem, updated_at } = dados;
    // 📥 Baixa a imagem para armazenamento local
    const imagemLocal = imagem ? await baixarImagemParaLocal(imagem) : null;

    await db.runAsync(`
  UPDATE user SET 
    nome = ?, email = ?, imagem = ?, ultima_sincronizacao = ?
  WHERE id = ?
`, [nome, email, imagemLocal, new Date().toISOString(), user.id]);


    console.log('🔄 Perfil sincronizado com sucesso.');

    console.log('✅ Perfil atualizado da API → app com imagem local:', imagemLocal);

  } catch (error) {
    console.error('❌ Erro ao sincronizar perfil do usuário:', error);
    throw error;
  }
}


async function sincronizarTudoApiParaApp() {
  console.log('🔄 Iniciando sincronização API → App...');

  try {
    await sincronizar_api_app_user();
    await sincronizar_api_app_subcategorias();
    await sincronizar_api_app_movimentos();
    await sincronizar_api_app_faturas();

    console.log('✅ Sincronização completa da API → App.');
  } catch (error) {
    console.error('❌ Falha durante sincronização API → App:', error);
    throw error; // ⬅️ importante para que o botão principal capte
  }
}


async function sincronizarTudoAppParaApi() {
  console.log('🚀 Iniciando sincronização App → API...');
  const pendentes = await listarSincronizacoesPendentes();

  if (pendentes.length === 0) {
    console.log('✅ Nenhuma sincronização pendente.');
    return;
  }

  for (const item of pendentes) {
    const sucesso = await processarItemDeSincronizacao(item);
    if (!sucesso) {
      console.warn(`⛔ Falha ao processar item da fila (ID ${item.id})`);
      // opcional: parar ou continuar com os próximos
    }
  }

  console.log('✅ Sincronização App → API concluída.');
}

export {
  criarTabelaSincronizacoes,
  adicionarNaFila,
  processarItemDeSincronizacao,
  listarSincronizacoes,
  limparFilaDeSincronizacao,
  atualizarPayloadCreateNaFila,
  listarSincronizacoesPendentes,
  sincronizarTudoApiParaApp,
  sincronizarTudoAppParaApi
};