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
import Icon_editar from '../../../assets/icons/pagina_camera/editar_nome.svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { listarSubCategorias } from '../../../BASEDEDADOS/sub_categorias';
import { SubCategoria } from '../../../BASEDEDADOS/tipos_tabelas';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BackHandler } from 'react-native';
import { useMoeda } from '../../MOEDA';

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
    const { moeda } = useMoeda();

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


    const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    type NavigationProps = StackNavigationProp<RootStackParamList, 'PaginaSucesso'>;
    const navigation = useNavigation<NavigationProps>();
    const [alturaNotas, setAlturaNotas] = useState(width * 0.25);
    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [emissorEditado, setEmissorEditado] = useState<string | null>(null);

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
            isMounted = false;
        };
    }, [visivel]);

    const fadeAnim = useRef(new Animated.Value(1)).current;


    const rotateInterpolation = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const trocarComFade = (callback: () => void) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            callback();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        });
    };






    function formatarData(dataStr: string): string {
        if (!dataStr) return '---';
    
        // Se vier no formato YYYYMMDD
        if (dataStr.length === 8) {
            const ano = dataStr.slice(0, 4);
            const mes = dataStr.slice(4, 6);
            const dia = dataStr.slice(6, 8);
            return `${dia}/${mes}/${ano}`;
        }
    
        // Se vier no formato YYYY-MM-DD
        if (dataStr.length === 10 && dataStr.includes('-')) {
            const [ano, mes, dia] = dataStr.split('-');
            return `${dia}/${mes}/${ano}`;
        }
    
        return '---'; 
    }
    

    async function interpretarQr(qr: string) {
        const dados = Object.fromEntries(qr.split('*').map(parte => {
            const [chave, valor] = parte.split(':');
            return [chave, valor];
        }));
        console.log('🧾 QR bruto:', qr);

        const nomeEmpresaInfo = await obterInfoEmpresaPorNif(dados.A);

        const resultado = {
            emissor: nomeEmpresaInfo || `${dados.A}`,
            contribuinte: dados.B,
            tipo: dados.D === 'FS' ? 'Fatura Simplificada' : dados.D,
            data: formatarData(dados.F),
            numero: dados.G,
            atcud: dados.H,
            totalLiquido: dados.I3 || '0',
            iva13: dados.I4 || '0',
            total: dados.O,
            certificado: dados.R,
        };

       //console.log('📦 Dados interpretados do QR:', resultado);

        return resultado;
    }

    useEffect(() => {
        if (visivel) {
            setNota('');
            setCategoriaSelecionada(null);
            setCategoriaSelecionadaId(null);
            setSubcategoriaSelecionada(null);
            setSubcategoriaSelecionadaId(null);
            setDadosInterpretados(null);
            setQrInvalido(false);
           // setEmissorEditado(null);

        }
    }, [visivel]);

    useEffect(() => {
        //console.log('📦 Conteúdo do QR recebido:', conteudoQr);

        if (visivel) {
            setLoadingQr(true);
            setQrInvalido(false);

            if (conteudoQr) {
                const timeout = setTimeout(async () => {
                    try {
                        const dados = await interpretarQr(conteudoQr);
                        setDadosInterpretados(dados);
                        trocarComFade(() => {
                            setQrInvalido(false);
                        });

                    } catch (error) {
                        console.warn('❌ Erro ao interpretar QR:', error);
                        setDadosInterpretados(null);
                        trocarComFade(() => {
                            setQrInvalido(true);
                        });

                    }
                    setLoadingQr(false);
                }, 2000);

                return () => clearTimeout(timeout);
            } else {
                setTimeout(() => {
                    setDadosInterpretados(null); setQrInvalido(true);
                    trocarComFade(() => {
                        setLoadingQr(false);
                    });

                }, 2000);
            }
        }
    }, [visivel, conteudoQr]);

    useEffect(() => {
        const carregarCategoriasESubcategorias = async () => {
            const listaCat = await listarCategoriasComTipo();
            const listaSub = await listarSubCategorias();
            if (listaCat) setCategorias(listaCat);
            if (listaSub) setSubcategorias(listaSub);
        };

        if (visivel) {
            carregarCategoriasESubcategorias();
        }
    }, [visivel]);

    const forcarRecarregarCategorias = () => {
        const carregar = async () => {
            const listaCat = await listarCategoriasComTipo();
            const listaSub = await listarSubCategorias();
            if (listaCat) setCategorias(listaCat);
            if (listaSub) setSubcategorias(listaSub);
        };

        carregar();
    };


    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (mostrarModalCategoria) {
                    setMostrarModalCategoria(false); // Fecha o modal de categorias
                    return true; // Impede comportamento padrão
                }
                return false; // Permite comportamento normal se modal já estiver fechado
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [mostrarModalCategoria])
    );


    function formatarContribuinte(nif?: string) {
        if (!nif || ['999999990', '999999999', '000000000'].includes(nif)) {
            return 'Sem NIF';
        }
        return nif;
    }



    const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<number | null>(null);
    const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState<SubCategoria | null>(null);
    const [subcategoriaSelecionadaId, setSubcategoriaSelecionadaId] = useState<number | null>(null);

    useEffect(() => {
        if (categoriaSelecionadaId && categorias.length > 0) {
            const categoria = categorias.find(cat => cat.id === categoriaSelecionadaId);
            if (categoria) {
                console.log('✅ Categoria aplicada após carregamento:', categoria);
                setCategoriaSelecionada(categoria);
            }
        }
    }, [categoriaSelecionadaId, categorias]);

    useEffect(() => {
        if (subcategoriaSelecionadaId && subcategorias.length > 0) {
            const sub = subcategorias.find(s => s.id === subcategoriaSelecionadaId);
            if (sub) {
                console.log('✅ Subcategoria aplicada após carregamento:', sub);
                setSubcategoriaSelecionada(sub);
            }
        }
    }, [subcategoriaSelecionadaId, subcategorias]);

    const subcategoriaInfo = subcategoriaSelecionada;

    const carregandoGeral =
        loadingQr




    return (
        <Modal isVisible={visivel} onBackdropPress={aoFechar} style={{ justifyContent: 'flex-end', margin: 0 }}>
            <View style={[styles.modalContainer, { minHeight: height * 0.75 }]}>

                <View style={styles.backgroundSvg}>
                    <FundoSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                </View>
                <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                    {carregandoGeral ? (
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
                                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                                <Text style={styles.label}>Estabelecimento:</Text>

                                                <TouchableOpacity onPress={() => {
                                                    setEmissorEditado(dadosInterpretados?.emissor ?? '');
                                                    setMostrarModalEdicao(true);
                                                }}
                                                    style={{ marginLeft: 6 }}>
                                                    <Icon_editar width={25} height={25} />
                                                </TouchableOpacity>
                                            </View>

                                            {loadingQr ? (
                                                <Text style={[styles.valor, { fontStyle: 'italic' }]}>A interpretar QR...</Text>
                                            ) : (
                                                //<Text style={styles.valor}>{dadosInterpretados?.emissor || '---'}</Text>
                                                <Text
                                                    style={styles.valor}
                                                    numberOfLines={2}
                                                    ellipsizeMode="tail"
                                                    onPress={() => {
                                                        setEmissorEditado(dadosInterpretados?.emissor ?? '');
                                                        setMostrarModalEdicao(true);
                                                    }}

                                                    onTextLayout={(event) => {
                                                        const numLinhas = event.nativeEvent.lines.length;
                                                        setAlturaNotas(numLinhas > 1 ? width * 0.20 : width * 0.25);
                                                    }}
                                                >
                                                    {dadosInterpretados?.emissor || '---'}
                                                </Text>

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
                                                onPress={() => {
                                                    console.log('📌 Categoria atual:', categoriaSelecionada);
                                                    console.log('📌 Subcategoria atual:', subcategoriaInfo);
                                                    setMostrarModalCategoria(true);
                                                }}
                                                style={[
                                                    styles.tipoBox,
                                                    {
                                                        backgroundColor:
                                                            categoriaSelecionada?.cor_cat ??
                                                            subcategoriaInfo?.cor_subcat ??
                                                            '#5DADE2',
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
                                                ) : subcategoriaInfo ? (
                                                    <>
                                                        <View style={styles.tipoIconeWrapper}>
                                                            <FontAwesome
                                                                name={subcategoriaInfo.icone_nome}
                                                                size={18}
                                                                color="#fff"
                                                            />
                                                        </View>
                                                        <Text style={styles.tipoTexto}>{subcategoriaInfo.nome_subcat}</Text>
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
                                                <Text style={styles.valor}>
                                                    {dadosInterpretados?.total ? `${parseFloat(dadosInterpretados.total).toFixed(2)} ${moeda.simbolo}` : '---'}
                                                </Text>

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
                                <View style={[styles.caixaNotas, { height: alturaNotas }]}>

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
                                            //setNota('');
                                            //setCategoriaSelecionada(null); 
                                            aoFechar();
                                            //aoEliminar(); 
                                        }}
                                    >
                                        <LixoIcon width={18} height={18} style={styles.iconeBotao} />
                                        <Text style={styles.txtBotao}>Eliminar</Text>
                                    </TouchableOpacity>


                                    <TouchableOpacity
                                        style={[
                                            styles.btnGuardar,
                                            !categoriaSelecionada && !subcategoriaSelecionada && { opacity: 0.5 }
                                        ]}
                                        disabled={!categoriaSelecionada && !subcategoriaSelecionada}
                                        onPress={() => {
                                            Keyboard.dismiss();

                                            if (!categoriaSelecionada && !subcategoriaSelecionada) {
                                                console.log('❌ Deve selecionar uma categoria ou subcategoria.');
                                                return;
                                            }


                                            console.log('✅ Nota guardada:', nota);
                                            aoFechar();
                                            setTimeout(() => {
                                                navigation.navigate('PaginaSucesso', {
                                                    conteudoQr: conteudoQr ?? null,
                                                    categoriaId: categoriaSelecionada?.id ?? null,
                                                    subcategoriaId: subcategoriaSelecionada?.id ?? null,
                                                    nota: nota || null,
                                                    nomeEmpresa: dadosInterpretados?.emissor ?? null,
                                                    imagemUri: uri ?? null,
                                                    codigoAtcud: dadosInterpretados?.atcud ?? null, 
                                                });

                                            }, 300);
                                        }}
                                    >
                                        <CheckIcon width={18} height={18} style={styles.iconeBotao} />
                                        <Text style={styles.txtBotao}>Guardar</Text>
                                    </TouchableOpacity>


                                </View>


                            </View></TouchableWithoutFeedback>
                    )}</Animated.View>
            </View>
            <ModalCategorias
                visivel={mostrarModalCategoria}
                aoFechar={() => setMostrarModalCategoria(false)}
                aoSelecionarCategoria={(idSelecionado) => {
                    if (idSelecionado !== null) {
                        setCategoriaSelecionadaId(idSelecionado); // salva o ID
                        setSubcategoriaSelecionada(null);
                    } else {
                        setCategoriaSelecionada(null);
                        setCategoriaSelecionadaId(null);
                        setSubcategoriaSelecionada(null);
                    }
                }}
                aoSelecionarSubcategoria={(id) => {
                    if (id !== null) {
                        setSubcategoriaSelecionadaId(id);
                        setCategoriaSelecionada(null);
                    } else {
                        setSubcategoriaSelecionada(null);
                        setSubcategoriaSelecionadaId(null);
                        setCategoriaSelecionada(null);
                    }
                }}

                onCategoriaCriada={forcarRecarregarCategorias}
                categoriaAtual={categoriaSelecionada}
                subcategoriaAtual={subcategoriaSelecionada?.id ?? null}

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


            <Modal isVisible={mostrarModalEdicao} onBackButtonPress={() => setMostrarModalEdicao(false)} >
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Editar establecimento</Text>

                    <TextInput
                        value={emissorEditado ?? ''}
                        onChangeText={(text) => {
                            if (text.length <= 20) {
                                setEmissorEditado(text);
                            }
                        }}
                        placeholder="Digite o nome"
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            marginBottom: 10,
                            fontWeight: 'bold',
                            fontSize: 16,

                        }}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        {/* Botão Eliminar */}
                        <TouchableOpacity
                            onPress={() => setMostrarModalEdicao(false)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#E76A5A',
                                paddingVertical: 10,
                                paddingHorizontal: 30,
                                borderRadius: 50,
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Cancelar</Text>
                        </TouchableOpacity>

                        {/* Botão Guardar */}
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();

                                setTimeout(() => {
                                    if (dadosInterpretados) {
                                        const nomeLimpo = emissorEditado?.trim();

                                        setDadosInterpretados({
                                            ...dadosInterpretados,
                                            emissor: nomeLimpo === '' || nomeLimpo == null
                                                ? dadosInterpretados.emissor
                                                : nomeLimpo,
                                        });
                                    }

                                    setMostrarModalEdicao(false);
                                    setEmissorEditado(null); // limpa para a próxima edição
                                }, 150);
                            }}

                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#164878',
                                paddingVertical: 10,
                                paddingHorizontal: 30,
                                borderRadius: 50,
                            }}
                        >

                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Guardar</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>



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
        //backgroundColor: 'red'
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
    tipoIconeWrapper: {
        width: 23,
        height: 23,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginRight: 6,
        marginLeft: 22,
    },




});

export default Modal_Info_Fatura;
