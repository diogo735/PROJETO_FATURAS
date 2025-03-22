import * as SQLite from 'expo-sqlite';
import { criarTabelaCategorias, verificarEInserirCategorias, apagarTodasCategorias,resetarCategorias } from './categorias';
import { criarTabelaTipoMovimento, inserirVariosTiposMovimento } from './tipo_movimento';
import { criarTabelaMovimentos,inserirVariosMovimentos } from './movimentos';
import { CRIARBD } from './databaseInstance';

async function inicializarBaseDeDados() {

  try {

    
  await CRIARBD();
    //CATEGORIAS
    await criarTabelaCategorias(); /*await resetarCategorias();*/  await verificarEInserirCategorias(); 
   
    //TIPOS_MOVIMENTOS
    await criarTabelaTipoMovimento(); await inserirVariosTiposMovimento();
   
    //MOVIMENTOS
    await criarTabelaMovimentos();//await inserirVariosMovimentos();


    console.log('🎉 Todas as tabelas foram inicializadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro na inicialização das tabelas:', error);
  }
}


export { inicializarBaseDeDados };
