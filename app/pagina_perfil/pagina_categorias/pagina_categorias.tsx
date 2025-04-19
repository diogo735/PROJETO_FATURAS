import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import CategoriaCard from './componentes/categoria_card';
import IconeRotativo from '../../../assets/imagens/wallpaper.svg';
import { useEffect, useState, useRef } from 'react';
import { Animated, ScrollView } from 'react-native';
import { listarCategorias } from '../../../BASEDEDADOS/categorias';
import { Categoria, SubCategoria } from '../../../BASEDEDADOS/tipos_tabelas';
import { listarTiposMovimento } from '../../../BASEDEDADOS/tipo_movimento';
const { height, width } = Dimensions.get('window');
import { TipoMovimento } from '../../../BASEDEDADOS/tipos_tabelas';
import { listarSubCategorias } from '../../../BASEDEDADOS/sub_categorias';
import SubcategoriaLista from './componentes/lista_subcategorias';
import { Ionicons } from '@expo/vector-icons';
import SetaBaixo from '../../../assets/icons/pagina_categorias/setabranca.svg';
import { Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

const PaginaCategorias = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [tipoSelecionado, setTipoSelecionado] = React.useState<'Despesas' | 'Receitas'>('Despesas');
    const translateX = useRef(new Animated.Value(0)).current;
    const [categoriasDespesa, setCategoriasDespesa] = useState<Categoria[]>([]);
    const [categoriasReceita, setCategoriasReceita] = useState<Categoria[]>([]);
    const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
    const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<number>>(new Set());

    const [carregando, setCarregando] = useState(true);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const [setaAberta, setSetaAberta] = useState(false);
    const setaAnim = useRef(new Animated.Value(0)).current;


    const girarSeta = () => {
        const para = !setaAberta;
        setSetaAberta(para);

        Animated.timing(setaAnim, {
            toValue: para ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();

        const todasCategorias = [...categoriasDespesa, ...categoriasReceita];

        const novas = new Set<number>();

        if (para) {
            todasCategorias.forEach(cat => {
                const temSub = subcategorias.some(sc => sc.categoria_id === cat.id);
                if (temSub) novas.add(cat.id);
            });
        }

        setCategoriasExpandidas(novas);
    };


    const rotate = setaAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    useEffect(() => {
        if (carregando) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.linear,
                })
            ).start();
        }
    }, [carregando]);


    const carregar = async () => {
        setCarregando(true);

        const tipos = await listarTiposMovimento();

        const tipoReceita = tipos.find((t: TipoMovimento) => t.nome_movimento === 'Receita');
        const tipoDespesa = tipos.find((t: TipoMovimento) => t.nome_movimento === 'Despesa');

        if (!tipoReceita || !tipoDespesa) {
            console.error('❌ Tipos de movimento não encontrados!');
            return;
        }

        const lista: Categoria[] = await listarCategorias();
        setCategoriasDespesa(lista.filter(c => c.tipo_movimento_id === tipoDespesa.id));
        setCategoriasReceita(lista.filter(c => c.tipo_movimento_id === tipoReceita.id));

        const subcats: SubCategoria[] = await listarSubCategorias();
        setSubcategorias(subcats);

        setCarregando(false);
    };

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [])
    );


    const translateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const toValue = tipoSelecionado === 'Despesas' ? -width * 0.24 : width * 0.26;

        Animated.timing(translateAnim, {
            toValue,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [tipoSelecionado]);
    useEffect(() => {
        const toValue = tipoSelecionado === 'Despesas' ? 0 : 1;

        Animated.timing(translateX, {
            toValue,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [tipoSelecionado]);


    const corBotao = tipoSelecionado === 'Despesas' ? '#FF3B30' : '#34C759';


    const toggleExpandida = (id: number) => {
        setCategoriasExpandidas(prev => {
            const novoSet = new Set(prev);
            if (novoSet.has(id)) {
                novoSet.delete(id);
            } else {
                novoSet.add(id);
            }
            return novoSet;
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Minhas Categorias</Text>
                </View>

                <TouchableOpacity style={styles.botaoRedondo} onPress={girarSeta}>
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <SetaBaixo width={14} height={14} stroke="white" />
                    </Animated.View>
                </TouchableOpacity>

            </View>

            {/* Conteúdo futuro */}
            <View style={styles.conteudo}>
                <View style={styles.tabsContainer}>
                    <TouchableOpacity onPress={() => setTipoSelecionado('Despesas')} style={styles.tabButton}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[
                                styles.tabText,
                                tipoSelecionado === 'Despesas' && styles.tabTextAtivo
                            ]}>
                                Despesas
                            </Text>
                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setTipoSelecionado('Receitas')} style={styles.tabButton}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[
                                styles.tabText,
                                tipoSelecionado === 'Receitas' && styles.tabTextAtivoVerde
                            ]}>
                                Receitas
                            </Text>
                        </View>

                    </TouchableOpacity>
                    <Animated.View
                        style={[
                            styles.tabAtivoBase,
                            {
                                transform: [{ translateX: translateAnim }],
                                backgroundColor: tipoSelecionado === 'Despesas' ? '#FF3B30' : '#34C759',
                            },
                        ]}
                    />



                </View>
                {carregando ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: rotateAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg'],
                                    }),
                                }],
                                marginBottom: 20,
                            }}
                        >
                            <IconeRotativo width={50} height={50} fill="#2565A3" />
                        </Animated.View>
                        <Text style={{ color: '#2565A3', fontWeight: 'bold' }}>A carregar categorias...</Text>
                    </View>
                ) : (
                    <View style={{ width, flex: 1, overflow: 'hidden' }}>
                        <Animated.View style={{
                            flexDirection: 'row',
                            width: width * 2,
                            transform: [{
                                translateX: translateX.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -width],
                                }),
                            }],
                        }}>

                            {/* Despesas */}
                            <View style={{ width, flex: 1 }}>
                                <ScrollView style={{ flex: 1, paddingHorizontal: 15, paddingTop: 10, paddingBottom: height * 0.71 }} showsVerticalScrollIndicator={false}>
                                    {categoriasDespesa.map((cat) => {

                                        const subcatsDaCategoria = subcategorias.filter(sc => sc.categoria_id === cat.id);
                                        const isExpandida = categoriasExpandidas.has(cat.id);


                                        return (
                                            <View key={cat.id}>
                                                <CategoriaCard
                                                    categoria={cat}
                                                    mostrarCheck={false}
                                                    aoPressionar={() => {
                                                        if (subcatsDaCategoria.length > 0) {
                                                            toggleExpandida(cat.id);
                                                        }
                                                    }}

                                                    expandida={isExpandida}
                                                />

                                                <SubcategoriaLista
                                                    visivel={isExpandida}
                                                    subcategorias={subcatsDaCategoria}
                                                    tipoSelecionado={'Despesas'}
                                                    aoAtualizarCategorias={carregar}
                                                />
                                            </View>
                                        );
                                    })}
                                </ScrollView>

                                {/* Footer para Despesas */}
                                <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' }}>
                                    <TouchableOpacity
                                        style={[styles.botao, { backgroundColor: '#FF3B30' }]}
                                        onPress={() => navigation.navigate('CriarCategoria', { tipo: 'Despesas' })}

                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Ionicons name="add" size={22} color="#fff" />
                                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                                Criar Categoria
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Receitas */}
                            <View style={{ width, flex: 1 }}>
                                <ScrollView style={{ flex: 1, paddingHorizontal: 15, paddingTop: 10, paddingBottom: height * 0.71 }} showsVerticalScrollIndicator={false}>
                                    {categoriasReceita.map((cat) => {
                                        const subcatsDaCategoria = subcategorias.filter(sc => sc.categoria_id === cat.id);
                                        const isExpandida = categoriasExpandidas.has(cat.id);

                                        return (
                                            <View key={cat.id}>
                                                <CategoriaCard
                                                    categoria={cat}
                                                    mostrarCheck={false}
                                                    aoPressionar={() => {
                                                        if (subcatsDaCategoria.length > 0) {
                                                            toggleExpandida(cat.id);
                                                        }
                                                    }}
                                                    expandida={isExpandida}
                                                />

                                                <SubcategoriaLista
                                                    visivel={isExpandida}
                                                    subcategorias={subcatsDaCategoria}
                                                    tipoSelecionado={'Receitas'}
                                                    aoAtualizarCategorias={carregar}
                                                />
                                            </View>
                                        );
                                    })}
                                </ScrollView>

                                {/* Footer para Receitas */}
                                <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' }}>
                                    <TouchableOpacity
                                        style={[styles.botao, { backgroundColor: '#34C759' }]}
                                        onPress={() => navigation.navigate('CriarCategoria', { tipo: 'Receitas' })}

                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Ionicons name="add" size={22} color="#fff" />
                                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                                Criar Categoria
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>


                        </Animated.View>
                    </View>
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
        elevation: 0,
    },
    headerTitle: {
        color: 'white',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: 18 * 0.05,
        marginLeft: 15,
    },
    botaoRedondo: {
        backgroundColor: 'transparent',
        borderRadius: 30,
        padding: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    conteudo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        //backgroundColor: 'red',
        borderBottomWidth: 1,
        //position: 'relative',
        borderBottomColor: '#ddd',
        paddingTop: 15,
        gap: 0,
        width: "100%"

    },
    tabButton: {
        alignItems: 'center',
        paddingBottom: 0,
        flex: 1,
        //backgroundColor:'red'
    },
    tabText: {
        fontSize: scale(15),
        fontWeight: '600',
        color: '#B0B0B0',
        marginBottom: 15,

    },
    tabTextAtivo: {
        color: '#FF3B30',
        marginBottom: 15,

    },
    tabTextAtivoVerde: {
        color: '#34C759',
        marginBottom: 15,

    },
    tabAtivoBase: {
        position: 'absolute',
        bottom: 0,
        height: 4,
        width: 110,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    botao: {

        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    }



});

export default PaginaCategorias;
