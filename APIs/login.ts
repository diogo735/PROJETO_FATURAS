
import axios from 'axios';
import { buscarUsuarioAtual } from '../BASEDEDADOS/user';

const API_BASE_URL = 'https://faturas-backend.onrender.com/api'; 

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro no login');
  }

  return data;
};


export const buscarDadosDoUsuarioAPI = async () => {
  try {
    const user = await buscarUsuarioAtual();
    const token = user?.token;

    if (!token) throw new Error('Token não encontrado no usuário local');

    const response = await fetch(`${API_BASE_URL}/obter_dados_user/${user.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao obter dados do usuário');
    }

    const json = await response.json();
    return json.user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
};


