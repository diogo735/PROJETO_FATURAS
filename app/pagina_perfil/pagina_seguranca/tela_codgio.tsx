import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Entypo';
const { height, width } = Dimensions.get('window');
import IconPin from '../../../assets/icons/pagina_seguranca/pin.svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Keyboard, BackHandler } from 'react-native';

const TelaCodigo = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'TelaCodigo'>>();
    const modo = route.params?.modo ?? 'criar';
    const [cellCount, setCellCount] = useState(4);
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });
    const [isConfirming, setIsConfirming] = useState(false);
    const [firstCode, setFirstCode] = useState('');
    const [etapa, setEtapa] = useState<'verificarAtual' | 'novo' | 'confirmarNovo'>(
        modo === 'alterar' ? 'verificarAtual' : 'novo'
    );
    const [novoCodigo, setNovoCodigo] = useState('');
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);

    const animOpacity = useRef(new Animated.Value(0)).current;
    const animTranslateY = useRef(new Animated.Value(30)).current;


    useEffect(() => {
        if (mostrarModalConfirmacao) {
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
    }, [mostrarModalConfirmacao]);

    useEffect(() => {
        const onBackPress = () => {
            const houveAlteracao = value !== '' || firstCode !== '' || novoCodigo !== '';
            if (houveAlteracao) {
                setMostrarModalConfirmacao(true);
                return true;
            }
            return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };
    }, [value, firstCode, novoCodigo]);


    const [animacaoErro, setAnimacaoErro] = useState(false);
    const [animacaoSucesso, setAnimacaoSucesso] = useState(false);
    const shake = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: shake.value,
            },
        ],
    }));

    const handleClose = () => {
        const houveAlteracao = value !== '' || firstCode !== '' || novoCodigo !== '';
        if (houveAlteracao) {
            setMostrarModalConfirmacao(true);
        } else {
            navigation.goBack();
        }
    };


    const guardarCodigo = async (codigo: string) => {
        try {
            const agora = new Date();
            const dataFormatada = agora.toLocaleString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            const dados = {
                codigo,
                data_ultimo_acesso: dataFormatada,
            };

            await AsyncStorage.setItem('@codigo_app', JSON.stringify(dados));
            console.log('Código e data salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar o código:', error);
        }
    };

    useEffect(() => {
        if (value.length !== cellCount) return;

        const limpar = () => {
            setValue('');
            setFirstCode('');
            setNovoCodigo('');
            setIsConfirming(false);
            setAnimacaoErro(false);
        };

        const animarErro = () => {
            setAnimacaoErro(true);
            shake.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
            setTimeout(() => limpar(), 600);
        };

        const avancar = () => {
            // só fecha o teclado se já estiver na etapa final (confirmarNovo) e no modo "alterar"
            if (modo === 'alterar' && etapa === 'confirmarNovo') {
                Keyboard.dismiss();
            }
        };


        (async () => {
            if (modo === 'alterar') {
                if (etapa === 'verificarAtual') {
                    const codigoSalvo = await AsyncStorage.getItem('@codigo_app');
                    if (value === codigoSalvo) {
                        limpar();
                        setEtapa('novo');
                        avancar();
                    } else {
                        animarErro();
                    }
                } else if (etapa === 'novo') {
                    setNovoCodigo(value);
                    setValue('');
                    setEtapa('confirmarNovo');
                    avancar();
                } else if (etapa === 'confirmarNovo') {
                    if (value === novoCodigo) {
                        setAnimacaoSucesso(true);
                        Keyboard.dismiss();
                        setTimeout(async () => {
                            await guardarCodigo(value);
                            navigation.goBack();
                        }, 1000);
                    } else {
                        animarErro();
                        setEtapa('novo');
                    }
                }
            } else {
                // modo criar (sem código salvo)
                if (!isConfirming) {
                    setFirstCode(value);
                    setValue('');
                    setIsConfirming(true);
                } else {
                    if (value === firstCode) {
                        setAnimacaoSucesso(true);
                        Keyboard.dismiss();
                        setTimeout(() => {
                            guardarCodigo(value);
                            navigation.goBack();
                        }, 1000);
                    } else {
                        animarErro();
                    }
                }
            }
        })();
    }, [value]);




    const resetCodigo = (novoTipo: number) => {
        setCellCount(novoTipo);
        setValue('');
        setFirstCode('');
        setNovoCodigo('');
        setEtapa(modo === 'alterar' ? 'verificarAtual' : 'novo');
        setIsConfirming(false);
        setAnimacaoErro(false);
        setAnimacaoSucesso(false);
    };



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={handleClose}>
                        <Icon name="cross" size={24} color="#2565A3" />
                    </TouchableOpacity>

                </View>
            </View>
            <View style={styles.codeTypeContainer}>
                <View style={styles.codeTypeRow}>
                    <IconPin
                        width={20}
                        height={20}
                    />
                    <Text style={styles.codeTypeTitle}>Tipo de código</Text>

                </View>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.optionButton, cellCount === 4 && styles.optionSelected]}
                        onPress={() => resetCodigo(4)}
                    >
                        <Text style={[styles.optionText, cellCount === 4 && styles.optionTextSelected]}>4 Dígitos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionButton, cellCount === 6 && styles.optionSelected]}
                        onPress={() => resetCodigo(6)}
                    >
                        <Text style={[styles.optionText, cellCount === 6 && styles.optionTextSelected]}>6 Dígitos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >


                <Text style={styles.title}>
                    {modo === 'alterar'
                        ? etapa === 'verificarAtual'
                            ? 'Digite o código atual'
                            : etapa === 'novo'
                                ? 'Novo código'
                                : 'Confirmar novo código'
                        : isConfirming
                            ? 'Confirmar código'
                            : 'Defina o código'}
                </Text>



                <CodeField
                    value={value}
                    onChangeText={setValue}
                    cellCount={cellCount}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({ index, symbol, isFocused }) => {
                        const erro = animacaoErro;
                        const sucesso = animacaoSucesso;

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.cell,
                                    isFocused && styles.focusCell,
                                    erro && { borderColor: 'red', backgroundColor: '#ffdddd' },
                                    sucesso && { borderColor: 'green', backgroundColor: '#ddffdd' },
                                    animatedStyle,
                                ]}

                                onLayout={getCellOnLayoutHandler(index)}
                            >
                                <Text style={[
                                    styles.cellText,
                                    erro && { color: 'red' },
                                    sucesso && { color: 'green' },
                                ]}>
                                    {symbol || (isFocused ? <Cursor /> : null)}

                                </Text>

                            </Animated.View>

                        );
                    }}

                />

            </KeyboardAvoidingView>
            {mostrarModalConfirmacao && (
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.modalBox,
                            {
                                opacity: animOpacity,
                                transform: [{ translateY: animTranslateY }],
                            },
                        ]}
                    >
                        <Icon name="warning" size={50} color="#D8000C" style={styles.modalIconAlerta} />
                        <Text style={styles.modalTitulo}>Quer descartar as alterações?</Text>

                        <View style={styles.modalBotoes}>
                            <TouchableOpacity
                                onPress={() => setMostrarModalConfirmacao(false)}
                                style={styles.botaoCancelar}
                            >
                                <Text style={styles.txtCancelar}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setMostrarModalConfirmacao(false);
                                    navigation.goBack();
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
        backgroundColor: 'white',
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
    title: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '600',
        color: '#2565A3',
        marginBottom: 30,
    },
    codeFieldRoot: {
        marginTop: 20,
        justifyContent: 'center',
    },
    cell: {
        width: width * 0.1,
        height: width * 0.1,
        lineHeight: 50,
        fontSize: 24,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        textAlign: 'center',
        marginHorizontal: 8,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellText: {
        fontSize: 25,
        color: '#2565A3',
    },
    focusCell: {
        borderColor: '#2EB3B9',
    },
    content: {
        flex: 1,
        backgroundColor: '#FDFDFD',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: height * 0.17
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 8,
    },
    optionSelected: {
        backgroundColor: '#2565A3',
        borderColor: '#2565A3',
    },
    optionText: {
        color: '#2565A3',
        fontWeight: 'bold',
    },
    optionTextSelected: {
        color: 'white',
    },
    codeTypeContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 0,
    },
    codeTypeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2565A3',
        marginBottom: 10,
    },
    codeTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 10,
    },
    shakeAnimation: {
        transform: [
            { translateX: -5 },
            { translateX: 5 },
            { translateX: -5 },
            { translateX: 5 },
            { translateX: 0 },
        ],
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

});

export default TelaCodigo;
