import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

import MaisAtivo from '../../../assets/icons/botes_paginia_pricipal/+.svg';
import MaisInativo from '../../../assets/icons/botes_paginia_pricipal/+_cinza.svg';
import MenosAtivo from '../../../assets/icons/botes_paginia_pricipal/-.svg';
import MenosInativo from '../../../assets/icons/botes_paginia_pricipal/-_cinza.svg';

const Botoes: React.FC = () => {
    const [ativo, setAtivo] = useState<'receitas' | 'despesas'>('despesas'); // Começa em despesas

    return (
        <View style={styles.container}>
            {/* Botão de Receitas */}
            <TouchableOpacity
                style={[
                    styles.botao,
                    ativo === 'receitas' ? styles.ativo : styles.inativo,
                ]}
                onPress={() => setAtivo('receitas')}
            >
                <View style={styles.conteudo}>
                    {/* Ícone */}
                    {ativo === 'receitas' ? (
                        <MaisAtivo width={width*0.1} height={width*0.1} />
                    ) : (
                        <MaisInativo width={width*0.1} height={width*0.1} />
                    )}

                    {/* Texto Receitas */}
                    <View style={styles.textoContainer}>
                        <Text style={ativo === 'receitas' ? styles.textoAtivoReceita : styles.textoInativoReceita}>
                            Receitas
                        </Text>
                        <Text style={ativo === 'receitas' ? styles.textovalorAtivoReceita : styles.textovalorInativoReceita}>
                            900 €
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Botão de Despesas */}
            <TouchableOpacity
                style={[
                    styles.botao,
                    ativo === 'despesas' ? styles.ativo : styles.inativo
                ]}
                onPress={() => setAtivo('despesas')}
            >
                <View style={styles.conteudo}>
                    {/* Ícone */}
                    {ativo === 'despesas' ? (
                        <MenosAtivo width={width*0.1} height={width*0.1} />
                    ) : (
                        <MenosInativo width={width*0.1} height={width*0.1} />
                    )}

                    {/* Texto e valor alinhados à direita */}
                    <View style={styles.textoContainer}>
                        <Text style={ativo === 'despesas' ? styles.textoAtivoDespesa : styles.textoInativoDespesa}>
                            Despesas
                        </Text>
                        <Text style={ativo === 'despesas' ? styles.textovalorAtivoDespesa : styles.textovalorInativoDespesa}>
                            -150 €
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
        backgroundColor:'red',
        marginTop:-20
    },
    botao: {
        width: '48%', // Ocupa metade da largura disponível
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5, // Efeito de sombra no Android
    },
    conteudo: {
        flexDirection: 'row', // Alinha o ícone e o texto horizontalmente
        alignItems: 'center', // Mantém alinhamento vertical correto
        justifyContent: 'space-between', // Ícone à esquerda, texto à direita
        width: '100%', // Garante que ocupa toda a largura do botão
        paddingHorizontal: "15%", // Adiciona espaço interno
    },
    
    textoContainer: {
        flex: 1, // Ocupa o espaço restante ao lado do ícone
        alignItems: 'flex-end', // Mantém o texto alinhado à direita
    },
    ativo: {
        backgroundColor: '#FFFFFF', // Fundo branco quando ativo
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4AAF53',
    },
    textovalorInativoReceita: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A0A0A0',
    },
    textovalorAtivoDespesa: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E12D2D',
    },
    textovalorInativoDespesa: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A0A0A0',
    },
});

export default Botoes;
