import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ImageSourcePropType } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useMoeda } from '../../../MOEDA';

function getImagemCategoria(img_cat: string): ImageSourcePropType {
    if (!img_cat) {
        return require('../../../../assets/imagens/categorias/outros.png');
    }

    // Se for imagem do usuário ou remota
    if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
        return { uri: img_cat };
    }

    // Se for imagem local pré-definida
    const imagensLocais: Record<string, ImageSourcePropType> = {
        'compras_pessoais.png': require('../../../../assets/imagens/categorias/compras_pessoais.png'),
        'contas_e_servicos.png': require('../../../../assets/imagens/categorias/contas_e_servicos.png'),
        'despesas_gerais.png': require('../../../../assets/imagens/categorias/despesas_gerais.png'),
        'educacao.png': require('../../../../assets/imagens/categorias/educacao.png'),
        'estimacao.png': require('../../../../assets/imagens/categorias/estimacao.png'),
        'financas.png': require('../../../../assets/imagens/categorias/financas.png'),
        'habitacao.png': require('../../../../assets/imagens/categorias/habitacao.png'),
        'lazer.png': require('../../../../assets/imagens/categorias/lazer.png'),
        'outros.png': require('../../../../assets/imagens/categorias/outros.png'),
        'restauracao.png': require('../../../../assets/imagens/categorias/restauracao.png'),
        'saude.png': require('../../../../assets/imagens/categorias/saude.png'),
        'transportes.png': require('../../../../assets/imagens/categorias/transportes.png'),
        'alugel.png': require('../../../../assets/imagens/categorias/receitas/alugel.png'),
        'caixa-de-ferramentas.png': require('../../../../assets/imagens/categorias/receitas/caixa-de-ferramentas.png'),
        'deposito.png': require('../../../../assets/imagens/categorias/receitas/deposito.png'),
        'dinheiro.png': require('../../../../assets/imagens/categorias/receitas/dinheiro.png'),
        'lucro.png': require('../../../../assets/imagens/categorias/receitas/lucro.png'),
        'presente.png': require('../../../../assets/imagens/categorias/receitas/presente.png'),
        'salario.png': require('../../../../assets/imagens/categorias/receitas/salario.png'),
    };

    return imagensLocais[img_cat] || imagensLocais['outros.png'];
}

interface Props {
    nome: string;
    valor: number;
    hora: string;
    cor: string;
    imagem: any;
    tipo: 'Receita' | 'Despesa';
    onPress?: () => void;
}

const MovimentoCard2: React.FC<Props> = ({ nome, valor, hora, cor, imagem, tipo, onPress }) => {
    const { moeda } = useMoeda();

    const isDespesa = tipo === 'Despesa';
    const valorFormatado = `${isDespesa ? '-' : '+'}${valor}${moeda.simbolo}`;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {/* Ícone com fundo colorido */}
            <View style={[styles.iconeWrapper, { backgroundColor: cor }]}>
                {typeof imagem === 'string' && !imagem.endsWith('.png') && !imagem.startsWith('http') && !imagem.startsWith('file') ? (
                    <FontAwesome name={imagem} size={20} color="#fff" />
                ) : (
                    <Image source={getImagemCategoria(imagem)} style={styles.icone} resizeMode="contain" />
                )}
            </View>


            {/* Texto e hora */}
            <View style={styles.textoContainer}>
                <Text style={styles.nome} numberOfLines={1} ellipsizeMode="tail">
                    {nome}
                </Text>

                {/* <Text style={styles.hora}>{hora}</Text>*/}
            </View>

            {/* Valor */}
            <View style={[styles.valorWrapper, { backgroundColor: isDespesa ? '#FFCACA' : '#C9E7CC' }]}>
                <Text style={[styles.valor, { color: isDespesa ? '#F54338' : '#4AAF53' }]}>
                    {valorFormatado}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#EEEEEE',
        borderRadius: 10,
        alignItems: 'center',
        padding: 10,
        paddingHorizontal: 10,
        marginVertical: 0,
        marginLeft:10,
        width: '100%',
        marginBottom: 8
    },
    iconeWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icone: {
        width: 24,
        height: 24,
    },
    textoContainer: {
        flex: 1,
        marginLeft: 10,
    },
    nome: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111',
    },
    hora: {
        fontSize: 12,
        color: '#BABABA',
    },
    valorWrapper: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    valor: {
        fontWeight: '900',
        fontSize: 14,
    },
});

export default MovimentoCard2;
