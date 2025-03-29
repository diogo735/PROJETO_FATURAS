// types.ts

export interface Categoria {
  id: number;
  nome_cat: string;
  img_cat: string;
  cor_cat: string;
  tipo_movimento_id: number;
}

export interface TipoMovimento {
  id: number;
  nome_movimento: string;
}
export interface Movimento {
  id: number;
  valor: number;
  data_movimento: string; 
  categoria_id: number; 
  tipo_movimento_id: number;
  nota?: string; 
}
