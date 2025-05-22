import AsyncStorage from '@react-native-async-storage/async-storage';

export type Notificacao = {
  id: string;
  titulo: string;
  hora: string;
  frequencia: string;
  nota: string;
};

const CHAVE_STORAGE = 'notificacoes_personalizadas';

export async function salvarNotificacao(nova: Omit<Notificacao, 'id'>) {
  const atual = await obterTodasNotificacoes();
  const novaComId: Notificacao = { ...nova, id: Date.now().toString() }; // ⬅️ ID baseado na data
  await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify([...atual, novaComId]));
}

export async function obterTodasNotificacoes(): Promise<Notificacao[]> {
  const json = await AsyncStorage.getItem(CHAVE_STORAGE);
  return json ? JSON.parse(json) : [];
}

export async function editarNotificacao(id: string, dados: Omit<Notificacao, 'id'>) {
  const todas = await obterTodasNotificacoes();
  const atualizadas = todas.map((n) =>
    n.id === id ? { ...n, ...dados } : n
  );
  await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(atualizadas));
}

export async function limparTodasNotificacoes() {
  await AsyncStorage.removeItem(CHAVE_STORAGE);
}
export async function eliminarNotificacao(id: string) {
  const todas = await obterTodasNotificacoes();
  const filtradas = todas.filter((n) => n.id !== id);
  await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(filtradas));
}
