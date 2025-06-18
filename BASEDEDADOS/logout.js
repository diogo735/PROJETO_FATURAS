import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CRIARBD } from './databaseInstance';
import { buscarUsuarioAtual } from './user';

const API_BASE_URL = 'https://faturas-backend.onrender.com/api';

export async function executarLogoutCompleto() {
    try {
        const user = await buscarUsuarioAtual();
        const token = user?.token;

        // Verificar conexão com a internet
        const net = await NetInfo.fetch();
        const online = net.isConnected && net.isInternetReachable;

        // Se estiver online e tiver token, faz logout na API
        if (token && online) {
            try {
                const response = await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Erro ao fazer logout na API');
                }

                console.log('✅ Logout na API realizado com sucesso!');
            } catch (error) {
                console.error('⚠️ Falha ao fazer logout na API:', error);
            }
        } else {
            console.log('⚠️ Usuário offline ou sem token – ignorando logout na API');
        }

        // Limpar base de dados local
        const db = await CRIARBD();
        await db.execAsync(`DELETE FROM sincronizacoes`);
        await db.execAsync(`DELETE FROM notificacoes`);
        await db.execAsync(`DELETE FROM metas`);
        await db.execAsync(`DELETE FROM faturas`);
        await db.execAsync(`DELETE FROM movimentos`);
        await db.execAsync(`DELETE FROM sub_categorias`);
        await db.execAsync(`DELETE FROM user`);

        // Limpar dados do AsyncStorage, exceto moeda
        await AsyncStorage.multiRemove([
            '@codigo_app',
            'notificacoes_personalizadas'
        ]);
        await AsyncStorage.setItem('moedaSelecionada', JSON.stringify({ codigo: 'EUR', simbolo: '€' }));

        console.log('✅ Logout completo: storage e base de dados limpos!');
    } catch (err) {
        console.error('❌ Erro ao executar logout completo:', err);
        throw err;
    }
}