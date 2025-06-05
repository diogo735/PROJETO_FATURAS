import * as SQLite from 'expo-sqlite';
import { CRIARBD } from './databaseInstance';
import { verificar_se_envia_notificacao } from './metas';
import NetInfo from '@react-native-community/netinfo';
import { criarMovimentoAPI, atualizarMovimentoAPI } from '../APIs/movimentos';
import { adicionarNaFila } from './sincronizacao';
import { atualizarPayloadCreateNaFila } from './sincronizacao';

async function criarTabelaMovimentos() {


  try {
    const db = await CRIARBD();
    await db.execAsync(`
  CREATE TABLE IF NOT EXISTS movimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id INTEGER,
    valor REAL NOT NULL,
    data_movimento TEXT NOT NULL,
    categoria_id INTEGER NOT NULL,
    sub_categoria_id INTEGER,
    nota TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_categoria_id) REFERENCES sub_categorias(id) ON DELETE SET NULL
  );
`);


    /*console.log('✅ Tabela "movimentos" criada ou já existente com sucesso!');*/
  } catch (error) {
    console.error('❌ Erro ao criar tabela "movimentos":', error);
  }
}


async function inserirMovimento(valor, data_movimento, categoria_id, sub_categoria_id, nota) {
  const db = await CRIARBD();
  const updated_at = new Date().toISOString();

  const movimentoLocal = {
    valor,
    data_movimento,
    categoria_id,
    sub_categoria_id,
    nota,
    updated_at
  };

  try {
    const estado = await NetInfo.fetch();

    if (estado.isConnected && estado.isInternetReachable) {
      try {
        // Envia para API
        const movimentoRemoto = await criarMovimentoAPI(movimentoLocal);
        const remoteId = movimentoRemoto?.id;

        if (!remoteId) {
          throw new Error('❌ A API não retornou um ID válido do movimento');
        }

        // Salva localmente como sincronizado
        const result = await db.runAsync(
          `INSERT INTO movimentos (remote_id, valor, data_movimento, categoria_id, sub_categoria_id, nota, updated_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [remoteId, valor, data_movimento, categoria_id, sub_categoria_id, nota, updated_at, 'synced']
        );

        await atualizarMeta(valor, categoria_id, data_movimento, db);
        return result.lastInsertRowId;

      } catch (err) {
        console.warn('⚠️ Erro ao criar movimento na API, salvando local:', err.message);
        return await salvarMovimentoLocalEPendencia(movimentoLocal, db);
      }

    } else {
      return await salvarMovimentoLocalEPendencia(movimentoLocal, db);
    }

  } catch (error) {
    console.error('❌ Erro ao inserir movimento:', error);
    return null;
  }
}

async function salvarMovimentoLocalEPendencia(movimento, db) {
  const { valor, data_movimento, categoria_id, sub_categoria_id, nota, updated_at } = movimento;

  const result = await db.runAsync(
    `INSERT INTO movimentos (valor, data_movimento, categoria_id, sub_categoria_id, nota, updated_at, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [valor, data_movimento, categoria_id, sub_categoria_id, nota, updated_at, 'pending']
  );

 await adicionarNaFila('movimentos', 'create', { ...movimento, id: result.lastInsertRowId });


  await atualizarMeta(valor, categoria_id, data_movimento, db);

  return result.lastInsertRowId;
}

async function atualizarMovimento(id, { nota, categoria_id, sub_categoria_id }) {
  try {

    const db = await CRIARBD();
    const updated_at = new Date().toISOString();

    // 1. Atualiza localmente e marca como 'pending'
    await db.runAsync(
      `UPDATE movimentos SET nota = ?, categoria_id = ?, sub_categoria_id = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
      [
        nota,
        categoria_id,
        sub_categoria_id ?? null,
        updated_at,
        'pending',
        id
      ]
    );

    // 2. Busca remote_id para saber se já foi sincronizado antes
    const movimento = await db.getFirstAsync(`SELECT remote_id FROM movimentos WHERE id = ?`, [id]);
    console.log('🎯 Movimento carregado do banco:', movimento);

    if (!movimento?.remote_id) {
      await atualizarPayloadCreateNaFila('movimentos', id, {
        nota,
        categoria_id,
        sub_categoria_id,
        updated_at
      });
      return true;
    }



    // 3. Verifica se está online
    const estado = await NetInfo.fetch();

    if (estado.isConnected && estado.isInternetReachable) {
      try {
        let subCategoriaRemoteId = null;

        if (sub_categoria_id) {
          const sub = await db.getFirstAsync(
            `SELECT remote_id FROM sub_categorias WHERE id = ?`,
            [sub_categoria_id]
          );
          if (!sub?.remote_id) {
            throw new Error('Subcategoria ainda não foi sincronizada com a API.');
          }
          subCategoriaRemoteId = sub.remote_id;
        }

        const result = await atualizarMovimentoAPI(movimento.remote_id, {
          nota,
          categoria_id,
          sub_categoria_id: subCategoriaRemoteId,
          updated_at
        });


        if (!result?.id) {
          throw new Error('❌ API não retornou o movimento atualizado corretamente');
        }

        // 5. Marca como sincronizado
        await db.runAsync(
          `UPDATE movimentos SET sync_status = ? WHERE id = ?`,
          ['synced', id]
        );

      } catch (err) {
        console.warn('⚠️ Falha ao atualizar movimento na API. Adicionando à fila:', err.message);

        await adicionarNaFila('movimentos', 'update', {
          nota,
          categoria_id,
          sub_categoria_id,
          updated_at
        }, movimento.remote_id);
      }


    } else {
      // 7. Está offline, adiciona à fila
      await adicionarNaFila('movimentos', 'update', {
        nota,
        categoria_id,
        sub_categoria_id,
        updated_at
      }, movimento.remote_id);
    }

    return true;

  } catch (error) {
    console.error('❌ Erro ao atualizar movimento:', error);
    return false;
  }
}

async function atualizarMeta(valor, categoria_id, data_movimento, db) {
  try {
    const meta = await db.getFirstAsync(
      `SELECT * FROM metas 
       WHERE categoria_id = ? AND meta_ativa = 1
       AND date(?) BETWEEN date(data_inicio) AND date(data_fim)`,
      [categoria_id, data_movimento]
    );

    if (meta) {
      const novoValor = (meta.valor_atual ?? 0) + valor;

      await db.runAsync(
        `UPDATE metas SET valor_atual = ? WHERE id_meta = ?`,
        [novoValor, meta.id_meta]
      );

      const metaAtualizada = { ...meta, valor_atual: novoValor };

      // Verifica se notificação deve ser enviada
      await verificar_se_envia_notificacao(metaAtualizada);
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar meta:', error);
  }
}






async function listarMovimentos() {
  try {
    const db = await CRIARBD();
    const result = await db.getAllAsync(`
      SELECT movimentos.*, categorias.nome_cat, tipo_movimento.nome_movimento
      FROM movimentos
      INNER JOIN categorias ON movimentos.categoria_id = categorias.id
      INNER JOIN tipo_movimento ON movimentos.tipo_movimento_id = tipo_movimento.id;
    `);
    console.log('📌 Movimentos encontrados:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao buscar movimentos:', error);
  }
}

async function apagarTabelaMovimentos() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`DROP TABLE IF EXISTS movimentos;`);
    console.log("🗑 Tabela 'movimentos' apagada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao apagar tabela 'movimentos':", error);
  }
}

///////////////////////////P A G I N A   P R I N C I P A L //////////
async function obterSomaMovimentosPorCategoriaDespesa() {
  try {
    const db = await CRIARBD();

    const result = await db.getAllAsync(`
        SELECT 
            m.categoria_id, 
            c.nome_cat, 
            c.cor_cat, 
            c.img_cat,
            SUM(m.valor) as total_valor
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Despesa'
          AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now')
        GROUP BY m.categoria_id, c.nome_cat, c.cor_cat, c.img_cat
        ORDER BY total_valor DESC;
      `);

    return result;
  } catch (error) {
    console.error("❌ Erro ao obter movimentos agrupados por categoria de despesas:", error);
    return [];
  }
}


async function obterSomaMovimentosPorCategoriaReceita() {
  try {
    const db = await CRIARBD();

    const result = await db.getAllAsync(`
        SELECT 
            m.categoria_id, 
            c.nome_cat, 
            c.cor_cat, 
            c.img_cat,
            SUM(m.valor) as total_valor
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Receita'
          AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now')
        GROUP BY m.categoria_id, c.nome_cat, c.cor_cat, c.img_cat
        ORDER BY total_valor DESC;
      `);

    return result;
  } catch (error) {
    console.error("❌ Erro ao obter movimentos de receitas por categoria de receitas:", error);
    return [];
  }
}


async function obterTotalReceitas() {
  try {
    const db = await CRIARBD();

    const resultado = await db.getFirstAsync(`
        SELECT SUM(m.valor) AS total
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Receita'
          AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now');
      `);

    return resultado?.total ?? 0;
  } catch (error) {
    console.error("❌ Erro ao obter total de receitas:", error);
    return 0;
  }
}


async function obterTotalDespesas() {
  try {
    const db = await CRIARBD();

    const resultado = await db.getFirstAsync(`
        SELECT SUM(m.valor) AS total
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Despesa'
          AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now');
      `);

    return resultado?.total ?? 0;
  } catch (error) {
    console.error("❌ Erro ao obter total de despesas:", error);
    return 0;
  }
}


async function listarMovimentosUltimos30Dias() {
  try {
    const db = await CRIARBD();

    const result = await db.getAllAsync(`
       SELECT 
  m.*, 
  c.nome_cat, 
  c.cor_cat, 
  c.img_cat, 
  sc.icone_nome,
  sc.cor_subcat,
  tm.nome_movimento
FROM movimentos m
INNER JOIN categorias c ON m.categoria_id = c.id
LEFT JOIN sub_categorias sc ON m.sub_categoria_id = sc.id
INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
WHERE strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now')
ORDER BY datetime(m.data_movimento) DESC;

      `);

    return result;
  } catch (error) {
    console.error("❌ Erro ao listar movimentos dos últimos 30 dias:", error);
    return [];
  }
}


async function obterSaldoMensalAtual() {
  try {
    const db = await CRIARBD();

    // Total de receitas do mês atual
    const totalReceitas = await db.getFirstAsync(`
        SELECT SUM(m.valor) AS total
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Receita'
          AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now');
      `);

    // Total de despesas do mês atual
    const totalDespesas = await db.getFirstAsync(`
        SELECT SUM(m.valor) AS total
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Despesa'
          AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now');
      `);

    const receitas = totalReceitas?.total || 0;
    const despesas = totalDespesas?.total || 0;

    return receitas - despesas;

  } catch (error) {
    console.error("❌ Erro ao calcular saldo do mês:", error);
    return 0;
  }
}


//////////////////////////PAGINA M O V I M E N T O S //////////
async function buscarMovimentosPorMesAno(mes, ano) {
  try {
    const db = await CRIARBD();
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoMes = `${ano}-${mesFormatado}`;

    const result = await db.getAllAsync(`
      SELECT 
        m.id,
        m.nota,
        m.valor,
        m.data_movimento,
        tm.nome_movimento,
        c.id AS categoria_id,
        c.img_cat,
        c.cor_cat,
        s.nome_subcat,
        s.icone_nome AS img_subcat,
        s.cor_subcat
      FROM movimentos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      LEFT JOIN sub_categorias s ON m.sub_categoria_id = s.id
      INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
      WHERE strftime('%Y-%m', m.data_movimento) = ?
      ORDER BY m.data_movimento DESC;
    `, [anoMes]);

    return result;
  } catch (error) {
    console.error('❌ Erro ao buscar movimentos:', error);
    return [];
  }
}



async function obterBalancoGeral(mes, ano) {
  try {
    const db = await CRIARBD();
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoMes = `${ano}-${mesFormatado}`;

    // Total de movimentos no mês
    const totalMovimentos = await db.getFirstAsync(`
        SELECT COUNT(*) as total 
        FROM movimentos 
        WHERE strftime('%Y-%m', data_movimento) = ?;
      `, [anoMes]);

    // Total de despesas
    const totalDespesas = await db.getFirstAsync(`
        SELECT SUM(m.valor) as total 
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Despesa'
          AND strftime('%Y-%m', m.data_movimento) = ?;
      `, [anoMes]);

    // Total de receitas
    const totalReceitas = await db.getFirstAsync(`
        SELECT SUM(m.valor) as total 
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
        WHERE tm.nome_movimento = 'Receita'
          AND strftime('%Y-%m', m.data_movimento) = ?;
      `, [anoMes]);

    return {
      totalMovimentos: totalMovimentos?.total || 0,
      totalDespesas: totalDespesas?.total || 0,
      totalReceitas: totalReceitas?.total || 0,
    };
  } catch (error) {
    console.error("❌ Erro ao obter resumo mensal:", error);
    return { totalMovimentos: 0, totalDespesas: 0, totalReceitas: 0 };
  }
}


//////////////////////////PAGINA DEYALHES F A T U R A S //////////

async function obterCategoriaPorMovimentoId(movimentoId) {
  const db = await CRIARBD();

  const result = await db.getFirstAsync(`
      SELECT c.id as id_categoria, c.nome_cat as nome_categoria, c.img_cat as icone_categoria
      FROM movimentos m
      JOIN categorias c ON m.categoria_id = c.id
      WHERE m.id = ?
    `, [movimentoId]);

  return result;
}

async function obterSubCategoriaPorMovimentoId(movimentoId) {
  try {
    const db = await CRIARBD();

    const result = await db.getFirstAsync(`
      SELECT sc.id AS id_subcategoria,
             sc.nome_subcat,
             sc.icone_nome,
             sc.cor_subcat
      FROM movimentos m
      JOIN sub_categorias sc ON m.sub_categoria_id = sc.id
      WHERE m.id = ?
    `, [movimentoId]);

    return result; // ou null se não houver subcategoria
  } catch (error) {
    console.error('❌ Erro ao buscar subcategoria por movimento ID:', error);
    return null;
  }
}




async function limparTabelaMovimentos() {
  try {
    const db = await CRIARBD();

    // 1. Apagar todos os dados da tabela
    await db.runAsync(`DELETE FROM movimentos;`);

    // 2. Resetar o autoincremento (sequência de IDs)
    await db.runAsync(`DELETE FROM sqlite_sequence WHERE name = 'movimentos';`);

    console.log("🧹 Tabela 'movimentos' limpa e sequência de IDs reiniciada!");
  } catch (error) {
    console.error("❌ Erro ao limpar tabela 'movimentos':", error);
  }
}
//////////////////////////////PAGINA DE UMA CATEGORIA

async function obterSomaMovimentosPorCategoriaEMes(categoriaId, mes, ano) {
  try {
    const db = await CRIARBD();
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoMes = `${ano}-${mesFormatado}`;

    const resultado = await db.getFirstAsync(`
      SELECT SUM(m.valor) AS total
      FROM movimentos m
      WHERE m.categoria_id = ?
        AND strftime('%Y-%m', m.data_movimento) = ?
    `, [categoriaId, anoMes]);

    return resultado?.total ?? 0;
  } catch (error) {
    console.error("❌ Erro ao obter soma dos movimentos da categoria:", error);
    return 0;
  }
}


async function obterSomaMovimentosPorIntervaloFormatado(categoriaId, dataInicio, dataFim) {
  try {
    const db = await CRIARBD();
    const resultado = await db.getFirstAsync(`
      SELECT SUM(valor) as total
      FROM movimentos
      WHERE categoria_id = ?
        AND date(data_movimento) BETWEEN date(?) AND date(?)
    `, [categoriaId, dataInicio, dataFim]);

    return resultado?.total ?? 0;
  } catch (error) {
    console.error('❌ Erro ao obter soma por intervalo:', error);
    return 0;
  }
}


async function obterSomaMovimentosPorSubCategoriaEMes(subCategoriaId, mes, ano) {
  try {
    const db = await CRIARBD();
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoMes = `${ano}-${mesFormatado}`;

    const resultado = await db.getFirstAsync(`
      SELECT SUM(valor) as total
      FROM movimentos
      WHERE sub_categoria_id = ?
        AND strftime('%Y-%m', data_movimento) = ?
    `, [subCategoriaId, anoMes]);

    return resultado?.total ?? 0;
  } catch (error) {
    console.error('❌ Erro ao obter soma de movimentos da subcategoria:', error);
    return 0;
  }
}

async function listarMovimentosPorCategoriaMesAno(categoriaId, mes, ano) {
  try {
    const db = await CRIARBD();
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoMes = `${ano}-${mesFormatado}`;

    const result = await db.getAllAsync(`
      SELECT 
        m.id,
        m.valor,
        m.nota,
        m.data_movimento,
        c.img_cat,
        c.cor_cat,
        sc.icone_nome AS img_subcat,
        sc.cor_subcat,
        tm.nome_movimento
      FROM movimentos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      LEFT JOIN sub_categorias sc ON m.sub_categoria_id = sc.id
      INNER JOIN tipo_movimento tm ON c.tipo_movimento_id = tm.id
      WHERE m.categoria_id = ?
        AND strftime('%Y-%m', m.data_movimento) = ?
      ORDER BY datetime(m.data_movimento) DESC;
    `, [categoriaId, anoMes]);

    return result;
  } catch (error) {
    console.error("❌ Erro ao listar movimentos da categoria:", error);
    return [];
  }
}

export {
  criarTabelaMovimentos,
  inserirMovimento,
  listarMovimentos,
  apagarTabelaMovimentos,
  obterSomaMovimentosPorCategoriaDespesa,
  obterSomaMovimentosPorCategoriaReceita,
  obterTotalDespesas,
  obterTotalReceitas,
  listarMovimentosUltimos30Dias,
  obterSaldoMensalAtual,
  buscarMovimentosPorMesAno,
  obterBalancoGeral,
  obterCategoriaPorMovimentoId,
  limparTabelaMovimentos,
  obterSubCategoriaPorMovimentoId,
  obterSomaMovimentosPorCategoriaEMes,
  obterSomaMovimentosPorIntervaloFormatado,
  obterSomaMovimentosPorSubCategoriaEMes,
  listarMovimentosPorCategoriaMesAno,
  atualizarMovimento




};
