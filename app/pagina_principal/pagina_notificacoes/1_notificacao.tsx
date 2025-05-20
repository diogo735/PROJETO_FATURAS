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
    return (
        <View style={styles.container}>
            <MaterialIcons name={icon} size={24} color="#2565A3" style={styles.icon} />
            <View style={styles.textContainer}>
                <View style={styles.textRow}>
                    <Text style={styles.texto}>{texto}</Text>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.data}>{data}</Text>
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
