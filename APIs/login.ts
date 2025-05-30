
import axios from 'axios';
import { buscarUsuarioAtual } from '../BASEDEDADOS/user';
import NetInfo from '@react-native-community/netinfo';

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

export const resetar_pass_email = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recuperar_pass`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Erro como 404, etc.
      throw new Error(data.message || 'Erro ao recuperar palavra-passe.');
    }

    return data.message; // Sucesso
  } catch (error: any) {
    throw new Error(error.message || 'Erro de rede.');
  }
};

export const verificarConectividade = async (): Promise<'ok' | 'wifi' | 'servidor'> => {
  // Verifica se há internet
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    return 'wifi';
  }

  // Verifica se o servidor está online
  try {
    const response = await fetch(`${API_BASE_URL}/ping`, { method: 'GET' });
    const data = await response.json();

    if (!response.ok || data.message !== 'online') {
      return 'servidor';
    }

    return 'ok';
  } catch (e) {
    return 'servidor';
  }
};
