import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, ImageSourcePropType } from 'react-native';
import IconeRotativo from '../../../../assets/imagens/wallpaper.svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Image } from 'react-native';

const { height } = Dimensions.get('window');

interface Props {
    visivel: boolean;
    setVisivel: (v: boolean) => void;
    iniciarProcesso: () => Promise<{ sucesso: boolean; mensagem: string }>;
    nomeMeta: string;
    cor: string;
    icone_nome?: string;
    nome_subcat?: string;
    img_cat?: any;
}
function getImagemCategoria(img_cat: any): ImageSourcePropType {
    if (typeof img_cat === 'object' && img_cat !== null && img_cat.uri === undefined) {
        return img_cat;
    }

    if (!img_cat || typeof img_cat !== 'string') {
        return require('../../../../assets/imagens/categorias/outros.png');
    }

    if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
        return { uri: img_cat };
    }

    const imagensLocais: Record<string, ImageSourcePropType> = {
        'compras_pessoais.png': require('../../../../assets/imagens/categorias/categorias_svg/compras_pessoais.png'),
        'contas_e_servicos.png': require('../../../../assets/imagens/categorias/categorias_svg/contas_e_servicos.png'),
        'despesas_gerais.png': require('../../../../assets/imagens/categorias/categorias_svg/despesas_gerais.png'),
        'educacao.png': require('../../../../assets/imagens/categorias/categorias_svg/educacao.png'),
        'estimacao.png': require('../../../../assets/imagens/categorias/categorias_svg/estimacao.png'),
        'financas.png': require('../../../../assets/imagens/categorias/categorias_svg/financas.png'),
        'habitacao.png': require('../../../../assets/imagens/categorias/categorias_svg/habitacao.png'),
        'lazer.png': require('../../../../assets/imagens/categorias/categorias_svg/lazer.png'),
        'outros.png': require('../../../../assets/imagens/categorias/categorias_svg/outros.png'),
        'restauracao.png': require('../../../../assets/imagens/categorias/categorias_svg/restauracao.png'),
        'saude.png': require('../../../../assets/imagens/categorias/categorias_svg/saude.png'),
        'transportes.png': require('../../../../assets/imagens/categorias/categorias_svg/transportes.png'),

    };

    return imagensLocais[img_cat] || imagensLocais['outros.png'];
}

const ModalAguardeCirarMeta: React.FC<Props> = ({ visivel, iniciarProcesso, nomeMeta, setVisivel,cor,nome_subcat,img_cat,icone_nome }) => {
    const navigation = useNavigation();

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [etapa, setEtapa] = useState<'carregando' | 'sucesso' | 'erro'>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');

    const animOpacity = useRef(new Animated.Value(0)).current;
    const [mostrarAnimado, setMostrarAnimado] = useState(false);

    const processarCriacao = async () => {
        setEtapa('carregando');
        const delay = new Promise(res => setTimeout(res, 1000));

        const resultado = await Promise.all([iniciarProcesso(), delay]).then(([res]) => res);

        if (resultado.sucesso) {
            setEtapa('sucesso');
        } else {
            setMensagemErro(resultado.mensagem);
            setEtapa('erro');
        }
    };




    useEffect(() => {
        if (visivel) {
            animOpacity.setValue(0);
            setMostrarAnimado(true);

            requestAnimationFrame(() => {
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            });

            setEtapa('carregando');
            processarCriacao(); // <- Aqui
        } else if (mostrarAnimado) {
            Animated.timing(animOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setMostrarAnimado(false));
        }
    }, [visivel]);




    useEffect(() => {
        if (visivel) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotateAnim.stopAnimation();
        }
    }, [visivel]);

    if (!mostrarAnimado) return null;


    return (
        <Animated.View style={[styles.overlay, { opacity: animOpacity }]}>
            <View style={styles.modal}>

                {etapa === 'carregando' && (
                    <>
                        <View style={styles.donutWrapper}>
                            <AnimatedCircularProgress
                                size={74}
                                width={7}
                                fill={100}
                                tintColor={cor}
                                backgroundColor="#eee"
                                rotation={0}
                                lineCap="round"
                            >
                                {() =>
                                    nome_subcat ? (
                                        <FontAwesome name={icone_nome!} size={30} color={cor} />
                                    ) : (
                                        <Image
                                            source={getImagemCategoria(img_cat)}
                                            style={{ width: 30, height: 30 }}
                                            resizeMode="contain"
                                        />
                                    )
                                }
                            </AnimatedCircularProgress>
                        </View>



                        <Text style={styles.nome}>{nomeMeta}</Text>
                        <Text style={styles.texto}>Criando a meta...</Text>


                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: rotateAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg'],
                                    }),
                                }],
                                marginTop: 24,
                            }}
                        >
                            <IconeRotativo width={30} height={30} fill="#2565A3" />
                        </Animated.View>
                    </>
                )}

                {etapa === 'sucesso' && (
                    <>
                        <View style={styles.donutWrapper}>
                            <AnimatedCircularProgress
                                size={74}
                                width={7}
                                fill={100}
                                tintColor={cor}
                                backgroundColor="#eee"
                                rotation={0}
                                lineCap="round"
                            >
                                {() =>
                                    nome_subcat ? (
                                        <FontAwesome name={icone_nome!} size={30} color={cor} />
                                    ) : (
                                        <Image
                                            source={getImagemCategoria(img_cat)}
                                            style={{ width: 30, height: 30 }}
                                            resizeMode="contain"
                                        />
                                    )
                                }
                            </AnimatedCircularProgress>
                        </View>


                        <Text style={styles.nome}>{nomeMeta}</Text>
                        <Text style={styles.texto}>Meta criada com sucesso!</Text>


                        <TouchableOpacity
                            style={styles.botaoOk}
                            onPress={() => {
                                Animated.timing(animOpacity, {
                                    toValue: 0,
                                    duration: 200,
                                    useNativeDriver: true,
                                }).start(() => {
                                    setVisivel(false);
                                    navigation.goBack();
                                });
                            }}

                        >
                            <Text style={styles.textoBotao}>OK</Text>
                        </TouchableOpacity>

                    </>
                )}

                {etapa === 'erro' && (
                    <>
                        <View style={[styles.iconeCircle, { backgroundColor: '#D9534F' }]}>
                            <FontAwesome name="exclamation-circle" size={30} color="#fff" />
                        </View>

                        <Text style={styles.nome}>Erro ao criar</Text>
                        <Text style={styles.texto}>{mensagemErro}</Text>

                        <TouchableOpacity
                            style={[styles.botaoOk, { backgroundColor: '#D9534F' }]}
                            onPress={() => setVisivel(false)}
                        >
                            <Text style={styles.textoBotao}>Voltar</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </Animated.View>

    );
};

export default ModalAguardeCirarMeta;

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    nome: {
        fontSize: 18,
        color: '#2565A3',
        fontWeight: 'bold',
        marginTop: 1,
    },
    texto: {
        color: '#2565A3',
        fontSize: 15,
        marginTop: 16,
    },


    modal: {
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 25,
        borderRadius: 14,
        alignItems: 'center',
        width: '70%',
    },
    iconeCircle: {
        width: 74,
        height: 74,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    botaoOk: {
        marginTop: 20,
        backgroundColor: '#2565A3',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 24,
    },
    textoBotao: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    donutWrapper: {
        width: 74,
        height: 74,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
      }
      

});
