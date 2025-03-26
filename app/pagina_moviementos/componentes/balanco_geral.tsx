import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { height, width } = Dimensions.get('window');
import TrianguloIcon from '../../../assets/icons/seta_balanco_geral.svg';

import { useRef, useState } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

interface Props {
    resumo: {
        totalMovimentos: number;
        totalDespesas: number;
        totalReceitas: number;
    };
}

const BalancoGeral: React.FC<Props> = ({ resumo }) => {

    const [expandido, setExpandido] = useState(true);
    const alturaAnimada = useRef(new Animated.Value(1)).current;

    const toggleExpandir = () => {
        Animated.timing(alturaAnimada, {
            toValue: expandido ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setExpandido(!expandido);
    };




    return (
        <LinearGradient
            colors={['#238DF3', '#1B6FC0', '#14528D']} // Cores do gradiente baseadas na sua imagem
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={toggleExpandir} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.title}>Balanço Geral</Text>
                    <TrianguloIcon
                        width={17}
                        style={{
                            marginLeft: 10,
                            transform: [{ rotate: expandido ? '0deg' : '180deg' }],
                        }}
                    /><View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.transacoes}>{resumo.totalMovimentos} Transações</Text>
                    </View>
                </TouchableOpacity>


            </View>
            <View >
                <Animated.View style={{
                    overflow: 'hidden', height: alturaAnimada.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 85] // ajuste a altura total do conteúdo
                    })
                }}>
                    <View>
                        <View style={styles.linhaInfo}>
                            <Text style={styles.label}>Receitas</Text>
                            <Text style={[styles.value, { color: 'limegreen' }]}>{resumo.totalReceitas} €</Text>
                        </View>

                        <View style={styles.linhaInfo}>
                            <Text style={styles.label}>Despesas</Text>
                            <Text style={[styles.value, { color: 'tomato' }]}>{resumo.totalDespesas} €</Text>
                        </View>

                        <View style={styles.linha}></View>

                        <Text style={[styles.total, { color: resumo.totalReceitas - resumo.totalDespesas >= 0 ? 'limegreen' : 'tomato' }]}>
                        {(resumo.totalReceitas - resumo.totalDespesas).toFixed(2).replace(/\.00$/, '')} €
                        </Text>
                    </View>
                </Animated.View>

            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        padding: 10,
        width: width * 0.95
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    transacoes: {
        fontSize: 16,
        color: '#fff',
        alignSelf: 'flex-end',
    },
    label: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '300',
    },
    value: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    total: {
        fontSize: 25,
        color: 'red',
        fontWeight: 'bold',
        marginTop: 0,
        alignSelf: 'flex-end',
    },
    linha: {
        width: "50%",
        borderTopWidth: 0.4,
        borderTopColor: '#fff',
        paddingTop: 0,
        alignSelf: 'flex-end',
    },
    linhaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 1,
    }

});

export default BalancoGeral;
