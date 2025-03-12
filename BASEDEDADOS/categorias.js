import * as SQLite from 'expo-sqlite';

// 📌 Criar a tabela "categorias"
async function criarTabelaCategorias() {
  try {
    const db = await SQLite.openDatabaseAsync('app.db');
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          img_cat TEXT,
          cor_cat TEXT,
          nome_cat TEXT NOT NULL
      );`
    );
    //console.log('✅ Tabela "categorias" criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela "categorias":', error);
  }
}


async function inserirCategoria(img_cat, cor_cat, nome_cat) {
    try {
      const db = await SQLite.openDatabaseAsync('app.db');
  
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
      const db = await SQLite.openDatabaseAsync('app.db');
  
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
        console.log('✅ Categorias já existem. Nenhuma inserção necessária.');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar categorias:', error);
    }
  }
  
  async function inserirVariasCategorias() {
    const categorias = [
        { img_cat: require('../assets/imagens/categorias/compras_pessoais.png'), cor_cat: '#FA6FE0', nome_cat: 'Compras Pessoais' },
        { img_cat: require('../assets/imagens/categorias/contas_e_servicos.png'), cor_cat: '#7FCACF', nome_cat: 'Contas e Serviços' },
        { img_cat: require('../assets/imagens/categorias/despesas_gerais.png'), cor_cat: '#61C98D', nome_cat: 'Despesas Gerais' },
        { img_cat: require('../assets/imagens/categorias/educacao.png'), cor_cat: '#7FC5F3', nome_cat: 'Educação' },
        { img_cat: require('../assets/imagens/categorias/estimacao.png'), cor_cat: '#CF866C', nome_cat: 'Estimação' },
        { img_cat: require('../assets/imagens/categorias/financas.png'), cor_cat: '#B4CE61', nome_cat: 'Finanças' },
        { img_cat: require('../assets/imagens/categorias/habitacao.png'), cor_cat: '#60A0E0', nome_cat: 'Habitação' },
        { img_cat: require('../assets/imagens/categorias/lazer.png'), cor_cat: '#C370E5', nome_cat: 'Lazer' },
        { img_cat: require('../assets/imagens/categorias/outros.png'), cor_cat: '#B0C5C6', nome_cat: 'Outros' },
        { img_cat: require('../assets/imagens/categorias/restauracao.png'), cor_cat: '#E8CE62', nome_cat: 'Restauração e Alojamento' },
        { img_cat: require('../assets/imagens/categorias/saude.png'), cor_cat: '#FA6C5D', nome_cat: 'Saúde' },
        { img_cat: require('../assets/imagens/categorias/transportes.png'), cor_cat: '#E39F62', nome_cat: 'Transportes' }
      ];
      

    try {
      const db = await SQLite.openDatabaseAsync('app.db');
  
      for (const categoria of categorias) {
        await db.runAsync(
          `INSERT INTO categorias (img_cat, cor_cat, nome_cat) VALUES (?, ?, ?);`,
          categoria.img_cat, categoria.cor_cat, categoria.nome_cat // Passando parâmetros corretamente
        );
      }
  
      console.log('✅ 12 categorias inseridas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inserir múltiplas categorias:', error);
    }
  }
  
 async function listarCategorias() {
  try {
    const db = await SQLite.openDatabaseAsync('app.db');
    const result = await db.getAllAsync('SELECT * FROM categorias;');

    //console.log('📌 Categorias encontradas:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
  }
}
async function apagarTodasCategorias() {
    try {
      const db = await SQLite.openDatabaseAsync('app.db');
  
      const result = await db.runAsync(`DELETE FROM categorias`);
  
      console.log(`🗑 Todas as categorias foram apagadas! Registros afetados: ${result.changes}`);
    } catch (error) {
      console.error('❌ Erro ao apagar categorias:', error);
    }
  }
  
// Exporta as operações para serem usadas no app
export { criarTabelaCategorias, inserirCategoria, listarCategorias , verificarEInserirCategorias, inserirVariasCategorias,apagarTodasCategorias};
