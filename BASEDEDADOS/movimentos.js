import * as SQLite from 'expo-sqlite';
import { CRIARBD } from './databaseInstance';
import { verificar_se_envia_notificacao } from './metas';
async function criarTabelaMovimentos() {

    try {
        const db = await CRIARBD();
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
        const db = await CRIARBD();

        // 1. Inserir movimento
        await db.runAsync(
            `INSERT INTO movimentos (valor, data_movimento, categoria_id, tipo_movimento_id, nota) 
         VALUES (?, ?, ?, ?, ?);`,
            [valor, data_movimento, categoria_id, tipo_movimento_id, nota]
        );

        // 2. Verificar se há alguma meta com essa categoria
        const meta = await db.getFirstAsync(
            `SELECT * FROM metas 
             WHERE categoria_id = ? 
               AND meta_ativa = 1
               AND date(?) BETWEEN date(data_inicio) AND date(data_fim)`,
            [categoria_id, data_movimento]
          );
          

        if (meta) {
            const novoValor = (meta.valor_atual || 0) + valor;

            // 3. Atualizar valor_atual da meta
            await db.runAsync(
                `UPDATE metas SET valor_atual = ? WHERE id_meta = ?`,
                [novoValor, meta.id_meta]
            );
            // Atualiza a meta com novo valor para passar à função de verificação
            const metaAtualizada = { ...meta, valor_atual: novoValor };
            await verificar_se_envia_notificacao(metaAtualizada);

            console.log(`📈 Meta ${meta.id_meta} atualizada: novo valor atual = ${novoValor}`);
        }

    } catch (error) {
        console.error('❌ Erro ao inserir movimento ou atualizar meta:', error);
    }
}


async function inserirVariosMovimentos() {
    try {
        const db = await CRIARBD();
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

async function apagarTodosMovimentos() {
    try {
        const db = await CRIARBD();
        const result = await db.runAsync(`DELETE FROM movimentos;`);
        await db.runAsync(`UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'movimentos';`);
        console.log(`🗑 Todos os movimentos foram apagados! Registros afetados: ${result.changes}`);
    } catch (error) {
        console.error('❌ Erro ao apagar movimentos:', error);
    }
}
///////////////////////////P A G I N A   P R I N C I P A L //////////
async function obterSomaMovimentosPorCategoriaDespesa() {//DAS DESPESAS
    try {
        const db = await CRIARBD();

        // Primeiro, obter o ID correspondente ao tipo "Despesa"
        const tipoDespesa = await db.getFirstAsync(`
            SELECT id FROM tipo_movimento WHERE nome_movimento = 'Despesa';
        `);

        if (!tipoDespesa) {
            console.error("❌ Tipo de movimento 'Despesa' não encontrado.");
            return [];
        }

        const result = await db.getAllAsync(`
            SELECT 
                m.categoria_id, 
                c.nome_cat, 
                c.cor_cat, 
                c.img_cat,
                SUM(m.valor) as total_valor
            FROM movimentos m
            INNER JOIN categorias c ON m.categoria_id = c.id
            WHERE m.tipo_movimento_id = ?
              AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now')
            GROUP BY m.categoria_id, c.nome_cat, c.cor_cat, c.img_cat
            ORDER BY total_valor DESC;
        `, [tipoDespesa.id]);

        return result;
    } catch (error) {
        console.error("❌ Erro ao obter movimentos agrupados por categoria de despesas:", error);
        return [];
    }
}

async function obterSomaMovimentosPorCategoriaReceita() { // DAS RECEITAS
    try {
        const db = await CRIARBD();

        // Primeiro, obter o ID correspondente ao tipo "Receita"
        const tipoReceita = await db.getFirstAsync(`
            SELECT id FROM tipo_movimento WHERE nome_movimento = 'Receita';
        `);

        if (!tipoReceita) {
            console.error("❌ Tipo de movimento 'Receita' não encontrado.");
            return [];
        }

        const result = await db.getAllAsync(`
            SELECT 
                m.categoria_id, 
                c.nome_cat, 
                c.cor_cat, 
                c.img_cat,
                SUM(m.valor) as total_valor
            FROM movimentos m
            INNER JOIN categorias c ON m.categoria_id = c.id
            WHERE m.tipo_movimento_id = ?
                AND strftime('%Y-%m', m.data_movimento) = strftime('%Y-%m', 'now')
            GROUP BY m.categoria_id, c.nome_cat, c.cor_cat, c.img_cat
            ORDER BY total_valor DESC;
        `, [tipoReceita.id]);

        return result;
    } catch (error) {
        console.error("❌ Erro ao obter movimentos de receitas por categoria de receitas:", error);
        return [];
    }
}

async function obterTotalReceitas() {
    try {
        const db = await CRIARBD();
        const tipo = await db.getFirstAsync(`SELECT id FROM tipo_movimento WHERE nome_movimento = 'Receita';`);

        if (!tipo) {
            console.error("❌ Tipo 'Receita' não encontrado.");
            return 0;
        }

        const resultado = await db.getFirstAsync(`
            SELECT SUM(valor) AS total 
            FROM movimentos 
            WHERE tipo_movimento_id = ? 
              AND strftime('%Y-%m', data_movimento) = strftime('%Y-%m', 'now');
          `, [tipo.id]);

        return resultado?.total ?? 0;
    } catch (error) {
        console.error("❌ Erro ao obter total de receitas:", error);
        return 0;
    }
}

async function obterTotalDespesas() {
    try {
        const db = await CRIARBD();
        const tipo = await db.getFirstAsync(`SELECT id FROM tipo_movimento WHERE nome_movimento = 'Despesa';`);

        if (!tipo) {
            console.error("❌ Tipo 'Despesa' não encontrado.");
            return 0;
        }

        const resultado = await db.getFirstAsync(`
            SELECT SUM(valor) AS total 
            FROM movimentos 
            WHERE tipo_movimento_id = ? 
              AND strftime('%Y-%m', data_movimento) = strftime('%Y-%m', 'now');
          `, [tipo.id]);

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
        SELECT movimentos.*, categorias.nome_cat, categorias.cor_cat, categorias.img_cat, tipo_movimento.nome_movimento
        FROM movimentos
        INNER JOIN categorias ON movimentos.categoria_id = categorias.id
        INNER JOIN tipo_movimento ON movimentos.tipo_movimento_id = tipo_movimento.id
        WHERE datetime(data_movimento) >= datetime('now', '-30 days')
        ORDER BY datetime(data_movimento) DESC;
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

        const tipoReceita = await db.getFirstAsync(`SELECT id FROM tipo_movimento WHERE nome_movimento = 'Receita';`);
        const tipoDespesa = await db.getFirstAsync(`SELECT id FROM tipo_movimento WHERE nome_movimento = 'Despesa';`);

        if (!tipoReceita || !tipoDespesa) {
            console.error("❌ Tipos 'Receita' ou 'Despesa' não encontrados.");
            return 0;
        }

        const totalReceitas = await db.getFirstAsync(`
            SELECT SUM(valor) AS total FROM movimentos 
            WHERE tipo_movimento_id = ? AND strftime('%Y-%m', data_movimento) = strftime('%Y-%m', 'now');
        `, [tipoReceita.id]);

        const totalDespesas = await db.getFirstAsync(`
            SELECT SUM(valor) AS total FROM movimentos 
            WHERE tipo_movimento_id = ? AND strftime('%Y-%m', data_movimento) = strftime('%Y-%m', 'now');
        `, [tipoDespesa.id]);

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
        const mesFormatado = mes.toString().padStart(2, '0'); // Garante que o mês tem dois dígitos
        const anoMes = `${ano}-${mesFormatado}`; // Formato aaaa-mm

        const result = await db.getAllAsync(`
        SELECT 
          movimentos.id,
          movimentos.nota,
          movimentos.valor,
          movimentos.data_movimento,
          tipo_movimento.nome_movimento,
          categorias.id AS categoria_id,
          categorias.img_cat,
          categorias.cor_cat
        FROM movimentos
        INNER JOIN categorias ON movimentos.categoria_id = categorias.id
        INNER JOIN tipo_movimento ON movimentos.tipo_movimento_id = tipo_movimento.id
        WHERE strftime('%Y-%m', data_movimento) = ?
        ORDER BY data_movimento DESC;
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
        const anoMes = `${ano}-${mesFormatado}`; // ex: 2025-03

        const tipoDespesa = await db.getFirstAsync(`
            SELECT id FROM tipo_movimento WHERE nome_movimento = 'Despesa';
        `);
        const tipoReceita = await db.getFirstAsync(`
            SELECT id FROM tipo_movimento WHERE nome_movimento = 'Receita';
        `);

        if (!tipoDespesa || !tipoReceita) {
            console.error("❌ Tipos 'Despesa' ou 'Receita' não encontrados.");
            return { totalMovimentos: 0, totalDespesas: 0, totalReceitas: 0 };
        }

        const totalMovimentos = await db.getFirstAsync(`
            SELECT COUNT(*) as total 
            FROM movimentos 
            WHERE strftime('%Y-%m', data_movimento) = ?;
        `, [anoMes]);

        const totalDespesas = await db.getFirstAsync(`
            SELECT SUM(valor) as total 
            FROM movimentos 
            WHERE tipo_movimento_id = ? 
              AND strftime('%Y-%m', data_movimento) = ?;
        `, [tipoDespesa.id, anoMes]);

        const totalReceitas = await db.getFirstAsync(`
            SELECT SUM(valor) as total 
            FROM movimentos 
            WHERE tipo_movimento_id = ? 
              AND strftime('%Y-%m', data_movimento) = ?;
        `, [tipoReceita.id, anoMes]);

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






/////////////////////////////////////////////////////////////////////// TEEEEEEEESSSSSSSSSSSTTTTTTTTTEEEEEEESXXXXXXXXXXXXXXX
const listaDeMovimentosTODOS = [
    { valor: 100.50, data_movimento: "2025-04-17 08:30:00", categoria_id: 1, tipo_movimento_id: 2, nota: "Despesa Exemplo 1" },
    { valor: 950.00, data_movimento: "2025-04-18 15:00:00", categoria_id: 2, tipo_movimento_id: 2, nota: "Despesa Exemplo 2" },
    { valor: 150.00, data_movimento: "2025-04-19 19:45:00", categoria_id: 3, tipo_movimento_id: 2, nota: "Despesa Exemplo 3" },
    { valor: 200.00, data_movimento: "2025-04-20 10:15:00", categoria_id: 4, tipo_movimento_id: 2, nota: "Despesa Exemplo 4" },
    { valor: 150.00, data_movimento: "2025-04-20 19:19:00", categoria_id: 5, tipo_movimento_id: 2, nota: "Despesa Exemplo 5" },
    { valor: 55.00, data_movimento: "2025-04-20 19:10:00", categoria_id: 6, tipo_movimento_id: 2, nota: "Despesa Exemplo 6" },
    { valor: 50.00, data_movimento: "2025-04-29 10:10:00", categoria_id: 7, tipo_movimento_id: 2, nota: "Despesa Exemplo 7" },
    { valor: 150.00, data_movimento: "2025-04-19 19:45:00", categoria_id: 8, tipo_movimento_id: 2, nota: "Despesa Exemplo 3" },
    { valor: 200.00, data_movimento: "2025-04-20 10:15:00", categoria_id: 9, tipo_movimento_id: 2, nota: "Despesa Exemplo 4" },
    { valor: 150.00, data_movimento: "2025-04-20 19:19:00", categoria_id: 10, tipo_movimento_id: 2, nota: "Despesa Exemplo 5" },
    { valor: 55.00, data_movimento: "2025-04-20 19:10:00", categoria_id: 11, tipo_movimento_id: 2, nota: "Despesa Exemplo 6" },
    { valor: 50.00, data_movimento: "2025-04-29 10:10:00", categoria_id: 12, tipo_movimento_id: 2, nota: "Despesa Exemplo 7" },
];
const listaDeMovimentosNormais = [
    { valor: 100.50, data_movimento: "2025-04-17 08:30:00", categoria_id: 1, tipo_movimento_id: 2, nota: "Despesa Exemplo 1" },
    { valor: 950.00, data_movimento: "2025-04-18 15:00:00", categoria_id: 2, tipo_movimento_id: 2, nota: "Despesa Exemplo 2" },
    { valor: 150.00, data_movimento: "2025-04-19 19:45:00", categoria_id: 3, tipo_movimento_id: 2, nota: "Despesa Exemplo 3" },
    { valor: 200.00, data_movimento: "2025-04-20 10:15:00", categoria_id: 4, tipo_movimento_id: 2, nota: "Despesa Exemplo 4" },
    { valor: 150.00, data_movimento: "2025-04-20 19:19:00", categoria_id: 5, tipo_movimento_id: 2, nota: "Despesa Exemplo 5" },
    { valor: 55.00, data_movimento: "2025-04-20 19:10:00", categoria_id: 6, tipo_movimento_id: 2, nota: "Despesa Exemplo 6" },
];


async function inserirMovimentoTesteUnico() {
    try {
        const m = listaDeMovimentosTODOS[0];
        await inserirMovimento(m.valor, m.data_movimento, m.categoria_id, m.tipo_movimento_id, m.nota);
        console.log("✅ Movimento de teste inserido!");
    } catch (error) {
        console.error("❌ Erro ao inserir movimento teste único:", error);
    }
}

async function inserirTodosMovimentosTeste() {
    try {
        for (const m of listaDeMovimentosTODOS) {
            await inserirMovimento(m.valor, m.data_movimento, m.categoria_id, m.tipo_movimento_id, m.nota);
        }
        console.log("🎉 Todos os movimentos de teste foram inseridos!");
    } catch (error) {
        console.error("❌ Erro ao inserir movimentos de teste:", error);
    }
}


async function inserirMovimentoTesteNormal() {
    try {
        for (const m of listaDeMovimentosNormais) {
            await inserirMovimento(m.valor, m.data_movimento, m.categoria_id, m.tipo_movimento_id, m.nota);
        }
        console.log("✅ Movimento de  NORMAIS inserido!");
    } catch (error) {
        console.error("❌ Erro ao inserir movimento teste único:", error);
    }
}

export {
    criarTabelaMovimentos,
    inserirMovimento,
    listarMovimentos,
    apagarTodosMovimentos,
    inserirVariosMovimentos,
    obterSomaMovimentosPorCategoriaDespesa,
    obterSomaMovimentosPorCategoriaReceita,
    inserirMovimentoTesteUnico,
    inserirTodosMovimentosTeste,
    inserirMovimentoTesteNormal,
    obterTotalDespesas,
    obterTotalReceitas,
    listarMovimentosUltimos30Dias,
    obterSaldoMensalAtual,
    buscarMovimentosPorMesAno,
    obterBalancoGeral
};
