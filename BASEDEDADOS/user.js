import { CRIARBD } from './databaseInstance';
import { inserirNotificacao } from './notificacoes';
import * as Notify from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function criarTabelaUsers() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        imagem TEXT,
        email TEXT UNIQUE ,
        pass TEXT ,
        ultimo_login TEXT,
        primeiro_login INTEGER DEFAULT 1
      );
    `);

  } catch (error) {
    console.error('❌ Erro ao criar tabela "users":', error);
  }
}

async function criarUsuarioAnonimo() {
  try {
    const nome = 'Utilizador';
    const email = null;
    const pass = null;
    const ultimo_login = new Date().toISOString();
    const primeiro_login = 1;

    
    const asset = Asset.fromModule(require('../assets/imagens/sem_foto.png'));
    await asset.downloadAsync(); 
    const imagem = asset.localUri || asset.uri;

    await inserirUser(nome, imagem, email, pass, ultimo_login, primeiro_login);
  } catch (error) {
    console.error('❌ Erro ao criar usuário anônimo:', error);
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
  const imagem = 'h';
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
async function atualizarUsuario(nome, imagem, pass) {
  try {
    const db = await CRIARBD();
    await db.runAsync(
      `UPDATE user SET nome = ?, imagem = ?, pass = ? WHERE id = (SELECT id FROM user LIMIT 1)`,
      nome, imagem, pass
    );

    // Cria a notificação
    const agora = new Date();
    const dataFormatada = agora.toISOString().slice(0, 16).replace('T', ' ');
    await inserirNotificacao(
      'lock', // ícone
      'Os teus dados de acesso foram atualizados com sucesso!',
      dataFormatada
    );
    await Notify.scheduleNotificationAsync({
      content: {
        title: 'Perfil atualizado !',
        body: 'Os teus dados de acesso foram atualizados com sucesso.',
        sound: true,
      },
      trigger: null,
    });
    await AsyncStorage.setItem('hasNotificacoesNovas', 'true');


    return true;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return false;
  }
}

async function deletarTabelaUsers() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`DROP TABLE IF EXISTS user`);
    console.log('🗑 Tabela "user" apagada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao apagar a tabela "user":', error);
  }
}

export {
  criarTabelaUsers,
  inserirUser,
  inserirUserTeste,
  existeUsuario,
  apagarTodosUsers,
  buscarUsuarioAtual,
  atualizarImagemDoUsuario,
  atualizarUsuario, deletarTabelaUsers,
  criarUsuarioAnonimo
};
