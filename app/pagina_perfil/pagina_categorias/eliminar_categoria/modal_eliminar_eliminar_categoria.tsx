import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from '../../../../assets/imagens/wallpaper.svg';
const { width } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';

import { eliminarSubCategoriaEAtualizarMovimentos } from '../../../../BASEDEDADOS/sub_categorias';


interface Props {
    visivel: boolean;
    nomeSubcategoria: string;
    corSubcategoria: string;
    setVisivel: (v: boolean) => void;
    icone: string;
    idSubcategoria: number;
    aoConfirmar: () => void;
    aoCancelar: () => void;
    onSucesso?: () => void;
}

const ModalConfirmarExclusao: React.FC<Props> = ({
    visivel,
    nomeSubcategoria,
    corSubcategoria,
    icone,
    idSubcategoria,
    aoConfirmar,
    onSucesso,
    setVisivel,
    aoCancelar,
}) => {

    const [etapa, setEtapa] = useState<'confirmar' | 'carregando' | 'sucesso' | 'erro'>('confirmar');
    const [mostrarAnimado, setMostrarAnimado] = useState(true);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();


    useEffect(() => {
        if (visivel && etapa === 'carregando') {
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
    }, [visivel, etapa]);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const trocarEtapaComAnimacao = (novaEtapa: typeof etapa) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            setEtapa(novaEtapa);
            fadeAnim.setValue(1);
        });
    };


    const processarExclusao = async () => {
        trocarEtapaComAnimacao('carregando');
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const resultado = await eliminarSubCategoriaEAtualizarMovimentos(idSubcategoria);
            if (resultado === 'sucesso') {
                trocarEtapaComAnimacao('sucesso');
            } else {
                trocarEtapaComAnimacao('erro');
            }
        } catch (e) {
            trocarEtapaComAnimacao('erro');
        }
    };

    const [contador, setContador] = useState(5);
    const [botaoAtivo, setBotaoAtivo] = useState(false);

    useEffect(() => {
        if (visivel && etapa === 'confirmar') {
            setBotaoAtivo(false);
            setContador(5);

            const interval = setInterval(() => {
                setContador(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setBotaoAtivo(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [visivel, etapa]);



    return (
        <Modal
            isVisible={visivel}
            onBackdropPress={aoCancelar}
            backdropOpacity={0.5}
            animationIn="zoomIn"
            animationOut="fadeOutDown" // <- mais leve que zoomOut
            animationOutTiming={300}   // <- duração personalizada
            animationInTiming={300}
            useNativeDriver
        >
            <View style={styles.modalBox}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {etapa === 'confirmar' && (
                        <>

                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="delete" size={50} color="#E22121" />
                                <Text style={styles.titulo}>Excluir Categoria?</Text>

                                <View style={styles.infoBox}>
                                    <View style={[styles.bolinha, { backgroundColor: corSubcategoria }]}>
                                        <FontAwesome name={icone} size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.nome}>{nomeSubcategoria}</Text>
                                </View>
                                <View style={styles.infoTextBox}>
                                    <Text style={styles.subTexto}>Atenção: Se tiveres movimentos com esta categoria,estes passarão a ser catalogados com a categoria principal !</Text>
                                </View>

                                <View style={styles.botoes}>
                                    <TouchableOpacity style={styles.cancelar} onPress={aoCancelar}>
                                        <Text style={styles.textoCancelar}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.excluir, { opacity: botaoAtivo ? 1 : 0.6 }]}
                                        onPress={botaoAtivo ? processarExclusao : undefined}
                                        disabled={!botaoAtivo}
                                    >
                                        <Text style={styles.textoExcluir}>
                                            {botaoAtivo ? 'Excluir' : `Excluir (${contador})`}
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </>
                    )}
                    {etapa === 'carregando' && (

                        <>

                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="delete" size={50} color="#E22121" />
                                <Text style={styles.titulo}>A eliminar categoria...</Text>
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
                                    <Icon width={30} height={30} fill="#2565A3" />
                                </Animated.View>
                            </View>
                        </>
                    )}
                    {etapa === 'sucesso' && (
                        <>

                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="check-circle" size={50} color="#4CAF50" />
                                <Text style={styles.titulo}>Categoria eliminada com sucesso!</Text>
                                <TouchableOpacity style={styles.botaoOk} onPress={() => {
                                    setVisivel(false);
                                    onSucesso?.();
                                }}>
                                    <Text style={styles.textoBotaoOk}>OK</Text>
                                </TouchableOpacity>
                            </View>

                        </>
                    )}{etapa === 'erro' && (
                        <>

                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="warning" size={50} color="#FFA000" />
                                <Text style={styles.titulo}>Erro ao eliminar</Text>
                                <TouchableOpacity onPress={aoCancelar}>
                                    <Text style={styles.textoExcluir}>Voltar</Text>
                                </TouchableOpacity>
                            </View>

                        </>
                    )}
                </Animated.View>
            </View>
        </Modal >
    );
};

const styles = StyleSheet.create({
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#164878',
        marginTop: 10,
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        width: width * 0.75,
        justifyContent: 'flex-start',

    },
    bolinha: {
        width: 50,
        height: 50,
        borderRadius: 99,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },

    nome: {
        fontSize: 16,
        fontWeight: '600',
        color: '#164878',
    },
    botoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    cancelar: {
        backgroundColor: '#A9A9A9',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
    },
    excluir: {
        backgroundColor: '#E22121',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
    },
    textoCancelar: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    textoExcluir: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoTextBox: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginBottom: 15,
        gap: 4,
    },

    subTexto: {
        fontSize: 13,
        color: '#A0A0A0',
        marginTop: 2,
    },
    botaoOk: {
        backgroundColor: '#2565A3',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 10,
    },

    textoBotaoOk: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },

});

export default ModalConfirmarExclusao;
