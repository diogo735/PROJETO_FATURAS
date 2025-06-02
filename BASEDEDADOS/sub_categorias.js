import { CRIARBD } from './databaseInstance';
import NetInfo from '@react-native-community/netinfo';
import { adicionarNaFila } from './sincronizacao';

import { criarSubCategoriaAPI } from '../APIs/sub_categorias';
import { atualizarSubCategoriaAPI, deletarSubCategoriaAPI } from '../APIs/sub_categorias';

async function criarTabelaSubCategorias() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sub_categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        nome_subcat TEXT NOT NULL,
        icone_nome TEXT NOT NULL,
        categoria_id INTEGER NOT NULL,
        cor_subcat TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        sync_status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      );
    `);
    //console.log('✅ Tabela "sub_categorias" criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela "sub_categorias":', error);
  }
}

async function listarSubCategoriasPorCategoriaId(categoriaId) {
  try {
    const db = await CRIARBD();
    const resultados = await db.getAllAsync(`
      SELECT 
        id, 
        nome_subcat AS nome, 
        cor_subcat AS cor, 
        icone_nome AS icone
      FROM sub_categorias
      WHERE categoria_id = ?
    `, [categoriaId]);

    return resultados;
  } catch (error) {
    console.error('❌ Erro ao listar subcategorias por categoria:', error);
    return [];
  }
}

NAO ESTA A RETORNAR O ID DA SUBCATEGORIA AO CRIAR LA

async function inserirSubCategoria(nome_subcat, icone_nome, cor_subcat, categoria_id) {
  try {
    const db = await CRIARBD();
    const nomeNormalizado = nome_subcat.trim().toLowerCase();
    const updated_at = new Date().toISOString();

    // Verificar duplicação em subcategorias
    const subcatExistente = await db.getFirstAsync(
      `SELECT * FROM sub_categorias WHERE LOWER(nome_subcat) = ?`,
      nomeNormalizado
    );
    if (subcatExistente) return 'duplicada_subcategoria';

    // Verificar duplicação em categorias
    const catExistente = await db.getFirstAsync(
      `SELECT * FROM categorias WHERE LOWER(nome_cat) = ?`,
      nomeNormalizado
    );
    if (catExistente) return 'duplicada_categoria';

    const estado = await NetInfo.fetch();

    if (estado.isConnected && estado.isInternetReachable) {
      try {
        // Tenta enviar direto para a API
        const response = await criarSubCategoriaAPI({
          nome_subcat,
          icone_nome,
          cor_subcat,
          categoria_id,
          updated_at
        });

        const remoteId = response.subcategoria?.id;
        if (!remoteId) {
          console.warn('⚠️ Nenhum remote_id retornado pela API.');
          return 'erro';
        }

        console.log('🆔 ID remoto da subcategoria criada:', remoteId);
        // Salva localmente como sincronizada
        await db.runAsync(
          `INSERT INTO sub_categorias 
            (remote_id, nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [remoteId, nome_subcat.trim(), icone_nome, cor_subcat, categoria_id, updated_at, 'synced']
        );

        // 🔍 Busca a subcategoria recém inserida para log
        const resultado = await db.getFirstAsync(
          `SELECT * FROM sub_categorias WHERE remote_id = ?`,
          [remoteId]
        );

        console.log('✅ Subcategoria inserida localmente após criação na API:', resultado);

        return 'sucesso';

      } catch (err) {
        console.warn('🔁 API falhou, salvando local e na fila:', err.message);
        return await salvarLocalEPendencia(nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at);
      }

    } else {
      // Sem internet
      return await salvarLocalEPendencia(nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at);
    }

  } catch (error) {
    console.error('❌ Erro ao inserir subcategoria:', error);
    return 'erro';
  }
}

async function salvarLocalEPendencia(nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at) {
  const db = await CRIARBD();

  // Salva localmente como pendente
  await db.runAsync(
    `INSERT INTO sub_categorias 
      (nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at, sync_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome_subcat.trim(), icone_nome, cor_subcat, categoria_id, updated_at, 'pending']
  );

  // Adiciona à fila de sincronização
  await adicionarNaFila('sub_categorias', 'create', {
    nome_subcat,
    icone_nome,
    cor_subcat,
    categoria_id,
    updated_at
  });

  return 'sucesso';
}




async function listarSubCategorias() {
  try {
    const db = await CRIARBD();
    return await db.getAllAsync(`SELECT * FROM sub_categorias;`);
  } catch (error) {
    console.error('❌ Erro ao listar subcategorias:', error);
    return [];
  }
}


async function buscarSubCategoriaPorId(id) {
  try {
    const db = await CRIARBD();
    return await db.getFirstAsync(`SELECT * FROM sub_categorias WHERE id = ?;`, [id]);
  } catch (error) {
    console.error('❌ Erro ao buscar subcategoria por ID:', error);
    return null;
  }
}




async function atualizarSubCategoriaComVerificacao(id, nome_subcat, icone_nome, cor_subcat, categoria_id) {
  try {
    const db = await CRIARBD();
    const nomeNormalizado = nome_subcat.trim().toLowerCase();
    const updated_at = new Date().toISOString();

    // Verifica se já existe outra subcategoria com o mesmo nome
    const subcatExistente = await db.getFirstAsync(
      `SELECT * FROM sub_categorias WHERE LOWER(nome_subcat) = ? AND id != ?`,
      nomeNormalizado, id
    );
    if (subcatExistente) return 'duplicada_subcategoria';

    // Verifica se o nome já existe como categoria
    const catExistente = await db.getFirstAsync(
      `SELECT * FROM categorias WHERE LOWER(nome_cat) = ?`,
      nomeNormalizado
    );
    if (catExistente) return 'duplicada_categoria';

    // Obter subcategoria atual
    const subcatAtual = await db.getFirstAsync(
      `SELECT categoria_id, remote_id FROM sub_categorias WHERE id = ?`,
      [id]
    );

    if (!subcatAtual) return 'erro';

    // Atualiza localmente com sync_status = 'pending' até confirmar
    await db.runAsync(
      `UPDATE sub_categorias 
       SET nome_subcat = ?, icone_nome = ?, cor_subcat = ?, categoria_id = ?, updated_at = ?, sync_status = ? 
       WHERE id = ?`,
      [nome_subcat.trim(), icone_nome, cor_subcat, categoria_id, updated_at, 'pending', id]
    );

    // Atualiza movimentos se a categoria mudou
    if (subcatAtual.categoria_id !== categoria_id) {
      await db.runAsync(
        `UPDATE movimentos SET categoria_id = ? WHERE sub_categoria_id = ?`,
        [categoria_id, id]
      );///////////////////////////////////FALTA ATUALIZAR OS MOVIMENTOS QUANDO A SUB CATEGORIA É ALTERADA
    }

    const estado = await NetInfo.fetch();

    if (estado.isConnected && estado.isInternetReachable) {
      try {
        // Envia PUT para a API
        await atualizarSubCategoriaAPI(subcatAtual.remote_id, {
          nome_subcat,
          icone_nome,
          cor_subcat,
          categoria_id,
          updated_at
        });

        // Marca como sincronizado
        await db.runAsync(
          `UPDATE sub_categorias SET sync_status = ? WHERE id = ?`,
          ['synced', id]
        );

        return 'sucesso';

      } catch (err) {
        console.warn('⚠️ Erro ao sincronizar atualização com API, adicionando na fila:', err.message);
        console.log('🔍 Detalhes do erro:', err);
        await adicionarNaFila('sub_categorias', 'update', {
          nome_subcat,
          icone_nome,
          cor_subcat,
          categoria_id,
          updated_at
        }, subcatAtual.remote_id);

        return 'sucesso';
      }

    } else {
      // Offline → adiciona à fila
      await adicionarNaFila('sub_categorias', 'update', {
        nome_subcat,
        icone_nome,
        cor_subcat,
        categoria_id,
        updated_at
      }, subcatAtual.remote_id);

      return 'sucesso';
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar subcategoria:', error);
    return 'erro';
  }
}




async function deletarSubCategoria(id) {
  try {
    const db = await CRIARBD();
    await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?;`, [id]);
    console.log('🗑 Subcategoria deletada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao deletar subcategoria:', error);
  }
}


async function listarSubCategoriasComCategoria() {
  try {
    const db = await CRIARBD();
    return await db.getAllAsync(`
      SELECT sub_categorias.*, categorias.nome_cat AS nome_categoria
      FROM sub_categorias
      INNER JOIN categorias ON sub_categorias.categoria_id = categorias.id;
    `);
  } catch (error) {
    console.error('❌ Erro ao buscar subcategorias com nome da categoria:', error);
    return [];
  }
}

async function criarSubCategoriasDeTeste() {
  try {
    const db = await CRIARBD();

    const categoria = await db.getFirstAsync(
      `SELECT id FROM categorias WHERE nome_cat = ?`,
      ['Depósitos']
    );

    if (!categoria) {
      console.error('❌ Categoria "Compras Pessoais" não encontrada.');
      return;
    }

    const categoriaId = categoria.id;

    //await inserirSubCategoria('Roupas', 'shopping-bag', '#FF9F1C', categoriaId);
    //await inserirSubCategoria('Calçado', 'cutlery', '#2EC4B6', categoriaId);
    // await inserirSubCategoria('Acessórios', 'gift', '#E71D36', categoriaId);
    await inserirSubCategoria('tste', 'gift', '#E71D36', categoriaId);
    console.log('✅ Subcategorias de teste criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar subcategorias de teste:', error);
  }
}

async function eliminarSubCategoriaEAtualizarMovimentos(idSubcategoria) {
  try {
    const db = await CRIARBD();

    // Buscar remote_id para sincronizar com a API
    const subcat = await db.getFirstAsync(`SELECT remote_id FROM sub_categorias WHERE id = ?`, [idSubcategoria]);
    if (!subcat) return 'erro';

    // Atualizar movimentos relacionados
    await db.runAsync(
      `UPDATE movimentos SET sub_categoria_id = NULL WHERE sub_categoria_id = ?`,
      [idSubcategoria]
    );//////////////ATUALIZAR ONLINE

    const estado = await NetInfo.fetch();

    if (estado.isConnected && estado.isInternetReachable) {
      try {
        if (subcat.remote_id) {
          await deletarSubCategoriaAPI(subcat.remote_id);
        }

        // Remover do banco local
        await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?`, [idSubcategoria]);

        return 'sucesso';

      } catch (err) {
        console.warn('❌ Erro ao apagar na API, adicionando à fila:', err.message);

        // Marca para deletar mais tarde
        if (subcat.remote_id) {
          await adicionarNaFila('sub_categorias', 'delete', {}, subcat.remote_id);
        }

        await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?`, [idSubcategoria]);
        return 'sucesso';
      }

    } else {
      // Está offline → marcar para deletar depois
      if (subcat.remote_id) {
        await adicionarNaFila('sub_categorias', 'delete', {}, subcat.remote_id);
      }

      await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?`, [idSubcategoria]);
      return 'sucesso';
    }

  } catch (error) {
    console.error('❌ Erro ao eliminar subcategoria e atualizar movimentos:', error);
    return 'erro';
  }
}

export {
  criarTabelaSubCategorias,
  inserirSubCategoria,
  listarSubCategorias,
  buscarSubCategoriaPorId,
  atualizarSubCategoriaComVerificacao,
  deletarSubCategoria,
  listarSubCategoriasComCategoria,
  criarSubCategoriasDeTeste,
  eliminarSubCategoriaEAtualizarMovimentos,
  listarSubCategoriasPorCategoriaId,
  salvarLocalEPendencia
};
