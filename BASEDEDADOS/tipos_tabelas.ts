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
  sub_categoria_id?: number | null; 
  nota?: string; 
}

export interface SubCategoria {
  id: number;
  nome_subcat: string;
  icone_nome: string;        
  cor_subcat: string;        
  categoria_id: number;      
}
