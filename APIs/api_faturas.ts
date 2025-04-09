const API_KEY = '09e346d263794142857493f790e1109d'; // tua key

export async function obterInfoEmpresaPorNif(nif: string): Promise<string | null> {
    try {
        const url = `https://www.nif.pt/?json=1&q=${nif}&key=${API_KEY}`;
        const response = await fetch(url);

       // console.log('🔄 Response bruto:', response);
        const data = await response.json();
        //console.log('📦 Dados recebidos:', data);

        // Verifica se a resposta indica limite atingido
        if (data.result === 'error' && data.message?.includes('Limit per minute')) {
            console.warn('⏳ Limite de consultas por minuto atingido. Tente novamente em instantes.');
            return null;
        }

        // Verifica se a empresa foi encontrada
        if (data.result === 'success' && data.records && data.records[nif]) {
            const nome = data.records[nif].title;
            console.log(`✅ Empresa encontrada: ${nome}`);
            return nome;
        }

        console.warn(`⚠️ Empresa não encontrada para NIF: ${nif}`);
        return null;
    } catch (error) {
        console.error('❌ Erro ao consultar nif.pt:', error);
        return null;
    }
}
