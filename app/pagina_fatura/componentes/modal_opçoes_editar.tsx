// ModalEditarFatura.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ImageSourcePropType } from 'react-native';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { listarCategoriasComTipo } from '../../../BASEDEDADOS/categorias';
import { Image } from 'react-native';
import { ScrollView } from 'react-native';
import { Animated, Easing } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface CategoriaSelecionada {
    id: number;
    nome_cat: string;
    cor_cat: string;
    img_cat: string;
}

interface Props {
    visivel: boolean;
    aoFechar: () => void;
    onGuardar: (novaDescricao: string, idFatura: number, novaCategoriaId: number) => void;
    idFatura: number;
    descricaoInicial?: string | null;
    categoriaInicial?: CategoriaSelecionada | null;
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
const ModalEditarFatura: React.FC<Props> = ({
    visivel,
    aoFechar,
    onGuardar,
    idFatura,
    descricaoInicial,
    categoriaInicial
}) => {

    const [descricao, setDescricao] = useState('');
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<{
        id: number;
        nome_cat: string;
        cor_cat: string;
        img_cat: string;
    } | null>(null);

    const [despesas, setDespesas] = useState<any[]>([]);
    const [receitas, setReceitas] = useState<any[]>([]);
    const alturaAnimada = useState(new Animated.Value(0))[0];
    const [alturaVisivel, setAlturaVisivel] = useState(false);


    useEffect(() => {
        const carregar = async () => {
            const lista: { tipo_nome: string }[] = await listarCategoriasComTipo();
            if (lista) {
                setDespesas(lista.filter(c => c.tipo_nome === 'Despesa'));
                setReceitas(lista.filter(c => c.tipo_nome === 'Receita'));
            }
        };
        if (visivel) carregar();
    }, [visivel]);

    useEffect(() => {
        if (visivel) {
            console.log('📝 descrição recebida no modal:', descricaoInicial);
            if (descricaoInicial !== undefined) {
                setDescricao(descricaoInicial || '');
            }

            if (categoriaInicial !== undefined) {
                setCategoriaSelecionada(categoriaInicial);
            }
        }
    }, [visivel, descricaoInicial, categoriaInicial]);

    const guardarAtivo = () => {
        const descricaoMudou = descricao.trim() !== (descricaoInicial?.trim() || '');
        const categoriaMudou = categoriaSelecionada?.id !== categoriaInicial?.id;

        return descricaoMudou || categoriaMudou;
    };


    return (

        <Modal isVisible={visivel} backdropOpacity={0.4} useNativeDriver>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <MaterialIcons name="edit" size={20} color="white" />
                        <Text style={styles.titulo}>Editar</Text>
                    </View>

                    {/* Campo: Tipo de Despesa */}
                    <Text style={styles.label}>Tipo de Fatura</Text>
                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity
                            style={[
                                styles.categoriaButton,
                                { backgroundColor: categoriaSelecionada?.cor_cat || '#27AE60' }
                            ]}
                            onPress={() => {
                                Keyboard.dismiss();
                                const abrir = !mostrarDropdown;
                                setMostrarDropdown(abrir);
                                setAlturaVisivel(abrir);

                                Animated.timing(alturaAnimada, {
                                    toValue: abrir ? 1 : 0,
                                    duration: 300,
                                    easing: Easing.out(Easing.ease),
                                    useNativeDriver: false,
                                }).start();
                            }}

                        >
                            {categoriaSelecionada ? (
                                <>
                                    <Image
                                        source={getImagemCategoria(categoriaSelecionada.img_cat)}
                                        style={{ width: 20, height: 20 }}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.textoCategoria}>
                                        {categoriaSelecionada.nome_cat}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <MaterialIcons name="category" size={20} color="white" />
                                    <Text style={styles.textoCategoria}>Selecionar categoria</Text>
                                </>
                            )}

                            <MaterialIcons
                                name={mostrarDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={20}
                                color="white"
                                style={{ marginLeft: 'auto' }}
                            />
                        </TouchableOpacity>


                        <Animated.View
                            style={[
                                styles.dropdownFlutuante,
                                {
                                    height: alturaAnimada.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 280],
                                    }),
                                    opacity: alturaAnimada,
                                    overflow: 'hidden',
                                }
                            ]}
                        >
                            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.grupoTitulo, { color: 'tomato' }]}>Despesas</Text>
                                {despesas.map((cat) => (
                                    <TouchableOpacity
                                        key={`d-${cat.id}`}
                                        style={styles.card}
                                        onPress={() => {
                                            setCategoriaSelecionada(cat);
                                            Animated.timing(alturaAnimada, {
                                                toValue: 0,
                                                duration: 300,
                                                easing: Easing.out(Easing.ease),
                                                useNativeDriver: false,
                                            }).start(() => {
                                                setMostrarDropdown(false);
                                            });
                                        }}

                                    >
                                        <View style={[styles.iconeWrapper, { backgroundColor: cat.cor_cat }]}>
                                            <Image source={getImagemCategoria(cat.img_cat)} style={styles.icone} resizeMode="contain" />
                                        </View>
                                        <Text style={styles.nomeCategoria}>{cat.nome_cat}</Text>
                                        {categoriaSelecionada?.id === cat.id ? (
                                            <View style={styles.radioSelecionado}>
                                                <MaterialIcons name="check" size={15} color="#fff" />
                                            </View>
                                        ) : (
                                            <View style={styles.radio} />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                <Text style={[styles.grupoTitulo, { marginTop: 10, color: 'green' }]}>Receitas</Text>
                                {receitas.map((cat) => (
                                    <TouchableOpacity
                                        key={`r-${cat.id}`}
                                        style={styles.card}
                                        onPress={() => {
                                            setCategoriaSelecionada(cat);
                                            Animated.timing(alturaAnimada, {
                                                toValue: 0,
                                                duration: 300,
                                                easing: Easing.out(Easing.ease),
                                                useNativeDriver: false,
                                            }).start(() => {
                                                setMostrarDropdown(false);
                                            });
                                        }}


                                    >
                                        <View style={[styles.iconeWrapper, { backgroundColor: cat.cor_cat }]}>
                                            <Image source={getImagemCategoria(cat.img_cat)} style={styles.icone} resizeMode="contain" />
                                        </View>
                                        <Text style={styles.nomeCategoria}>{cat.nome_cat}</Text>
                                        {categoriaSelecionada?.id === cat.id ? (
                                            <View style={styles.radioSelecionado}>
                                                <MaterialIcons name="check" size={15} color="#fff" />
                                            </View>
                                        ) : (
                                            <View style={styles.radio} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                        </Animated.View>

                    </View>




                    {/* Campo: Descrição */}
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={styles.inputDescricao}
                        placeholder="Sem descrição"
                        value={descricao}
                        onChangeText={setDescricao}
                        multiline={true}
                        numberOfLines={3}
                        maxLength={80}
                        blurOnSubmit={true}
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    <Text style={{ alignSelf: 'flex-end', color: '#A0AEB9', marginTop: 4 }}>
                        {descricao.length}/80
                    </Text>




                    {/* Botões */}
                    <View style={styles.botoes}>
                        <TouchableOpacity
                            style={[styles.cancelar, {
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }]}
                            onPress={aoFechar}
                        >
                            <Ionicons name="close" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={[styles.guardar, {
                                opacity: guardarAtivo() ? 1 : 0.8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }]}
                            onPress={() => {
                                if (categoriaSelecionada) {
                                    onGuardar(descricao, idFatura, categoriaSelecionada.id);
                                }
                            }}
                            disabled={!guardarAtivo()}
                        >
                            <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>




                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        overflow: 'visible'
    },
    header: {
        backgroundColor: '#2565A3',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: -20,
        marginHorizontal: -20,
    },
    titulo: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
    },
    label: {
        marginTop: 18,
        fontWeight: 'bold',
        color: '#2565A3',
    },
    categoriaButton: {
        marginTop: 8,
        backgroundColor: '#27AE60',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    textoCategoria: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
        marginRight: 5,
    },
    inputDescricao: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        padding: 12,
        minHeight: 90,
        textAlignVertical: 'top',
    },
    botoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelar: {
        backgroundColor: '#F54338',
        borderRadius: 99,
        paddingVertical: 12,
        paddingHorizontal: 25,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    guardar: {
        backgroundColor: '#50AF4A',
        borderRadius: 99,
        paddingVertical: 12,
        paddingHorizontal: 25,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    textoBotao: {
        color: 'white',
        fontWeight: 'bold',
    },
    dropdown: {
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 6,
        maxHeight: 250,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 8,
        elevation: 1,
    },

    iconeWrapper: {
        width: 40,
        height: 40,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    icone: {
        width: 20,
        height: 20,
    },

    nomeCategoria: {
        flex: 1,
        fontSize: 15,
        color: '#164878',
        fontWeight: '600',
    },

    radio: {
        width: 20,
        height: 20,
        borderRadius: 99,
        borderWidth: 2,
        borderColor: '#607D8B',
    },

    radioSelecionado: {
        width: 20,
        height: 20,
        borderRadius: 99,
        backgroundColor: '#164878',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownFlutuante: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 6,
        elevation: 5,
        zIndex: 100,
    },
    grupoTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 6,
        marginTop: 4,
        paddingLeft: 4,
    },



});

export default ModalEditarFatura;
