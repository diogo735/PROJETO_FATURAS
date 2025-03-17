import * as SQLite from 'expo-sqlite';


async function criarTabelaMovimentos() {
    try {
        const db = await SQLite.openDatabaseAsync('app.db');
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS movimentos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          valor REAL NOT NULL,
          data_movimento TEXT NOT NULL,
          categoria_id INTEGER NOT NULL,
          tipo_movimento_id INTEGER NOT NULL,
          nota TEXT,  
          FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
          FOREIGN KEY (tipo_movimento_id) REFERENCES tipo_movimento(id) ON DELETE CASCADE
      );`
        );
        /*console.log('✅ Tabela "movimentos" criada ou já existente com sucesso!');*/
    } catch (error) {
        console.error('❌ Erro ao criar tabela "movimentos":', error);
    }
}

async function inserirMovimento(valor, data_movimento, categoria_id, tipo_movimento_id, nota = '') {
    try {
        const db = await SQLite.openDatabaseAsync('app.db');
        const result = await db.runAsync(
            `INSERT INTO movimentos (valor, data_movimento, categoria_id, tipo_movimento_id, nota) 
       VALUES (?, ?, ?, ?, ?);`,
            [valor, data_movimento, categoria_id, tipo_movimento_id, nota]
        );
        /*console.log(`✅ Movimento inserido! ID: ${result.lastInsertRowId}`);*/
    } catch (error) {
        console.error('❌ Erro ao inserir movimento:', error);
    }
}

async function inserirVariosMovimentos() {
    try {
        const db = await SQLite.openDatabaseAsync('app.db');
        const tabelaExiste = await db.getFirstAsync(
            `SELECT name FROM sqlite_master WHERE type='table' AND name='movimentos';`
        );

        if (!tabelaExiste) {
            console.error("❌ A tabela 'movimentos' não existe. Criação necessária antes da inserção.");
            return;
        }
        const listaDeMovimentos = [
            { valor: 100.50, data_movimento: "2025-03-17 08:30:00", categoria_id: 3, tipo_movimento_id: 2, nota: "Despesa Exemplo 1" },
            { valor: 950.00, data_movimento: "2025-03-18 15:00:00", categoria_id: 3, tipo_movimento_id: 2, nota: "Despesa Exemplo 2" },
            { valor: 150.00, data_movimento: "2025-03-19 19:45:00", categoria_id: 11, tipo_movimento_id: 2, nota: "Despesa Exemplo 3" },
            { valor: 200.00, data_movimento: "2025-03-20 10:15:00", categoria_id: 1, tipo_movimento_id: 2, nota: "Despesa Exemplo 4" },
            { valor: 150.00, data_movimento: "2025-03-20 19:19:00", categoria_id: 1, tipo_movimento_id: 2, nota: "Despesa Exemplo 5" },
            { valor: 55.00, data_movimento: "2025-01-20 19:10:00", categoria_id: 2, tipo_movimento_id: 2, nota: "Despesa Exemplo 6" },
            { valor: 50.00, data_movimento: "2025-01-29 10:10:00", categoria_id: 9, tipo_movimento_id: 2, nota: "Despesa Exemplo 7" },
        ];


        if (listaDeMovimentos.length === 0) {
            console.warn("⚠️ Nenhum movimento para inserir.");
            return;
        }
        const result = await db.getFirstAsync(`SELECT COUNT(*) as total FROM movimentos;`);

        if (result.total > 0) {
            //console.log("Ja tem movimentos.");
            return;
        }

        for (const movimento of listaDeMovimentos) {
            await db.runAsync(
                `INSERT INTO movimentos (valor, data_movimento, categoria_id, tipo_movimento_id, nota) 
           VALUES (?, ?, ?, ?, ?);`,
                [movimento.valor, movimento.data_movimento, movimento.categoria_id, movimento.tipo_movimento_id, movimento.nota]
            );

            //console.log(`✅ Movimento inserido: ${movimento.valor}€ - ${movimento.nota}`);
        }

        //console.log(`🎉 ${listaDeMovimentos.length} movimentos foram inseridos com sucesso!`);
    } catch (error) {
        console.error('❌ Erro ao inserir múltiplos movimentos:', error);
    }
}
async function listarMovimentos() {
    try {
        const db = await SQLite.openDatabaseAsync('app.db');
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

async function obterSomaMovimentosPorCategoria() {
    try {
      const db = await SQLite.openDatabaseAsync('app.db');
  
      const result = await db.getAllAsync(`
        SELECT 
          m.categoria_id, 
          c.nome_cat, 
          c.cor_cat, 
          c.img_cat,
          SUM(m.valor) as total_valor
        FROM movimentos m
        INNER JOIN categorias c ON m.categoria_id = c.id
        GROUP BY m.categoria_id, c.nome_cat,c.cor_cat, c.img_cat
        ORDER BY total_valor DESC;
      `);
  
     // console.log("📊 Dados de movimentos agrupados por categoria:", result);
      return result;
    } catch (error) {
      console.error("❌ Erro ao obter movimentos agrupados por categoria:", error);
      return [];
    }
  }

async function apagarTodosMovimentos() {
    try {
        const db = await SQLite.openDatabaseAsync('app.db');
        const result = await db.runAsync(`DELETE FROM movimentos;`);
        console.log(`🗑 Todos os movimentos foram apagados! Registros afetados: ${result.changes}`);
    } catch (error) {
        console.error('❌ Erro ao apagar movimentos:', error);
    }
}


export { criarTabelaMovimentos, inserirMovimento, listarMovimentos, apagarTodosMovimentos, inserirVariosMovimentos,obterSomaMovimentosPorCategoria };
