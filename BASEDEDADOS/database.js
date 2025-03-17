import * as SQLite from 'expo-sqlite';
import { criarTabelaCategorias, verificarEInserirCategorias, apagarTodasCategorias,resetarCategorias } from './categorias';
import { criarTabelaTipoMovimento, inserirVariosTiposMovimento } from './tipo_movimento';
import { criarTabelaMovimentos,inserirVariosMovimentos } from './movimentos';


async function CRIARBD() {
  try {

    const db = await SQLite.openDatabaseAsync('app.db');

    if (db) {
      console.log("✅ Base de dados'app.db' aberta com sucesso!");
    } else {
      console.error("❌ Erro: O banco de dados retornou 'null' ou 'undefined'.");
    }
  } catch (error) {
    console.error("❌ Erro ao abrir o banco de dados:", error);
    throw error;
  }
}

async function inicializarBaseDeDados() {

  try {
    await CRIARBD();
    //CATEGORIAS
    await criarTabelaCategorias(); /*await resetarCategorias();*/  await verificarEInserirCategorias(); 
   
    //TIPOS_MOVIMENTOS
    await criarTabelaTipoMovimento(); await inserirVariosTiposMovimento();
   
    //MOVIMENTOS
    await criarTabelaMovimentos();await inserirVariosMovimentos();


    console.log('🎉 Todas as tabelas foram inicializadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro na inicialização das tabelas:', error);
  }
}


export { inicializarBaseDeDados };
