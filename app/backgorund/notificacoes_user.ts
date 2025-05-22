import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASK_NAME = 'verificar_notificacoes';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const data = await AsyncStorage.getItem('notificacoes_personalizadas');
    if (!data) return BackgroundFetch.BackgroundFetchResult.NewData;


    const notificacoes = JSON.parse(data);

    const agora = new Date();
    const diaSemana = agora.getDay(); // 0 = Domingo
    const diaMes = agora.getDate();
    const horaAtual = agora.toTimeString().slice(0, 5); // formato "HH:MM"

    for (const n of notificacoes) {
      const deveNotificar =
        (n.frequencia === 'Diariamente') ||
        (n.frequencia === 'Semanalmente' && diaSemana === 1) || // segunda
        (n.frequencia === 'Mensalmente' && diaMes === 1) ||
        (n.frequencia === 'Uma vez' && n.data === agora.toISOString().slice(0, 10)); // comparar data

      if (deveNotificar && n.hora === horaAtual) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: n.titulo,
            body: n.nota,
            sound: true,
          },
          trigger: null, // envia imediatamente
        });
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
;
  } catch (error) {
    console.error('Erro no background:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;

  }
});

export async function iniciarTarefaBackground() {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    console.warn('Background fetch não permitido');
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 60, // 1 min (ajuste conforme necessário)
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}
