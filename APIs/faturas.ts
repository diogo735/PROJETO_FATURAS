import { buscarUsuarioAtual } from '../BASEDEDADOS/user';

const API_BASE_URL = 'https://faturas-backend.onrender.com/api';

//  GET – Listar faturas atualizadas desde determinada data
export const obterFaturasAtualizadas = async (updated_since: string) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/obter_fatura?updated_since=${updated_since}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error('Erro ao buscar faturas');

  return await response.json();
};

//  POST – Criar nova fatura
export const criarFaturaAPI = async (dados: any) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/criar_fatura`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erro ao criar fatura');

  return json;
};

//  3. PUT – Atualizar fatura existente
export const atualizarFaturaAPI = async (remoteId: number, dados: any) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/atualizar_fatura/${remoteId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) throw new Error('Erro ao atualizar fatura');
  return await response.json();
};

// DELETE – Apagar fatura (opcional)
export const deletarFaturaAPI = async (remoteId: number) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/apagar_fatura/${remoteId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error('Erro ao apagar fatura');
  return true;
};
