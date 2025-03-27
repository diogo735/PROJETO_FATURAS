import { CRIARBD } from './databaseInstance';

async function criarTabelaFaturas() {
  try {
    const db = await CRIARBD();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS faturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movimento_id INTEGER NOT NULL,
        tipo_documento TEXT NOT NULL,
        numero_fatura TEXT NOT NULL,
        data_fatura TEXT NOT NULL,
        nif_emitente TEXT NOT NULL,
        nome_empresa TEXT NOT NULL,
        nif_cliente TEXT,
        descricao TEXT,
        total_iva REAL NOT NULL,
        total_final REAL NOT NULL,
        FOREIGN KEY (movimento_id) REFERENCES movimentos(id) ON DELETE CASCADE
      );
    `);
    //console.log("✅ Tabela 'faturas' criada com sucesso!");
  } catch (error) {
    console.error('❌ Erro ao criar tabela "faturas":', error);
  }
}
async function apagarTabelaFaturas() {
    try {
      const db = await CRIARBD();
      await db.execAsync(`
        DROP TABLE IF EXISTS faturas;
      `);
      console.log("🗑️ Tabela 'faturas' apagada com sucesso!");
    } catch (error) {
      console.error('❌ Erro ao apagar tabela "faturas":', error);
    }
  }


////////////////// TESSETTES
async function inserirFaturaTESTE() {
    try {
      const db = await CRIARBD();
  
      // Verifica se a tabela já possui dados
      const check = await db.getFirstAsync(`SELECT COUNT(*) AS total FROM faturas`);
      if (check.total > 0) {
        console.log(`ℹ️ A tabela 'faturas' já contém ${check.total} registro(s). Nenhuma fatura foi inserida.`);
        return;
      }
  
      // Parâmetros de exemplo
      const movimento_id = 1; // Certifique-se que existe na tabela movimentos
      const tipo_documento = 'Fatura';
      const numero_fatura = 'FT-2025-001';
      const data_fatura = '2025-03-27 12:30:00';
      const nif_emitente = '123456789';
      const nome_empresa = 'Super Empresa LDA';
      const nif_cliente = null;
      const descricao = 'Serviços de consultoria';
      const total_iva = 23.00;
      const total_final = 123.00;
  
      // Insere fatura
      const result = await db.runAsync(
        `INSERT INTO faturas (
          movimento_id, tipo_documento, numero_fatura, data_fatura,
          nif_emitente, nome_empresa, nif_cliente, descricao,
          total_iva, total_final
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movimento_id,
          tipo_documento,
          numero_fatura,
          data_fatura,
          nif_emitente,
          nome_empresa,
          nif_cliente,
          descricao,
          total_iva,
          total_final
        ]
      );
  
      console.log(`✅ Fatura de teste inserida com ID ${result.lastInsertRowId}`);
  
    } catch (error) {
      console.error("❌ Erro ao inserir fatura de teste:", error);
    }
  }
  
  

export { criarTabelaFaturas,
    apagarTabelaFaturas
    
 };
