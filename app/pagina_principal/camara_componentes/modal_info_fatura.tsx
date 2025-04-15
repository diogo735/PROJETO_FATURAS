import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, ImageBackground, ActivityIndicator, Keyboard } from 'react-native';
import Modal from 'react-native-modal';
import FundoSvg from '../../../assets/icons/pagina_camera/FUNDO_INFO_FATURA.svg';
import InfoIcon from '../../../assets/icons/pagina_camera/info.svg';
import { Dimensions } from 'react-native';
import NotasIcon from '../../../assets/icons/pagina_camera/notas.svg';
import LixoIcon from '../../../assets/icons/pagina_camera/lixo.svg';
import CheckIcon from '../../../assets/icons/pagina_camera/guardar.svg';
import ModalCategorias from './modal_categorias_info_fatura';
import { listarCategoriasComTipo } from '../../../BASEDEDADOS/categorias';
import ErroQrIcon from '../../../assets/icons/pagina_camera/invalida.png';
import IconeRotativo from '../../../assets/imagens/wallpaper.svg';
import { Animated, Easing } from 'react-native';
import { obterInfoEmpresaPorNif } from '../../../APIs/api_faturas';
import { ImageSourcePropType } from 'react-native';
import { Categoria } from '../../../BASEDEDADOS/tipos_tabelas';
import ImageViewer from 'react-native-image-zoom-viewer';
import { TouchableWithoutFeedback } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';


const { width, height } = Dimensions.get('window');
interface Props {
    visivel: boolean;
    uri: string | null;
    aoFechar: () => void;
    conteudoQr: string | null;
    aoEliminar: () => void;
}
function getImagemCategoria(img_cat: string): ImageSourcePropType {
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

const Modal_Info_Fatura: React.FC<Props> = ({ visivel, uri, aoFechar, aoEliminar, conteudoQr }) => {
    const [alturaInfo, setAlturaInfo] = React.useState(0);
    const [mostrarModalCategoria, setMostrarModalCategoria] = React.useState(false);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<(Categoria & { tipo_nome: string }) | null>(null);
    const [nota, setNota] = useState('');
    const [imagemAmpliada, setImagemAmpliada] = useState(false);

    const [dadosInterpretados, setDadosInterpretados] = useState<any | null>(null);
    const [loadingQr, setLoadingQr] = useState(false);
    const [qrInvalido, setQrInvalido] = useState(false);
    const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);
    const rotateValue = useRef(new Animated.Value(0)).current;

    type NavigationProps = StackNavigationProp<RootStackParamList, 'PaginaSucesso'>;
    const navigation = useNavigation<NavigationProps>();

    useEffect(() => {
        let isMounted = true;

        if (visivel) {
            rotateValue.setValue(0);

            const animateRotation = () => {
                Animated.timing(rotateValue, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }).start(() => {
                    if (isMounted) {
                        rotateValue.setValue(0);
                        animateRotation();
                    }
                });
            };

            animateRotation();
        }

        return () => {
            isMounted = false; // previne loop após fechar
        };
    }, [visivel]);



    const rotateInterpolation = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const aoFecharModal = () => {

        setDadosInterpretados(null);  // Limpa a interpretação
    };


    const [categorias, setCategorias] = useState<any[]>([]);

    function formatarData(dataStr: string): string {
        if (!dataStr || dataStr.length !== 8) return '---';

        const ano = dataStr.slice(0, 4);
        const mes = dataStr.slice(4, 6);
        const dia = dataStr.slice(6, 8);

        return `${dia}/${mes}/${ano}`;
    }

    async function interpretarQr(qr: string) {
        const dados = Object.fromEntries(qr.split('*').map(parte => {
            const [chave, valor] = parte.split(':');
            return [chave, valor];
        }));
        const nomeEmpresaInfo = await obterInfoEmpresaPorNif(dados.A);
        return {
            emissor: nomeEmpresaInfo || `${dados.A}`,
            contribuinte: dados.B,
            tipo: dados.D === 'FS' ? 'Fatura Simplificada' : dados.D,
            data: formatarData(dados.F),
            numero: dados.G,
            atcud: dados.H,
            totalLiquido: dados.I7 + ' €',
            iva: dados.I8 + ' €',
            total: dados.O + ' €',
            certificado: dados.R,
        };
    }

    useEffect(() => {
        //console.log('📦 Conteúdo do QR recebido:', conteudoQr);

        if (visivel) {
            setLoadingQr(true);
            setQrInvalido(false);

            if (conteudoQr) {
                const timeout = setTimeout(async () => {
                    try {
                        const dados = await interpretarQr(conteudoQr); // agora é async
                        setDadosInterpretados(dados);
                        setQrInvalido(false);
                    } catch (error) {
                        console.warn('❌ Erro ao interpretar QR:', error);
                        setDadosInterpretados(null);
                        setQrInvalido(true);
                    }
                    setLoadingQr(false);
                }, 2000);

                return () => clearTimeout(timeout);
            } else {
                setTimeout(() => {
                    setDadosInterpretados(null);
                    setQrInvalido(true);
                    setLoadingQr(false);
                }, 2000);
            }
        }
    }, [visivel, conteudoQr]);




    useEffect(() => {
        const carregarCategorias = async () => {
            const lista = await listarCategoriasComTipo();
            if (lista) {
                setCategorias(lista);
            }
        };

        carregarCategorias();
    }, []);


    function formatarContribuinte(nif?: string) {
        if (!nif || ['999999990', '999999999', '000000000'].includes(nif)) {
            return 'Sem NIF';
        }
        return nif;
    }

    useEffect(() => {
        if (visivel) {
            setNota('');
            setCategoriaSelecionada(null);
        }
    }, [visivel]);

    return (
        <Modal isVisible={visivel} onBackdropPress={aoFechar} style={{ justifyContent: 'flex-end', margin: 0 }}>
            <View style={[styles.modalContainer, { minHeight: height * 0.75 }]}>

                <View style={styles.backgroundSvg}>
                    <FundoSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                </View>

                {loadingQr ? (
                    <View style={[styles.loadingContainer, { height: alturaInfo || 400 }]}>
                        <Animated.View style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            transform: [{ rotate: rotateInterpolation }]
                        }}>
                            <IconeRotativo
                                width={70}
                                height={70}
                                fill="#2565A3"
                            />
                        </Animated.View>

                        <Text style={{ marginTop: 15, color: '#2565A3', fontWeight: 'bold' }}>A ler fatura...</Text>
                    </View>


                ) : qrInvalido ? (
                    <View style={styles.loadingContainer}>
                        <Image
                            source={ErroQrIcon}
                            style={{ width: 84, height: 84, marginBottom: 15 }}
                            resizeMode="contain"
                        />
                        <Text style={{ color: '#2565A3', fontSize: 16, fontWeight: 'bold' }}>
                            QR inválido ou
                            não detetado !
                        </Text>
                        <TouchableOpacity
                            style={styles.botaoTentarNovamente}
                            onPress={aoFechar} // ou outra função como voltar à câmera
                        >
                            <Text style={styles.textoBotaoTentar}>Tente novamente</Text>
                        </TouchableOpacity>

                    </View>

                ) : (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>

                            {/* SVG como fundo absoluto */}

                            <View style={styles.tituloBox}>
                                <InfoIcon width={22} height={22} style={styles.iconeInfo} />
                                <Text style={styles.tituloTexto}>Informações da Fatura</Text>
                            </View>
                            <View style={styles.linhaHorizontal}>
                                <View
                                    style={styles.info_container}
                                    onLayout={(event) => {
                                        const { height } = event.nativeEvent.layout;
                                        setAlturaInfo(height);
                                    }}
                                >
                                    {/* Estabelecimento */}
                                    <View style={styles.linhaInfo}>
                                        <Text style={styles.label}>Estabelecimento:</Text>
                                        {loadingQr ? (
                                            <Text style={[styles.valor, { fontStyle: 'italic' }]}>A interpretar QR...</Text>
                                        ) : (
                                            <Text style={styles.valor}>{dadosInterpretados?.emissor || '---'}</Text>
                                        )}
                                    </View>

                                    {/* Contribuinte */}
                                    <View style={styles.linhaInfo}>
                                        <Text style={styles.label}>Nº de Contribuinte:</Text>
                                        <Text style={styles.valor}>{formatarContribuinte(dadosInterpretados?.contribuinte)}</Text>

                                    </View>

                                    {/* Data da fatura */}

                                    <View style={styles.linhaInfo}>
                                        <Text style={styles.label}>Data:</Text>
                                        {loadingQr ? (
                                            <Text style={[styles.valor, { fontStyle: 'italic' }]}>a carregar...</Text>
                                        ) : (
                                            <Text style={styles.valor}>{dadosInterpretados?.data || '---'}</Text>
                                        )}
                                    </View>
                                    <View style={styles.linhaInfo}>
                                        <Text style={styles.label}>Tipo:</Text>
                                        <TouchableOpacity
                                            onPress={() => setMostrarModalCategoria(true)}
                                            style={[
                                                styles.tipoBox,
                                                {
                                                    backgroundColor: categoriaSelecionada ? categoriaSelecionada.cor_cat : '#5DADE2',
                                                },
                                            ]}
                                        >
                                            {categoriaSelecionada ? (
                                                <>
                                                    <Image
                                                        source={getImagemCategoria(categoriaSelecionada.img_cat)}
                                                        style={styles.tipoIcone}
                                                    />
                                                    <Text style={styles.tipoTexto}>{categoriaSelecionada.nome_cat}</Text>
                                                    <Image
                                                        source={require('../../../assets/icons/pagina_camera/editar.svg')}
                                                        style={styles.iconeEditar}
                                                    />
                                                </>
                                            ) : (
                                                <Text style={[styles.tipoTexto, { color: 'white' }]}>Selecionar</Text>
                                            )}
                                        </TouchableOpacity>

                                    </View>


                                    {/* Total */}
                                    <View style={[styles.linhavalor, { marginTop: 20 }]}>
                                        <Text style={styles.label}>Valor:</Text>
                                        {loadingQr ? (
                                            <Text style={[styles.valor, { fontStyle: 'italic' }]}>a carregar...</Text>
                                        ) : (
                                            <Text style={styles.valor}>{dadosInterpretados?.total || '---'}</Text>
                                        )}
                                    </View>
                                </View>



                                {uri && (
                                    <TouchableOpacity onPress={() => setImagemAmpliada(true)}>
                                        <Image
                                            source={{ uri }}
                                            style={[styles.image, { height: alturaInfo }]}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}



                            </View>
                            <View style={styles.caixaNotas}>
                                <View style={styles.iconeNota}>
                                    <NotasIcon width={22} height={22} />
                                </View>

                                <View style={{ flex: 1, position: 'relative' }}>
                                    <TextInput
                                        value={nota}
                                        onChangeText={setNota}
                                        placeholder="Adicionar notas..."
                                        placeholderTextColor="#6C8CA1"
                                        style={styles.inputNota}
                                        multiline
                                        numberOfLines={3}
                                        scrollEnabled={false}
                                        maxLength={80}
                                        returnKeyType="done"
                                        blurOnSubmit={true}
                                        onSubmitEditing={() => Keyboard.dismiss()}

                                    />
                                    <Text style={styles.contadorTexto}>{nota.length}/80</Text>
                                </View>
                            </View>

                            <View style={styles.separador} />

                            <View style={styles.botoesContainer}>
                                <TouchableOpacity
                                    style={styles.btnEliminar}
                                    onPress={() => {
                                        setNota('');
                                        setCategoriaSelecionada(null);
                                        aoEliminar(); // chama o reset da tela principal
                                        aoFecharModal(); // limpa os dados do QR e do modal
                                    }}
                                >
                                    <LixoIcon width={18} height={18} style={styles.iconeBotao} />
                                    <Text style={styles.txtBotao}>Eliminar</Text>
                                </TouchableOpacity>


                                <TouchableOpacity
                                    style={[
                                        styles.btnGuardar,
                                        !categoriaSelecionada && { opacity: 0.5 }
                                    ]}
                                    disabled={!categoriaSelecionada}
                                    onPress={() => {
                                        Keyboard.dismiss();

                                        if (!categoriaSelecionada) {
                                            console.log('❌ Categoria obrigatória.');
                                            return;
                                        }

                                        

                                        console.log('✅ Nota guardada:', nota);
                                        aoFechar();
                                        setTimeout(() => {
                                            navigation.navigate('PaginaSucesso', {
                                                conteudoQr: conteudoQr ?? null,
                                                categoriaId: categoriaSelecionada?.id ?? null,
                                                nota: nota || null,
                                                nomeEmpresa: dadosInterpretados?.emissor ?? null,
                                                imagemUri: uri ?? null,
                                            });

                                        }, 300);
                                    }}
                                >
                                    <CheckIcon width={18} height={18} style={styles.iconeBotao} />
                                    <Text style={styles.txtBotao}>Guardar</Text>
                                </TouchableOpacity>


                            </View>


                        </View></TouchableWithoutFeedback>
                )}
            </View>
            <ModalCategorias
                visivel={mostrarModalCategoria}
                aoFechar={() => setMostrarModalCategoria(false)}
                aoSelecionarCategoria={(idSelecionado) => {
                    const categoria = categorias.find(cat => cat.id === idSelecionado);
                    if (categoria) {
                        setCategoriaSelecionada(categoria);
                    } else {
                        setCategoriaSelecionada(null);
                    }
                }}
                categoriaAtual={categoriaSelecionada}
            />
            {uri && (
                <Modal isVisible={imagemAmpliada} onBackdropPress={() => setImagemAmpliada(false)} style={{ margin: 0 }}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity style={styles.closeFullscreen} onPress={() => setImagemAmpliada(false)}>
                            <Text style={{ color: 'white', fontSize: 24, zIndex: 10 }}>✕</Text>
                        </TouchableOpacity>

                        <ImageViewer
                            imageUrls={[{ url: uri as string }]}
                            enableSwipeDown
                            onSwipeDown={() => setImagemAmpliada(false)}
                            renderIndicator={() => <></>}
                            backgroundColor="black"
                        />
                    </View>
                </Modal>
            )}





        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'transparent',
        marginHorizontal: 10,
        paddingHorizontal: 0,

        overflow: 'hidden',
        position: 'relative',
    },
    backgroundSvg: {
        ...StyleSheet.absoluteFillObject, // ocupa toda a área do .content
        zIndex: 0,

    },
    content: {
        zIndex: 1,
        //backgroundColor: 'blue',
        marginBottom: 0
    },
    image: {
        width: width * 0.34,
        alignSelf: 'stretch',
        borderRadius: 10,
        marginRight: 10,
        marginTop: 10,
    },
    closeButton: {
        marginTop: 15,
    },
    closeText: {
        color: '#2C72B4',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    tituloBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    iconeInfo: {
        marginRight: 6,
        marginLeft: 6,
    },

    tituloTexto: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#164878',
    },
    linhaInfo: {
        marginBottom: 5,
        marginTop: 5,
        marginLeft: 15
    },
    linhavalor: {
        marginBottom: 5,
        marginLeft: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },

    label: {
        color: '#164878',
        fontSize: 18,
        fontWeight: '300',
    },

    valor: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5
    },
    tipoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#61C98D',
        paddingVertical: 6,
        borderRadius: 999,
        marginLeft: 5,
        marginRight: 20,
        marginTop: 5
    },

    tipoIcone: {
        width: 23,
        height: 23,
        marginRight: 6,
        marginLeft: 22
    },

    tipoTexto: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    iconeEditar: {
        width: 16,
        height: 16,
        marginLeft: 8,
        tintColor: 'white',
    },

    valorTotal: {
        fontSize: 22,
        fontWeight: '900',
        color: 'black',
        marginLeft: 5,
    },
    info_container: {
        marginTop: 10,
        flex: 1,
        // backgroundColor: 'red'
    },
    linhaHorizontal: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',

    },
    caixaNotas: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1.5,
        borderColor: '#D1D9E2',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 10,
        marginTop: 10,
        backgroundColor: 'white',
        height: width * 0.25
    },

    iconeNota: {
        width: 20,
        height: 20,
        marginRight: 10,

    },

    inputNota: {
        flex: 1,
        fontSize: 14,
        color: '#1E2A38',
        paddingTop: 0,
        paddingBottom: 0,
        textAlignVertical: 'top',


    },
    botoesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',

        marginTop: 0,
        marginBottom: 10,

    },

    btnEliminar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E76A5A',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 40,
    },

    btnGuardar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#164878',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 40,
    },

    iconeBotao: {
        width: 18,
        height: 18,
        marginRight: 10,
        tintColor: 'white',
    },

    txtBotao: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    separador: {
        height: 1,
        backgroundColor: '#E1E6EC',
        marginVertical: 15,
        marginHorizontal: 0,
    },
    contadorTexto: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        fontSize: 12,
        color: '#6C8CA1',
        paddingRight: 2,
        paddingBottom: 2,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingVertical: 40,
    },
    botaoTentarNovamente: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#2565A3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
    },

    textoBotaoTentar: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },

    fullscreenImage: {
        width: '100%',
        height: '100%',
    },

    closeFullscreen: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },




});

export default Modal_Info_Fatura;
