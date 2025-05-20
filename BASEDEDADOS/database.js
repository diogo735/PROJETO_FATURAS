import * as SQLite from 'expo-sqlite';
import { criarTabelaCategorias, verificarEInserirCategorias, apagarTodasCategorias, resetarCategorias, deletarTabelaCategorias } from './categorias';
import { criarTabelaTipoMovimento, inserirVariosTiposMovimento } from './tipo_movimento';
import { criarTabelaMovimentos, apagarTabelaMovimentos, inserirMovimentoTesteUnico, limparTabelaMovimentos } from './movimentos';
import { CRIARBD } from './databaseInstance';
import { criarTabelaFaturas, apagarTabelaFaturas } from './faturas';
import { criarTabelaMetas, limparMetas, apagarTabelaMetas } from './metas';

import { criarTabelaSubCategorias, criarSubCategoriasDeTeste, limparSubCategorias } from './sub_categorias';
import { criarTabelaUsers, inserirUserTeste ,existeUsuario,apagarTodosUsers} from './user';





async function inicializarBaseDeDados() {

  try {


    await CRIARBD();

    await criarTabelaUsers();
    // await apagarTodosUsers();
    //await inserirUserTeste();

    //TIPOS_MOVIMENTOS
    await criarTabelaTipoMovimento(); await inserirVariosTiposMovimento();

    //CATEGORIAS
    await criarTabelaCategorias(); /*await resetarCategorias();*/  await verificarEInserirCategorias();

    //sub_categorias
    await criarTabelaSubCategorias();
    //await criarSubCategoriasDeTeste();
    //await limparSubCategorias();

    //MOVIMENTOS
    await criarTabelaMovimentos();
    // await apagarTabelaMovimentos();
    //await limparTabelaMovimentos();

    //faturas
    await criarTabelaFaturas();
    // await apagarTabelaFaturas();

    //metas
    await criarTabelaMetas(); //await limparMetas();
    //await apagarTabelaMetas();

    console.log('🎉 Todas as tabelas foram inicializadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro na inicialização das tabelas:', error);
  }
}


export { inicializarBaseDeDados };
