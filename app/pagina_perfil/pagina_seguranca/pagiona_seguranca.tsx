import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList, Modal } from 'react-native';
import { scale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Iconseta from '../../../assets/icons/pagina_seguranca/seta.svg';
import { Switch } from 'react-native';
import IconAlerta from '../../../assets/icons/pagina_seguranca/remover.svg';
import SwitchCustomizado from './switch_customizado';


const PaginaSeguranca = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [mostrarModalDesativar, setMostrarModalDesativar] = useState(false);
    const [contador, setContador] = useState(3);
    const [botaoAtivo, setBotaoAtivo] = useState(false);
    const animOpacity = useRef(new Animated.Value(0)).current;
    const animTranslateY = useRef(new Animated.Value(30)).current;
    useEffect(() => {
        if (mostrarModalDesativar) {
            animOpacity.setValue(0);
            animTranslateY.setValue(30);
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
        }
    }, [mostrarModalDesativar]);

    const [senhaAtivada, setSenhaAtivada] = useState(false);
    useFocusEffect(
        useCallback(() => {
            const verificarCodigoSalvo = async () => {
                const codigo = await AsyncStorage.getItem('@codigo_app');
                setSenhaAtivada(!!codigo); // true se houver código
            };

            verificarCodigoSalvo();
        }, [])
    );



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => {

                            navigation.goBack();

                        }}
                    >
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Segurança</Text>
                </View>
            </View>
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (!senhaAtivada) {
                            setSenhaAtivada(true);
                            navigation.navigate('TelaCodigo', { modo: 'criar' });
                        } else {
                            // código já ativo → pedir confirmação para desativar
                            setMostrarModalDesativar(true);
                            setBotaoAtivo(false);
                            setContador(3);
                            const intervalo = setInterval(() => {
                                setContador((prev) => {
                                    if (prev <= 1) {
                                        clearInterval(intervalo);
                                        setBotaoAtivo(true);
                                        return 0;
                                    }
                                    return prev - 1;
                                });
                            }, 1000);
                        }
                    }}

                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.cardTitle}>Código de Acesso</Text>
                        <SwitchCustomizado
                            value={senhaAtivada}
                            onValueChange={(value) => {
                                if (value) {
                                    setSenhaAtivada(true);
                                    navigation.navigate('TelaCodigo', { modo: 'criar' });
                                } else {
                                    setMostrarModalDesativar(true);
                                    setBotaoAtivo(false);
                                    setContador(3);
                                    const intervalo = setInterval(() => {
                                        setContador((prev) => {
                                            if (prev <= 1) {
                                                clearInterval(intervalo);
                                                setBotaoAtivo(true);
                                                return 0;
                                            }
                                            return prev - 1;
                                        });
                                    }, 1000);
                                }
                            }}
                        />

                    </View>
                    <Text style={styles.cardDescription}>
                        Cuidado, se esqueceres o código, não conseguirás entrar na aplicação
                    </Text>
                </TouchableOpacity>
                {senhaAtivada && (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => {
                            navigation.navigate('TelaCodigo', { modo: 'alterar' });
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.cardTitle}>Mudar código</Text>
                            <Iconseta width={15} height={15} style={{ transform: [{ rotate: '270deg' }] }} />
                        </View>
                    </TouchableOpacity>
                )}

            </View>

            {mostrarModalDesativar && (
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 999
                }}>
                    <Animated.View
                        style={{
                            backgroundColor: '#fff',
                            padding: 24,
                            borderRadius: 12,
                            width: '80%',
                            alignItems: 'center',
                            opacity: animOpacity,
                            transform: [{ translateY: animTranslateY }],
                        }}
                    >
                        <IconAlerta width={100} height={100} style={{ marginBottom: 20 }} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#2565A3' }}>
                            Deseja desativar o código de acesso?
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <TouchableOpacity
                                onPress={() => setMostrarModalDesativar(false)}
                                style={{
                                    backgroundColor: '#ccc', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!botaoAtivo}
                                onPress={async () => {
                                    await AsyncStorage.removeItem('@codigo_app');
                                    setSenhaAtivada(false);
                                    setMostrarModalDesativar(false);
                                }}
                                style={{
                                    backgroundColor: botaoAtivo ? '#FF3B30' : '#aaa',
                                    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                    {botaoAtivo ? 'Desativar' : `Desativar (${contador})`}
                                </Text>
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
    texto: {
        fontSize: 18,
        color: '#2565A3',
        fontWeight: 'bold',
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
        marginVertical: '5%',
        justifyContent: 'flex-start',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2565A3',
    },
    cardDescription: {
        fontSize: 13,
        color: '#4884BE',
        marginTop: 8,
    },

});

export default PaginaSeguranca;
