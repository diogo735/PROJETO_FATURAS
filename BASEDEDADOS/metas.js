import { CRIARBD } from './databaseInstance';

async function criarTabelaMetas() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS metas (
        id_meta INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER NOT NULL,
        valor_meta REAL NOT NULL,
        data_inicio TEXT NOT NULL,
        data_fim TEXT NOT NULL,
        repetir_meta INTEGER NOT NULL CHECK (repetir_meta IN (0, 1)),
        recebe_alerta INTEGER,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
      );
    `);
    //console.log("✅ Tabela 'metas' criada com sucesso!");
  } catch (error) {
    console.error('❌ Erro ao criar tabela "metas":', error);
  }
}

async function inserirMeta(categoria_id, valor_meta, data_inicio, data_fim, repetir_meta, recebe_alerta = null) {
    try {
      const db = await CRIARBD();
      const result = await db.runAsync(
        `INSERT INTO metas (
          categoria_id, valor_meta, data_inicio, data_fim, repetir_meta, recebe_alerta
        ) VALUES (?, ?, ?, ?, ?, ?);`,
        [categoria_id, valor_meta, data_inicio, data_fim, repetir_meta ? 1 : 0, recebe_alerta]
      );
      console.log(`✅ Meta inserida! ID: ${result.lastInsertRowId}`);
    } catch (error) {
      console.error('❌ Erro ao inserir meta:', error);
    }
  }
  
  async function listarMetas() {
    try {
      const db = await CRIARBD();
      const result = await db.getAllAsync(`
        SELECT metas.*, categorias.nome_cat, categorias.cor_cat, categorias.img_cat
        FROM metas
        INNER JOIN categorias ON metas.categoria_id = categorias.id
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
  
  
export { criarTabelaMetas,inserirMeta,listarMetas,apagarMeta };
