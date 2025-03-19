import * as SQLite from 'expo-sqlite';
import { CRIARBD } from './databaseInstance';

async function criarTabelaTipoMovimento() {
    try {
      const db = await CRIARBD();
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS tipo_movimento (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome_movimento TEXT NOT NULL
      );`
        );
        //console.log('Tabela criada tipo_movimentos');
    } catch (error) {
        console.error('❌ Erro ao criar tabela "tipo_movimento":', error);
    }
}

async function inserirVariosTiposMovimento() {
    try {
      const db = await CRIARBD();
      const result = await db.getFirstAsync(`SELECT COUNT(*) as total FROM tipo_movimento;`);
      
      if (result.total === 0) {
        await db.runAsync(
          `INSERT INTO tipo_movimento (nome_movimento) VALUES (?), (?);`,
          ["Receita", "Despesa"]
        );
        //console.log("✅ Tipos de movimento inseridos: Receita e Despesa");
      } else {
        //console.log("✅ Tipos de movimento já existem no banco.");
      }
    } catch (error) {
      console.error('❌ Erro ao inserir tipos de movimento:', error);
    }
  }


async function listarTiposMovimento() {
    try {
      const db = await CRIARBD();
        const result = await db.getAllAsync('SELECT * FROM tipo_movimento;');
        console.log('📌 Tipos de movimento encontrados:', result);
        return result;
    } catch (error) {
        console.error('❌ Erro ao buscar tipos de movimento:', error);
    }
}


async function apagarTodosTiposMovimento() {
    try {
      const db = await CRIARBD();
        const result = await db.runAsync(`DELETE FROM tipo_movimento;`);
        console.log(`🗑 Todos os tipos de movimento foram apagados! Registros afetados: ${result.changes}`);
    } catch (error) {
        console.error('❌ Erro ao apagar tipos de movimento:', error);
    }
}


export { criarTabelaTipoMovimento, inserirVariosTiposMovimento, listarTiposMovimento, apagarTodosTiposMovimento };
