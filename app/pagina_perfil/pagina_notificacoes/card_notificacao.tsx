import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IconeSino from '../../../assets/icons/pagina_notificacoes_minhas/bell.svg';

type Props = {
    titulo: string;
    hora: string;
    nota: string;
};

const CartaoNotificacao = ({ titulo, hora, nota }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <IconeSino width={22} height={22} style={styles.icon} />
                <View style={styles.textoContainer}>
                    <View style={styles.topoTexto}>
                        <Text style={styles.titulo}>{titulo}</Text>
                        <Text style={styles.hora}>{hora}h</Text>
                    </View>
                    <Text style={styles.nota}>
                        {nota}
                    </Text>

                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#BABABA',
        borderRadius: 14,
        padding: '5%',
        marginBottom: '5%',
        backgroundColor: '#FDFDFD',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: 10,
        alignSelf: 'center',
    },
    textoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    topoTexto: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    titulo: {
        fontWeight: 'bold',
        color: '#2565A3',
        fontSize: 16,
    },
    hora: {
        fontWeight: 'bold',
        color: '#2565A3',
        fontSize: 16,
    },
    nota: {
        color: '#889',
        fontSize: 14,
    },
});

export default CartaoNotificacao;
