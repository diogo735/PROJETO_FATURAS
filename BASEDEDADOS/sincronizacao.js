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

 async function adicionarNaFila(tipo, operacao, dados, remoteId = null) {
  const db = await CRIARBD();
  const payload = JSON.stringify(dados);
  const createdAt = new Date().toISOString();

  await db.executeSql(`
    INSERT INTO sincronizacoes (tipo, operacao, payload, remote_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [tipo, operacao, payload, remoteId, createdAt]);
}

 async function processarFilaDeSincronizacao() {
  const db = await CRIARBD();
  const fila = await db.executeSql('SELECT * FROM sincronizacoes ORDER BY created_at ASC');

  for (const item of fila[0].rows._array) {
    const { id, tipo, operacao, payload, remote_id } = item;
    const dados = JSON.parse(payload);

    try {
      if (tipo === 'sub_categorias') {
        if (operacao === 'create') {
          const response = await api.post('/sub_categorias', dados);
          // depois de sucesso, remove da fila
          await db.executeSql('DELETE FROM sincronizacoes WHERE id = ?', [id]);
        } else if (operacao === 'update') {
          await api.put(`/sub_categorias/${remote_id}`, dados);
          await db.executeSql('DELETE FROM sincronizacoes WHERE id = ?', [id]);
        } else if (operacao === 'delete') {
          await api.delete(`/sub_categorias/${remote_id}`);
          await db.executeSql('DELETE FROM sincronizacoes WHERE id = ?', [id]);
        }
      }

      // ✨ Adiciona lógica semelhante para 'movimentos' e 'faturas' quando necessário

    } catch (err) {
      console.warn(`❌ Falha ao sincronizar item da fila ID ${id}:`, err.message);
      // não remove da fila, ele tentará de novo mais tarde
    }
  }
}


export {
 criarTabelaSincronizacoes,
 adicionarNaFila,
 processarFilaDeSincronizacao

};