import { CRIARBD } from './databaseInstance';

import { inserirMovimento } from './movimentos';



async function criarTabelaFaturas() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS faturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movimento_id INTEGER NOT NULL,
        tipo_documento TEXT NOT NULL,
        numero_fatura TEXT NOT NULL,
        data_fatura TEXT NOT NULL,
        nif_emitente TEXT NOT NULL,
        codigo_ATCUD TEXT NOT NULL,
        nome_empresa TEXT NULL,
        nif_cliente TEXT,
        descricao TEXT,
        total_iva REAL NOT NULL,
        total_final REAL NOT NULL,
        imagem_fatura TEXT,
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

    nomeEmpresa = nomeEmpresa?.trim() || 'Empresa';


    const result = await db.runAsync(
      `INSERT INTO faturas (
    movimento_id, tipo_documento, numero_fatura, codigo_ATCUD, data_fatura,
    nif_emitente, nome_empresa, nif_cliente, descricao,
    total_iva, total_final, imagem_fatura
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
      [
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
      ]
    );

    const faturaId = result.lastInsertRowId;

    return faturaId;

  } catch (error) {
    console.error('❌ Erro ao inserir fatura:', error);
    return null;
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

    // 🧾 3. Inserir fatura
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

    // 1. Obter o movimento_id da fatura
    const fatura = await db.getFirstAsync(`SELECT movimento_id FROM faturas WHERE id = ?`, [faturaId]);

    if (!fatura?.movimento_id) {
      console.warn('⚠️ Fatura não encontrada ou sem movimento ligado:', faturaId);
      return false;
    }

    const movimentoId = fatura.movimento_id;

    let categoriaFinalId = categoriaId;
    let tipoMovimentoId = null;

    // 2. Se recebeu apenas subcategoriaId, buscar a categoria correspondente
    if (!categoriaId && subcategoriaId) {
      const subcat = await db.getFirstAsync(
        `SELECT categoria_id FROM sub_categorias WHERE id = ?`,
        [subcategoriaId]
      );

      if (!subcat?.categoria_id) {
        console.warn('⚠️ Categoria não encontrada para subcategoria:', subcategoriaId);
        return false;
      }

      categoriaFinalId = subcat.categoria_id;
    }

    // 3. Buscar tipo_movimento_id a partir da categoriaFinalId
    const tipo = await db.getFirstAsync(
      `SELECT tipo_movimento_id FROM categorias WHERE id = ?`,
      [categoriaFinalId]
    );

    if (!tipo?.tipo_movimento_id) {
      console.warn('⚠️ Tipo de movimento não encontrado para categoria:', categoriaFinalId);
      return false;
    }

    tipoMovimentoId = tipo.tipo_movimento_id;

    // 4. Atualizar o movimento
    await db.runAsync(
      `UPDATE movimentos 
       SET nota = ?, categoria_id = ?, sub_categoria_id = ?
       WHERE id = ?`,
      [
        novaDescricao,
        categoriaFinalId,
        subcategoriaId ?? null,
        movimentoId
      ]
    );

    // 5. Atualizar a descrição da fatura
    await db.runAsync(
      `UPDATE faturas SET descricao = ? WHERE id = ?`,
      [novaDescricao, faturaId]
    );

    console.log(`✅ Movimento ${movimentoId} atualizado com:
      - categoria_id: ${categoriaFinalId}
      - sub_categoria_id: ${subcategoriaId ?? 'null'}
      - tipo_movimento_id: ${tipoMovimentoId}
      - descrição: ${novaDescricao}`);

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
