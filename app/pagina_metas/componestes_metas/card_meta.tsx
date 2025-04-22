import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import MeuIconeSVG from '../../../assets/teste.svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { Image, ImageSourcePropType } from 'react-native';


function getImagemCategoria(img_cat: any): ImageSourcePropType {
    if (typeof img_cat === 'object' && img_cat !== null && img_cat.uri === undefined) {
        return img_cat;
    }

    if (!img_cat || typeof img_cat !== 'string') {
        return require('../../../assets/imagens/categorias/outros.png');
    }

    if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
        return { uri: img_cat };
    }

    const imagensLocais: Record<string, ImageSourcePropType> = {
        'compras_pessoais.png': require('../../../assets/imagens/categorias/categorias_svg/compras_pessoais.png'),
        'contas_e_servicos.png': require('../../../assets/imagens/categorias/categorias_svg/contas_e_servicos.png'),
        'despesas_gerais.png': require('../../../assets/imagens/categorias/categorias_svg/despesas_gerais.png'),
        'educacao.png': require('../../../assets/imagens/categorias/categorias_svg/educacao.png'),
        'estimacao.png': require('../../../assets/imagens/categorias/categorias_svg/estimacao.png'),
        'financas.png': require('../../../assets/imagens/categorias/categorias_svg/financas.png'),
        'habitacao.png': require('../../../assets/imagens/categorias/categorias_svg/habitacao.png'),
        'lazer.png': require('../../../assets/imagens/categorias/categorias_svg/lazer.png'),
        'outros.png': require('../../../assets/imagens/categorias/categorias_svg/outros.png'),
        'restauracao.png': require('../../../assets/imagens/categorias/categorias_svg/restauracao.png'),
        'saude.png': require('../../../assets/imagens/categorias/categorias_svg/saude.png'),
        'transportes.png': require('../../../assets/imagens/categorias/categorias_svg/transportes.png'),

    };

    return imagensLocais[img_cat] || imagensLocais['outros.png'];
}


interface CardMetasProps {
    meta: any;
}

const CardMetas: React.FC<CardMetasProps> = ({ meta }) => {
    if (!meta) return null;

    const {
        nome_cat,
        cor_cat,
        img_cat,
        nome_subcat,
        cor_subcat,
        icone_nome,
        valor_meta,
        data_inicio,
        data_fim,
    } = meta;

    const nome = nome_subcat ?? nome_cat;
    const cor = cor_subcat ?? cor_cat;


    // console.log(`🚨 Meta: valor_atual = ${meta.valor_atual}, recebe_alerta = ${meta.recebe_alerta}`);


    const percentagem = Math.floor((meta.valor_atual / valor_meta) * 100);
    const hoje = new Date();
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);

    const mesmaData =
        hoje.getDate() === inicio.getDate() &&
        hoje.getMonth() === inicio.getMonth() &&
        hoje.getFullYear() === inicio.getFullYear();

    const anoAtual = hoje.getFullYear();
    const anoInicio = inicio.getFullYear();
    const anoFim = fim.getFullYear();

    const dataInicioStr = mesmaData
        ? 'Hoje'
        : inicio.toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'long',
            ...(anoInicio !== anoAtual && { year: 'numeric' }),
        });

    const dataFimStr = fim.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        ...(anoFim !== anoAtual && { year: 'numeric' }),
    });

    return (
        <View style={[
            styles.card,
            meta.valor_atual > meta.valor_meta
                ? { backgroundColor: '#FFE3E0' }
                : meta.recebe_alerta != null && meta.valor_atual > meta.recebe_alerta
                    ? { backgroundColor: '#FFF3E6' }
                    : null
        ]}>
            <View style={styles.rowTop}>
                <View style={styles.donutWrapper}>
                    <AnimatedCircularProgress
                        size={60}
                        width={7}
                        fill={percentagem}
                        tintColor={cor}
                        backgroundColor="#eee"
                        rotation={0}
                        lineCap="round"
                    >
                        {() =>
                            nome_subcat ? (
                                <View
                                    style={{
                                        backgroundColor: cor,
                                        width: 30,
                                        height: 30,
                                        borderRadius: 99,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <FontAwesome name={icone_nome} size={16} color="#fff" />
                                </View>
                            ) : (
                                <Image
                                    source={getImagemCategoria(img_cat)}
                                    style={{ width: 27, height: 27 }}
                                    resizeMode="contain"
                                />
                            )
                        }
                    </AnimatedCircularProgress>

                </View>

                <View style={styles.contentRight}>
                    <View style={styles.infoRowHorizontal}>
                        <Text
                            style={styles.nome}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {nome}
                        </Text>
                        <Text style={styles.valores}>
                            <Text style={styles.valorUsado}>
                                {Number(meta.valor_atual).toLocaleString('pt-PT', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                })} €
                            </Text> / {valor_meta}€
                        </Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <ProgressBar progress={percentagem / 100} color={cor} style={styles.progressBar} />
                        <Text style={styles.percentagem}>{percentagem}%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.dataRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.hoje}>{dataInicioStr}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    {meta.valor_atual > meta.valor_meta ? (
                        <Text style={styles.ultrapassou}>Ultrapassou!</Text>
                    ) : meta.recebe_alerta != null && meta.valor_atual > meta.recebe_alerta ? (
                        <Text style={styles.limiteAtingido}>Limite atingido!</Text>
                    ) : null}
                </View>


                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.fim}>{dataFimStr}</Text>
                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        //backgroundColor:'#FDF9DB',
        borderRadius: 12,
        padding: 14,
        marginTop: 15,
        elevation: 2,
    },
    rowTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    donutWrapper: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
    },
    contentRight: {
        flex: 1,
        justifyContent: 'center',
        gap: 10,
        marginTop: 5,
    },
    infoRowHorizontal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nome: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flexShrink: 1,
        marginRight: 8,
    },
    valores: {
        fontSize: 14,
        color: '#888',
    },
    valorUsado: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
    },
    progressContainer: {
        position: 'relative',
    },
    progressBar: {
        height: 16,
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
    },
    percentagem: {
        position: 'absolute',
        top: -1,
        left: '46%',
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    hoje: {
        color: '#aaa',
        fontWeight: '500',
    },
    fim: {
        color: '#aaa',
        fontWeight: '500',
    },
    limiteAtingido: {
        color: '#F49A4A',
        fontWeight: '500',
        fontSize: 13,
        textAlign: 'center',
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -50 }],
    },
    ultrapassou: {
        color: 'tomato',
        fontWeight: '500',
        fontSize: 13,

    }


});

export default CardMetas;
