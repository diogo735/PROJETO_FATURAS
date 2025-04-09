import * as SQLite from 'expo-sqlite';
import { CRIARBD } from './databaseInstance';
// 📌 Criar a tabela "categorias"
async function criarTabelaCategorias() {
  try {
    const db = await CRIARBD();
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          img_cat TEXT,
          cor_cat TEXT,
          nome_cat TEXT NOT NULL,
          tipo_movimento_id INTEGER NOT NULL,
          FOREIGN KEY (tipo_movimento_id) REFERENCES tipo_movimento(id)
      );`
    );
    //console.log('✅ Tabela "categorias" criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela "categorias":', error);
  }
}
async function resetarCategorias() {
  try {
    const db = await CRIARBD();

    await db.runAsync(`DELETE FROM categorias;`); // Apaga todas as categorias
    await db.runAsync(`UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'categorias';`); // Reseta o ID

    console.log("🔄 IDs da tabela 'categorias' resetados com sucesso!");
  } catch (error) {
    console.error('❌ Erro ao resetar IDs da tabela "categorias":', error);
  }
}

async function inserirCategoria(img_cat, cor_cat, nome_cat) {
    try {
      const db = await CRIARBD();
  
      const result = await db.runAsync(
        `INSERT INTO categorias (img_cat, cor_cat, nome_cat) VALUES (?, ?, ?)`,
        img_cat, cor_cat, nome_cat // 🔄 Agora os parâmetros são passados diretamente
      );
  
      console.log(`✅ Categoria inserida! ID: ${result.lastInsertRowId}, Mudanças: ${result.changes}`);
    } catch (error) {
      console.error('❌ Erro ao inserir categoria:', error);
    }
  }
  
  async function verificarEInserirCategorias() {
    try {
      const db = await CRIARBD();
  
      // 📌 Obtém a contagem de categorias usando getFirstAsync()
      const result = await db.getFirstAsync(`SELECT COUNT(*) as total FROM categorias`);
  
      if (!result || result.total === undefined) {
        console.error('❌ Erro: Resultado inesperado ao contar categorias.');
        return;
      }
  
      //console.log(`📊 Total de categorias no banco: ${result.total}`);
  
      if (result.total === 0) {
        //console.log('🛑 Nenhuma categoria encontrada. Inserindo categorias...');
        await inserirVariasCategorias(); // Agora garantimos que a inserção só ocorre quando necessário
      } else {
        //console.log('✅ Categorias já existem. Nenhuma inserção necessária.');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar categorias:', error);
    }
  }
  
  async function inserirVariasCategorias() {
    const categoriasDespesas = [
      { img_cat: 'compras_pessoais.png', cor_cat: '#FA6FE0', nome_cat: 'Compras Pessoais' },
      { img_cat: 'contas_e_servicos.png', cor_cat: '#7FCACF', nome_cat: 'Contas e Serviços' },
      { img_cat: 'despesas_gerais.png', cor_cat: '#61C98D', nome_cat: 'Despesas Gerais' },
      { img_cat: 'educacao.png', cor_cat: '#7FC5F3', nome_cat: 'Educação' },
      { img_cat: 'estimacao.png', cor_cat: '#CF866C', nome_cat: 'Estimação' },
      { img_cat: 'financas.png', cor_cat: '#B4CE61', nome_cat: 'Finanças' },
      { img_cat: 'habitacao.png', cor_cat: '#60A0E0', nome_cat: 'Habitação' },
      { img_cat: 'lazer.png', cor_cat: '#C370E5', nome_cat: 'Lazer' },
      { img_cat: 'outros.png', cor_cat: '#B0C5C6', nome_cat: 'Outros' },
      { img_cat: 'restauracao.png', cor_cat: '#E8CE62', nome_cat: 'Restauração e Alojamento' },
      { img_cat: 'saude.png', cor_cat: '#FA6C5D', nome_cat: 'Saúde' },
      { img_cat: 'transportes.png', cor_cat: '#E39F62', nome_cat: 'Transportes' },
    ];
  
    const categoriasReceitas = [
      { img_cat: 'alugel.png', cor_cat: '#5899FF', nome_cat: 'Renda' },
      { img_cat: 'caixa-de-ferramentas.png', cor_cat: '#DAC44A', nome_cat: 'Pequenos Trabalhos' },
      { img_cat: 'deposito.png', cor_cat: '#5899FF', nome_cat: 'Depósitos' },
      { img_cat: 'dinheiro.png', cor_cat: '#ACBCC3', nome_cat: 'Outras Receitas' },
      { img_cat: 'lucro.png', cor_cat: '#B258FF', nome_cat: 'Investimentos' },
      { img_cat: 'presente.png', cor_cat: '#FF66C4', nome_cat: 'Presentes' },
      { img_cat: 'salario.png', cor_cat: '#39C89E', nome_cat: 'Salário' }
    ];
  
    try {
      const db = await CRIARBD();
  
      // Obtem os IDs dos tipos
      const tipoReceita = await db.getFirstAsync(`SELECT id FROM tipo_movimento WHERE nome_movimento = 'Receita'`);
      const tipoDespesa = await db.getFirstAsync(`SELECT id FROM tipo_movimento WHERE nome_movimento = 'Despesa'`);
  
      if (!tipoReceita || !tipoDespesa) {
        console.error('❌ Tipos de movimento não encontrados.');
        return;
      }
  
      // Insere categorias de despesa
      for (const categoria of categoriasDespesas) {
        await db.runAsync(
          `INSERT INTO categorias (img_cat, cor_cat, nome_cat, tipo_movimento_id) VALUES (?, ?, ?, ?)`,
          categoria.img_cat, categoria.cor_cat, categoria.nome_cat, tipoDespesa.id
        );
      }
  
      // Insere categorias de receita
      for (const categoria of categoriasReceitas) {
        await db.runAsync(
          `INSERT INTO categorias (img_cat, cor_cat, nome_cat, tipo_movimento_id) VALUES (?, ?, ?, ?)`,
          categoria.img_cat, categoria.cor_cat, categoria.nome_cat, tipoReceita.id
        );
      }
  
      console.log('✅ Categorias de despesa e receita inseridas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inserir categorias:', error);
    }
  }
  
  async function deletarTabelaCategorias() {
    try {
      const db = await CRIARBD();
      await db.execAsync(`DROP TABLE IF EXISTS categorias;`);
      console.log('🗑 Tabela "categorias" foi removida completamente.');
    } catch (error) {
      console.error('❌ Erro ao deletar a tabela "categorias":', error);
    }
  }
  
  async function listarCategorias() {
    try {
      const db = await CRIARBD();
      const result = await db.getAllAsync('SELECT * FROM categorias;');
      return result; 
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
    }
  }
  async function listarCategoriasDespesa() {
    try {
      const db = await CRIARBD();
  
      const tipo = await db.getFirstAsync(`
        SELECT id FROM tipo_movimento WHERE nome_movimento = 'Despesa';
      `);
  
      if (!tipo) {
        console.error("❌ Tipo 'Despesa' não encontrado.");
        return [];
      }
  
      const result = await db.getAllAsync(`
        SELECT * FROM categorias WHERE tipo_movimento_id = ?;
      `, [tipo.id]);
  
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar categorias de despesa:', error);
      return [];
    }
  }
  async function listarCategoriasComTipo() {
    try {
      const db = await CRIARBD();
  
      const result = await db.getAllAsync(`
        SELECT categorias.*, tipo_movimento.nome_movimento AS tipo_nome
        FROM categorias
        INNER JOIN tipo_movimento ON categorias.tipo_movimento_id = tipo_movimento.id
      `);
  
      return result; // já vem como array de objetos
    } catch (error) {
      console.error('❌ Erro ao buscar categorias com tipo:', error);
      return [];
    }
  }
  
  
  
async function apagarTodasCategorias() {
    try {
      const db = await CRIARBD();
  
      const result = await db.runAsync(`DELETE FROM categorias`);
  
      console.log(`🗑 Todas as categorias foram apagadas! Registros afetados: ${result.changes}`);
    } catch (error) {
      console.error('❌ Erro ao apagar categorias:', error);
    }
  }
  async function buscarCategoriaPorId(id) {
    try {
      const db = await CRIARBD();
      const categoria = await db.getFirstAsync(
        'SELECT * FROM categorias WHERE id = ?',
        [id]
      );
      return categoria;
    } catch (error) {
      console.error('❌ Erro ao buscar categoria por ID:', error);
      return null;
    }
  }
  
  
// Exporta as operações para serem usadas no app
export { criarTabelaCategorias, 
  resetarCategorias,
  inserirCategoria,
   listarCategorias , 
   verificarEInserirCategorias,
    inserirVariasCategorias,
    apagarTodasCategorias,
    deletarTabelaCategorias,
    listarCategoriasDespesa,
    listarCategoriasComTipo,
    buscarCategoriaPorId

  };
