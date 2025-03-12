import * as SQLite from 'expo-sqlite';
import { criarTabelaCategorias,verificarEInserirCategorias,apagarTodasCategorias } from './categorias'; 




async function CRIARBD() {
  try {
    
    const db = await SQLite.openDatabaseAsync('app.db');

    if (db) {
      console.log("✅ Banco de dados 'app.db' aberto com sucesso!");
    } else {
      console.error("❌ Erro: O banco de dados retornou 'null' ou 'undefined'.");
    }
  } catch (error) {
    console.error("❌ Erro ao abrir o banco de dados:", error);
    throw error; // Lança o erro para que ele possa ser tratado em outro lugar
  }
}

async function inicializarBaseDeDados() {
  
  try {
    await CRIARBD();
    await criarTabelaCategorias(); {/*await apagarTodasCategorias();*/}
    await verificarEInserirCategorias();
    console.log('🎉 Todas as tabelas foram inicializadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro na inicialização das tabelas:', error);
  }
}


export {  inicializarBaseDeDados };
