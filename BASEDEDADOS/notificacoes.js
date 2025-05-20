import * as SQLite from 'expo-sqlite';
import { CRIARBD } from './databaseInstance';

export async function criarTabelaNotificacoes() {
  try {
    const db = await CRIARBD();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        icon TEXT NOT NULL,
        texto TEXT NOT NULL,
        data TEXT NOT NULL
      );
    `);

  } catch (error) {
    console.error('❌ Erro ao criar tabela "notificacoes":', error);
  }
}

export async function inserirNotificacao(icon, texto, data) {
  try {
    const db = await CRIARBD();

    await db.runAsync(`
      INSERT INTO notificacoes (icon, texto, data)
      VALUES (?, ?, ?);
    `, [icon, texto, data]);

    console.log('📩 Notificação inserida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir notificação:', error);
  }
}

export async function listarNotificacoes() {
  try {
    const db = await CRIARBD();

    const result = await db.getAllAsync(`
      SELECT * FROM notificacoes
      ORDER BY datetime(data) DESC;
    `);

    return result;
  } catch (error) {
    console.error('❌ Erro ao listar notificações:', error);
    return [];
  }
}

export async function deletarNotificacao(id) {
  try {
    const db = await CRIARBD();

    await db.runAsync(`
      DELETE FROM notificacoes WHERE id = ?;
    `, [id]);

   // console.log(`🗑 Notificação ${id} apagada com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao apagar notificação:', error);
  }
}
export async function apagarTodasNotificacoes() {
  try {
    const db = await CRIARBD();
    await db.runAsync(`DELETE FROM notificacoes;`);
    await db.runAsync(`DELETE FROM sqlite_sequence WHERE name = 'notificacoes';`);
   
  } catch (error) {
    console.error('❌ Erro ao apagar notificações:', error);
  }
}

export async function inserirNotificacoesTeste() {
  const notificacoesTeste = [
    {
      icon: 'track-changes',
      texto: 'Atingiste o teu valor de alerta para a meta de "Despesas Gerais".',
      data: '2025-06-15 19:40',
    },
    {
      icon: 'warning',
      texto: 'Atingiste o valor MÁXIMO da meta "Despesas Gerais". Atenção aos teus gastos!',
      data: '2025-06-20 19:40',
    },
    {
      icon: 'hourglass-empty',
      texto: 'A tua meta "Educação" chegou ao fim.',
      data: '2025-06-19 19:40',
    },
    {
      icon: 'cached',
      texto: 'A meta "Educação" terminou e foi renovada com sucesso.',
      data: '2025-06-19 20:00',
    },
    {
      icon: 'cloud-upload',
      texto: 'Registaste um movimento em "Bisquates", mas ainda não está sincronizado com a cloud.',
      data: '2025-06-20 18:00',
    },
    {
      icon: 'check-circle',
      texto: 'A tua conta foi recuperada com sucesso.',
      data: '2025-06-20 17:00',
    },
    {
      icon: 'vpn-key',
      texto: 'O PIN foi configurado com sucesso para proteger a aplicação.',
      data: '2025-06-20 16:00',
    },
    {
      icon: 'lock',
      texto: 'Os teus dados de acesso foram atualizados com sucesso.',
      data: '2025-06-20 15:00',
    },
  ];

  for (const n of notificacoesTeste) {
    await inserirNotificacao(n.icon, n.texto, n.data);
  }

  console.log('✅ Notificações de teste inseridas com sucesso!');
}
