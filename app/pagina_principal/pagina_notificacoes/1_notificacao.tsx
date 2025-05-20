// components/Notificacao.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface NotificacaoProps {
    icon: string;
    texto: string;
    data: string;
}

const Notificacao: React.FC<NotificacaoProps> = ({ icon, texto, data }) => {

function formatarDataNotificacao(dataString: string) {
  const data = new Date(dataString);
  const agora = new Date();

  // Zerar horas para comparar apenas as datas
  const dataZero = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const hojeZero = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const ontemZero = new Date(hojeZero);
  ontemZero.setDate(hojeZero.getDate() - 1);

  const horaMinuto = data.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (dataZero.getTime() === hojeZero.getTime()) {
    return `hoje às ${horaMinuto}`;
  } else if (dataZero.getTime() === ontemZero.getTime()) {
    return `ontem às ${horaMinuto}`;
  } else {
    const diaMes = data.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
    });
    return `${diaMes} às ${horaMinuto}`;
  }
}

    return (
        <View style={styles.container}>
            <MaterialIcons name={icon} size={24} color="#2565A3" style={styles.icon} />
            <View style={styles.textContainer}>
                <View style={styles.textRow}>
                    <Text style={styles.texto}>{texto}</Text>
                </View>
                <View style={styles.dataRow}>
                   <Text style={styles.data}>{formatarDataNotificacao(data)}</Text>
                </View>
            </View>

        </View>
    );
};

export default Notificacao;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginVertical: '2%',
        marginHorizontal: '4%',
        padding: '5%',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    icon: {
        marginRight: '5%',
        alignSelf: 'center',
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },

    textRow: {
        alignSelf: 'flex-start',
    },

    dataRow: {
        alignSelf: 'flex-end',
        marginTop: '5%',
    },

    texto: {
        fontSize: 14,
        color: '#2565A3',
    },

    data: {
        fontSize: 12,
        color: '#999',
    },

});
