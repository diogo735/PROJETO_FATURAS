// src/componentes/ModalFiltros.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageSourcePropType, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; // ou outro pacote de ícones
import { listarCategorias } from '../../../BASEDEDADOS/categorias';
import { Image } from 'react-native';
import IconTodas from '../../../assets/icons/todas_categorias.svg';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Animated, Easing } from 'react-native';
import { useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const faixas = ['Até 50€', '50€ – 100€', 'Mais de 100€'];

const { height, width } = Dimensions.get('window');
interface Props {
    visivel: boolean;
    aoFechar: () => void;
    filtrosSalvos: Filtros | null;
    setFiltrosSalvos: (f: Filtros | null) => void;
}

interface Categoria {
    id: number;
    nome_cat: string;
    cor_cat: string;
    img_cat: string;
    imagem: ImageSourcePropType;
}

interface Filtros {
    categoriasSelecionadas: number[];
    faixaSelecionada: string | null;
    montanteInicial: string;
    montanteFinal: string;
    tipoSelecionado: 'Receita' | 'Despesa' | null;
    ordenacaoSelecionada: 'data' | 'maior' | 'menor' | null;
}


function getImagemCategoria(img_cat: any): ImageSourcePropType {
    // Se já for um objeto (tipo require), retorna diretamente
    if (typeof img_cat === 'object' && img_cat !== null && img_cat.uri === undefined) {
        return img_cat;
    }

    if (!img_cat || typeof img_cat !== 'string') {
        return require('../../../assets/imagens/categorias/outros.png');
    }

    // Se for imagem do usuário ou remota
    if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
        return { uri: img_cat };
    }

    const imagensLocais: Record<string, ImageSourcePropType> = {
        'compras_pessoais.png': require('../../../assets/imagens/categorias/compras_pessoais.png'),
        'contas_e_servicos.png': require('../../../assets/imagens/categorias/contas_e_servicos.png'),
        'despesas_gerais.png': require('../../../assets/imagens/categorias/despesas_gerais.png'),
        'educacao.png': require('../../../assets/imagens/categorias/educacao.png'),
        'estimacao.png': require('../../../assets/imagens/categorias/estimacao.png'),
        'financas.png': require('../../../assets/imagens/categorias/financas.png'),
        'habitacao.png': require('../../../assets/imagens/categorias/habitacao.png'),
        'lazer.png': require('../../../assets/imagens/categorias/lazer.png'),
        'outros.png': require('../../../assets/imagens/categorias/outros.png'),
        'restauracao.png': require('../../../assets/imagens/categorias/restauracao.png'),
        'saude.png': require('../../../assets/imagens/categorias/saude.png'),
        'transportes.png': require('../../../assets/imagens/categorias/transportes.png'),
        'alugel.png': require('../../../assets/imagens/categorias/receitas/alugel.png'),
        'caixa-de-ferramentas.png': require('../../../assets/imagens/categorias/receitas/caixa-de-ferramentas.png'),
        'deposito.png': require('../../../assets/imagens/categorias/receitas/deposito.png'),
        'dinheiro.png': require('../../../assets/imagens/categorias/receitas/dinheiro.png'),
        'lucro.png': require('../../../assets/imagens/categorias/receitas/lucro.png'),
        'presente.png': require('../../../assets/imagens/categorias/receitas/presente.png'),
        'salario.png': require('../../../assets/imagens/categorias/receitas/salario.png'),
    };

    return imagensLocais[img_cat] || imagensLocais['outros.png'];
}


const ModalFiltros: React.FC<Props> = ({ visivel, aoFechar, filtrosSalvos, setFiltrosSalvos }) => {

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([0]);
    const [selecionado, setSelecionado] = useState<string | null>(null);
    const [montanteInicial, setMontanteInicial] = useState('');
    const [montanteFinal, setMontanteFinal] = useState('');
    const [focoInicial, setFocoInicial] = useState(false);
    const [focoFinal, setFocoFinal] = useState(false);
    const [tipoSelecionado, setTipoSelecionado] = useState<'Receita' | 'Despesa' | null>(null);
    const [ordenacaoSelecionada, setOrdenacaoSelecionada] = useState<'data' | 'maior' | 'menor' | null>(null);
    const [pronto, setPronto] = useState(false);


    const alternarCategoria = (id: number) => {
        if (id === 0) {
            if (categoriasSelecionadas.length === 1 && categoriasSelecionadas[0] === 0) {
                // "Todas" já está sozinha selecionada → desmarcar
                setCategoriasSelecionadas([]);
            } else {
                // Marca apenas "Todas"
                setCategoriasSelecionadas([0]);
            }
        } else {
            const atual = categoriasSelecionadas.filter(catId => catId !== 0);

            if (atual.includes(id)) {
                // Já estava selecionada → desmarca
                const novaLista = atual.filter(catId => catId !== id);
                setCategoriasSelecionadas(novaLista);
            } else {
                // Adiciona nova categoria e remove "Todas" se tiver
                setCategoriasSelecionadas([...atual, id]);
            }
        }
    };




    useEffect(() => {
        if (visivel) {
            setPronto(false);
            if (filtrosSalvos) {
                setCategoriasSelecionadas(filtrosSalvos.categoriasSelecionadas);
                setSelecionado(filtrosSalvos.faixaSelecionada);
                setMontanteInicial(filtrosSalvos.montanteInicial);
                setMontanteFinal(filtrosSalvos.montanteFinal);
                setTipoSelecionado(filtrosSalvos.tipoSelecionado);
                setOrdenacaoSelecionada(filtrosSalvos.ordenacaoSelecionada);
                //console.log("🟢 Modal aberto com filtros:", filtrosSalvos);
            } else {
                // Resetar se não houver filtros salvos
                setCategoriasSelecionadas([]);
                setSelecionado(null);
                setMontanteInicial('');
                setMontanteFinal('');
                setTipoSelecionado(null);
                setOrdenacaoSelecionada(null);
                setFocoInicial(false);
                setFocoFinal(false);
                labelAnim.setValue(0);
                labelFinalAnim.setValue(0);
                labelAnim.setValue(0);
                labelFinalAnim.setValue(0);
            }

            listarCategorias().then((lista) => {
                const comImagem = lista.map((cat: any) => {
                    const imagemSegura = getImagemCategoria(cat?.img_cat || 'outros.png');

                    return {
                        id: cat.id,
                        nome_cat: cat.nome_cat,
                        cor_cat: cat.cor_cat,
                        img_cat: cat.img_cat,
                        imagem: imagemSegura,
                    };
                });
                setCategorias([
                    {
                        id: 0,
                        nome_cat: 'Todas',
                        cor_cat: '#387DC0',
                        img_cat: '',
                        imagem: null,
                    },
                    ...comImagem,
                ]);


                setPronto(true);

            });
        } else {
            setPronto(false);
        }
    }, [visivel]);

    const labelAnim = useRef(new Animated.Value(0)).current;
    const labelFinalAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (focoInicial || montanteInicial) {
            Animated.timing(labelAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }).start();
        } else {
            Animated.timing(labelAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }).start();
        }
    }, [focoInicial, montanteInicial]);

    useEffect(() => {
        if (focoFinal || montanteFinal) {
            Animated.timing(labelFinalAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }).start();
        } else {
            Animated.timing(labelFinalAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }).start();
        }
    }, [focoFinal, montanteFinal]);

    const contarFiltrosAtivos = () => {
        let count = 0;

        if (categoriasSelecionadas.length > 0) count++;
        if (selecionado) count++;
        if (montanteInicial !== '' || montanteFinal !== '') count++;
        if (tipoSelecionado) count++;
        if (ordenacaoSelecionada) count++;

        return count;
    };


    return (
        <Modal
            isVisible={visivel && pronto}
            onBackdropPress={aoFechar}
            style={styles.modal}
            swipeDirection="down"
            onSwipeComplete={aoFechar}
            backdropOpacity={0.7}
            animationIn="bounceInUp"
            animationOut="bounceOutDown"
            animationInTiming={1000}
            animationOutTiming={1000}
        >

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <Text style={styles.titulo}>Filtrar por:</Text>
                    </View>

                    {/* CATEGORIAAS*/}
                    <Text style={styles.opcao}>Categoria</Text>

                    <View style={{ position: 'relative' }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingLeft: 15,
                                paddingRight: 15,
                                marginTop: 10,
                                marginBottom: 5,
                                alignItems: 'flex-start', // centraliza verticalmente
                                //backgroundColor: 'red', // para debug
                            }}
                        >
                            {categorias.map((cat) => (
                                <View key={cat.id} style={{ alignItems: 'center', marginRight: 12 }}>
                                    <TouchableOpacity
                                        style={[
                                            styles.categoriaItem,
                                            { backgroundColor: cat.cor_cat },
                                            categoriasSelecionadas.includes(cat.id)
                                            && {
                                                backgroundColor: cat.cor_cat,
                                                borderWidth: 5,
                                                padding: 8,
                                                borderColor: '#2565A3',
                                                shadowColor: cat.cor_cat,
                                                shadowOpacity: 0.3,
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowRadius: 4,
                                                elevation: 5,
                                            }
                                        ]}
                                        onPress={() => alternarCategoria(cat.id)}
                                    >
                                        {cat.id === 0 ? (
                                            <IconTodas width={40} height={40} />
                                        ) : (
                                            <Image
                                                source={cat.imagem}
                                                style={{ width: 40, height: 40 }}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </TouchableOpacity>

                                    <Text
                                        style={[
                                            styles.categoriaTexto,
                                            !categoriasSelecionadas.includes(cat.id) && { fontWeight: '500' } // regular
                                        ]}
                                    >
                                        {cat.nome_cat}
                                    </Text>

                                </View>

                            ))}
                        </ScrollView>
                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                top: -10,
                                right: 0,
                                width: 30,
                                height: '100%',
                                backgroundColor: 'rgba(255,255,255,0)', 
                                zIndex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <MaterialCommunityIcons name="chevron-right" size={30} color="#2565A3" />
                        </View>
                    </View>
                    {/* VALOR*/}
                    <Text style={styles.opcao}>Valor</Text>
                    <View style={styles.containerbotoeesvalor}>
                        {faixas.map((faixa) => {
                            const ativo = faixa === selecionado;
                            return (
                                <TouchableOpacity
                                    key={faixa}
                                    style={[styles.botao, ativo && styles.botaoSelecionado]}
                                    onPress={() => {
                                        setSelecionado(prev => prev === faixa ? null : faixa);
                                        setMontanteInicial('');
                                        setMontanteFinal('');
                                    }}


                                >
                                    <Text style={[styles.texto, ativo && styles.textoSelecionado]}>
                                        {faixa}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.valoresPersonalizadosContainer}>
                        <View style={styles.valorBox}>
                            <View style={{ position: 'relative', height: 55 }}>
                                <Animated.Text
                                    style={[
                                        styles.labelFlutuante,
                                        {
                                            top: labelAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [22, 0], // de centro → topo
                                            }),
                                            fontSize: labelAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [16, 13], // de grande → pequeno
                                            }),
                                        },
                                    ]}
                                >
                                    Montante inicial
                                </Animated.Text>

                                <TextInput
                                    style={styles.inputValor}
                                    value={montanteInicial}
                                    keyboardType="numeric"
                                    inputMode="numeric"
                                    onChangeText={(text) => {
                                        const apenasNumeros = text.replace(/[^0-9]/g, '');
                                        setMontanteInicial(apenasNumeros);
                                        if (apenasNumeros !== '') {
                                            setSelecionado(null); // desmarca faixa
                                        }
                                    }}
                                    onFocus={() => {
                                        setFocoInicial(true);
                                        setSelecionado(null);
                                    }}

                                    onBlur={() => setFocoInicial(false)}
                                />


                                <View
                                    style={[
                                        styles.linha,
                                        montanteInicial === '' && { height: 1, backgroundColor: '#6C8CA1' }
                                    ]}
                                />

                            </View>
                        </View>


                        <View style={styles.valorBox}>
                            <View style={{ position: 'relative', height: 55 }}>
                                <Animated.Text
                                    style={[
                                        styles.labelFlutuante,
                                        {
                                            top: labelFinalAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [22, 0], // flutua do centro para o topo
                                            }),
                                            fontSize: labelFinalAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [16, 13],
                                            }),
                                        },
                                    ]}
                                >
                                    Montante final
                                </Animated.Text>

                                <TextInput
                                    style={styles.inputValor}
                                    value={montanteFinal}
                                    keyboardType="numeric"
                                    inputMode="numeric"
                                    onChangeText={(text) => {
                                        const apenasNumeros = text.replace(/[^0-9]/g, '');
                                        setMontanteFinal(apenasNumeros);
                                        if (apenasNumeros !== '') {
                                            setSelecionado(null); // desmarca faixa
                                        }
                                    }}
                                    onFocus={() => {
                                        setFocoFinal(true);
                                        setSelecionado(null);
                                    }}

                                    onBlur={() => setFocoFinal(false)}
                                />


                                <View
                                    style={[
                                        styles.linha,
                                        montanteInicial === '' && { height: 1, backgroundColor: '#6C8CA1' }
                                    ]}
                                />
                            </View>
                        </View>




                    </View>

                    {/* Movimentos*/}
                    <Text style={styles.opcao}>Movimentos</Text>
                    <View style={styles.containerMovimentos}>
                        {/* Receita */}
                        <TouchableOpacity
                            style={[
                                styles.botaoMovimentos,
                                tipoSelecionado === 'Receita' ? styles.botaoSelecionadoMovimentos : styles.botaoNaoSelecionado,
                            ]}
                            onPress={() =>
                                setTipoSelecionado((prev) => (prev === 'Receita' ? null : 'Receita'))
                            }

                        >
                            <View style={[styles.iconeCirculo, { backgroundColor: '#2ECC71' }]}>
                                <MaterialCommunityIcons name="arrow-right" color="#fff" size={16} />
                            </View>
                            <Text
                                style={[
                                    styles.textoMovimentos,
                                    tipoSelecionado === 'Receita' ? styles.textoSelecionadoMovimentos : styles.textoNaoSelecionado,
                                ]}
                            >
                                Receita
                            </Text>
                        </TouchableOpacity>

                        {/* Despesas */}
                        <TouchableOpacity
                            style={[
                                styles.botaoMovimentos,
                                tipoSelecionado === 'Despesa' ? styles.botaoSelecionadoMovimentos : styles.botaoNaoSelecionado,
                            ]}
                            onPress={() =>
                                setTipoSelecionado((prev) => (prev === 'Despesa' ? null : 'Despesa'))
                            }

                        >
                            <View style={[styles.iconeCirculo, { backgroundColor: '#E74C3C' }]}>
                                <MaterialCommunityIcons name="arrow-left" color="#fff" size={16} />
                            </View>
                            <Text
                                style={[
                                    styles.textoMovimentos,
                                    tipoSelecionado === 'Despesa' ? styles.textoSelecionadoMovimentos : styles.textoNaoSelecionado,
                                ]}
                            >
                                Despesas
                            </Text>
                        </TouchableOpacity>
                    </View>



                    {/* ORDENAR POR */}
                    <Text style={styles.opcao}>Ordenar por</Text>
                    <View style={{ marginTop: 10, paddingLeft: 15 }}>
                        <TouchableOpacity
                            style={styles.opcaoOrdenar}
                            onPress={() =>
                                setOrdenacaoSelecionada((prev) => (prev === 'data' ? null : 'data'))
                            }

                        >
                            <MaterialCommunityIcons
                                name={ordenacaoSelecionada === 'data' ? 'radiobox-marked' : 'radiobox-blank'}
                                size={22}
                                color="#2C72B4"
                            />
                            <Text style={styles.textoOrdenar}>Por data (antigo &gt; recente)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.opcaoOrdenar}
                            onPress={() =>
                                setOrdenacaoSelecionada((prev) => (prev === 'maior' ? null : 'maior'))
                            }

                        >
                            <MaterialCommunityIcons
                                name={ordenacaoSelecionada === 'maior' ? 'radiobox-marked' : 'radiobox-blank'}
                                size={22}
                                color="#2C72B4"
                            />
                            <Text style={styles.textoOrdenar}>Por montante (maior &gt; menor)</Text>
                        </TouchableOpacity>
 
                        <TouchableOpacity
                            style={styles.opcaoOrdenar}
                            onPress={() =>
                                setOrdenacaoSelecionada((prev) => (prev === 'menor' ? null : 'menor'))
                            }

                        >
                            <MaterialCommunityIcons
                                name={ordenacaoSelecionada === 'menor' ? 'radiobox-marked' : 'radiobox-blank'}
                                size={22}
                                color="#2C72B4"
                            />
                            <Text style={styles.textoOrdenar}>Por montante (menor &gt; maior)</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.botoes}>
                        <TouchableOpacity
                            style={styles.botaoLimpar}
                            onPress={() => {

                                setFiltrosSalvos(null);
                                aoFechar();

                            }}
                        >
                            <Text style={styles.textoBotao}>Limpar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.botaoAplicar}
                            onPress={() => {
                                const filtros = {
                                    categoriasSelecionadas,
                                    faixaSelecionada: selecionado,
                                    montanteInicial,
                                    montanteFinal,
                                    tipoSelecionado,
                                    ordenacaoSelecionada,
                                };

                                //console.log("🔵 Filtros aplicados:", filtros);

                                setFiltrosSalvos(filtros);
                                aoFechar();
                            }}
                        >
                            <Text style={styles.textoBotao}>
                                Aplicar{contarFiltrosAtivos() > 0 ? `(${contarFiltrosAtivos()})` : ''}
                            </Text>

                        </TouchableOpacity>


                    </View>
                </View></TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 15,
        paddingBottom: 5,
    },
    header: {
        marginBottom: 5,
    },
    titulo: {
        fontSize: 23,
        color: '#164878',
        fontWeight: 'bold',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: 'black',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 0,
        opacity: 0.3,
    },
    opcao: {
        color: '#164878',
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 0,
    },
    botoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,

    },
    botaoLimpar: {
        backgroundColor: '#F54338',
        paddingVertical: 11,
        borderRadius: 12,
        width: width * 0.43
    },
    botaoAplicar: {
        backgroundColor: '#50AF4A',
        paddingVertical: 11,
        borderRadius: 12,
        width: width * 0.43
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    categoriaItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        width: 80,
        height: 80,
    },

    categoriaTexto: {
        marginTop: 4,
        fontSize: 13,
        color: '#2C72B4',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 100,
        paddingRight: 10,
    },
    containerbotoeesvalor: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
        marginBottom: 10,
        paddingLeft: 10,
        width: "100%"
    },
    botao: {
        borderWidth: 2,
        borderColor: '#2C72B4',
        borderRadius: 30,
        paddingVertical: 7,
        paddingHorizontal: 13,
        backgroundColor: 'white',
        marginHorizontal: 5,
    },
    botaoSelecionado: {
        backgroundColor: '#2C72B4',
    },
    texto: {
        color: '#2C72B4',
        fontWeight: 'bold',
        fontSize: 13.5,
    },
    textoSelecionado: {
        color: 'white',
    },
    valoresPersonalizadosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 25,
        marginBottom: 5,
    },

    valorBox: {
        flex: 1,
    },

    labelValor: {
        fontSize: 16,
        color: '#6C8CA1',
        marginBottom: 2,
        fontWeight: '600',
    },

    valorDigitado: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 4,
    },

    linha: {
        height: 2,
        backgroundColor: '#2C72B4',
        width: '100%',
    },
    labelFlutuante: {
        position: 'absolute',
        left: 0,
        color: '#6C8CA1',
        fontWeight: '600',
    },

    inputValor: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#164878',
        paddingTop: 24, // espaço para a label flutuante
        paddingBottom: 0,
    },
    containerMovimentos: {
        flexDirection: 'row',
        gap: 15,
        marginVertical: 10,
        paddingLeft: 15,
    },

    botaoMovimentos: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 30,
    },

    botaoSelecionadoMovimentos: {
        backgroundColor: '#2C72B4',
    },

    botaoNaoSelecionado: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#2C72B4',
    },

    textoMovimentos: {
        marginLeft: 8,
        fontWeight: 'bold',
        fontSize: 16,
    },

    textoSelecionadoMovimentos: {
        color: '#fff',
    },

    textoNaoSelecionado: {
        color: '#2C72B4',
    },

    iconeCirculo: {
        width: 22,
        height: 22,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    opcaoOrdenar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    textoOrdenar: {
        marginLeft: 8,
        fontSize: 16,
        color: '#2C72B4',
        fontWeight: '600',
    },


});

export default ModalFiltros;
