import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList, Modal, Easing, ActivityIndicator } from 'react-native';
import { scale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('window');
import IconSync from '../../../assets/icons/Sync_branco.svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App'; // a
import * as Application from 'expo-application';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LaravelIcon from '../../../assets/icons/laravel.svg';
import ReactlIcon from '../../../assets/icons/React.svg';

const PaginaTuturial = () => {


    type NotificacaoNavigationProp = StackNavigationProp<RootStackParamList, 'PaginaTuturial'>;
    const navigation = useNavigation<NotificacaoNavigationProp>();
    const slides = [
        {
            title: ' Regista um Movimento',
            description: '💸 Adiciona receitas e despesas de forma rápida.\n📅 Regista as datas para acompanhares o teu histórico.\n📊 Vê imediatamente o impacto nas tuas finanças.',
            image: require('../../../assets/imagens/pagina_tuturial/movimentos.png'),
        },
        {
            title: ' Gráfico geral',
            description: '🧠 Analisa os teus gastos com gráficos intuitivos.\n🔍 Descobre onde estás a gastar mais.\n💡 Toma decisões financeiras mais inteligentes.',
            image: require('../../../assets/imagens/pagina_tuturial/grafico.png'),
        },
        {
            title: ' Cria Categorias Pessoais',
            description: '🎨 Personaliza as tuas categorias como quiseres.\n📂 Organiza os teus gastos por temas relevantes (ex: Estudo, Lazer, Casa).\n🔔 Recebe alertas por categoria se quiseres.',
            image: require('../../../assets/imagens/pagina_tuturial/categorias.png'),
        },
        {
            title: ' Define metas',
            description: '📝 Estabelece metas mensais de poupança.\n📬 Recebe notificações quando estiveres perto de atingir (ou ultrapassar) o limite.\n🚀 Acompanha o teu progresso de forma motivadora.',
            image: require('../../../assets/imagens/pagina_tuturial/metas.png'),
        },
    ];


    const scrollX = useRef(new Animated.Value(0)).current;






    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#2565A3" />
                    </TouchableOpacity>


                </View>

            </View>


            <View style={{ flex: 1 }}>
                <Animated.FlatList
                    data={slides}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    renderItem={({ item }) => (
                        <View style={[styles.slide, { width }]}>
                            <Image source={item.image} style={styles.image} resizeMode="contain" />
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                    )}

                />
            </View>

            <View style={styles.dotsContainer}>
                {slides.map((_, index) => {
                    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

                    const dotColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#ccc', '#2565A3', '#ccc'],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[styles.dot, { backgroundColor: dotColor }]}
                        />
                    );
                })}
            </View>






        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    body: {
        flex: 1,
        justifyContent: 'center',   // centraliza verticalmente
        alignItems: 'center',       // centraliza horizontalmente
        paddingHorizontal: '5%',
        backgroundColor: '#FDFDFD',
    },

    image: {
        width: width * 0.8,       // aumenta a largura
        height: height * 0.4,     // aumenta a altura
        marginBottom: 30,
        alignSelf: 'center',
    },

    header: {
        backgroundColor: '#FDFDFD',
        height: height * 0.08,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
    },
    headerTitle: {
        color: '#2565A3',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: scale(0.9),
        marginLeft: 15,
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2565A3',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 22,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height * 0.05,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 6,
    },


});

export default PaginaTuturial;