import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Feather';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import IconRotativo from '../../assets/imagens/wallpaper.svg';

import { login } from '../../APIs/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inserirUser } from '../../BASEDEDADOS/user';
import { SharedObject } from 'expo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import ModalErro from './modal_erro';



const { width, height } = Dimensions.get('window');

const PaginaLoginEmail: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    type NavigationProp = StackNavigationProp<RootStackParamList, 'Pagina_Login_Email'>;
    const navigation = useNavigation<NavigationProp>();

    const isFormValid = email.trim() !== '' && senha.trim() !== '';
    const [estadoBotao, setEstadoBotao] = useState<'idle' | 'loading' | 'sucesso' | 'erro'>('idle');

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
    const [mostrarErro, setMostrarErro] = useState(false);
    const [tipoErro, setTipoErro] = useState<'wifi' | 'servidor'>('wifi');

    const API_BASE_URL = 'https://faturas-backend.onrender.com/api';


    const [mensagemErro, setMensagemErro] = useState('');

    const fazerLogin = async () => {
        Keyboard.dismiss();

        setEstadoBotao('loading');

        // Verifica conexão com a internet
        const net = await NetInfo.fetch();
        if (!net.isConnected) {
            setTipoErro('wifi');
            setMostrarErro(true);
            setEstadoBotao('idle');
            return;
        }

        // Verifica se o servidor está disponível
        try {
            const response = await fetch(`${API_BASE_URL}/ping`, { method: 'GET' });
            const data = await response.json();

            if (!response.ok || data.message !== 'online') throw new Error();
        } catch (e) {
            setTipoErro('servidor');
            setMostrarErro(true);
            setEstadoBotao('idle');
            return;
        }

        // Validação de email
        if (!email || !senha) {
            setMensagemErro('Preencha todos os campos!');
            setEstadoBotao('idle');
            return;
        }
        if (!email.endsWith('@enovo.pt') && !email.endsWith('@gmail.com')) {
            setMensagemErro('Apenas email @enovo.pt aceites!');
            setEstadoBotao('idle');
            return;
        }

        // Tenta fazer login
        try {
            const { token, user } = await login(email, senha);

            await inserirUser(
                user.id,
                user.nome,
                user.imagem,
                user.email,
                senha,
                token,
                user.primeiro_login ? 1 : 0
            );

            setMensagemErro('');
            setEstadoBotao('sucesso');

            setTimeout(() => {
                navigation.navigate('Splash');
            }, 800);
        } catch (error: any) {
            setMensagemErro(error.message || 'Erro ao conectar. Tente novamente.');
            setEstadoBotao('erro');

            setTimeout(() => {
                setEstadoBotao('idle');
            }, 2000);
        }
    };




    const corFixa =
        estadoBotao === 'sucesso'
            ? '#28A745'
            : estadoBotao === 'erro'
                ? '#DC3545'
                : '#2565A3';



    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (estadoBotao === 'loading') {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotateAnim.stopAnimation();
            rotateAnim.setValue(0);
        }
    }, [estadoBotao]);


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>


                    <TouchableOpacity style={styles.btnFechar} onPress={() => navigation.goBack()}>
                        <Icon name="x" size={26} color="#000" />
                    </TouchableOpacity>



                    <View style={styles.logoArea}>
                        <Image
                            source={require('../../assets/ios_icon.png')}
                            style={styles.logoBox}
                            resizeMode="contain"
                        />
                        <Text style={styles.bemVindo}>Bem-vindo de volta!</Text>
                    </View>


                    <View style={styles.form}>

                        <View style={styles.inputComIcone}>
                            <Icon name="mail" size={20} color="#5385B4" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputInterno}
                                placeholder="Digita o teu email"
                                value={email}
                                onChangeText={(texto) => {
                                    setEmail(texto);
                                    setMensagemErro(''); // limpa erro ao digitar
                                }}
                                placeholderTextColor="#7FA5CB"
                            />
                        </View>



                        <View style={styles.inputSenhaContainer}>
                            <Icon name="lock" size={20} color="#5385B4" style={{ marginRight: 10 }} />

                            <TextInput
                                style={styles.inputSenha}
                                placeholder="Digita a tua palavra-passe"
                                secureTextEntry={!mostrarSenha}
                                value={senha}

                                onChangeText={(texto) => {
                                    setSenha(texto);
                                    setMensagemErro(''); // limpa erro ao digitar
                                }}
                                placeholderTextColor="#7FA5CB"
                            />

                            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                                <Icon name={mostrarSenha ? 'eye' : 'eye-off'} size={20} color="#5385B4" />
                            </TouchableOpacity>
                        </View>
                        {mensagemErro !== '' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 10 }}>
                                <Ionicons name="warning-outline" size={18} color="#DC3545" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#DC3545', fontSize: 14 }}>
                                    {mensagemErro}
                                </Text>
                            </View>
                        )}





                    </View>
                    <View style={styles.footer}>
                        <AnimatedTouchable
                            disabled={!isFormValid || estadoBotao === 'loading'}
                            onPress={fazerLogin}
                            activeOpacity={0.8}
                            style={[
                                styles.btnEntrar,
                                {
                                    backgroundColor: corFixa,
                                    opacity: isFormValid ? 1 : 0.5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                },
                            ]}
                        >

                            {estadoBotao === 'loading' ? (
                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                rotate: rotateAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', '360deg'],
                                                }),
                                            },
                                        ],
                                    }}
                                >
                                    <IconRotativo width={20} height={20} fill="#fff" />
                                </Animated.View>
                            ) : estadoBotao === 'sucesso' ? (
                                <Icon name="check" size={20} color="#fff" />
                            ) : estadoBotao === 'erro' ? (
                                <Icon name="x" size={20} color="#fff" />
                            ) : (
                                <Text style={styles.btnEntrarText}>Entrar</Text>
                            )}
                        </AnimatedTouchable>






                        <TouchableOpacity onPress={() => navigation.navigate('Pagina_Esqueceu_Pass')}>
                            <Text style={styles.linkSenha}>Esqueci a palavra-passe</Text>
                        </TouchableOpacity>

                    </View>
                </View></TouchableWithoutFeedback>
            <ModalErro
                visivel={mostrarErro}
                tipoErro={tipoErro}
                aoFechar={() => setMostrarErro(false)}
            />

        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFF2FF',
        paddingTop: height * 0.022,
        paddingHorizontal: '5%',
    },
    btnFechar: {
        position: 'absolute',
        top: height * 0.02,
        left: '6%',
        zIndex: 2,
    },
    btnFecharText: {
        fontSize: 30,
        color: '#000',
    },
    logoArea: {
        alignItems: 'center',
        marginTop: height * 0.07,
        marginBottom: height * 0.04,
    },
    logoBox: {
        width: height * 0.1,
        height: height * 0.1,
        borderRadius: 12,
        marginBottom: 15,
    },
    bemVindo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2565A3',
    },
    form: {
        width: '100%',
    },
    label: {
        marginBottom: 10,
        color: '#6B6868',
        fontWeight: 'bold',

    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 30,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#DADADA',
    },

    inputSenhaContainer: {
        backgroundColor: '#fff',
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: 'space-between',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DADADA',
    },

    inputSenha: {
        flex: 1,

    },
    btnEntrar: {
        backgroundColor: '#2565A3',
        borderRadius: 50,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    btnEntrarText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkSenha: {
        marginTop: '3%',
        color: '#2565A3',
        textAlign: 'center',
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: height * 0.04,
        left: '8%',
        right: '8%',
    },
    inputComIcone: {
        backgroundColor: '#fff',
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DADADA',
    },

    inputInterno: {
        flex: 1,
        fontSize: 15,
        color: '#000',
    },

});

export default PaginaLoginEmail;
