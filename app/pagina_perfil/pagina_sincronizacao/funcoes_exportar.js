import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { CRIARBD } from '../../../BASEDEDADOS/databaseInstance'; 

// 1. Buscar movimentos entre datas
export async function buscarMovimentosEntreDatas(dataInicio, dataFim) {
  const db = await CRIARBD();
  const movimentos = await db.getAllAsync(`
    SELECT * FROM movimentos 
    WHERE date(data_movimento) BETWEEN date(?) AND date(?)
  `, [dataInicio, dataFim]);
  return movimentos;
}

// 2. Buscar faturas associadas aos movimentos
export async function buscarFaturasPorMovimentos(movimentoIds) {
  if (movimentoIds.length === 0) return [];
  const db = await CRIARBD();
  const placeholders = movimentoIds.map(() => '?').join(', ');
  const faturas = await db.getAllAsync(`
    SELECT * FROM faturas 
    WHERE movimento_id IN (${placeholders})
  `, movimentoIds);
  return faturas;
}

// 3. Função principal de exportação
export async function exportarFaturas({ dataInicio, dataFim, formato }) {
  try {
    const movimentos = await buscarMovimentosEntreDatas(dataInicio, dataFim);
    const movimentoIds = movimentos.map(m => m.id);
    const faturas = await buscarFaturasPorMovimentos(movimentoIds);

    if (faturas.length === 0) {
      alert('Nenhuma fatura encontrada neste período!');
      return;
    }

    const nomeFicheiro = `faturas_${Date.now()}.${formato === 'csv' ? 'csv' : 'xlsx'}`;
    const caminho = `${FileSystem.documentDirectory}${nomeFicheiro}`;

    if (formato === 'csv') {
      const csv = Papa.unparse(faturas);
      await FileSystem.writeAsStringAsync(caminho, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      const ws = XLSX.utils.json_to_sheet(faturas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Faturas');

      const buffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      await FileSystem.writeAsStringAsync(caminho, buffer, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(caminho);
    } else {
      alert('Ficheiro exportado, mas o dispositivo não permite partilhar.');
    }

  } catch (error) {
    console.error('❌ Erro ao exportar faturas:', error);
    alert('Erro ao exportar as faturas.');
  }
}
