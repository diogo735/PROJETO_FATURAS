import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Switch, ImageSourcePropType } from 'react-native';
import { scale } from 'react-native-size-matters';
const { height, width } = Dimensions.get('window');
import Ionicons from 'react-native-vector-icons/Ionicons';
import { buscarCategoriaPorId } from '../../BASEDEDADOS/categorias';
import Catgoriaicon from '../../../assets/icons/pagina_criar_meta/categorias.svg';
import Valoricon from '../../../assets/icons/pagina_criar_meta/valor.svg';
import Dataicon from '../../../assets/icons/pagina_criar_meta/data.svg';
import Repetiricon from '../../../assets/icons/pagina_criar_meta/repetir.svg';
import SwitchCustomizado from './criar_meta/componentes/switch_customizado';
import AlertaCard from './criar_meta/componentes/alerta_card';
import { ScrollView } from 'react-native';
import ModalCategorias from './criar_meta/modal_categorias';
import { Categoria } from '../../BASEDEDADOS/tipos_tabelas';
import { Image } from 'react-native';
import ModalData from './criar_meta/modal_data';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { inserirMeta } from '../../BASEDEDADOS/metas';


import { Keyboard, TouchableWithoutFeedback } from 'react-native';


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


const EditarMeta: React.FC = () => {
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

    useFocusEffect(
        useCallback(() => {
            // Resetar tudo quando a tela abrir
            setCategoriaSelecionada(null);
            setCategoriaInfo(null);
            setValor(null);
            setDataInicio(null);
            setDataFim(null);
            setRotuloDuracao('');
            setOpcaoDuracao('');
            setUltimaOpcaoConfirmada('');
            setRepetir(false);
            setAlertaAtivo(false);
        }, [])
    );

    const podeCriarMeta = categoriaSelecionada !== null && valor !== null && valor > 0 && dataInicio !== null && dataFim !== null;

    const navigation = useNavigation();


    const handleCriarMeta = async () => {
        if (!podeCriarMeta) return;

        const valorFinal = alertaAtivo ? (valorCalculadoAlerta ?? 0) : null;

        await inserirMeta(
            categoriaSelecionada,
            valor,
            dataInicio.toISOString().split('T')[0],
            dataFim.toISOString().split('T')[0],
            repetir,
            valorFinal as any
        );

        navigation.goBack();
    };


    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={26} color="#164878" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Meta Mensal</Text>
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
                                        { backgroundColor: categoriaInfo?.cor_cat || '#5DADE2' }
                                    ]}
                                    onPress={() => {
                                        setModalCategoriaVisivel(true);
                                    }}
                                >
                                    {categoriaInfo ? (
                                        <>
                                            <Image
                                                source={getImagemCategoria(categoriaInfo.img_cat)}
                                                style={{ width: 22, height: 22 }}
                                                resizeMode="contain"
                                            />
                                            <Text
                                                style={styles.pickerText}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {categoriaInfo.nome_cat}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text
                                                style={styles.pickerText}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                Selecionar
                                            </Text>
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
                        <TouchableOpacity style={[
                            styles.botaoCriarMeta,
                            { opacity: podeCriarMeta ? 1 : 0.5 }
                        ]}
                            onPress={() => {
                                if (podeCriarMeta) {
                                    handleCriarMeta();
                                    console.log('Criar Meta');
                                }
                            }}
                            disabled={!podeCriarMeta}
                        >
                            <Ionicons name="checkmark" size={22} color="#fff" />
                            <Text style={styles.botaoTexto}>Criar Meta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <ModalCategorias
                visivel={modalCategoriaVisivel}
                aoFechar={() => setModalCategoriaVisivel(false)}
                aoSelecionarCategoria={(cat) => {
                    setCategoriaSelecionada(cat);
                }}

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





        </View>
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



});

export default EditarMeta;
