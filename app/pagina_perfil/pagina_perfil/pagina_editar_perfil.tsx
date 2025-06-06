import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Image, Keyboard } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import Iconnome from '../../../assets/pagina_perfil/pagina_editar_perfil/nome.svg';
import Iconmail from '../../../assets/pagina_perfil/pagina_editar_perfil/mail.svg';
import Iconfoto from '../../../assets/pagina_perfil/pagina_editar_perfil/user.svg';
import Iconpass from '../../../assets/pagina_perfil/pagina_editar_perfil/password.svg';
const { height, width } = Dimensions.get('window');
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { atualizarUsuario, buscarUsuarioAtual } from '../../../BASEDEDADOS/user';
import ModalOpcoesCamera_editarfoto from './modal_foto_opcoes';
import * as ImagePicker from 'expo-image-picker';
import ModalCameraCheia_editarperfil from './camara_view';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';


import Icon from '../../../assets/imagens/wallpaper.svg';
import { Animated, Easing } from 'react-native';



const PaginaDetalhePerfil = () => {
    const navigation = useNavigation();
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [foto, setFoto] = useState<string | null>(null);
    const [senha, setSenha] = useState('');
    const [mostrarModalFoto, setMostrarModalFoto] = useState(false);
    const [abrirCamera, setAbrirCamera] = useState(false);
    const [nomeOriginal, setNomeOriginal] = useState('');
    const [fotoOriginal, setFotoOriginal] = useState<string | null>(null);
    const [senhaOriginal, setSenhaOriginal] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
    const animOpacity = useRef(new Animated.Value(0)).current;
    const animTranslateY = useRef(new Animated.Value(30)).current;
    const [salvando, setSalvando] = useState(false);
    const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
    const animModalOpacity = useRef(new Animated.Value(0)).current;
    const animModalTranslateY = useRef(new Animated.Value(30)).current;
    const [mostrarModalErro, setMostrarModalErro] = useState(false);
    const animContentOpacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.sequence([
            Animated.timing(animContentOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(animContentOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [salvando, mostrarModalSucesso, mostrarModalErro]);

    const animarEntradaModal = () => {
        animModalOpacity.setValue(0);
        animModalTranslateY.setValue(30);
        Animated.parallel([
            Animated.timing(animModalOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(animModalTranslateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };


    const rotateAnim = useRef(new Animated.Value(0)).current;




    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    useEffect(() => {
        if (!carregando) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
    }, [carregando]);


    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        const carregarDados = async () => {
            const tempoMinimo = new Promise((resolve) => setTimeout(resolve, 500)); // pelo menos 500ms
            const carregarUser = (async () => {
                const user = await buscarUsuarioAtual();
                if (user) {
                    setNome(user.nome);
                    setEmail(user.email);
                    setFoto(user.imagem);
                    setSenha(user.pass);
                    setNomeOriginal(user.nome);
                    setFotoOriginal(user.imagem);
                    setSenhaOriginal(user.pass);
                }
            })();

            // Espera os dois em paralelo
            await Promise.all([tempoMinimo, carregarUser]);

            setCarregando(false);


        };

        carregarDados();
    }, []);


    const houveAlteracao =
        nome !== nomeOriginal ||
        senha !== senhaOriginal ||
        foto !== fotoOriginal;

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (houveAlteracao) {
                    setMostrarModalConfirmacao(true);

                    Animated.parallel([
                        Animated.timing(animOpacity, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animTranslateY, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]).start();

                    return true; // impede voltar
                }

                return false; // permite voltar normalmente
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => backHandler.remove();
        }, [houveAlteracao])
    );
    useEffect(() => {
        if (salvando) {
            rotateAnim.setValue(0); // reinicia o valor
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [salvando]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => {
                            if (houveAlteracao) {
                                setMostrarModalConfirmacao(true);
                                Animated.parallel([
                                    Animated.timing(animOpacity, {
                                        toValue: 1,
                                        duration: 200,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(animTranslateY, {
                                        toValue: 0,
                                        duration: 200,
                                        useNativeDriver: true,
                                    }),
                                ]).start();
                            } else {
                                navigation.goBack();
                            }
                        }}
                    >
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                </View>
            </View>

            {carregando ? (
                <View style={styles.vazioContainer}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Icon width={height * .1} height={height * .1} fill="#2565A3" />
                    </Animated.View>
                    <Text style={{ marginTop: 16, color: '#2565A3' }}>A carregar perfil...</Text>
                </View>
            ) : (<Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >

                        <View style={styles.labelContainer}>
                            <Iconfoto width={22} height={22} style={{ marginTop: '2%' }} />
                            <Text style={styles.label}>Foto de Perfil</Text>
                        </View>
                        <TouchableOpacity style={styles.fotoWrapper} onPress={() => setMostrarModalFoto(true)}>
                            {foto ? (
                                <Image source={{ uri: foto }} style={styles.foto} />
                            ) : (
                                <Image source={require('../../../assets/imagens/sem_foto.png')} style={styles.foto} />
                            )}

                            {/* Camada escura + ícone */}
                            <View style={styles.overlay}>
                                <Ionicons name="create-outline" size={26} color="white" />
                            </View>
                        </TouchableOpacity>



                        {/* Nome */}
                        <View style={styles.labelContainer}>
                            <Iconnome width={22} height={22} style={{ marginTop: '2%' }} />
                            <Text style={styles.label}>Nome</Text>
                        </View>

                        <TextInput
                            value={nome}
                            onChangeText={setNome}
                            style={styles.input}
                            placeholder="Digite seu nome"
                        />

                        {/* Email */}
                        {email ? (
                            <>
                                <View style={styles.labelContainer}>
                                    <Iconmail width={22} height={22} style={{ marginTop: '2%' }} />
                                    <Text style={styles.label}>Email</Text>
                                </View>
                                <TextInput
                                    value={email}
                                    editable={false}
                                    style={[styles.input, { backgroundColor: '#f0f0f0', color: '#888' }]}
                                />
                            </>
                        ) : null}


                        {/* Palavra-passe */}
                        {email && (
                            <>
                                <View style={styles.labelContainer}>
                                    <Iconpass width={22} height={22} style={{ marginTop: '2%' }} />
                                    <Text style={styles.label}>Palavra-Passe</Text>
                                </View>
                                <View style={styles.passwordWrapper}>
                                    <TextInput
                                        value={senha}
                                        onChangeText={setSenha}
                                        secureTextEntry={!mostrarSenha}
                                        style={styles.passwordInput}
                                        placeholder="Digite sua palavra-passe"
                                    />
                                    <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={{ paddingHorizontal: 8 }}>
                                        <Ionicons
                                            name={mostrarSenha ? 'eye' : 'eye-off'}
                                            size={20}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}



                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.botaoGuardar, { opacity: houveAlteracao ? 1 : 0.5 }]}
                        onPress={async () => {
                            Keyboard.dismiss();
                            if (houveAlteracao) {
                                setSalvando(true);
                                animarEntradaModal();
                                const sucesso = await Promise.all([
                                    atualizarUsuario(nome, foto, senha),
                                    new Promise(resolve => setTimeout(resolve, 1000))
                                ]).then(([resultado]) => resultado);

                                setSalvando(false);

                                if (sucesso) {
                                    setMostrarModalSucesso(true);
                                } else {
                                    setMostrarModalErro(true);
                                }
                            }
                        }}

                        disabled={!houveAlteracao}
                    >
                        <View style={styles.botaoConteudo}>
                            <MaterialIcons name="save" size={20} color="#fff" />
                            <Text style={styles.textoBotao}>Guardar Alterações</Text>
                        </View>
                    </TouchableOpacity>

                </KeyboardAvoidingView></Animated.View>
            )}
            {(salvando || mostrarModalSucesso || mostrarModalErro) && (
                <View style={styles.modalOverlay}>
                    <Animated.View style={[
                        styles.modalBox,
                        {
                            opacity: animModalOpacity,
                            transform: [{ translateY: animModalTranslateY }]
                        }
                    ]}>
                        {salvando ? (
                            <>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <Icon width={50} height={50} fill="#2565A3" />
                                </Animated.View>
                                <Text style={styles.modalTitulo2}>Guardando alterações...</Text>
                            </>
                        ) : mostrarModalSucesso ? (
                            <>
                                <Ionicons name="checkmark-circle" size={50} color="#28a745" style={styles.modalIconAlerta} />
                                <Text style={styles.modalTitulo}>Atualizaste o teu perfil com sucesso!</Text>
                                <TouchableOpacity
                                    style={[styles.botaoConfirmar2, { marginTop: 16 }]}
                                    onPress={() => {
                                        setMostrarModalSucesso(false);
                                        navigation.goBack();
                                    }}
                                >
                                    <Text style={styles.txtConfirmar2}>OK</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Ionicons name="close-circle" size={50} color="#D8000C" style={styles.modalIconAlerta} />
                                <Text style={styles.modalTitulo}>Erro ao atualizar o perfil.</Text>
                                <TouchableOpacity
                                    style={[styles.botaoConfirmar2, { marginTop: 16 }]}
                                    onPress={() => {
                                        setMostrarModalErro(false);
                                    }}
                                >
                                    <Text style={styles.txtConfirmar2}>Tentar Novamente</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animated.View>
                </View>
            )}




            <ModalOpcoesCamera_editarfoto
                visivel={mostrarModalFoto}
                aoFechar={() => setMostrarModalFoto(false)}
                onAbrirGaleria={async () => {
                    setMostrarModalFoto(false);

                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permissionResult.granted) {
                        alert('Permissão para acessar a galeria é necessária!');
                        return;
                    }

                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1], // quadrado
                        quality: 1,
                    });

                    if (!result.canceled && result.assets.length > 0) {
                        const imagemSelecionada = result.assets[0].uri;
                        setFoto(imagemSelecionada);

                    }
                }}

                onInserirManual={() => {
                    setMostrarModalFoto(false);
                    setAbrirCamera(true); // abre o modal com a câmera
                }}

            />
            <ModalCameraCheia_editarperfil
                visivel={abrirCamera}
                aoFechar={() => setAbrirCamera(false)}
                onFotoCapturada={(uri) => {
                    setFoto(uri);
                    setAbrirCamera(false);
                }}
            />
            {mostrarModalConfirmacao && (
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.modalBox,
                            {
                                opacity: animOpacity,
                                transform: [{ translateY: animTranslateY }]
                            }
                        ]}
                    >
                        <Ionicons name="alert-circle" size={50} color="#D8000C" style={styles.modalIconAlerta} />
                        <Text style={styles.modalTitulo}>Quer descartar as alterações?</Text>

                        <View style={styles.modalBotoes}>
                            <TouchableOpacity
                                onPress={() => {
                                    Animated.parallel([
                                        Animated.timing(animOpacity, {
                                            toValue: 0,
                                            duration: 200,
                                            useNativeDriver: true,
                                        }),
                                        Animated.timing(animTranslateY, {
                                            toValue: 30,
                                            duration: 200,
                                            useNativeDriver: true,
                                        }),
                                    ]).start(() => setMostrarModalConfirmacao(false));
                                }}
                                style={styles.botaoCancelar}
                            >
                                <Text style={styles.txtCancelar}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    Animated.parallel([
                                        Animated.timing(animOpacity, {
                                            toValue: 0,
                                            duration: 200,
                                            useNativeDriver: true,
                                        }),
                                        Animated.timing(animTranslateY, {
                                            toValue: 30,
                                            duration: 200,
                                            useNativeDriver: true,
                                        }),
                                    ]).start(() => {
                                        setMostrarModalConfirmacao(false);
                                        navigation.goBack();
                                    });
                                }}
                                style={styles.botaoConfirmar}
                            >
                                <Text style={styles.txtConfirmar}>Sim</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            )}

        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    header: {
        backgroundColor: '#2565A3',
        height: height * 0.08,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        elevation: 0,
    },
    headerTitle: {
        color: 'white',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: 18 * 0.05,
        marginLeft: 15,
    },
    content: {
        paddingHorizontal: '5%',
        marginVertical: '1%',
        justifyContent: 'flex-start',
    },
    label: {
        fontSize: scale(15),
        color: '#2565A3',
        marginTop: '5%',
        marginBottom: '3%',
        fontWeight: '600',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 0,
        marginBottom: '1%',
    },

    fotoWrapper: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: 99,
        overflow: 'hidden',
        alignSelf: 'center',
        marginVertical: 10,
    },
    foto: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    input: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: '2%',
        fontSize: scale(13),
        color: '#333',
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        paddingHorizontal: 10, paddingVertical: 12
    },
    passwordInput: {
        flex: 1,

        paddingHorizontal: 5,
        fontSize: scale(13),
        color: '#333',
    },


    botaoGuardar: {
        backgroundColor: '#2565A3',
        paddingVertical: 14,
        borderRadius: 99,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        margin: '5%'
    },

    textoBotao: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: scale(14),
    },
    botaoConteudo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10, // ou use marginRight no ícone
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.19)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 99, // igual ao da imagem
    },
    vazioContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFDFD',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    modalBox: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    modalTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalTitulo2: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 20,
        textAlign: 'center',
    },
    modalBotoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    botaoCancelar: {
        flex: 1,
        backgroundColor: '#ccc',
        paddingVertical: 12,
        borderRadius: 999,
        alignItems: 'center',
    },
    botaoConfirmar: {
        flex: 1,
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        borderRadius: 999,
        alignItems: 'center',
    },
    txtCancelar: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    txtConfirmar: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalIconAlerta: {
        marginBottom: 12,
    },
    botaoConfirmar2: {
        backgroundColor: '#2565A3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
        alignItems: 'center',
        alignSelf: 'center',
    },

    txtConfirmar2: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },

});

export default PaginaDetalhePerfil;

