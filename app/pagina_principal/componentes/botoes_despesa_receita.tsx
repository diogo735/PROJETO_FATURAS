import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useMoeda } from '../../MOEDA'; // ajusta o caminho se necessário

const { width, height } = Dimensions.get('window');

import MaisAtivo from '../../../assets/icons/botes_paginia_pricipal/+.svg';
import MaisInativo from '../../../assets/icons/botes_paginia_pricipal/+_cinza.svg';
import MenosAtivo from '../../../assets/icons/botes_paginia_pricipal/-.svg';
import MenosInativo from '../../../assets/icons/botes_paginia_pricipal/-_cinza.svg';

interface BotoesProps {
    tipoSelecionado: 'receitas' | 'despesas';
    setTipoSelecionado: (tipo: 'receitas' | 'despesas') => void;
    totalReceitas: number;
    totalDespesas: number;
}

const Botoes: React.FC<BotoesProps> = ({ tipoSelecionado, setTipoSelecionado, totalReceitas, totalDespesas }) => {

const { moeda } = useMoeda();

    return (
        <View style={styles.container}>
            {/* Botão de Receitas */}
            <TouchableOpacity
                style={[
                    styles.botao,
                    tipoSelecionado === 'receitas' ? styles.ativo : styles.inativo,
                ]}
                onPress={() => setTipoSelecionado('receitas')}
            >
                <View style={styles.conteudo}>
                    {/* Ícone */}
                    {tipoSelecionado === 'receitas' ? (
                        <MaisAtivo width={width * 0.1} height={width * 0.1} />
                    ) : (
                        <MaisInativo width={width * 0.1} height={width * 0.1} />
                    )}

                    {/* Texto Receitas */}
                    <View style={styles.textoContainer}>
                        <Text style={tipoSelecionado === 'receitas' ? styles.textoAtivoReceita : styles.textoInativoReceita}>
                            Receitas
                        </Text>
                        <Text style={tipoSelecionado === 'receitas' ? styles.textovalorAtivoReceita : styles.textovalorInativoReceita}>
                            {totalReceitas.toFixed(2)}{moeda.simbolo}
                        </Text>

                    </View>
                </View>
            </TouchableOpacity>

            {/* Botão de Despesas */}
            <TouchableOpacity
                style={[
                    styles.botao,
                    tipoSelecionado === 'despesas' ? styles.ativo : styles.inativo
                ]}
                onPress={() => setTipoSelecionado('despesas')}
            >
                <View style={styles.conteudo}>
                    {/* Ícone */}
                    {tipoSelecionado === 'despesas' ? (
                        <MenosAtivo width={width * 0.1} height={width * 0.1} />
                    ) : (
                        <MenosInativo width={width * 0.1} height={width * 0.1} />
                    )}

                    {/* Texto e valor alinhados à direita */}
                    <View style={styles.textoContainer}>
                        <Text style={tipoSelecionado === 'despesas' ? styles.textoAtivoDespesa : styles.textoInativoDespesa}>
                            Despesas
                        </Text>
                        <Text style={tipoSelecionado === 'despesas' ? styles.textovalorAtivoDespesa : styles.textovalorInativoDespesa}>
                            {totalDespesas > 0 ? `-${totalDespesas.toFixed(2)}${moeda.simbolo}` : `${totalDespesas.toFixed(2)}${moeda.simbolo}`}
                        </Text>


                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // Mantém os botões lado a lado
        justifyContent: 'space-between', // Garante espaço uniforme entre eles
        width: '95%',
        height: height * 0.10,
        alignSelf: 'center',
        //backgroundColor:'red',
        marginTop: -10
    },
    botao: {
        width: '48%', // Ocupa metade da largura disponível
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',

    },

    conteudo: {
        flexDirection: 'row', // Alinha o ícone e o texto horizontalmente
        alignItems: 'center', // Mantém alinhamento vertical correto
        justifyContent: 'space-between', // Ícone à esquerda, texto à direita
        width: '100%', // Garante que ocupa toda a largura do botão
        paddingHorizontal: "12%", // Adiciona espaço interno
    },

    textoContainer: {
        flex: 1, // Ocupa o espaço restante ao lado do ícone
        alignItems: 'flex-end', // Mantém o texto alinhado à direita
    },
    ativo: {
        backgroundColor: '#FFFFFF', // Fundo branco quando ativo
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 9,
        elevation: 2,
    },
    inativo: {
        backgroundColor: '#F2F2F2', // Fundo mais cinza quando inativo
    },

    textoAtivoDespesa: {
        color: '#E12D2D',
        fontSize: 16,
    },
    textoInativoDespesa: {
        color: '#A0A0A0',
        fontSize: 16,
    },
    textoAtivoReceita: {
        color: '#4AAF53',
        fontSize: 16,
    },
    textoInativoReceita: {
        color: '#A0A0A0',
        fontSize: 16,
    },
    textovalorAtivoReceita: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#4AAF53',
    },
    textovalorInativoReceita: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#A0A0A0',
    },
    textovalorAtivoDespesa: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#E12D2D',
    },
    textovalorInativoDespesa: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#A0A0A0',
    },
});

export default Botoes;
