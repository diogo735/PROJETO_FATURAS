import { CRIARBD } from './databaseInstance';
import * as Notify from 'expo-notifications';
async function criarTabelaMetas() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS metas (
        id_meta INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER,
        sub_categoria_id INTEGER,
        valor_meta REAL NOT NULL,
        valor_atual REAL DEFAULT 0,
        data_inicio TEXT NOT NULL,
        data_fim TEXT NOT NULL,
        repetir_meta INTEGER NOT NULL CHECK (repetir_meta IN (0, 1)),
        recebe_alerta INTEGER,
        notificado_limite_user INTEGER DEFAULT 0,
        notificado_valor_meta INTEGER DEFAULT 0,
        meta_ativa INTEGER DEFAULT 1,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
        FOREIGN KEY (sub_categoria_id) REFERENCES sub_categorias(id) ON DELETE CASCADE
      );
    `);
    //console.log("✅ Tabela 'metas' criada com sucesso!");
  } catch (error) {
    console.error('❌ Erro ao criar tabela "metas":', error);
  }
}

async function inserirMeta(categoria_id, sub_categoria_id, valor_meta, data_inicio, data_fim, repetir_meta, recebe_alerta, valor_atual = 0) {
  try {
    const db = await CRIARBD();

    console.log("📥 Dados que serão inseridos:", {
      categoria_id,
      sub_categoria_id,
      valor_meta,
      data_inicio,
      data_fim,
      repetir_meta,
      recebe_alerta
    });

    // 1. Inserir a meta com categoria e/ou subcategoria
    const result = await db.runAsync(
      `INSERT INTO metas (
        categoria_id, sub_categoria_id, valor_meta, valor_atual, data_inicio, data_fim, repetir_meta, recebe_alerta, notificado_limite_user, notificado_valor_meta, meta_ativa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        categoria_id,
        sub_categoria_id,
        valor_meta,
        0, // valor_atual inicial
        data_inicio,
        data_fim,
        repetir_meta ? 1 : 0,
        recebe_alerta,
        0, 0, 1
      ]
    );

    console.log(`✅ Meta inserida! ID: ${result.lastInsertRowId}`);

    // 2. Buscar movimentos (da categoria OU subcategoria)
    let movimentos = [];

    if (categoria_id !== null) {
      movimentos = await db.getAllAsync(
        `SELECT valor, data_movimento FROM movimentos WHERE categoria_id = ?`,
        [categoria_id]
      );
    } else if (sub_categoria_id !== null) {
      movimentos = await db.getAllAsync(
        `SELECT valor, data_movimento FROM movimentos WHERE sub_categoria_id = ?`,
        [sub_categoria_id]
      );
    }

    // 3. Somar apenas os valores dentro do intervalo de datas
    const total = movimentos
      .filter(m => {
        const data = new Date(m.data_movimento);
        return data >= new Date(data_inicio) && data <= new Date(data_fim);
      })
      .reduce((soma, mov) => soma + mov.valor, 0);

    // 4. Atualizar o campo valor_atual da meta
    await db.runAsync(
      `UPDATE metas SET valor_atual = ? WHERE id_meta = ?`,
      [total, result.lastInsertRowId]
    );

    // 5. Buscar nome da categoria para notificação
    let nome_cat = 'Meta';
    if (categoria_id !== null) {
      const cat = await db.getFirstAsync(
        `SELECT nome_cat FROM categorias WHERE id = ?`,
        [categoria_id]
      );
      nome_cat = cat?.nome_cat ?? 'Categoria';
    } else if (sub_categoria_id !== null) {
      const sub = await db.getFirstAsync(
        `SELECT nome_subcat FROM sub_categorias WHERE id = ?`,
        [sub_categoria_id]
      );
      nome_cat = sub?.nome_subcat ?? 'Subcategoria';
    }

    // 6. Enviar notificação
    await verificar_se_envia_notificacao({
      id_meta: result.lastInsertRowId,
      categoria_id,
      sub_categoria_id,
      valor_meta,
      valor_atual: total,
      data_inicio,
      data_fim,
      repetir_meta,
      recebe_alerta,
      notificado_limite_user: 0,
      notificado_valor_meta: 0,
      meta_ativa: 1,
      nome_cat
    });

    console.log(`🔄 Meta atualizada com valor atual: ${total}`);
  } catch (error) {
    console.error('❌ Erro ao inserir/atualizar meta:', error);
  }
}



async function listarMetas() {
  try {
    const db = await CRIARBD();
    const result = await db.getAllAsync(`
      SELECT 
        metas.*,
        categorias.nome_cat,
        categorias.cor_cat,
        categorias.img_cat,
        sub_categorias.nome_subcat,
        sub_categorias.cor_subcat,
        sub_categorias.icone_nome
      FROM metas
      LEFT JOIN categorias ON metas.categoria_id = categorias.id
      LEFT JOIN sub_categorias ON metas.sub_categoria_id = sub_categorias.id
      ORDER BY data_inicio DESC;
    `);
    return result;
  } catch (error) {
    console.error('❌ Erro ao listar metas:', error);
    return [];
  }
}


async function apagarMeta(id_meta) {
  try {
    const db = await CRIARBD();
    const result = await db.runAsync(`DELETE FROM metas WHERE id_meta = ?`, [id_meta]);
    console.log(`🗑 Meta apagada! Linhas afetadas: ${result.changes}`);
  } catch (error) {
    console.error('❌ Erro ao apagar meta:', error);
  }
}

async function limparMetas() {
  try {
    const db = await CRIARBD();

    await db.runAsync(`DELETE FROM metas;`);

    await db.runAsync(`DELETE FROM sqlite_sequence WHERE name = 'metas';`);

    console.log('🧹 Tabela "metas" limpa e IDs resetados!');
  } catch (error) {
    console.error('❌ Erro ao limpar a tabela "metas":', error);
  }
}

async function buscarMetaPorId(id_meta) {
  try {
    const db = await CRIARBD();
    const result = await db.getFirstAsync(
      `SELECT metas.*, categorias.nome_cat, categorias.cor_cat, categorias.img_cat
         FROM metas
         INNER JOIN categorias ON metas.categoria_id = categorias.id
         WHERE metas.id_meta = ?`,
      [id_meta]
    );
    return result;
  } catch (error) {
    console.error('❌ Erro ao buscar meta por ID:', error);
    return null;
  }
}

async function apagarTabelaMetas() {
  try {
    const db = await CRIARBD();

    // Apaga a tabela
    await db.execAsync(`DROP TABLE IF EXISTS metas;`);
    console.log('🗑 Tabela "metas" apagada com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao resetar a tabela "metas":', error);
  }
}

async function verificar_se_envia_notificacao(meta) {
  try {
    const db = await CRIARBD();

    const hoje = new Date();

    // ✅ Verifica se a meta está ativa e dentro da validade
    if (meta.meta_ativa !== 1 ) {
      console.log('🧪 Objeto meta recebido:', meta);
      console.log('Valor da variável:',meta.meta_ativa);
      console.log(`⏳ Meta ${meta.id_meta} não está ativa ou fora do intervalo de datas.`);
      return;
    }

    let nomeMeta = meta.nome_cat ?? 'Meta';

    if (!meta.nome_cat && meta.sub_categoria_id) {
      const sub = await db.getFirstAsync(`SELECT nome_subcat FROM sub_categorias WHERE id = ?`, [meta.sub_categoria_id]);
      nomeMeta = sub?.nome_subcat ?? 'Meta';
    }
    // 🔔 Notificação para o limite personalizado (recebe_alerta)
    if (meta.recebe_alerta && !meta.notificado_limite_user && meta.valor_atual >= meta.recebe_alerta) {
      await Notify.scheduleNotificationAsync({
        content: {
          title: 'Limite de Alerta Atingido!',
          body: `Você atingiu o limite de ${meta.recebe_alerta}€ definido para "${meta.nomeMeta}".`,
          sound: true,
        },
        trigger: null,
      });

      await db.runAsync(
        `UPDATE metas SET notificado_limite_user = 1 WHERE id_meta = ?`,
        [meta.id_meta]
      );
    }

    // 🏁 Notificação quando a meta é atingida, mesmo sem alerta personalizado
    if (!meta.notificado_valor_meta && meta.valor_atual >= meta.valor_meta) {
      await Notify.scheduleNotificationAsync({
        content: {
          title: 'Valor da Meta Atingido',
          body: `Ultrapassaste o valor para a meta de "${meta.nomeMeta}"!`,
          sound: true,
        },
        trigger: null,
      });

      await db.runAsync(
        `UPDATE metas SET notificado_valor_meta = 1 WHERE id_meta = ?`,
        [meta.id_meta]
      );
    }

  } catch (error) {
    console.error('❌ Erro ao verificar/enviar notificações da meta:', error);
  }
}

async function verificarNotificacoesDeTodasMetas() {
  try {
    const db = await CRIARBD();

    const metas = await db.getAllAsync(`
      SELECT 
        metas.*, 
        categorias.nome_cat, 
        sub_categorias.nome_subcat 
      FROM metas
      LEFT JOIN categorias ON metas.categoria_id = categorias.id
      LEFT JOIN sub_categorias ON metas.sub_categoria_id = sub_categorias.id
      WHERE metas.meta_ativa = 1;
    `);

    for (const meta of metas) {
      await verificar_se_envia_notificacao(meta); 
    }

    console.log('🔁 Verificação de notificações de metas concluída!');
  } catch (error) {
    console.error('❌ Erro ao verificar notificações de metas:', error);
  }
}


async function buscarMetaPorId_pagina_editar(id_meta) {
  try {
    const db = await CRIARBD();
    const meta = await db.getFirstAsync(`
      SELECT 
        id_meta,
        categoria_id,
        valor_meta,
        data_inicio,
        data_fim,
        repetir_meta,
        recebe_alerta
      FROM metas
      WHERE id_meta = ?;
    `, [id_meta]);

    return meta;
  } catch (error) {
    console.error('❌ Erro ao buscar meta por ID para edição:', error);
    return null;
  }
}
async function atualizarMeta(id_meta, categoria_id, valor_meta, data_inicio, data_fim, repetir_meta, recebe_alerta) {
  const db = await CRIARBD();

  // 1. Atualiza os campos principais da meta
  await db.runAsync(
    `UPDATE metas
     SET categoria_id = ?, valor_meta = ?, data_inicio = ?, data_fim = ?, repetir_meta = ?, recebe_alerta = ?
     WHERE id_meta = ?`,
    [categoria_id, valor_meta, data_inicio, data_fim, repetir_meta ? 1 : 0, recebe_alerta, id_meta]
  );

  // 2. Recalcula o valor_atual da meta com base nos movimentos
  const movimentos = await db.getAllAsync(
    `SELECT valor, data_movimento FROM movimentos WHERE categoria_id = ?`,
    [categoria_id]
  );

  const total = movimentos
    .filter(m => {
      const data = new Date(m.data_movimento);
      return data >= new Date(data_inicio) && data <= new Date(data_fim);
    })
    .reduce((soma, mov) => soma + mov.valor, 0);

  await db.runAsync(
    `UPDATE metas SET valor_atual = ? WHERE id_meta = ?`,
    [total, id_meta]
  );

  // 3. Buscar nome da categoria para notificação
  const categoria = await db.getFirstAsync(
    `SELECT nome_cat FROM categorias WHERE id = ?`,
    [categoria_id]
  );

  // 4. Verificar se deve enviar notificação
  await verificar_se_envia_notificacao({
    id_meta,
    categoria_id,
    valor_meta,
    valor_atual: total,
    data_inicio,
    data_fim,
    repetir_meta,
    recebe_alerta,
    notificado_limite_user: 0,
    notificado_valor_meta: 0,
    meta_ativa: 1,
    nome_cat: categoria?.nome_cat ?? 'Categoria',
  });

  console.log(`✅ Meta atualizada com recalculo. valor_atual = ${total}`);
}



export {
  criarTabelaMetas,
  inserirMeta,
  listarMetas,
  apagarMeta,
  limparMetas,
  buscarMetaPorId,
  apagarTabelaMetas,
  verificar_se_envia_notificacao,
  verificarNotificacoesDeTodasMetas,
  buscarMetaPorId_pagina_editar,
  atualizarMeta
};
