import { CRIARBD } from './databaseInstance';
import NetInfo from '@react-native-community/netinfo';
import { adicionarNaFila } from './sincronizacao';
import { buscarUsuarioAtual } from './user';
import { criarSubCategoriaAPI } from '../APIs/sub_categorias';
import { atualizarSubCategoriaAPI, deletarSubCategoriaAPI } from '../APIs/sub_categorias';
import { obterSubCategoriasAtualizadas } from '../APIs/sub_categorias';

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

    // Preferências do usuário
    const user = await buscarUsuarioAtual();
    const syncAuto = user?.sincronizacao_automatica === 1;
    const wifiOnly = user?.sincronizacao_wifi === 1;

    // Estado de conexão
    const estado = await NetInfo.fetch();
    const estaOnline = estado.isConnected && estado.isInternetReachable;
    const usandoWifi = estado.type === 'wifi';

    const podeSincronizarAgora = syncAuto && estaOnline && (!wifiOnly || usandoWifi);




    if (podeSincronizarAgora) {
      try {
        // Tenta enviar direto para a API
        const subcat = await criarSubCategoriaAPI({
          nome_subcat,
          icone_nome,
          cor_subcat,
          categoria_id,
          updated_at
        });

        const remoteId = subcat?.id;
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
  const result = await db.runAsync(
    `INSERT INTO sub_categorias 
    (nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at, sync_status)
   VALUES (?, ?, ?, ?, ?, ?)`,
    [nome_subcat.trim(), icone_nome, cor_subcat, categoria_id, updated_at, 'pending']
  );

  const idLocal = result.lastInsertRowId;

  // Adiciona à fila de sincronização
  await adicionarNaFila('sub_categorias', 'create', {
    id: idLocal, // 🔥 IMPORTANTE
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
      const movimentosAfetados = await db.getAllAsync(
        `SELECT * FROM movimentos WHERE sub_categoria_id = ?`,
        [id]
      );

      for (const mov of movimentosAfetados) {
        const novoUpdatedAt = new Date().toISOString();

        // Atualiza localmente
        await db.runAsync(
          `UPDATE movimentos SET categoria_id = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
          [categoria_id, novoUpdatedAt, 'pending', mov.id]
        );

        // Se tiver remote_id, adiciona à fila
        if (mov.remote_id) {
          // 🔍 Buscar o remote_id da subcategoria
          const subcat = await db.getFirstAsync(
            `SELECT remote_id FROM sub_categorias WHERE id = ?`,
            [mov.sub_categoria_id]
          );

          const remoteSubcatId = subcat?.remote_id;

          if (!remoteSubcatId) {
            console.warn(`⚠️ Subcategoria local ID ${mov.sub_categoria_id} não tem remote_id — movimento ID ${mov.id} ignorado`);
            continue; // pula este movimento
          }

          await adicionarNaFila('movimentos', 'update', {
            valor: mov.valor,
            data_movimento: mov.data_movimento,
            categoria_id: categoria_id, // já é o remoto
            sub_categoria_id: remoteSubcatId, // ✅ agora correto
            nota: mov.nota,
            updated_at: novoUpdatedAt
          }, mov.remote_id);
        }
      }
    }



    // 🎯 Preferências do usuário
    const user = await buscarUsuarioAtual();
    const syncAuto = user?.sincronizacao_automatica === 1;
    const wifiOnly = user?.sincronizacao_wifi === 1;

    const estado = await NetInfo.fetch();
    const estaOnline = estado.isConnected && estado.isInternetReachable;
    const usandoWifi = estado.type === 'wifi';

    const podeSincronizarAgora = syncAuto && estaOnline && (!wifiOnly || usandoWifi);

    if (podeSincronizarAgora) {
      try {
        // Envia PUT para a API
        const subcatAtualizada = await atualizarSubCategoriaAPI(subcatAtual.remote_id, {
          nome_subcat,
          icone_nome,
          cor_subcat,
          categoria_id,
          updated_at
        });

        console.log('🔄 Subcategoria sincronizada na API:', subcatAtualizada);

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
          id,
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
        id,
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

    // 1. Buscar o remote_id da subcategoria
    const subcat = await db.getFirstAsync(
      `SELECT remote_id, nome_subcat FROM sub_categorias WHERE id = ?`,
      [idSubcategoria]
    );
    console.log('🔍 Subcategoria carregada antes de apagar:', subcat);
    if (!subcat) return 'erro';

    const { remote_id, nome_subcat } = subcat;

    // 2. Atualizar movimentos relacionados à subcategoria
    const movimentosAfetados = await db.getAllAsync(
      `SELECT * FROM movimentos WHERE sub_categoria_id = ?`,
      [idSubcategoria]
    );

    for (const mov of movimentosAfetados) {
      const novoUpdatedAt = new Date().toISOString();

      await db.runAsync(
        `UPDATE movimentos SET sub_categoria_id = NULL, updated_at = ?, sync_status = ? WHERE id = ?`,
        [novoUpdatedAt, 'pending', mov.id]
      );

      if (mov.remote_id) {
        await adicionarNaFila('movimentos', 'update', {
          valor: mov.valor,
          data_movimento: mov.data_movimento,
          categoria_id: mov.categoria_id,
          sub_categoria_id: null,
          nota: mov.nota,
          updated_at: novoUpdatedAt
        }, mov.remote_id);
      }
    }

    // 3. Apagar metas associadas
    const metasAssociadas = await db.getAllAsync(
      `SELECT id_meta FROM metas WHERE sub_categoria_id = ?`,
      [idSubcategoria]
    );
    for (const meta of metasAssociadas) {
      await apagarMeta(meta.id_meta);
    }

    // 3. Verificar preferências do usuário
    const user = await buscarUsuarioAtual();
    const syncAuto = user?.sincronizacao_automatica === 1;
    const wifiOnly = user?.sincronizacao_wifi === 1;

    const estado = await NetInfo.fetch();
    const estaOnline = estado.isConnected && estado.isInternetReachable;
    const usandoWifi = estado.type === 'wifi';

    const podeSincronizarAgora = syncAuto && estaOnline && (!wifiOnly || usandoWifi);

    // 4. Processamento baseado nas condições

    if (podeSincronizarAgora) {
      try {
        if (remote_id) {
          // ✅ Se já foi sincronizada, deletar da API
          await deletarSubCategoriaAPI(remote_id);
        } else {
          // 🔁 Se ainda não foi sincronizada, remover da fila de criação
          await db.runAsync(`
  DELETE FROM sincronizacoes
  WHERE tipo = 'sub_categorias'
    AND operacao IN ('create', 'update')
    AND json_extract(payload, '$.nome_subcat') = ?
`, [nome_subcat]);
        }

        // Remover localmente
        await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?`, [idSubcategoria]);
        return 'sucesso';

      } catch (err) {
        console.warn('❌ Erro ao apagar na API, adicionando à fila:', err.message);

        if (remote_id) {
          await adicionarNaFila('sub_categorias', 'delete', {}, remote_id);
        }

        await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?`, [idSubcategoria]);
        return 'sucesso';
      }

    } else {
      // 5. Se estiver offline

      if (remote_id) {
        // ✅ Subcategoria já sincronizada → agendar delete
        await adicionarNaFila('sub_categorias', 'delete', {}, remote_id);
      } else {
        // 🔁 Criada offline → remover da fila de criação
        await db.runAsync(`
  DELETE FROM sincronizacoes
  WHERE tipo = 'sub_categorias'
    AND operacao IN ('create', 'update')
    AND json_extract(payload, '$.nome_subcat') = ?
`, [nome_subcat]);
      }

      // Sempre apagar localmente
      await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?`, [idSubcategoria]);
      return 'sucesso';
    }

  } catch (error) {
    console.error('❌ Erro ao eliminar subcategoria e atualizar movimentos:', error);
    return 'erro';
  }
}

async function sincronizarSubcategoriasAPI() {
  try {
    const db = await CRIARBD();

    const maisRecente = await db.getFirstAsync(`
      SELECT updated_at FROM sub_categorias
      ORDER BY datetime(updated_at) DESC
      LIMIT 1
    `);
    const updated_since = maisRecente?.updated_at || '2025-01-01T00:00:00Z';

    const subcatsRemotas = await obterSubCategoriasAtualizadas(updated_since);
    if (!Array.isArray(subcatsRemotas)) {
      console.warn('⚠️ subcatsRemotas não é um array:', subcatsRemotas);
      return;
    }

    for (const sub of subcatsRemotas) {
      const local = await db.getFirstAsync(`SELECT * FROM sub_categorias WHERE remote_id = ?`, [sub.id]);

      if (local) {
        const remotoMaisNovo = new Date(sub.updated_at) > new Date(local.updated_at);
        if (remotoMaisNovo) {
          await db.runAsync(`
            UPDATE sub_categorias
            SET nome_subcat = ?, icone_nome = ?, cor_subcat = ?, categoria_id = ?, updated_at = ?, sync_status = ?
            WHERE remote_id = ?
          `, [
            sub.nome_subcat,
            sub.icone_nome,
            sub.cor_subcat,
            sub.categoria_id,
            sub.updated_at,
            'synced',
            sub.id
          ]);
        }
      } else {
        await db.runAsync(`
          INSERT INTO sub_categorias (
            remote_id, nome_subcat, icone_nome, cor_subcat, categoria_id, updated_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          sub.id,
          sub.nome_subcat,
          sub.icone_nome,
          sub.cor_subcat,
          sub.categoria_id,
          sub.updated_at,
          'synced'
        ]);
      }
    }

    console.log(`🔄 Sincronização de subcategorias concluída: ${subcatsRemotas.length} registros.`);
  } catch (error) {
    console.error('❌ Erro ao sincronizar subcategorias:', error.message);
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
  salvarLocalEPendencia,
  sincronizarSubcategoriasAPI
};
