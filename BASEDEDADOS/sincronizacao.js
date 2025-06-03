import { CRIARBD } from './databaseInstance';

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

async function processarFilaDeSincronizacao() {
  const db = await CRIARBD();
  const fila = await db.runAsync('SELECT * FROM sincronizacoes ORDER BY created_at ASC');

  for (const item of fila[0].rows._array) {
    const { id, tipo, operacao, payload, remote_id } = item;
    const dados = JSON.parse(payload);

    try {
      if (tipo === 'sub_categorias') {
        if (operacao === 'create') {
          await api.post('/sub_categorias', dados);
        } else if (operacao === 'update') {
          await api.put(`/sub_categorias/${remote_id}`, dados);
        } else if (operacao === 'delete') {
          await api.delete(`/sub_categorias/${remote_id}`);
        }
      }

      if (tipo === 'movimentos') {
        if (operacao === 'create') {
          await api.post('/movimentos', dados);
        } else if (operacao === 'update') {
          await api.put(`/movimentos/${remote_id}`, dados);
        } else if (operacao === 'delete') {
          await api.delete(`/movimentos/${remote_id}`);
        }
      }

      if (tipo === 'faturas') {
        if (operacao === 'create') {
          await api.post('/faturas', dados);
        } else if (operacao === 'update') {
          await api.put(`/atualizar_fatura/${remote_id}`, dados);
        } else if (operacao === 'delete') {
          await api.delete(`/faturas/${remote_id}`);
        }
      }

      // ✅ remove da fila após sucesso
      await db.runAsync('DELETE FROM sincronizacoes WHERE id = ?', [id]);

    } catch (err) {
      console.warn(`❌ Falha ao sincronizar item da fila ID ${id} (${tipo}/${operacao}):`, err.message);
      // ❌ não remove da fila — tentará novamente no futuro
    }
  }
}



export {
  criarTabelaSincronizacoes,
  adicionarNaFila,
  processarFilaDeSincronizacao,
  listarSincronizacoes

};