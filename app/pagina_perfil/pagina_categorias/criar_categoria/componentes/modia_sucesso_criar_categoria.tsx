import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import IconeRotativo from '../../../../../assets/imagens/wallpaper.svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { inserirSubCategoria } from '../../../../../BASEDEDADOS/sub_categorias'; 

const { height } = Dimensions.get('window');

interface Props {
    visivel: boolean;
    setVisivel: (v: boolean) => void;
    cor: string;
    icone: string;
    categoriaId: number | null;
    nomeCategoria: string;
    onCategoriaCriada?: () => void;

}

const ModalAguardeCirarCategoria: React.FC<Props> = ({ visivel, cor, icone, categoriaId, nomeCategoria, setVisivel,onCategoriaCriada}) => {
    const navigation = useNavigation();

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [etapa, setEtapa] = useState<'carregando' | 'sucesso' | 'erro'>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');

    const animOpacity = useRef(new Animated.Value(0)).current;
    const [mostrarAnimado, setMostrarAnimado] = useState(false);

    const processarCriacao = async () => {
        setEtapa('carregando');
      
        // Garante pelo menos 1 segundo de carregamento
        const delay = new Promise(resolve => setTimeout(resolve, 1000));
      
        const resultado = await Promise.all([
            inserirSubCategoria(nomeCategoria, icone, cor, categoriaId),
            delay,
          ]).then(([res]) => res);
          
          
          
      
        if (resultado === 'sucesso') {
          setEtapa('sucesso');
        } else {
          setMensagemErro(
            resultado === 'duplicada_subcategoria'
              ? 'Já criaste uma subcategoria com este nome!'
              : resultado === 'duplicada_categoria'
                ? 'Já existe uma categoria com este nome!'
                : 'Ocorreu um erro ao criar a subcategoria.'
          );
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
                        <View style={[styles.iconeCircle, { backgroundColor: cor }]}>
                            <FontAwesome name={icone} size={30} color="#fff" />
                        </View>

                        <Text style={styles.nome}>{nomeCategoria}</Text>
                        <Text style={styles.texto}>Criando a categoria...</Text>

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
                        <View style={[styles.iconeCircle, { backgroundColor: cor }]}>
                            <FontAwesome name={icone} size={30} color="#fff" />
                        </View>

                        <Text style={styles.nome}>{nomeCategoria}</Text>
                        <Text style={styles.texto}>Categoria criada com sucesso!</Text>

                        <TouchableOpacity
                            style={styles.botaoOk}
                            onPress={() => {
                                setVisivel(false);
                                if (onCategoriaCriada) {
                                  onCategoriaCriada(); 
                                }
                                navigation.goBack();
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

export default ModalAguardeCirarCategoria;

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

});
