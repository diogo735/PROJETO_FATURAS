import { buscarUsuarioAtual } from '../BASEDEDADOS/user';
const API_BASE_URL = 'https://faturas-backend.onrender.com/api';

// GET: Buscar movimentos atualizados
export const obterMovimentosAtualizados = async (updated_since: string) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;
  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/listar_movimentos_user?updated_since=${updated_since}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error('Erro ao buscar movimentos');

  return await response.json();
};

// POST: Criar movimento
export const criarMovimentoAPI = async (dados: any) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;
  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/criar_movimento`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erro ao criar movimento');

  return json;
};

// PUT: Atualizar movimento
export const atualizarMovimentoAPI = async (remoteId: number, dados: any) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;
  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/atualizar_movimento/${remoteId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) throw new Error('Erro ao atualizar movimento');
  return await response.json();
};

// DELETE: Apagar movimento
export const deletarMovimentoAPI = async (remoteId: number) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;
  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/apagar_movimento/${remoteId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error('Erro ao apagar movimento');
  return true;
};
