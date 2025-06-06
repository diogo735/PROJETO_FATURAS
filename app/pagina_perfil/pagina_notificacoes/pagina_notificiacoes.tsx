import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList, Modal, Easing } from 'react-native';
import { scale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import NotificacaoVazia from '../../../assets/icons/pagina_notificacoes_minhas/sem_notificacoes.svg';
import Iconmais from '../../../assets/icons/pagina_notificacoes_minhas/icon_+.svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App'; // a

import { obterTodasNotificacoes, Notificacao } from '../../storage/notificacoes_personalizadas';
import CartaoNotificacao from './card_notificacao';

import Icon from '../../../assets/imagens/wallpaper.svg';

const PaginaNotificacoesMinhas = () => {


    type NotificacaoNavigationProp = StackNavigationProp<RootStackParamList, 'PaginaNotificacoesMinhas'>;
    const navigation = useNavigation<NotificacaoNavigationProp>();
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregar = async () => {
            setCarregando(true);
            const lista = await obterTodasNotificacoes();
            setNotificacoes(lista);
            setCarregando(false);
        };

        const unsubscribe = navigation.addListener('focus', carregar);
        return unsubscribe;
    }, [navigation]);

    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.linear,
            })
        ).start();
    }, []);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>As Minhas Notificações</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('CriarNotificacao')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Iconmais width={scale(15)} height={scale(15)} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, paddingHorizontal: '3%', paddingVertical: '5%' }}>
                {carregando ? (
                    <View style={styles.content}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Icon width={height * 0.08} height={height * 0.08} fill="#2565A3" />
                        </Animated.View>
                        <Text style={{ marginTop: 16, color: '#2565A3' }}>A carregar notificações...</Text>
                    </View>
                ) : notificacoes.length === 0 ? (
                    <View style={styles.content}>
                        <NotificacaoVazia width={height * 0.2} height={height * 0.2} />
                        <Text style={styles.textoNegrito}>Ainda não definiste notificações.</Text>
                        <Text style={styles.texto}>Crie uma no “+” lá em cima !</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notificacoes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditarNotificacao', { id: item.id })}
                            >
                                <CartaoNotificacao
                                    titulo={item.titulo}
                                    hora={item.hora}
                                    nota={item.nota}
                                />
                            </TouchableOpacity>
                        )}

                    />
                )}
            </View>
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
    },
    headerTitle: {
        color: 'white',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: scale(0.9),
        marginLeft: 15,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: '5%',
    },
    textoNegrito: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 20,
    },
    texto: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
});

export default PaginaNotificacoesMinhas;