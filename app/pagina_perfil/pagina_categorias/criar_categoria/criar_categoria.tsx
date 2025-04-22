import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import IconCategoriaPrincipal from '../../../../assets/icons/pagina_categorias/criar_categoria/icon_categorias.svg';
import ModalCores from './componentes/modal_cores';
import IconCheck from '../../../../assets/icons/pagina_categorias/criar_categoria/check.svg';
import ModalCategorias from './componentes/modal_categorias';
import { Categoria } from '../../../../BASEDEDADOS/tipos_tabelas';
import { listarCategoriasDespesa, listarCategoriasReceita } from '../../../../BASEDEDADOS/categorias';
const { height } = Dimensions.get('window');
import { Image, ImageSourcePropType } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Animated, Easing } from 'react-native';
import IconeRotativo from '../../../../assets/imagens/wallpaper.svg';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ModalAguardeCirarCategoria from './componentes/modia_sucesso_criar_categoria';



function getImagemCategoria(img_cat: any): ImageSourcePropType {
    // Se já for um objeto (tipo require), retorna diretamente
    if (typeof img_cat === 'object' && img_cat !== null && img_cat.uri === undefined) {
        return img_cat;
    }

    if (!img_cat || typeof img_cat !== 'string') {
        return require('../../../../assets/imagens/categorias/outros.png');
    }

    // Se for imagem do usuário ou remota
    if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
        return { uri: img_cat };
    }

    const imagensLocais: Record<string, ImageSourcePropType> = {
        'compras_pessoais.png': require('../../../../assets/imagens/categorias/compras_pessoais.png'),
        'contas_e_servicos.png': require('../../../../assets/imagens/categorias/contas_e_servicos.png'),
        'despesas_gerais.png': require('../../../../assets/imagens/categorias/despesas_gerais.png'),
        'educacao.png': require('../../../../assets/imagens/categorias/educacao.png'),
        'estimacao.png': require('../../../../assets/imagens/categorias/estimacao.png'),
        'financas.png': require('../../../../assets/imagens/categorias/financas.png'),
        'habitacao.png': require('../../../../assets/imagens/categorias/habitacao.png'),
        'lazer.png': require('../../../../assets/imagens/categorias/lazer.png'),
        'outros.png': require('../../../../assets/imagens/categorias/outros.png'),
        'restauracao.png': require('../../../../assets/imagens/categorias/restauracao.png'),
        'saude.png': require('../../../../assets/imagens/categorias/saude.png'),
        'transportes.png': require('../../../../assets/imagens/categorias/transportes.png'),
        'alugel.png': require('../../../../assets/imagens/categorias/receitas/alugel.png'),
        'caixa-de-ferramentas.png': require('../../../../assets/imagens/categorias/receitas/caixa-de-ferramentas.png'),
        'deposito.png': require('../../../../assets/imagens/categorias/receitas/deposito.png'),
        'dinheiro.png': require('../../../../assets/imagens/categorias/receitas/dinheiro.png'),
        'lucro.png': require('../../../../assets/imagens/categorias/receitas/lucro.png'),
        'presente.png': require('../../../../assets/imagens/categorias/receitas/presente.png'),
        'salario.png': require('../../../../assets/imagens/categorias/receitas/salario.png'),
    };

    return imagensLocais[img_cat] || imagensLocais['outros.png'];
}




const CriarCategoria: React.FC = () => {
    const navigation = useNavigation();

    const route = useRoute<RouteProp<RootStackParamList, 'CriarCategoria'>>();
    const { tipo, onCategoriaCriada } = route.params;

    const nomeSingular = tipo === 'Receitas' ? 'Receita' : 'Despesa';
    const [modalVisivel, setModalVisivel] = useState(false);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaInfo, setCategoriaInfo] = useState<Categoria | null>(null);

    const [modalCorVisivel, setModalCorVisivel] = useState(false);
    const [corSelecionada, setCorSelecionada] = useState('#D9D9D9');
    const [nomeCategoria, setNomeCategoria] = useState('');
    const labelAnim = useRef(new Animated.Value(nomeCategoria ? 1 : 0)).current;
    const [carregando, setCarregando] = useState(true);


    useEffect(() => {
        Animated.timing(labelAnim, {
            toValue: nomeCategoria.length > 0 ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
        }).start();
    }, [nomeCategoria]);

    useEffect(() => {
        const carregar = async () => {
            setCarregando(true);
            const lista = tipo === 'Despesas'
                ? await listarCategoriasDespesa()
                : await listarCategoriasReceita();
            setCategorias(lista);
            setCarregando(false);
        };

        carregar();
    }, []);

    const rotateAnim = useRef(new Animated.Value(0)).current;

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
        } else {
            rotateAnim.stopAnimation();
        }
    }, [carregando]);




    const iconesCategoria = [
        'car', 'plane', 'cutlery', 'user', 'money', 'home', 'bolt', 'shopping-cart',
        'bed', 'plus-square', 'coffee', 'book', 'heart', 'gift', 'bus', 'subway',
        'bicycle', 'medkit', 'hospital-o', 'building', 'bank', 'credit-card', 'camera',
        'envelope', 'briefcase', 'phone', 'truck', 'paw', 'shopping-bag', 'calendar',
        'suitcase', 'globe', 'desktop', 'laptop', 'mobile', 'television', 'archive',
        'cart-plus', 'check-square', 'child', 'leaf', 'lightbulb-o', 'lock', 'magic',
        'male', 'female', 'map-marker', 'paint-brush', 'pie-chart', 'road',
        'star', 'sun-o', 'tag', 'tags', 'ticket', 'tint', 'tree', 'wrench',
        'bell', 'music', 'film', 'hospital-o', 'bank', 'gift', 'heart',
        'camera', 'truck', 'phone', 'book', 'envelope', 'archive',
        'tag', 'leaf', 'star', 'cutlery', 'credit-card', 'shopping-cart', 'paw',
        'globe', 'suitcase',
    ];


    const [iconeSelecionado, setIconeSelecionado] = useState<string | null>(null);




    const podeCriar =
        nomeCategoria.trim().length > 0 &&
        corSelecionada !== '#D9D9D9' &&
        iconeSelecionado !== null &&
        categoriaInfo !== null;

    const [modalSairVisivel, setModalSairVisivel] = useState(false);

    const temAlteracoes = useCallback(() => {
        return (
            nomeCategoria.trim().length > 0 ||
            corSelecionada !== '#D9D9D9' ||
            iconeSelecionado !== null ||
            categoriaInfo !== null
        );
    }, [nomeCategoria, corSelecionada, iconeSelecionado, categoriaInfo]);
    const [modalCriarVisivel, setModalCriarVisivel] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (temAlteracoes()) {
                    setModalSairVisivel(true);
                    return true;
                }
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [temAlteracoes])
    );


    const animOpacity = useRef(new Animated.Value(0)).current;
    const animTranslateY = useRef(new Animated.Value(30)).current;
    const [mostrarModalAnimado, setMostrarModalAnimado] = useState(false);

    useEffect(() => {
        if (modalSairVisivel) {
            // 👉 Resetar os valores antes de montar
            animOpacity.setValue(0);
            animTranslateY.setValue(30);
            setMostrarModalAnimado(true);

            // 👉 Esperar um frame para garantir que o modal esteja montado
            requestAnimationFrame(() => {
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
                    })
                ]).start();
            });
        } else if (mostrarModalAnimado) {
          
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
                })
            ]).start(() => {
                setMostrarModalAnimado(false);
            });
        }
    }, [modalSairVisivel]);


    if (carregando) {
        return (
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
                <Text style={{ color: '#2565A3', fontWeight: 'bold' }}>
                    A carregar categorias...
                </Text>
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        if (temAlteracoes()) {
                            setModalSairVisivel(true);
                        } else {
                            navigation.goBack();
                        }
                    }}>

                        <Ionicons name="close" size={26} color="#164878" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Criar categoria de {nomeSingular}</Text>


                </View>


                <View style={styles.card}>

                    <View style={styles.inputRow}>
                        <View style={[styles.iconCircle, { backgroundColor: corSelecionada }]}>
                            {iconeSelecionado && (
                                <FontAwesome name={iconeSelecionado} size={30} color="#fff" />
                            )}
                        </View>


                        <View style={styles.inputWrapper}>
                            {nomeCategoria.length > 0 && (
                                <Animated.Text
                                    style={[
                                        styles.floatingLabel,
                                        {
                                            transform: [
                                                {
                                                    translateY: labelAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [18, 0], // sobe quando input não está vazio
                                                    }),
                                                },
                                            ],
                                            fontSize: labelAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [16, 12], // diminui fonte ao subir
                                            }),
                                            color: labelAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['#999', '#164878'], // muda cor se quiser
                                            }),
                                        },
                                    ]}
                                >
                                    Nome da Categoria
                                </Animated.Text>

                            )}

                            <TextInput
                                style={styles.nomeInput}
                                placeholder={nomeCategoria.length === 0 ? 'Nome da Categoria' : ''}
                                placeholderTextColor="#999"
                                value={nomeCategoria}
                                maxLength={20}
                                onChangeText={setNomeCategoria}
                                returnKeyType="done"
                                blurOnSubmit={true}
                                onSubmitEditing={Keyboard.dismiss}
                            />
                            <Text style={styles.contadorCaracteres}>
                                {nomeCategoria.length}/20
                            </Text>

                        </View>
                    </View>


                    <View style={styles.bottomRow}>
                        <View style={styles.labelWrapper}>
                            <IconCategoriaPrincipal width={16} height={16} />
                            <Text style={styles.label}>Categoria principal</Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.botaoCategoria,
                                { backgroundColor: categoriaInfo?.cor_cat || '#5DADE2' }
                            ]}
                            onPress={() => setModalVisivel(true)}
                        >
                            {categoriaInfo && (
                                <Image
                                    source={getImagemCategoria(categoriaInfo.img_cat)}
                                    style={{ width: 18, height: 18 }}
                                    resizeMode="contain"
                                />
                            )}

                            <Text style={styles.textoBotao}>
                                {categoriaInfo?.nome_cat || 'Selecionar Categoria'}
                            </Text>

                            <Ionicons name="chevron-down" size={16} color="#fff" />
                        </TouchableOpacity>


                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.tituloCard}>
                        <Image
                            source={require('../../../../assets/icons/pagina_categorias/criar_categoria/palette.png')}
                            style={styles.iconeTitulo}
                            resizeMode="contain"
                        />
                        <Text style={styles.tituloTexto}>Cor da categoria</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.botaoCorCategoria, { backgroundColor: corSelecionada }]}
                        activeOpacity={0.7}
                        onPress={() => setModalCorVisivel(true)}
                    >
                        <Ionicons name="chevron-down" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>


                <View style={styles.card}>
                    <View style={styles.tituloCard}>
                        <Image
                            source={require('../../../../assets/icons/pagina_categorias/criar_categoria/emoji.png')}
                            style={styles.iconeTitulo}
                            resizeMode="contain"
                        />
                        <Text style={styles.tituloTexto}>Ícone da categoria</Text>
                    </View>

                    <View style={styles.gridPlaceholder}>
                        <ScrollView contentContainerStyle={styles.iconeGrid}>
                            {iconesCategoria.map((nome, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.iconeItem,
                                        iconeSelecionado === nome && styles.iconeSelecionado,
                                    ]}
                                    onPress={() => setIconeSelecionado(nome)}
                                >
                                    <FontAwesome name={nome} size={18} color={iconeSelecionado === nome ? '#fff' : '#555'} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                </View>
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.botaoFinal,
                            { opacity: podeCriar ? 1 : 0.4 }
                        ]}
                        disabled={!podeCriar}
                        onPress={() => setModalCriarVisivel(true)}
                    >
                        <IconCheck width={16} color="#fff" />
                        <Text style={styles.textoBotaoFinal}>Criar categoria</Text>
                    </TouchableOpacity>

                </View>

                <ModalCategorias
                    visivel={modalVisivel}
                    tipo={tipo}
                    categoriaSelecionada={categoriaSelecionada}
                    aoFechar={() => setModalVisivel(false)}
                    aoSelecionarCategoria={(id) => {
                        setCategoriaSelecionada(id);
                        const categoria = id
                            ? categorias.find(cat => cat.id === id)
                            : null;

                        setCategoriaInfo(categoria || null);
                    }}
                />
                <ModalCores
                    visivel={modalCorVisivel}
                    corSelecionada={corSelecionada}
                    aoSelecionarCor={(cor) => setCorSelecionada(cor)}
                    aoFechar={() => setModalCorVisivel(false)}
                />
                {mostrarModalAnimado && (
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
                                <TouchableOpacity onPress={() => setModalSairVisivel(false)} style={styles.botaoCancelar}>
                                    <Text style={styles.txtCancelar}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
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
                                        })
                                    ]).start(() => {
                                        setMostrarModalAnimado(false);
                                        navigation.goBack(); 
                                    });
                                }} style={styles.botaoConfirmar}>
                                    <Text style={styles.txtConfirmar}>Sim</Text>
                                </TouchableOpacity>

                            </View>
                        </Animated.View>
                    </View>
                )}

                <ModalAguardeCirarCategoria
                    visivel={modalCriarVisivel}
                    cor={corSelecionada}
                    icone={iconeSelecionado || 'question'}
                    categoriaId={categoriaSelecionada}
                    nomeCategoria={nomeCategoria}
                    setVisivel={setModalCriarVisivel}
                    onCategoriaCriada={onCategoriaCriada}
                />

            </View>
        </TouchableWithoutFeedback >
    );
};

export default CriarCategoria;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    header: {
        backgroundColor: 'white',
        height: height * 0.09,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        elevation: 0,
    },
    contadorCaracteres: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
        marginRight: 4,
    },
    headerTitle: {
        color: '#2565A3',
        fontSize: scale(17),
        marginLeft: 10,
        fontWeight: 'bold',
        letterSpacing: 18 * 0.05,
    },
    card: {
        backgroundColor: '#F5F5F5',
        marginHorizontal: 15,
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 14,
        elevation: 0,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },

    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 99,
        backgroundColor: '#D9D9D9',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },


    inputWrapper: {
        flex: 1,
        justifyContent: 'center',
    },

    floatingLabel: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        marginBottom: 2,
    },

    nomeInput: {
        fontSize: 16,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#BABABA',
        paddingVertical: 4,
        paddingHorizontal: 2,
    },


    bottomRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 7,
    },

    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    label: {
        fontSize: 16,
        color: '#164878',
        fontWeight: 'bold',
    },

    botaoCategoria: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#5DADE2',
        marginHorizontal: 23,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 24,
        gap: 10,
    },

    textoBotao: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tituloCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    iconeTitulo: {
        width: 18,
        height: 18,
        marginRight: 6,
    },

    tituloTexto: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#164878',
    },

    botaoCorCategoria: {
        height: 42,
        borderRadius: 12,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginLeft: 20,
        marginRight: 15,
        paddingHorizontal: 12,
    },

    gridPlaceholder: {
        backgroundColor: '#F4F6F8',
        borderRadius: 12,
        height: height * 0.29, // altura fixa para o scroll funcionar
        paddingHorizontal: 12,
        paddingTop: 1,
    },
    footer: {
        marginTop: 5,
        paddingHorizontal: 15,
    },

    botaoFinal: {
        backgroundColor: '#2565A3',
        paddingVertical: 11,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        elevation: 2,
    },

    textoBotaoFinal: {

        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    iconeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
        paddingBottom: 2,
    },


    iconeItem: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    iconeSelecionado: {
        backgroundColor: '#2565A3',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
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

    modalBotoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 0,
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
