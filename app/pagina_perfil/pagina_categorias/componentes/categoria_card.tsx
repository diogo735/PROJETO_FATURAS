import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Categoria } from '../../../../BASEDEDADOS/tipos_tabelas';
import SetaBaixo from '../../../../assets/icons/pagina_categorias/seta.svg';

interface Props {
    categoria: Categoria;

    aoPressionar?: () => void;
    mostrarCheck?: boolean;
    expandida?: boolean;
}


function getImagemCategoria(img_cat: any): ImageSourcePropType {
    if (typeof img_cat === 'object' && img_cat !== null && img_cat.uri === undefined) return img_cat;
    if (!img_cat || typeof img_cat !== 'string') return require('../../../../assets/imagens/categorias/outros.png');
    if (img_cat.startsWith('file') || img_cat.startsWith('http')) return { uri: img_cat };

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

const CategoriaCard: React.FC<Props> = ({ categoria, aoPressionar, expandida }) => {


    const rotateAnim = useRef<Animated.Value | null>(null);

    if (!rotateAnim.current) {
        rotateAnim.current = new Animated.Value(expandida ? 1 : 0);
    }


    useEffect(() => {
        Animated.timing(rotateAnim.current!, {
            toValue: expandida ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [expandida]);



    const rotate = rotateAnim.current!.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={aoPressionar}

        >

            <View style={[styles.iconeWrapper, { backgroundColor: categoria.cor_cat }]}>
                <Image
                    source={getImagemCategoria(categoria.img_cat)}
                    style={styles.icone}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.nomeCategoria}>{categoria.nome_cat}</Text>

            <Animated.View style={{ transform: [{ rotate }], marginRight: 5 }}>
                <SetaBaixo width={16} height={16} fill="#164878" />
            </Animated.View>

        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        //backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    iconeWrapper: {
        width: 50,
        height: 50,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    icone: {
        width: 24,
        height: 24,
    },
    nomeCategoria: {
        flex: 1,
        fontSize: 16,
        color: '#164878',
        fontWeight: '600',
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 99,
        borderWidth: 2,
        borderColor: '#607D8B',
    },
    radioSelecionado: {
        width: 22,
        height: 22,
        borderRadius: 99,
        backgroundColor: '#164878',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategoriaCard;
