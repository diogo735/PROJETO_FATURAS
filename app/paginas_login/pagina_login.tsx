import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Text, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../assets/imagens/icon_app_porco.svg';
const { width, height } = Dimensions.get('window');
import { useFonts, Andika_700Bold } from '@expo-google-fonts/andika';
import Constants from 'expo-constants';
import IconEmail from '../../assets/icons/pagina_login/mail.svg';
import IconLogin from '../../assets/icons/pagina_login/sem_login.svg'
import { Afacad_500Medium } from '@expo-google-fonts/afacad';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Image } from 'react-native';
import { criarUsuarioAnonimo } from '../../BASEDEDADOS/user';







const Pagina_Login = () => {

    const [mostrarModalAviso, setMostrarModalAviso] = useState(false);
    type NavigationProp = StackNavigationProp<RootStackParamList, 'Pagina_Login'>;
    const navigation = useNavigation<NavigationProp>();

    const [fontsLoaded] = useFonts({
        Andika_700Bold,
        Afacad_500Medium,
    });
    const [contador, setContador] = useState(3);
    const [botaoAtivo, setBotaoAtivo] = useState(false);

    useEffect(() => {
        if (mostrarModalAviso) {
            setBotaoAtivo(false);
            setContador(3);
            const intervalo = setInterval(() => {
                setContador((prev) => {
                    if (prev === 1) {
                        clearInterval(intervalo);
                        setBotaoAtivo(true);
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(intervalo);
        }
    }, [mostrarModalAviso]);

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <LinearGradient
                colors={['#022B4C', '#2985DE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.logoContainer}>
                <Logo width={width * 0.35} height={height * 0.15} />
                <Text style={[styles.welcomeText, !fontsLoaded && { fontFamily: 'System' }]}>
                    Bem vindo de volta !
                </Text>
            </View>

            <View style={styles.bottomContainer}>
                <Text style={[styles.loginPrompt, !fontsLoaded && { fontFamily: 'System' }]}>
                    Iniciar sessão para continuar
                </Text>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Pagina_Login_Email')}
                >
                    <View style={styles.iconTextRow}>
                        <IconEmail width={20} height={20} style={{ marginRight: '10%' }} />
                        <Text style={styles.loginButtonText}>Continuar com e-mail</Text>
                    </View>
                </TouchableOpacity>



                <Text style={[styles.orText, !fontsLoaded && { fontFamily: 'System' }]}>ou</Text>

                <TouchableOpacity style={styles.noLoginButton} onPress={() => setMostrarModalAviso(true)}>
                    <View style={styles.iconTextRow}>
                        <IconLogin width={20} height={20} style={{ marginRight: '10%' }} />
                        <Text style={styles.noLoginButtonText}>Continuar sem login</Text>
                    </View>
                </TouchableOpacity>



            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Text style={styles.versionText}>v{Constants.expoConfig?.version}</Text>
            </View>
            <Modal
                transparent
                animationType="fade"
                visible={mostrarModalAviso}
                onRequestClose={() => setMostrarModalAviso(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 20,
                        width: '85%',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 5
                    }}>
                        <Image
                            source={require('../../assets/imagens/anonimo.png')}
                            style={{ width: 80, height: 80, marginBottom: 16 }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2565A3', marginBottom: '10%' }}>Cuidado!</Text>
                        <Text style={{ color: '#3F7FBC', fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: '6%' }}>
                            Tu podes usar a app sem fazer login, mas corres o risco de não conseguir recuperar os teus dados futuramente.
                        </Text>
                        <Text style={{ color: '#3F7FBC', fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: '10%' }}>
                            Quando quiseres fazer login, não poderás recuperar os registros que criaste.
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    backgroundColor: '#eee',
                                    borderRadius: 99,
                                    alignItems: 'center',
                                }}
                                onPress={() => setMostrarModalAviso(false)}
                            >
                                <Text style={{ color: '#666', fontWeight: '600' }}>Fechar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    backgroundColor: botaoAtivo ? '#2565A3' : '#ccc',
                                    borderRadius: 99,
                                    alignItems: 'center',
                                }}
                                onPress={async () => {
                                    if (!botaoAtivo) return;
                                    setMostrarModalAviso(false);
                                    await criarUsuarioAnonimo();
                                    navigation.navigate('Splash');
                                }}

                                disabled={!botaoAtivo}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>
                                    {botaoAtivo ? 'Vou arriscar !' : `Aguarde ${contador}s`}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer: {
        marginTop: height * 0.25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
        fontFamily: 'Andika_700Bold',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#EFF2FF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingVertical: '10%',
        paddingHorizontal: '10%',
        flexDirection: 'column',

        height: height * 0.47,
        alignItems: 'center',
    },
    loginPrompt: {
        color: '#999',
        marginBottom: '10%',
        fontSize: 14,
        fontFamily: 'Afacad_500Medium',
    },
    loginButton: {
        backgroundColor: '#346EAA',
        paddingVertical: '5%',
        paddingHorizontal: '10%',
        borderRadius: 99,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    orText: {
        color: '#999',
        marginVertical: '10%',
        fontSize: 14,
    },
    noLoginButton: {
        borderColor: '#346EAA',
        borderWidth: 1,
        paddingVertical: '5%',
        paddingHorizontal: '10%',
        borderRadius: 99
    },
    noLoginButtonText: {
        color: '#346EAA',
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        fontSize: 12,
        color: '#ccc',
        marginBottom: 10,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

});

export default Pagina_Login;
