import { CRIARBD } from './databaseInstance';
import { inserirNotificacao } from './notificacoes';
import * as Notify from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NetInfo from '@react-native-community/netinfo';
import { atualizarPerfil } from '../APIs/login';

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
        token TEXT,
        primeiro_login INTEGER DEFAULT 1,
        sincronizacao_automatica INTEGER DEFAULT 1,
        sincronizacao_wifi INTEGER DEFAULT 0,
        ultima_sincronizacao TEXT
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
    const token = null;
    const primeiro_login = 1;
    const id = 1;

    const asset = Asset.fromModule(require('../assets/imagens/sem_foto.png'));
    await asset.downloadAsync();
    const imagem = asset.localUri || asset.uri;

    await inserirUser(id, nome, imagem, email, pass, token, primeiro_login);
  } catch (error) {
    console.error('❌ Erro ao criar usuário anônimo:', error);
  }
}
// Exemplo de inserção
async function inserirUser(id, nome, imagem, email, pass, token, primeiro_login, updated_at) {
  try {
    const db = await CRIARBD();
    await db.runAsync(
      `INSERT INTO user (
        id, nome, imagem, email, pass, token, primeiro_login,
        sincronizacao_automatica, sincronizacao_wifi, ultima_sincronizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, nome, imagem, email, pass, token, primeiro_login,
      1, 0, updated_at
    );
    console.log(`✅ User ${nome} inserido com ID ${id}.`);
  } catch (error) {
    console.error('❌ Erro ao inserir user:', error);
  }
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
    const updated_at = new Date().toISOString();

    const user = await buscarUsuarioAtual();
    const naoTemEmail = !user?.email || user.email.trim() === '';
    // Atualiza localmente
    await db.runAsync(
      `UPDATE user SET nome = ?, imagem = ?, pass = ? WHERE id = (SELECT id FROM user LIMIT 1)`,
      nome, imagem, pass
    );

    // Cria notificação
    const agora = new Date();
    const dataFormatada = agora.toISOString().slice(0, 16).replace('T', ' ');
    await inserirNotificacao(
      'lock',
      'Os teus dados de acesso foram atualizados com sucesso!',
      dataFormatada
    );
    await AsyncStorage.setItem('hasNotificacoesNovas', 'true');

// ✅ Se usuário é local, apenas retorna após salvar localmente
    if (naoTemEmail) {
      console.warn('⚠️ Usuário sem email. Atualização feita apenas localmente.');
      return true;
    }

    // Verifica condições de sincronização
    const estado = await NetInfo.fetch();
  
    const podeSincronizarAgora =
      user?.sincronizacao_automatica === 1 &&
      estado.isConnected &&
      estado.isInternetReachable &&
      (user?.sincronizacao_wifi !== 1 || estado.type === 'wifi');

    if (podeSincronizarAgora) {
      // Envia para a API
      const resultado = await atualizarPerfil({
        nome,
        imagem,
        password: pass,
        token: user?.token,
      });

      if (resultado) {
        console.log('✅ Usuário sincronizado com a API com sucesso.');
        await atualizarUltimaSincronizacao();
      } else {
        console.warn('⚠️ Falha na API — salvando na fila.');
        // Código de adicionar na fila (em caso de falha)
        const tipo = 'user';
        const operacao = 'update';
        const dados = { nome, imagem, password: pass, updated_at };
        const remoteId = null;
        const createdAt = new Date().toISOString();
        const filaPayload = JSON.stringify(dados);

        await db.runAsync(`
          INSERT INTO sincronizacoes (tipo, operacao, payload, remote_id, created_at)
          VALUES (?, ?, ?, ?, ?)
        `, [tipo, operacao, filaPayload, remoteId, createdAt]);

        console.log('📥 Adicionado à fila de sincronizações (fallback API):', {
          tipo,
          operacao,
          remoteId,
          created_at: createdAt,
          payload: dados
        });
      }

    } else {
      console.log('🕓 Usuário adicionado à fila de sincronização.');
      // Código de adicionar na fila (sem internet)
      const tipo = 'user';
      const operacao = 'update';
      const dados = { nome, imagem, password: pass, updated_at };
      const remoteId = null;
      const createdAt = new Date().toISOString();
      const filaPayload = JSON.stringify(dados);

      await db.runAsync(`
        INSERT INTO sincronizacoes (tipo, operacao, payload, remote_id, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [tipo, operacao, filaPayload, remoteId, createdAt]);

      console.log('📥 Adicionado à fila de sincronizações (offline):', {
        tipo,
        operacao,
        remoteId,
        created_at: createdAt,
        payload: dados
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
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

async function obter_imagem_user(uri) {
  if (!uri) return;

  const db = await CRIARBD();
  await db.runAsync(
    `UPDATE user SET imagem = ? WHERE id = (SELECT id FROM user LIMIT 1)`,
    uri
  );
}

async function atualizarPreferenciasSincronizacao(automatica, wifi) {
  const db = await CRIARBD();
  await db.runAsync(`
    UPDATE user 
    SET sincronizacao_automatica = ?, sincronizacao_wifi = ? 
    WHERE id = (SELECT id FROM user LIMIT 1)
  `, automatica ? 1 : 0, wifi ? 1 : 0);
}

async function atualizarUltimaSincronizacao() {
  const db = await CRIARBD();
  const agora = new Date().toISOString();

  await db.runAsync(`
    UPDATE user SET ultima_sincronizacao = ? WHERE id = (SELECT id FROM user LIMIT 1)
  `, [agora]);

  console.log('📌 Última sincronização atualizada para:', agora);
}

export {
  criarTabelaUsers,
  inserirUser,
  existeUsuario,
  apagarTodosUsers,
  buscarUsuarioAtual,
  atualizarImagemDoUsuario,
  atualizarUsuario, deletarTabelaUsers,
  criarUsuarioAnonimo,
  obter_imagem_user,
  atualizarPreferenciasSincronizacao,
  atualizarUltimaSincronizacao
};
