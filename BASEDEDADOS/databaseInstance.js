import * as SQLite from 'expo-sqlite';

let db = null;

async function CRIARBD() {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync('app.db');

      if (db) {
        console.log("✅ Base de dados 'app.db' aberta com sucesso!");

        // Ativar chaves estrangeiras
        await db.execAsync('PRAGMA foreign_keys = ON;');
        //console.log("🔗 Integridade referencial (foreign_keys) ativada!");
      } else {
        console.error("❌ Erro: O banco de dados retornou 'null' ou 'undefined'.");
        db = null;
      }
    } catch (error) {
      console.error("❌ Erro ao abrir o banco de dados:", error);
      throw error;
    }
  }
  return db;
}

export { CRIARBD };
