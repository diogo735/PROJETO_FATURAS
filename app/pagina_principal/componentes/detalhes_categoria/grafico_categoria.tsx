import React from 'react';
import { Dimensions } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
const { width, height } = Dimensions.get('window');
import { ScrollView } from 'react-native';

type Props = {
    cor: string;
    valoresX: string[];
    valoresY: number[];
    valoresBarras: number[];
    indiceHoje: number;
};

const GraficoBarras: React.FC<Props> = ({ cor, valoresX, valoresY, valoresBarras, indiceHoje }) => {
    const valorMaximo = Math.max(...valoresY.map(Math.abs));
    const alturaGrafico = height * 0.4;
    const linhasCount = valoresY.length;
    const indiceZero = valoresY.findIndex(v => v === 0);
    const alturaLinha = alturaGrafico / (linhasCount - 1);
    const alturaZero = indiceZero * alturaLinha;

    return (
        <View style={styles.container}>

            <View style={styles.graficoContainer}>
                {/* Eixo Y */}
                <View style={styles.eixoY}>
                    {valoresY.slice().reverse().map((valor, index) => (
                        <Text key={index} style={styles.textoEixoY}>{valor}</Text>
                    ))}
                </View>

                {/* Gráfico de barras */}
                <View style={styles.barrasArea}>
                    {/* Linhas de fundo */}
                    <View style={styles.linhasFundo}>
                        {valoresY.map((_, index) => (
                            <View key={index} style={styles.linhaHorizontal} />
                        ))}
                    </View>

                    {/* Barras posicionadas na linha do zero */}
                    <View style={[styles.barrasContainer, { bottom: alturaZero }]}>
                        {valoresBarras.map((valor, index) => {
                            const alturaBarra = (Math.abs(valor) / valorMaximo) * alturaGrafico;


                            return (
                                <View key={index} style={styles.barraWrapper}>
                                    <View
                                        style={[
                                            styles.barra,
                                            {
                                                height: alturaBarra,
                                                backgroundColor: index === indiceHoje ? 'brown' : cor,
                                            },
                                        ]}
                                    />
                                </View>
                            );
                        })}
                    </View>
                </View>



            </View>
            {/* Texto abaixo */}
            <View style={styles.labelsContainer}>
                {valoresX.map((label, index) => (
                    <Text key={index} style={styles.textoEixoX}>{label}</Text>
                ))}
            </View>
        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20
    },
    graficoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    eixoY: {
        justifyContent: 'space-between',
        height: height * 0.4,
        marginRight: 10,
    },
    textoEixoY: {
        fontSize: 10,
        color: 'gray',
        textAlign: 'right',
    },
    barrasArea: {
        position: 'relative',
        height: height * 0.4,
        width: width * 0.8,
    },
    linhasFundo: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    linhaHorizontal: {
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        borderStyle: 'dashed',
        width: '100%',
    },
    barrasContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        position: 'absolute',
        width: '100%',
    },

    barraWrapper: {
        alignItems: 'center',
        width: '20%',
    },
    barra: {
        width: '20%',
        borderRadius: 99,
    },
    textoEixoX: {
        fontSize: 10,
        color: 'gray',
        marginTop: 0,
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        paddingTop: 5,
        marginLeft: '10%'
    },
});

export default GraficoBarras;
