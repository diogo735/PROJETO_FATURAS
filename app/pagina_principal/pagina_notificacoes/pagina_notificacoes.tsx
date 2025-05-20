import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

import Icon from '../../../assets/imagens/wallpaper.svg';
const { height } = Dimensions.get('window');
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters';
import Notificacao from './1_notificacao';
import NoNotificationsSvg from '../../../assets/icons/pagina_notificacoa/sem_notificacao.svg';
import { Swipeable } from 'react-native-gesture-handler';
import { useRef } from 'react';
import { apagarTodasNotificacoes, deletarNotificacao, listarNotificacoes } from '../../../BASEDEDADOS/notificacoes';
import { Animated, Easing } from 'react-native';

interface NotificacaoItem {
    id: number;
    icon: string;
    texto: string;
    data: string;
}

const PaginaNotificacoes = () => {
    if (
        Platform.OS === 'android' &&
        UIManager.setLayoutAnimationEnabledExperimental
    ) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const [notificacoes, setNotificacoes] = React.useState<NotificacaoItem[]>([]);
    const [carregando, setCarregando] = React.useState(true);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (carregando) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [carregando]);

    useEffect(() => {

        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }).start();
        });
    }, [carregando, notificacoes.length]);

    const navigation = useNavigation();
    const [modalVisivel, setModalVisivel] = React.useState(false);
    const scrollOffsetY = React.useRef(0);

    useEffect(() => {
        const carregarNotificacoes = async () => {
            setCarregando(true);

            const inicio = Date.now();

            const lista = await listarNotificacoes();

            const tempoDecorrido = Date.now() - inicio;
            const tempoRestante = Math.max(0, 500 - tempoDecorrido); // garante pelo menos 1s

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setNotificacoes(lista);


            setTimeout(() => {
                setCarregando(false);
            }, tempoRestante);
        };

        carregarNotificacoes();
    }, []);

    const fadeAnim = useRef(new Animated.Value(1)).current;


    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
        }).start();
    }, [notificacoes, carregando]);




    const [mostrarConfirmacao, setMostrarConfirmacao] = React.useState(false);
    const swipeableRefs = useRef<Record<number, Swipeable | null>>({});

    const [idsEmRemocao, setIdsEmRemocao] = React.useState<number[]>([]);

    const handleDelete = async (id: number) => {
        const ref = swipeableRefs.current[id];
        setIdsEmRemocao((prev) => [...prev, id]); // esconde visualmente

        ref?.close();

        requestAnimationFrame(() => {
            requestAnimationFrame(async () => {
                await deletarNotificacao(id); // apagar do banco
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setNotificacoes((prev) => prev.filter((item) => item.id !== id));
                delete swipeableRefs.current[id];
                setIdsEmRemocao((prev) => prev.filter((itemId) => itemId !== id));
            });
        });
    };






    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={24} color="#2565A3" />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { marginLeft: '5%' }]}>Notificações</Text>

                    {notificacoes.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setMostrarConfirmacao(true)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ position: 'absolute', right: 16 }}
                        >
                            <MaterialIcons name="delete-sweep" size={25} color="#2565A3" />
                        </TouchableOpacity>
                    )}


                </View>
            </View>



            <View style={styles.main}>
                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    {carregando ? (
                        <View style={styles.vazioContainer}>
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
                                <Icon width={height * 0.08} height={height * 0.08} fill="#2565A3" />
                            </Animated.View>
                            <Text style={{ marginTop: 16, color: '#2565A3' }}>
                                A carregar notificações...
                            </Text>
                        </View>
                    ) : notificacoes.length === 0 ? (
                        <View style={styles.vazioContainer}>
                            <NoNotificationsSvg width={height * 0.25} height={height * 0.25} />
                            <Text style={styles.vazioTexto}>Sem notificações por enquanto</Text>
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
                            {notificacoes.map((n) =>
                                idsEmRemocao.includes(n.id) ? null : (
                                    <Swipeable
                                        key={n.id}
                                        ref={(ref) => {
                                            swipeableRefs.current[n.id] = ref;
                                        }}
                                        overshootRight={false}
                                        renderRightActions={() => (
                                            <View
                                                style={{
                                                    backgroundColor: '#FF3B30',
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    alignItems: 'flex-end',
                                                    paddingRight: '10%',
                                                    marginVertical: '2%',
                                                }}
                                            >
                                                <MaterialIcons name="delete" size={25} color="#fff" />
                                            </View>
                                        )}
                                        onSwipeableOpen={() => handleDelete(n.id)}
                                    >
                                        <Notificacao icon={n.icon} texto={n.texto} data={n.data} />
                                    </Swipeable>
                                )
                            )}
                        </ScrollView>
                    )}
                </Animated.View>
            </View>
            <Modal isVisible={mostrarConfirmacao}>
                <View style={modalStyles.modalContainer}>
                    <Text style={modalStyles.modalTitulo}>Eliminar notificações</Text>
                    <Text style={modalStyles.modalTexto}>Tens a certeza que queres apagar todas as notificações?</Text>

                    <View style={modalStyles.modalBotoes}>
                        <TouchableOpacity
                            style={modalStyles.botaoCancelar}
                            onPress={() => setMostrarConfirmacao(false)}
                        >
                            <Text style={{ color: '#2565A3' }}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyles.botaoConfirmar}
                            onPress={async () => {
                                await apagarTodasNotificacoes();
                                setNotificacoes([]);
                                setMostrarConfirmacao(false);
                            }}
                        >
                            <Text style={{ color: 'white' }}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



        </View>

    );



};

export default PaginaNotificacoes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 20,
    },
    header: {
        backgroundColor: 'white',
        height: height * 0.08,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
    },
    headerTitle: {
        color: '#2565A3',
        fontSize: scale(17),
        fontWeight: 'bold',
        marginLeft: scale(20),
    },
    main: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        width: '100%',
        alignItems: 'stretch',
        paddingBottom: 20,
    },
    vazioContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    vazioTexto: {
        marginTop: 20,
        fontSize: 16,
        color: '#AAAAAA',
        fontWeight: '500',
        textAlign: 'center',
    },
    swipeDelete: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 6,
        borderRadius: 8,
    },



});
const modalStyles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2565A3',
    },
    modalTexto: {
        fontSize: 14,
        color: '#6E7175',
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 20,
    },
    modalBotoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    botaoCancelar: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#2565A3',
    },
    botaoConfirmar: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        borderRadius: 99,
    },
});
