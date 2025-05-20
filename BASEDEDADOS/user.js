import { CRIARBD } from './databaseInstance';


async function criarTabelaUsers() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        imagem TEXT,
        email TEXT UNIQUE NOT NULL,
        pass TEXT NOT NULL,
        ultimo_login TEXT,
        primeiro_login INTEGER DEFAULT 1
      );
    `);

  } catch (error) {
    console.error('❌ Erro ao criar tabela "users":', error);
  }
}

// Exemplo de inserção
async function inserirUser(nome, imagem, email, pass, ultimo_login, primeiro_login = 1) {
  try {
    const db = await CRIARBD();
    await db.runAsync(
      `INSERT INTO user (nome, imagem, email, pass, ultimo_login, primeiro_login) VALUES (?, ?, ?, ?, ?, ?)`,
      nome, imagem, email, pass, ultimo_login, primeiro_login
    );
    console.log(`✅ User ${nome} inserido.`);
  } catch (error) {
    console.error('❌ Erro ao inserir user:', error);
  }
}
async function inserirUserTeste() {
  const nome = 'Diogo Ferreira';
  const imagem = 'local://perfil_default.png'; // depois você substituirá com FileSystem URI
  const email = 'diogo@enovo.pt';
  const pass = '1234';
  const ultimo_login = new Date().toISOString();
  const primeiro_login = 1;

  await inserirUser(nome, imagem, email, pass, ultimo_login, primeiro_login);
}
async function existeUsuario() {
  const db = await CRIARBD();
  const result = await db.getFirstAsync(`SELECT COUNT(*) as total FROM user`);
  return result?.total > 0;
}
async function apagarTodosUsers() {
  try {
    const db = await CRIARBD();
    const resultado = await db.runAsync(`DELETE FROM user`);
    console.log(`🗑 Todos os usuários foram apagados! Total: ${resultado.changes}`);
  } catch (error) {
    console.error('❌ Erro ao apagar usuários:', error);
  }
}

async function buscarUsuarioAtual() {
  const db = await CRIARBD();
  const result = await db.getFirstAsync(`SELECT * FROM user LIMIT 1`);
  return result;
}
async function atualizarImagemDoUsuario(uri) {
  const db = await CRIARBD();
  await db.runAsync(`UPDATE user SET imagem = ? WHERE id = (SELECT id FROM user LIMIT 1)`, uri);
}

export {
  criarTabelaUsers,
  inserirUser,
  inserirUserTeste,
  existeUsuario,apagarTodosUsers,buscarUsuarioAtual,atualizarImagemDoUsuario
};
