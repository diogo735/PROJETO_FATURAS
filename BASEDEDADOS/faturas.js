import { CRIARBD } from './databaseInstance';

import { inserirMovimento, atualizarMovimento } from './movimentos';
import NetInfo from '@react-native-community/netinfo';
import { criarFaturaAPI, atualizarFaturaAPI } from '../APIs/faturas';
import { adicionarNaFila } from './sincronizacao';
import { atualizarPayloadCreateNaFila } from './sincronizacao';

async function criarTabelaFaturas() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS faturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        movimento_id INTEGER NOT NULL,
        tipo_documento TEXT NOT NULL,
        numero_fatura TEXT NOT NULL,
        data_fatura TEXT NOT NULL,
        nif_emitente TEXT NOT NULL,
        codigo_ATCUD TEXT NOT NULL,
        nome_empresa TEXT,
        nif_cliente TEXT,
        descricao TEXT,
        total_iva REAL NOT NULL,
        total_final REAL NOT NULL,
        imagem_fatura TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        sync_status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (movimento_id) REFERENCES movimentos(id) ON DELETE CASCADE
      );
    `);
    //console.log("✅ Tabela 'faturas' criada com sucesso!");
  } catch (error) {
    console.error('❌ Erro ao criar tabela "faturas":', error);
  }
}

async function obterTipoMovimentoPorCategoria(categoriaId) {
  const db = await CRIARBD();
  const result = await db.getFirstAsync(`
    SELECT tipo_movimento_id 
    FROM categorias 
    WHERE id = ?;
  `, [categoriaId]);
  return result?.tipo_movimento_id ?? null;
}
async function apagarTabelaFaturas() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
        DROP TABLE IF EXISTS faturas;
      `);
    console.log("🗑️ Tabela 'faturas' apagada com sucesso!");
  } catch (error) {
    console.error('❌ Erro ao apagar tabela "faturas":', error);
  }
}
async function inserirFatura({
  movimentoId,
  tipoDocumento,
  numeroFatura,
  codigoATCUD,
  dataFatura,
  nifEmitente,
  nomeEmpresa,
  nifCliente,
  descricao,
  totalIva,
  totalFinal,
  imagemFatura
}) {
  try {
    const db = await CRIARBD();
    const updated_at = new Date().toISOString();
    nomeEmpresa = nomeEmpresa?.trim() || 'Empresa';

    // 🟡 Busca o remote_id do movimento antes de enviar à API
    const movimento = await db.getFirstAsync(`SELECT remote_id FROM movimentos WHERE id = ?`, [movimentoId]);

    if (!movimento?.remote_id) {
      console.warn('⚠️ Movimento ainda não sincronizado. Salvando fatura localmente.');
      return await salvarFaturaLocalEPendencia({
        movimento_id: movimentoId,
        tipo_documento: tipoDocumento,
        numero_fatura: numeroFatura,
        codigo_ATCUD: codigoATCUD,
        data_fatura: dataFatura,
        nif_emitente: nifEmitente,
        nome_empresa: nomeEmpresa,
        nif_cliente: nifCliente,
        descricao,
        total_iva: totalIva,
        total_final: totalFinal,
        imagem_fatura: imagemFatura,
        updated_at
      }, db);
    }

    const fatura = {
      movimento_id: movimento.remote_id, // ✅ usa o ID da API
      tipo_documento: tipoDocumento,
      numero_fatura: numeroFatura,
      codigo_ATCUD: codigoATCUD,
      data_fatura: dataFatura,
      nif_emitente: nifEmitente,
      nome_empresa: nomeEmpresa,
      nif_cliente: nifCliente,
      descricao,
      total_iva: totalIva,
      total_final: totalFinal,
      imagem_fatura: imagemFatura,
      updated_at
    };

    const estado = await NetInfo.fetch();

    if (estado.isConnected && estado.isInternetReachable) {
      try {
        const faturaRemota = await criarFaturaAPI(fatura);
        const remoteId = faturaRemota?.id;

        if (!remoteId) {
          throw new Error('❌ API não retornou ID da fatura');
        }

        console.log('✅ Fatura criada na API com sucesso! ID remoto:', remoteId);

        const result = await db.runAsync(
          `INSERT INTO faturas (
            remote_id, movimento_id, tipo_documento, numero_fatura, codigo_ATCUD, data_fatura,
            nif_emitente, nome_empresa, nif_cliente, descricao,
            total_iva, total_final, imagem_fatura,
            updated_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            remoteId, movimentoId, tipoDocumento, numeroFatura, codigoATCUD, dataFatura,
            nifEmitente, nomeEmpresa, nifCliente, descricao,
            totalIva, totalFinal, imagemFatura,
            updated_at, 'synced'
          ]
        );

        return result.lastInsertRowId;

      } catch (err) {
        console.warn('⚠️ API falhou. Salvando local + fila:', err.message);
        return await salvarFaturaLocalEPendencia(fatura, db);
      }

    } else {
      return await salvarFaturaLocalEPendencia(fatura, db);
    }

  } catch (error) {
    console.error('❌ Erro ao inserir fatura:', error);
    return null;
  }
}


async function salvarFaturaLocalEPendencia(fatura, db) {
  const {
    movimento_id, tipo_documento, numero_fatura, codigo_ATCUD, data_fatura,
    nif_emitente, nome_empresa, nif_cliente, descricao,
    total_iva, total_final, imagem_fatura, updated_at
  } = fatura;

  const result = await db.runAsync(
    `INSERT INTO faturas (
      movimento_id, tipo_documento, numero_fatura, codigo_ATCUD, data_fatura,
      nif_emitente, nome_empresa, nif_cliente, descricao,
      total_iva, total_final, imagem_fatura,
      updated_at, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      movimento_id, tipo_documento, numero_fatura, codigo_ATCUD, data_fatura,
      nif_emitente, nome_empresa, nif_cliente, descricao,
      total_iva, total_final, imagem_fatura,
      updated_at, 'pending'
    ]
  );

await adicionarNaFila('faturas', 'create', { ...fatura, id: result.lastInsertRowId });
  return result.lastInsertRowId;
}
async function atualizarFatura(id, novaDescricao) {
  try {
    const db = await CRIARBD();
    const updated_at = new Date().toISOString();

    // Atualiza localmente e marca como 'pending'
    await db.runAsync(
      `UPDATE faturas SET descricao = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
      [novaDescricao, updated_at, 'pending', id]
    );

    // Pega remote_id para sincronizar se possível
    const fatura = await db.getFirstAsync(`SELECT remote_id FROM faturas WHERE id = ?`, [id]);

    if (!fatura?.remote_id) {
      await atualizarPayloadCreateNaFila('faturas', id, {
        descricao: novaDescricao,
        updated_at
      });
      return true;
    }

    // será sincronizada depois como 'create'

    const estado = await NetInfo.fetch();

    if (estado.isConnected && estado.isInternetReachable) {
      try {
        // Envia update para a API
        await atualizarFaturaAPI(fatura.remote_id, {
          descricao: novaDescricao,
          updated_at
        });


        await db.runAsync(
          `UPDATE faturas SET sync_status = ? WHERE id = ?`,
          ['synced', id]
        );

      } catch (err) {
        console.warn('⚠️ API falhou, adicionando fatura à fila:', err.message);
        await adicionarNaFila('faturas', 'update', {
          descricao: novaDescricao,
          updated_at
        }, fatura.remote_id);
      }

    } else {
      // Está offline: adiciona à fila
      await adicionarNaFila('faturas', 'update', {
        descricao: novaDescricao,
        updated_at
      }, fatura.remote_id);
    }

    return true;

  } catch (error) {
    console.error('❌ Erro ao atualizar fatura:', error);
    return false;
  }
}



async function registarFatura_BDLOCAL({
  dataMovimento,
  categoriaId,
  subcategoriaId,
  nota,
  tipoDocumento,
  numeroFatura,
  codigoATCUD,
  dataFatura,
  nifEmitente,
  nomeEmpresa,
  nifCliente,
  totalIva,
  totalFinal,
  imagemFatura
}) {
  try {
    const db = await CRIARBD();

    let categoriaIdFinal = categoriaId;
    let subCategoriaIdFinal = subcategoriaId ?? null;

    if (subcategoriaId) {
      const subcat = await db.getFirstAsync(
        `SELECT categoria_id FROM sub_categorias WHERE id = ?`,
        [subcategoriaId]
      );

      if (!subcat) {
        console.warn('⚠️ Subcategoria não encontrada:', subcategoriaId);
        return;
      }

      categoriaIdFinal = subcat.categoria_id;
    }



    // 🧾 2. Inserir movimento e obter ID
    const movimentoId = await inserirMovimento(
      totalFinal,
      dataMovimento,
      categoriaIdFinal,
      subCategoriaIdFinal,
      nota
    );


    if (!movimentoId) {
      console.warn('⚠️ Movimento não foi criado. Cancelando registro de fatura.');
      return;
    }

    // 🧾 3. Inserir fatura ///NAO ESTA A FUNCIONAR O INSERIR FATURA
    const faturaId = await inserirFatura({
      movimentoId,
      tipoDocumento,
      numeroFatura,
      codigoATCUD,
      dataFatura,
      nifEmitente,
      nomeEmpresa,
      nifCliente,
      descricao: nota,
      totalIva,
      totalFinal,
      imagemFatura
    });

    if (!faturaId) {
      console.warn('❌ Falha ao registrar fatura.');
      return null;
    }
    console.log('✅ Fatura registrada com sucesso! ID:', faturaId);
    return faturaId;
  } catch (error) {
    console.error('❌ Erro ao registrar fatura:', error);
  }
}


async function verificarFaturaPorATCUD(codigoATCUD) {
  try {
    const db = await CRIARBD();
    const fatura = await db.getFirstAsync(
      `SELECT * FROM faturas WHERE codigo_ATCUD = ?`,
      [codigoATCUD]
    );

    if (!fatura) {
      console.log(`✅ Nenhuma fatura encontrada com ATCUD: ${codigoATCUD}`);
      return null;
    }

    console.log(`⚠️ Fatura já registrada com ATCUD: ${codigoATCUD}`);
    return fatura;
  } catch (error) {
    console.error('❌ Erro ao verificar fatura por ATCUD:', error);
    return null;
  }
}


async function consultarFatura(movimentoId) {
  try {
    const db = await CRIARBD();
    const fatura = await db.getFirstAsync(
      `SELECT * FROM faturas WHERE movimento_id = ?`,
      [movimentoId]
    );

    if (!fatura) {
      console.warn(`⚠️ Nenhuma fatura encontrada com movimento_id ${movimentoId}`);
      return null;
    }

    return fatura;
  } catch (error) {
    console.error('❌ Erro ao consultar fatura:', error);
    return null;
  }
}

/**
 * @param {number} faturaId
 * @param {string} novaDescricao
 * @param {?number} categoriaId
 * @param {?number} subcategoriaId
 * @returns {Promise<boolean>}
 */
async function atualizarMovimentoPorFatura(faturaId, novaDescricao, categoriaId = null, subcategoriaId = null) {
  try {
    const db = await CRIARBD();

    const fatura = await db.getFirstAsync(`SELECT movimento_id FROM faturas WHERE id = ?`, [faturaId]);
    if (!fatura?.movimento_id) {
      console.warn('⚠️ Fatura não encontrada ou sem movimento ligado:', faturaId);
      return false;
    }

    const movimentoId = fatura.movimento_id;
    let categoriaFinalId = categoriaId;

    if (!categoriaId && subcategoriaId) {
      const subcat = await db.getFirstAsync(`SELECT categoria_id FROM sub_categorias WHERE id = ?`, [subcategoriaId]);
      if (!subcat?.categoria_id) {
        console.warn('⚠️ Categoria não encontrada para subcategoria:', subcategoriaId);
        return false;
      }
      categoriaFinalId = subcat.categoria_id;
    }

    const tipo = await db.getFirstAsync(`SELECT tipo_movimento_id FROM categorias WHERE id = ?`, [categoriaFinalId]);
    if (!tipo?.tipo_movimento_id) {
      console.warn('⚠️ Tipo de movimento não encontrado para categoria:', categoriaFinalId);
      return false;
    }

    const sucesso = await atualizarMovimento(movimentoId, {
      nota: novaDescricao,
      categoria_id: categoriaFinalId,
      sub_categoria_id: subcategoriaId ?? null
    });

    if (!sucesso) return false;

    // Atualiza a fatura corretamente com sincronização
    await atualizarFatura(faturaId, novaDescricao);

    return true;

  } catch (error) {
    console.error('❌ Erro ao atualizar movimento por fatura:', error);
    return false;
  }
}



export {
  criarTabelaFaturas,
  apagarTabelaFaturas,
  registarFatura_BDLOCAL,
  consultarFatura,
  atualizarMovimentoPorFatura,
  verificarFaturaPorATCUD,


};
