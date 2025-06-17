import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import NetInfo from '@react-native-community/netinfo';
import { buscarUsuarioAtual, atualizarUltimaSincronizacao } from '../../BASEDEDADOS/user';
import { sincronizarTudoAppParaApi, sincronizarTudoApiParaApp, listarSincronizacoesPendentes } from '../../BASEDEDADOS/sincronizacao';
import { inserirNotificacao } from '../../BASEDEDADOS/notificacoes';
const TASK_NAME = 'sincronizacao_automatica';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const estado = await NetInfo.fetch();
    const user = await buscarUsuarioAtual();
    const naoTemEmail = !user?.email || user.email.trim() === '';
    if (naoTemEmail) {
      console.warn('⛔ Usuário local (sem e-mail). Sincronização em background ignorada.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    if (!estado.isConnected || !estado.isInternetReachable) {
      console.log('📡 Sem internet. Tarefa de sincronização cancelada.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    if (user?.sincronizacao_wifi === 1 && estado.type !== 'wifi') {
      console.log('📶 Dados móveis detectados e o usuário exige Wi-Fi.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    if (user?.sincronizacao_automatica !== 1) {
      console.log('⚙️ Sincronização automática está desativada.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const pendentes = await listarSincronizacoesPendentes();

    const haviaPendentes = pendentes.length > 0;

    await sincronizarTudoAppParaApi();
    await sincronizarTudoApiParaApp();
    await atualizarUltimaSincronizacao();

    if (haviaPendentes) {
      const agora = new Date();
      const data = agora.toISOString().slice(0, 16).replace('T', ' ');
      await inserirNotificacao(
        'cloud-done',
        'Sincronização com a nuvem concluída com sucesso.',
        data
      );
    }

    console.log('✅ Sincronização automática em background concluída!');
    return BackgroundFetch.BackgroundFetchResult.NewData;

  } catch (error) {
    console.error('❌ Erro na tarefa de sincronização automática:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function iniciarTarefaSincronizacao() {
  const user = await buscarUsuarioAtual();
  const naoTemEmail = !user?.email || user.email.trim() === '';

  if (naoTemEmail) {
    console.warn('⛔ Usuário local (sem e-mail). Tarefa de sincronização não será registrada.');
    return;
  }

  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    console.warn('⛔ Tarefa em background não permitida.');
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 300, // 5 minutos
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('✅ Tarefa de sincronização automática registrada.');
  } else {
    console.log('ℹ️ Tarefa de sincronização já estava registrada.');
  }
}