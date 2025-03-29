import * as SQLite from 'expo-sqlite';
import { criarTabelaCategorias, verificarEInserirCategorias, apagarTodasCategorias,resetarCategorias ,deletarTabelaCategorias} from './categorias';
import { criarTabelaTipoMovimento, inserirVariosTiposMovimento } from './tipo_movimento';
import { criarTabelaMovimentos,inserirVariosMovimentos,inserirMovimentoTesteUnico } from './movimentos';
import { CRIARBD } from './databaseInstance';
import { criarTabelaFaturas ,apagarTabelaFaturas} from './faturas';
import { criarTabelaMetas } from './metas';

async function inicializarBaseDeDados() {

  try {

    
  await CRIARBD();

    //TIPOS_MOVIMENTOS
    await criarTabelaTipoMovimento(); await inserirVariosTiposMovimento();

    //CATEGORIAS
    await criarTabelaCategorias(); /*await resetarCategorias();*/  await verificarEInserirCategorias(); 

    //MOVIMENTOS
   // await criarTabelaMovimentos();//await inserirVariosMovimentos();
    
    //faturas
    //await criarTabelaFaturas();
    

    

    //metas
    await criarTabelaMetas();



    console.log('🎉 Todas as tabelas foram inicializadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro na inicialização das tabelas:', error);
  }
}


export { inicializarBaseDeDados };
