import { CRIARBD } from './databaseInstance';


async function criarTabelaSubCategorias() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sub_categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_subcat TEXT NOT NULL,
        icone_nome TEXT NOT NULL,
        categoria_id INTEGER NOT NULL,
        cor_subcat TEXT NOT NULL,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      );
    `);
    //console.log('✅ Tabela "sub_categorias" criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela "sub_categorias":', error);
  }
}


async function inserirSubCategoria(nome_subcat, icone_nome, cor_subcat, categoria_id) {
  try {
    const db = await CRIARBD();
    const nomeNormalizado = nome_subcat.trim().toLowerCase();

    // Verificar se já existe uma subcategoria com o mesmo nome 
    const subcatExistente = await db.getFirstAsync(
      `SELECT * FROM sub_categorias WHERE LOWER(nome_subcat) = ?`,
      nomeNormalizado
    );
  

    if (subcatExistente) {
      return 'duplicada_subcategoria';
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const catExistente = await db.getFirstAsync(
      `SELECT * FROM categorias WHERE LOWER(nome_cat) = ?`,
      nomeNormalizado
    );

    if (catExistente) {
      return 'duplicada_categoria';
    }

    // Inserir se não existe nem como categoria nem como subcategoria
    await db.runAsync(
      `INSERT INTO sub_categorias (nome_subcat, icone_nome, cor_subcat, categoria_id) VALUES (?, ?, ?, ?);`,
      nome_subcat.trim(), icone_nome, cor_subcat, categoria_id
    );
    console.log('✅ Subcategoria inserida com sucesso!');
    return 'sucesso';
  } catch (error) {
    console.error('❌ Erro ao inserir subcategoria:', error);
    return 'erro';
  }
}

  


async function listarSubCategorias() {
  try {
    const db = await CRIARBD();
    return await db.getAllAsync(`SELECT * FROM sub_categorias;`);
  } catch (error) {
    console.error('❌ Erro ao listar subcategorias:', error);
    return [];
  }
}


async function buscarSubCategoriaPorId(id) {
  try {
    const db = await CRIARBD();
    return await db.getFirstAsync(`SELECT * FROM sub_categorias WHERE id = ?;`, [id]);
  } catch (error) {
    console.error('❌ Erro ao buscar subcategoria por ID:', error);
    return null;
  }
}


async function atualizarSubCategoriaComVerificacao(id, nome_subcat, icone_nome, cor_subcat, categoria_id) {
  try {
    const db = await CRIARBD();
    const nomeNormalizado = nome_subcat.trim().toLowerCase();

    // Verificar se já existe outra subcategoria com esse nome
    const subcatExistente = await db.getFirstAsync(
      `SELECT * FROM sub_categorias WHERE LOWER(nome_subcat) = ? AND id != ?`,
      nomeNormalizado, id
    );

    if (subcatExistente) {
      return 'duplicada_subcategoria';
    }

    // Verificar se o nome também já é usado por uma categoria
    const catExistente = await db.getFirstAsync(
      `SELECT * FROM categorias WHERE LOWER(nome_cat) = ?`,
      nomeNormalizado
    );

    if (catExistente) {
      return 'duplicada_categoria';
    }

    const subcatAtual = await db.getFirstAsync(
      `SELECT categoria_id FROM sub_categorias WHERE id = ?`,
      [id]
    );

    await db.runAsync(
      `UPDATE sub_categorias SET nome_subcat = ?, icone_nome = ?, cor_subcat = ?, categoria_id = ? WHERE id = ?;`,
      nome_subcat.trim(), icone_nome, cor_subcat, categoria_id, id
    );

    // Atualiza os movimentos relacionados a essa subcategoria com a nova categoria_id
    if (subcatAtual && subcatAtual.categoria_id !== categoria_id) {
      await db.runAsync(
        `UPDATE movimentos SET categoria_id = ? WHERE sub_categoria_id = ?`,
        categoria_id, id
      );
    }

    console.log('✅ Subcategoria e movimentos atualizados com sucesso!');
    return 'sucesso';
  } catch (error) {
    console.error('❌ Erro ao atualizar subcategoria:', error);
    return 'erro';
  }
}



async function deletarSubCategoria(id) {
  try {
    const db = await CRIARBD();
    await db.runAsync(`DELETE FROM sub_categorias WHERE id = ?;`, [id]);
    console.log('🗑 Subcategoria deletada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao deletar subcategoria:', error);
  }
}


async function listarSubCategoriasComCategoria() {
  try {
    const db = await CRIARBD();
    return await db.getAllAsync(`
      SELECT sub_categorias.*, categorias.nome_cat AS nome_categoria
      FROM sub_categorias
      INNER JOIN categorias ON sub_categorias.categoria_id = categorias.id;
    `);
  } catch (error) {
    console.error('❌ Erro ao buscar subcategorias com nome da categoria:', error);
    return [];
  }
}

async function criarSubCategoriasDeTeste() {
    try {
      const db = await CRIARBD();
  
      const categoria = await db.getFirstAsync(
        `SELECT id FROM categorias WHERE nome_cat = ?`,
        ['Depósitos']
      );
  
      if (!categoria) {
        console.error('❌ Categoria "Compras Pessoais" não encontrada.');
        return;
      }
  
      const categoriaId = categoria.id;
  
      //await inserirSubCategoria('Roupas', 'shopping-bag', '#FF9F1C', categoriaId);
      //await inserirSubCategoria('Calçado', 'cutlery', '#2EC4B6', categoriaId);
     // await inserirSubCategoria('Acessórios', 'gift', '#E71D36', categoriaId);
      await inserirSubCategoria('tste', 'gift', '#E71D36', categoriaId);
      console.log('✅ Subcategorias de teste criadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar subcategorias de teste:', error);
    }
  }

  async function eliminarSubCategoriaEAtualizarMovimentos(idSubcategoria) {
    try {
      const db = await CRIARBD();
  
      // 1. Atualizar todos os movimentos com essa subcategoria para null
      await db.runAsync(
        `UPDATE movimentos SET sub_categoria_id = NULL WHERE sub_categoria_id = ?`,
        [idSubcategoria]
      );
  
      // 2. Deletar a subcategoria
      await db.runAsync(
        `DELETE FROM sub_categorias WHERE id = ?`,
        [idSubcategoria]
      );
  
      
      return 'sucesso';
    } catch (error) {
      console.error('❌ Erro ao eliminar subcategoria e atualizar movimentos:', error);
      return 'erro';
    }
  }

export {
  criarTabelaSubCategorias,
  inserirSubCategoria,
  listarSubCategorias,
  buscarSubCategoriaPorId,
  atualizarSubCategoriaComVerificacao,
  deletarSubCategoria,
  listarSubCategoriasComCategoria,
  criarSubCategoriasDeTeste,
  eliminarSubCategoriaEAtualizarMovimentos
};
