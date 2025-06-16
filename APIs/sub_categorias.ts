import { buscarUsuarioAtual } from '../BASEDEDADOS/user';
const API_BASE_URL = 'https://faturas-backend.onrender.com/api';

// GET: Buscar subcategorias atualizadas
export const obterSubCategoriasAtualizadas = async (updated_since: string) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/listar_categorias_user?updated_since=${updated_since}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error('Erro ao buscar subcategorias');

  const json = await response.json();

  if (Array.isArray(json)) {
    return json;
  }

  if (Array.isArray(json.data)) {
    return json.data;
  }

  return [];
};

// POST: Criar nova subcategoria
export const criarSubCategoriaAPI = async (dados: any) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/criar_categoria_user`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Erro ao criar subcategoria');
  }

  return json.subcategoria;

};

// PUT: Atualizar subcategoria existente
export const atualizarSubCategoriaAPI = async (remoteId: number, dados: any) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/atualizar_categoria/${remoteId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  const json = await response.json();

  if (!response.ok) {
    const mensagemErro = json?.erro || json?.message || 'Erro ao atualizar subcategoria';
    throw new Error(mensagemErro);
  }

  return json.subcategoria; // <- retorna os dados atualizados
};


// DELETE: Eliminar subcategoria
export const deletarSubCategoriaAPI = async (remoteId: number) => {
  const user = await buscarUsuarioAtual();
  const token = user?.token;

  if (!token) throw new Error('Token não encontrado');

  const response = await fetch(`${API_BASE_URL}/apagar_categoria/${remoteId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = {};
  }

  if (!response.ok) {
    const msg = json?.erro || json?.message || 'Erro ao apagar subcategoria';
    throw new Error(msg);
  }

  console.log('✅ Subcategoria apagada na API:', json?.mensagem || '(sem mensagem)');
  return true;
};

