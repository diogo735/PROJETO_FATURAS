import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Switch, ImageSourcePropType } from 'react-native';
import { scale } from 'react-native-size-matters';
const { height, width } = Dimensions.get('window');
import Ionicons from 'react-native-vector-icons/Ionicons';
import { buscarCategoriaPorId } from '../../BASEDEDADOS/categorias';
import Catgoriaicon from '../../assets/icons/pagina_criar_meta/categorias.svg';
import Valoricon from '../../assets/icons/pagina_criar_meta/valor.svg';
import Dataicon from '../../assets/icons/pagina_criar_meta/data.svg';
import Repetiricon from '../../assets/icons/pagina_criar_meta/repetir.svg';
import SwitchCustomizado from './criar_meta/componentes/switch_customizado';
import AlertaCard from './criar_meta/componentes/alerta_card';
import { ScrollView } from 'react-native';
import ModalCategorias from './criar_meta/modal_categorias';
import { Categoria } from '../../BASEDEDADOS/tipos_tabelas';
import { Image } from 'react-native';
import ModalData from './criar_meta/modal_data';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { atualizarMeta } from '../../BASEDEDADOS/metas';
import { Modal, Pressable } from 'react-native';

import IconeRotativo from '../../assets/imagens/wallpaper.svg';
import { Animated } from 'react-native';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { buscarMetaPorId_pagina_editar } from '../../BASEDEDADOS/metas';
import { buscarSubCategoriaPorId } from '../../BASEDEDADOS/sub_categorias';
import { SubCategoria } from '../../BASEDEDADOS/tipos_tabelas';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BackHandler } from 'react-native';
import ModalAguardeEditarMeta from './componestes_metas/modal_sucesso_editar_meta';


type ParamList = {
    EditarMeta: { id_meta: number };
};

function getImagemCategoria(img_cat: any): ImageSourcePropType {
    // Se já for um objeto (tipo require), retorna diretamente
    if (typeof img_cat === 'object' && img_cat !== null && img_cat.uri === undefined) {
        return img_cat;
    }

    if (!img_cat || typeof img_cat !== 'string') {
        return require('../../assets/imagens/categorias/outros.png');
    }

    // Se for imagem do usuário ou remota
    if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
        return { uri: img_cat };
    }

    const imagensLocais: Record<string, ImageSourcePropType> = {
        'compras_pessoais.png': require('../../assets/imagens/categorias/compras_pessoais.png'),
        'contas_e_servicos.png': require('../../assets/imagens/categorias/contas_e_servicos.png'),
        'despesas_gerais.png': require('../../assets/imagens/categorias/despesas_gerais.png'),
        'educacao.png': require('../../assets/imagens/categorias/educacao.png'),
        'estimacao.png': require('../../assets/imagens/categorias/estimacao.png'),
        'financas.png': require('../../assets/imagens/categorias/financas.png'),
        'habitacao.png': require('../../assets/imagens/categorias/habitacao.png'),
        'lazer.png': require('../../assets/imagens/categorias/lazer.png'),
        'outros.png': require('../../assets/imagens/categorias/outros.png'),
        'restauracao.png': require('../../assets/imagens/categorias/restauracao.png'),
        'saude.png': require('../../assets/imagens/categorias/saude.png'),
        'transportes.png': require('../../assets/imagens/categorias/transportes.png'),
        'alugel.png': require('../../assets/imagens/categorias/receitas/alugel.png'),
        'caixa-de-ferramentas.png': require('../../assets/imagens/categorias/receitas/caixa-de-ferramentas.png'),
        'deposito.png': require('../../assets/imagens/categorias/receitas/deposito.png'),
        'dinheiro.png': require('../../assets/imagens/categorias/receitas/dinheiro.png'),
        'lucro.png': require('../../assets/imagens/categorias/receitas/lucro.png'),
        'presente.png': require('../../assets/imagens/categorias/receitas/presente.png'),
        'salario.png': require('../../assets/imagens/categorias/receitas/salario.png'),
    };

    return imagensLocais[img_cat] || imagensLocais['outros.png'];
}


const EditarMeta: React.FC = () => {

    const route = useRoute<RouteProp<ParamList, 'EditarMeta'>>();
    const { id_meta } = route.params;
    const [valorCalculadoAlerta, setValorCalculadoAlerta] = useState(0);
    const [repetir, setRepetir] = React.useState(false);
    const [alertaAtivo, setAlertaAtivo] = React.useState(false);
    const [valor, setValor] = useState<number | null>(null);
    const [modalCategoriaVisivel, setModalCategoriaVisivel] = useState(false);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
    const [categoriaInfo, setCategoriaInfo] = useState<Categoria | null>(null);
    const [modalDataVisivel, setModalDataVisivel] = useState(false);
    const [dataInicio, setDataInicio] = useState<Date | null>(null);
    const [dataFim, setDataFim] = useState<Date | null>(null);
    const [rotuloDuracao, setRotuloDuracao] = useState<string>('');
    const [opcaoDuracao, setOpcaoDuracao] = useState<'' | 'semana' | 'mes' | 'semestre' | 'personalizado'>('');
    const [ultimaOpcaoConfirmada, setUltimaOpcaoConfirmada] = useState<'' | 'semana' | 'mes' | 'semestre' | 'personalizado'>('');
    const [dadosOriginais, setDadosOriginais] = useState<any>(null);

    const [metaCarregada, setMetaCarregada] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState<number | null>(null);
    const [subcategoriaInfo, setSubcategoriaInfo] = useState<SubCategoria | null>(null);
    const [modalSairVisivel, setModalSairVisivel] = useState(false);
    const animOpacity = useRef(new Animated.Value(0)).current;
    const animTranslateY = useRef(new Animated.Value(30)).current;
    const [mostrarModalAnimado, setMostrarModalAnimado] = useState(false);
    const [modalEditarMetaVisivel, setModalEditarMetaVisivel] = useState(false);

    useEffect(() => {
        if (modalSairVisivel) {
            animOpacity.setValue(0);
            animTranslateY.setValue(30);
            setMostrarModalAnimado(true);

            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.timing(animOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                    Animated.timing(animTranslateY, { toValue: 0, duration: 200, useNativeDriver: true })
                ]).start();
            });
        } else if (mostrarModalAnimado) {
            Animated.parallel([
                Animated.timing(animOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(animTranslateY, { toValue: 30, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setMostrarModalAnimado(false);
            });
        }
    }, [modalSairVisivel]);

    const isMetaAlterada = () => {
        if (!dadosOriginais) return false;

        const dataInicioStr = dataInicio?.toISOString().split('T')[0];
        const dataFimStr = dataFim?.toISOString().split('T')[0];

        const alertaValorAtual = alertaAtivo ? valorCalculadoAlerta : null;
        const alertaValorOriginal = dadosOriginais.alerta_ativo ? dadosOriginais.recebe_alerta : null;


        return (
            categoriaSelecionada !== dadosOriginais.categoria_id ||
            valor !== dadosOriginais.valor_meta ||
            dataInicioStr !== dadosOriginais.data_inicio ||
            dataFimStr !== dadosOriginais.data_fim ||
            repetir !== dadosOriginais.repetir_meta ||
            alertaValorAtual !== alertaValorOriginal ||
            subcategoriaSelecionada !== dadosOriginais.subcategoria_id

        );
    };


    const houveAlteracao = isMetaAlterada();
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (houveAlteracao) {
                    setModalSairVisivel(true);
                    return true;
                }
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [houveAlteracao])
    );

    const rotateInterpolation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();
    }, []);


    useEffect(() => {
        const carregarMeta = async () => {
            setMetaCarregada(false);
            const meta = await buscarMetaPorId_pagina_editar(id_meta);

            if (meta) {
                setCategoriaSelecionada(meta.categoria_id);
                setSubcategoriaSelecionada(meta.sub_categoria_id);
                if (meta.sub_categoria_id) {
                    const sub = await buscarSubCategoriaPorId(meta.sub_categoria_id);
                    setSubcategoriaInfo(sub);
                }
                setValor(meta.valor_meta);
                setDataInicio(new Date(meta.data_inicio));
                setDataFim(new Date(meta.data_fim));
                const dataIni = new Date(meta.data_inicio);
                const dataFim = new Date(meta.data_fim);

                const tipoDuracao = calcularTipoDuracao(dataIni, dataFim);
                setOpcaoDuracao(tipoDuracao);
                setUltimaOpcaoConfirmada(tipoDuracao);
                setRotuloDuracao(tipoDuracao === 'semana' ? 'Esta semana' : tipoDuracao === 'mes' ? 'Este mês' : tipoDuracao === 'semestre' ? 'Este semestre' : 'Personalizado');

                setRepetir(meta.repetir_meta === 1);
                setAlertaAtivo(meta.recebe_alerta !== null);
                setValorCalculadoAlerta(meta.recebe_alerta ?? 0);

            }
            setDadosOriginais({
                categoria_id: meta.categoria_id,
                subcategoria_id: meta.sub_categoria_id,
                valor_meta: meta.valor_meta,
                data_inicio: meta.data_inicio,
                data_fim: meta.data_fim,
                repetir_meta: meta.repetir_meta === 1,
                alerta_ativo: meta.recebe_alerta !== null,
                recebe_alerta: meta.recebe_alerta !== undefined ? meta.recebe_alerta : null


            });

            setMetaCarregada(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();

        };

        carregarMeta();
    }, [id_meta]);

    useEffect(() => {
        const carregarSub = async () => {
            if (subcategoriaSelecionada !== null) {
                const sub = await buscarSubCategoriaPorId(subcategoriaSelecionada);
                setSubcategoriaInfo(sub);
            } else {
                setSubcategoriaInfo(null);
            }
        };

        carregarSub();
    }, [subcategoriaSelecionada]);



    const alertaInvalido = alertaAtivo && valorCalculadoAlerta === 0;


    function calcularTipoDuracao(dataInicio: Date, dataFim: Date): 'semana' | 'mes' | 'semestre' | 'personalizado' {
        const diffDias = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDias === 6 || diffDias === 7) return 'semana';
        if (diffDias >= 28 && diffDias <= 31) return 'mes';
        if (diffDias >= 181 && diffDias <= 184) return 'semestre';

        return 'personalizado';
    }

    useEffect(() => {
        const carregarCategoria = async () => {
            if (categoriaSelecionada !== null) {
                const categoria = await buscarCategoriaPorId(categoriaSelecionada);
                setCategoriaInfo(categoria);
            } else {
                setCategoriaInfo(null);
            }
        };

        carregarCategoria();
    }, [categoriaSelecionada]);

    useEffect(() => {
        if (!valor || valor <= 0) {
            setAlertaAtivo(false);
        }
    }, [valor]);


    const podeCriarMeta =
        (categoriaSelecionada !== null || subcategoriaSelecionada !== null) &&
        valor !== null &&
        valor > 0 &&
        dataInicio !== null &&
        dataFim !== null;

    const navigation = useNavigation();


    const handleAtualizarMeta = async () => {
        if (!podeCriarMeta) return;

        const valorFinal = alertaAtivo ? (valorCalculadoAlerta ?? 0) : null;
        if ((categoriaSelecionada !== null && subcategoriaSelecionada !== null) ||
            (categoriaSelecionada === null && subcategoriaSelecionada === null)) {
            alert("Por favor selecione apenas uma categoria ou subcategoria.");
            return;
        }
        setModalEditarMetaVisivel(true);
    };



    if (!metaCarregada) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Animated.View
                    style={{
                        transform: [{ rotate: rotateInterpolation }],
                        marginBottom: 20,
                    }}
                >
                    <IconeRotativo width={50} height={50} fill="#2565A3" />
                </Animated.View>
                <Text style={{ color: '#2565A3', fontWeight: 'bold' }}>
                    A carregar meta...
                </Text>
            </View>
        );
    }


    return (

        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (houveAlteracao) {
                        setModalSairVisivel(true);
                    } else {
                        navigation.goBack();
                    }
                }}
                >
                    <Ionicons name="close" size={26} color="#164878" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Meta</Text>
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 5 }} showsVerticalScrollIndicator={false}>



                        <View style={styles.card}>
                            {/* Categoria */}
                            <View style={styles.row}>
                                <Catgoriaicon width={16} height={16} color="#164878" />
                                <Text style={styles.label}>Categoria</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.pickerButton,
                                        { backgroundColor: subcategoriaInfo?.cor_subcat || categoriaInfo?.cor_cat || '#5DADE2' }
                                    ]}
                                    onPress={() => {
                                        setModalCategoriaVisivel(true);
                                    }}
                                >
                                    {subcategoriaInfo ? (
                                        <>
                                            <View style={{
                                                width: 22, height: 22, borderRadius: 99,
                                                backgroundColor: subcategoriaInfo.cor_subcat,
                                                justifyContent: 'center', alignItems: 'center'
                                            }}>
                                                <FontAwesome name={subcategoriaInfo.icone_nome} size={20} color="#fff" />
                                            </View>
                                            <Text style={styles.pickerText}>{subcategoriaInfo.nome_subcat}</Text>
                                        </>
                                    ) : categoriaInfo ? (
                                        <>
                                            <Image source={getImagemCategoria(categoriaInfo.img_cat)} style={{ width: 22, height: 22 }} />
                                            <Text style={styles.pickerText}>{categoriaInfo.nome_cat}</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.pickerText}>Selecionar</Text>
                                        </>
                                    )}

                                    <Ionicons name="chevron-down" size={18} color="#fff" />
                                </TouchableOpacity>



                            </View>

                            {/* Valor */}
                            <View style={styles.row}>
                                <Valoricon width={16} height={16} color="#164878" />
                                <Text style={styles.label}>Valor</Text>
                                <View style={styles.valorContainer}>
                                    <TextInput
                                        style={styles.valorInput}
                                        value={valor !== null ? valor.toString() : ''}
                                        onChangeText={(text) => {
                                            const apenasNumeros = text.replace(/[^0-9]/g, '');
                                            setValor(apenasNumeros ? parseInt(apenasNumeros, 10) : null);
                                        }}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        placeholder="0"
                                        placeholderTextColor="#164878"
                                    />

                                    <Text style={styles.euro}>€</Text>
                                </View>
                            </View>

                            {/* Duração */}
                            <View style={styles.row}>
                                <Dataicon width={16} height={16} color="#164878" />
                                <Text style={styles.label}>Duração</Text>
                                <TouchableOpacity
                                    style={styles.duracaoButton}
                                    onPress={() => setModalDataVisivel(true)}
                                >
                                    <Text style={styles.duracaoText}>
                                        {rotuloDuracao || 'Selecionar'}
                                    </Text>


                                    <Ionicons name="chevron-down" size={18} color="#164878" />
                                </TouchableOpacity>

                            </View>

                        </View>


                        {/* REPETIR META*/}
                        <View style={styles.repetirCard}>
                            <View style={styles.repetirTextContainer}>
                                <View style={styles.repetirRow}>
                                    <Repetiricon width={20} height={20} />
                                    <Text style={styles.repetirTitle}>Repetir Meta</Text>
                                </View>
                                <Text style={styles.repetirSub}>Esta meta será renovada automaticamente.</Text>
                            </View>

                            <SwitchCustomizado value={repetir} onValueChange={setRepetir} />

                        </View>

                        <AlertaCard
                            alertaAtivo={alertaAtivo}
                            valorCalculadoAlerta={valorCalculadoAlerta}
                            onToggle={(ativo) => {
                                if (valor && valor > 0) {
                                    setAlertaAtivo(ativo);
                                }
                            }}
                            valor={valor}
                            onValorCalculadoChange={(val) => setValorCalculadoAlerta(val)}
                        />



                    </ScrollView>
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.botaoCriarMeta, { opacity: podeCriarMeta && houveAlteracao && !alertaInvalido ? 1 : 0.5 }]}

                            onPress={handleAtualizarMeta}
                            disabled={!podeCriarMeta || !houveAlteracao || alertaInvalido}
                        >
                            <Ionicons name="checkmark" size={22} color="#fff" />
                            <Text style={styles.botaoTexto}>Guardar Alterações</Text>
                        </TouchableOpacity>



                    </View>
                </View>
            </TouchableWithoutFeedback>
            <ModalCategorias
                visivel={modalCategoriaVisivel}
                aoFechar={() => setModalCategoriaVisivel(false)}
                aoSelecionarCategoria={(cat) => {
                    setCategoriaSelecionada(cat);
                    setSubcategoriaSelecionada(null);
                }}
                aoSelecionarSubcategoria={(sub) => {
                    if (sub !== null) {
                        setCategoriaSelecionada(null);
                        setSubcategoriaSelecionada(sub);
                    }
                }}
                categoriaSelecionada={categoriaSelecionada}
                subcategoriaSelecionada={subcategoriaSelecionada}
            />



            <ModalData
                visivel={modalDataVisivel}
                opcaoSelecionada={opcaoDuracao}
                setOpcaoSelecionada={setOpcaoDuracao}
                aoFechar={() => {
                    setOpcaoDuracao(ultimaOpcaoConfirmada); // reverter se cancelado
                    setModalDataVisivel(false);
                }}
                aoConfirmar={(inicio, fim, rotulo) => {
                    setDataInicio(inicio);
                    setDataFim(fim);
                    setRotuloDuracao(rotulo);
                    setUltimaOpcaoConfirmada(opcaoDuracao); // confirmar a seleção
                    setModalDataVisivel(false);
                }}
            />

            {mostrarModalAnimado && (
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[styles.modalBox, {
                            opacity: animOpacity,
                            transform: [{ translateY: animTranslateY }]
                        }]}
                    >
                        <Ionicons name="alert-circle" size={50} color="#D8000C" style={styles.modalIconAlerta} />
                        <Text style={styles.modalTitulo}>Quer descartar as alterações?</Text>
                        <View style={styles.modalBotoes}>
                            <TouchableOpacity onPress={() => setModalSairVisivel(false)} style={styles.botaoCancelar}>
                                <Text style={styles.txtCancelar}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    Animated.parallel([
                                        Animated.timing(animOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                                        Animated.timing(animTranslateY, { toValue: 30, duration: 200, useNativeDriver: true })
                                    ]).start(() => {
                                        setMostrarModalAnimado(false);
                                        navigation.goBack();
                                    });
                                }}
                                style={styles.botaoConfirmar}
                            >
                                <Text style={styles.txtConfirmar}>Sim</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            )}


            <ModalAguardeEditarMeta
                visivel={modalEditarMetaVisivel}
                setVisivel={setModalEditarMetaVisivel}
                nomeMeta={subcategoriaInfo?.nome_subcat || categoriaInfo?.nome_cat || 'Meta'}
                cor={subcategoriaInfo?.cor_subcat || categoriaInfo?.cor_cat || '#2565A3'}
                nome_subcat={subcategoriaInfo?.nome_subcat}
                icone_nome={subcategoriaInfo?.icone_nome}
                img_cat={categoriaInfo?.img_cat}
                iniciarProcesso={async () => {
                    const valorFinal = alertaAtivo ? (valorCalculadoAlerta ?? 0) : null;

                    if ((categoriaSelecionada !== null && subcategoriaSelecionada !== null) ||
                        (categoriaSelecionada === null && subcategoriaSelecionada === null)) {
                        return { sucesso: false, mensagem: 'Por favor selecione apenas uma categoria ou subcategoria.' };
                    }

                    const resultado = await atualizarMeta(
                        id_meta,
                        categoriaSelecionada,
                        subcategoriaSelecionada,
                        valor,
                        dataInicio!.toISOString().split('T')[0],
                        dataFim!.toISOString().split('T')[0],
                        repetir,
                        valorFinal
                    );

                    return resultado;
                }}
            />




        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: '#4152D5',
    },
    header: {
        backgroundColor: 'white',
        height: height * 0.09,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        elevation: 0,
    },
    headerTitle: {
        color: '#2565A3',
        fontSize: scale(17
        ),
        marginLeft: 10,
        fontWeight: 'bold',
        letterSpacing: 18 * 0.05,
    },
    card: {
        backgroundColor: '#F5F5F5',
        margin: 10,
        marginBottom: 5,
        padding: 10,
        borderRadius: 14,
        elevation: 0,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 8
    },

    label: {
        color: '#164878',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
        flex: 1,
    },

    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        //backgroundColor: '#5DADE2',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 25,
        gap: 5,
        height: scale(35)
    },

    pickerText: {
        color: '#fff',
        fontWeight: 'bold',
        marginHorizontal: 4,
        maxWidth: 140,
    },

    valorContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end', // melhor para alinhas texto com símbolos
        borderBottomWidth: 1,
        borderBottomColor: '#4574A1',
        paddingBottom: 0, // reduz ainda mais a distância da linha
        marginTop: -5,
        marginBottom: 10 // opcional para subir tudo um pouco

    },

    valorInput: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#164878',
        minWidth: 60,
        textAlign: 'right',
        padding: 0,
        marginBottom: -2,
        lineHeight: 24, // controla o espaçamento vertical
    },

    euro: {
        fontSize: 18,
        color: '#164878',
        marginLeft: 4,
        marginBottom: -2,
        paddingBottom: 2, // ajuda na linha do baseline
    },

    duracaoButton: {
        backgroundColor: '#ACCFF1',
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
    },

    duracaoText: {
        fontWeight: '700',
        color: '#164878',
        marginRight: 6,
    },

    repetirTextContainer: {
        flexDirection: 'column',
        flex: 1,
        marginRight: 15,
    },

    repetirRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    repetirTitle: {
        marginLeft: 5,
        fontWeight: 'bold',
        fontSize: 16,
        color: '#164878',
    },

    repetirSub: {
        fontSize: 13,
        color: '#164878',
        fontWeight: '500',
        marginLeft: 15
    },
    repetirCard: {
        backgroundColor: '#F5F5F5',
        margin: 10,
        marginBottom: 5,
        padding: 10,
        borderRadius: 14,
        elevation: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        marginTop: 7,
    },
    botaoCriarMeta: {
        backgroundColor: '#FFA726',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 0,
        marginTop: 10,
        marginBottom: 10,
        paddingVertical: 14,
        borderRadius: 30,
        gap: 10,

        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },


    botaoTexto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    footer: {
        paddingHorizontal: 15,
        paddingBottom: 0, // limite inferior
        backgroundColor: 'transparent',
    },
    modalBotao: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 60,
        borderRadius: 99,
        backgroundColor: '#164878'

    },
    modalBotaoTexto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
    }


});

export default EditarMeta;
