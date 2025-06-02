import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing
} from 'react-native';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Feather'; // Ícone do olho
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { resetar_pass_email, verificarConectividade } from '../../APIs/login';
import NetInfo from '@react-native-community/netinfo';
import ModalErro from './modal_erro';
import IconRotativo from '../../assets/imagens/wallpaper.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
const { width, height } = Dimensions.get('window');

const PaginaEsqueceuPass: React.FC = () => {
    const [email, setEmail] = useState('');

    type NavigationProp = StackNavigationProp<RootStackParamList, 'Pagina_Esqueceu_Pass'>;
    const navigation = useNavigation<NavigationProp>();
    const [tentouSubmeter, setTentouSubmeter] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [mostrarErro, setMostrarErro] = useState(false);
    const [tipoErro, setTipoErro] = useState<'wifi' | 'servidor'>('wifi');
    const [loading, setLoading] = useState(false);

    const dominioValido = (): boolean => {
        return email.endsWith('@gmail.com') || email.endsWith('@enovo.pt');
    };
    const continuar = async () => {
        Keyboard.dismiss();
        setTentouSubmeter(true);
        setLoading(true);

        if (!dominioValido()) {
            setLoading(false);
            return;
        }

        const status = await verificarConectividade();

        if (status !== 'ok') {
            setTipoErro(status);
            setMostrarErro(true);
            setLoading(false);
            return;
        }

        try {
            await resetar_pass_email(email);
            setMensagemErro('');
            navigation.navigate('Pagina_Verificar_Email', { email });
        } catch (error: any) {
            setMensagemErro(error.message);
        } finally {
            setLoading(false);
        }
    };


    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (loading) {
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
    }, [loading]);

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);




    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>


                    <TouchableOpacity style={styles.btnFechar} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={26} color="#000" />
                    </TouchableOpacity>



                    <View style={styles.logoArea}>
                        <Image
                            source={require('../../assets/ios_icon.png')}
                            style={styles.logoBox}
                            resizeMode="contain"
                        />
                        <Text style={styles.bemVindo}>Esqueceu a sua Palavra-Passe ?</Text>
                        <Text style={styles.subText}>Coloca o teu email para te ajudarmos a recuperá-lo!</Text>

                    </View>


                    <View style={styles.form}>

                        <View style={styles.inputComIcone}>
                            <Icon name="mail" size={20} color="#5385B4" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputInterno}
                                placeholder="Digita o teu email"
                                value={email}
                                onChangeText={setEmail}
                                placeholderTextColor="#7FA5CB"
                            />
                        </View>
                        {tentouSubmeter && !dominioValido() && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 10 }}>
                                <Ionicons name="warning-outline" size={18} color="#DC3545" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#DC3545' }}>
                                    O email deve terminar com @gmail.com ou @enovo.pt
                                </Text>
                            </View>
                        )}

                        {mensagemErro !== '' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 10 }}>
                                <Ionicons name="warning-outline" size={18} color="#DC3545" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#DC3545' }}>
                                    {mensagemErro}
                                </Text>
                            </View>
                        )}



                    </View>
                    <View style={styles.footer}>
                        <AnimatedTouchable
                            style={[
                                styles.btnEntrar,
                                {
                                    opacity: email.trim() !== '' && !loading ? 1 : 0.5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#2565A3',
                                },
                            ]}
                            onPress={continuar}
                            disabled={email.trim() === '' || loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
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
                            ) : (
                                <Text style={styles.btnEntrarText}>Continuar</Text>
                            )}
                        </AnimatedTouchable>




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
        bottom: height * 0.03,
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
    subText: {
        marginTop: '4%',
        fontSize: 14,
        color: '#2565A3',
        textAlign: 'center',
    },


});

export default PaginaEsqueceuPass;
