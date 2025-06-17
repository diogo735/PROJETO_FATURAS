import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, ImageBackground, ActivityIndicator, Keyboard, Alert } from 'react-native';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ModalCameraCheia
    from '../modal_camera_manualmente';
import { useMoeda } from '../../MOEDA';
const { width, height } = Dimensions.get('window');
interface Props {
    visivel: boolean;
    uri: string | null;
    aoFechar: () => void;
    onAbrirCameraManual: () => void;
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

const Modal_Info_Fatura_Preencher: React.FC<Props> = ({ visivel, onAbrirCameraManual, uri, aoFechar, aoEliminar, }) => {
    const { moeda } = useMoeda();

    const [alturaInfo, setAlturaInfo] = React.useState(0);
    const [mostrarModalCategoria, setMostrarModalCategoria] = React.useState(false);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<(Categoria & { tipo_nome: string }) | null>(null);
    const [nota, setNota] = useState('');
    const [imagemAmpliada, setImagemAmpliada] = useState(false);

    const [emissor, setEmissor] = useState<string>('');
    const [contribuinte, setContribuinte] = useState<string>('');
    const [dataFatura, setDataFatura] = useState<string>('');
    const [valor, setValor] = useState<string>('');
    const [nifEstabelecimento, setNifEstabelecimento] = useState('');
    const [numeroFatura, setNumeroFatura] = useState('');
    const [valorIva, setValorIva] = useState('');
    const [atcud, setAtcud] = useState('');
    const [mostrarModalAtcud, setMostrarModalAtcud] = useState(false);
    // TEMPORÁRIOS
    const [emissorTemp, setEmissorTemp] = useState('');
    const [contribuinteTemp, setContribuinteTemp] = useState('');
    const [dataFaturaTemp, setDataFaturaTemp] = useState('');
    const [valorTemp, setValorTemp] = useState('');
    const [nifEstabelecimentoTemp, setNifEstabelecimentoTemp] = useState('');
    const [numeroFaturaTemp, setNumeroFaturaTemp] = useState('');
    const [valorIvaTemp, setValorIvaTemp] = useState('');
    const [atcudTemp, setAtcudTemp] = useState('');
    const [uriFotoCapturada, setUriFotoCapturada] = useState<string | null>(null);



    const [mostrarModalEstabelecimento, setMostrarModalEstabelecimento] = useState(false);
    const [mostrarModalContribuinte, setMostrarModalContribuinte] = useState(false);
    const [mostrarModalData, setMostrarModalData] = useState(false);
    const [mostrarModalValor, setMostrarModalValor] = useState(false);
    const [mostrarModalNifEstabelecimento, setMostrarModalNifEstabelecimento] = useState(false);
    const [mostrarModalNumeroFatura, setMostrarModalNumeroFatura] = useState(false);
    const [mostrarModalValorIva, setMostrarModalValorIva] = useState(false);


    const rotateValue = useRef(new Animated.Value(0)).current;

    const [loadingCategorias, setLoadingCategorias] = useState(true);

    const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    type NavigationProps = StackNavigationProp<RootStackParamList, 'PaginaSucesso'>;
    const navigation = useNavigation<NavigationProps>();

    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [emissorEditado, setEmissorEditado] = useState<string | null>(null);
    const [numLinhasNumeroFatura, setNumLinhasNumeroFatura] = useState(1);
    const [mostrarModalCamera, setMostrarModalCamera] = useState(false);

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


    const camposPreenchidos = () => {
        return (
            numeroFatura.trim() !== '' &&
            atcud.trim() !== '' &&
            emissor.trim() !== '' &&
            nifEstabelecimento.trim() !== '' &&
            dataFatura.trim() !== '' &&
            (categoriaSelecionada !== null || subcategoriaSelecionada !== null) &&
            valorIva.trim() !== '' &&
            valor.trim() !== '' &&
            (uriFotoCapturada !== null || uri !== null)
        );
    };








    useEffect(() => {
        if (visivel) {
            setNota('');
            setCategoriaSelecionada(null);
            setCategoriaSelecionadaId(null);
            setSubcategoriaSelecionada(null);
            setSubcategoriaSelecionadaId(null);

            setEmissorEditado(null);

        }
    }, [visivel]);



    useEffect(() => {
        const carregarCategoriasESubcategorias = async () => {
            setLoadingCategorias(true);
            const listaCat = await listarCategoriasComTipo();
            const listaSub = await listarSubCategorias();
            if (listaCat) setCategorias(listaCat);
            if (listaSub) setSubcategorias(listaSub);
            setLoadingCategorias(false);
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

    const validarData = (data: string) => {
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        return regex.test(data);
    };



    function formatarDataParaBD(data: string) {
        const partes = data.split('/');
        if (partes.length !== 3) return data; // fallback se não estiver no formato esperado
        const [dia, mes, ano] = partes;
        return `${ano}-${mes}-${dia}`;
    }

    const resetarCampos = () => {
        setNota('');
        setCategoriaSelecionada(null);
        setCategoriaSelecionadaId(null);
        setSubcategoriaSelecionada(null);
        setSubcategoriaSelecionadaId(null);

        setEmissor('');
        setContribuinte('');
        setDataFatura('');
        setValor('');
        setNifEstabelecimento('');
        setNumeroFatura('');
        setValorIva('');
        setAtcud('');
        setUriFotoCapturada(null);

        // Também reseta os temporários:
        setEmissorTemp('');
        setContribuinteTemp('');
        setDataFaturaTemp('');
        setValorTemp('');
        setNifEstabelecimentoTemp('');
        setNumeroFaturaTemp('');
        setValorIvaTemp('');
        setAtcudTemp('');
    };

    return (
        <Modal isVisible={visivel} onBackdropPress={aoFechar} style={{ justifyContent: 'flex-end', margin: 0 }}>
            <View style={[
                styles.modalContainer,
                { minHeight: numLinhasNumeroFatura > 1 ? height * 0.90 : height * 0.87 }
            ]}>


                <View style={styles.backgroundSvg}>
                    <FundoSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                </View>
                <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                    {loadingCategorias ? (
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


                    ) : (
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.content}>

                                {/* SVG como fundo absoluto */}

                                <View style={styles.tituloBox}>
                                    <InfoIcon width={22} height={22} style={styles.iconeInfo} />
                                    <Text style={styles.tituloTexto}>Preencher Fatura</Text>
                                </View>
                                <View style={styles.linhaHorizontal}>
                                    <View
                                        style={styles.info_container}
                                        onLayout={(event) => {
                                            const { height } = event.nativeEvent.layout;
                                            setAlturaInfo(height);
                                        }}
                                    >
                                        {/* NUMERO FATURA */}
                                        <View style={styles.linhaInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.label}>Número da Fatura:</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setNumeroFaturaTemp(numeroFatura); // copia o valor atual
                                                        setMostrarModalNumeroFatura(true); // abre o modal
                                                    }}
                                                    style={{ marginLeft: 6 }}
                                                >
                                                    <Icon_editar width={25} height={25} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setNumeroFaturaTemp(numeroFatura);
                                                    setMostrarModalNumeroFatura(true);
                                                }}
                                            >
                                                <Text
                                                    style={styles.valor}
                                                    onTextLayout={(event) => {
                                                        const linhas = event.nativeEvent.lines.length;
                                                        setNumLinhasNumeroFatura(linhas);
                                                    }}
                                                >
                                                    {numeroFatura || '---'}
                                                </Text>
                                            </TouchableOpacity>



                                        </View>
                                        {/* ATCU*/}
                                        <View style={styles.linhaInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.label}>Código ATCUD:</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setAtcudTemp(atcud);
                                                        setMostrarModalAtcud(true);
                                                    }}
                                                    style={{ marginLeft: 6 }}
                                                >
                                                    <Icon_editar width={25} height={25} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setAtcudTemp(atcud);
                                                    setMostrarModalAtcud(true);
                                                }}
                                            >
                                                <Text style={styles.valor}>{atcud || '---'}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Estabelecimento */}
                                        <View style={styles.linhaInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.label}>Estabelecimento:</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setEmissorTemp(emissor);
                                                        setMostrarModalEstabelecimento(true);
                                                    }}
                                                    style={{ marginLeft: 6 }}
                                                >
                                                    <Icon_editar width={25} height={25} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setEmissorTemp(emissor);
                                                    setMostrarModalEstabelecimento(true);
                                                }}
                                            >
                                                <Text style={styles.valor}>{emissor || '---'}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.linhaInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.label}>NIF de Emissor:</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setNifEstabelecimentoTemp(nifEstabelecimento);
                                                        setMostrarModalNifEstabelecimento(true);
                                                    }}
                                                    style={{ marginLeft: 6 }}
                                                >
                                                    <Icon_editar width={25} height={25} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setNifEstabelecimentoTemp(nifEstabelecimento);
                                                    setMostrarModalNifEstabelecimento(true);
                                                }}
                                            >
                                                <Text style={styles.valor}>{nifEstabelecimento || '---'}</Text>
                                            </TouchableOpacity>
                                        </View>


                                        {/* Contribuinte */}
                                        <View style={styles.linhaInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.label}>Nº de Contribuinte:</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setContribuinteTemp(contribuinte);
                                                        setMostrarModalContribuinte(true);
                                                    }}
                                                    style={{ marginLeft: 6 }}
                                                >
                                                    <Icon_editar width={25} height={25} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setContribuinteTemp(contribuinte);
                                                    setMostrarModalContribuinte(true);
                                                }}
                                            >
                                                <Text style={styles.valor}>{contribuinte || '---'}</Text>
                                            </TouchableOpacity>
                                        </View>



                                        {/* Data da fatura */}

                                        <View style={styles.linhaInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.label}>Data:</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setDataFaturaTemp(dataFatura);
                                                        setMostrarModalData(true);
                                                    }}
                                                    style={{ marginLeft: 6 }}
                                                >
                                                    <Icon_editar width={25} height={25} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setDataFaturaTemp(dataFatura);
                                                    setMostrarModalData(true);
                                                }}
                                            >
                                                <Text style={styles.valor}>{dataFatura || '---'}</Text>
                                            </TouchableOpacity>
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

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            {/* Valor do IVA */}
                                            <View style={[styles.linhaInfo, { flex: 1, minWidth: '50%' }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                    <Text style={styles.label}>IVA:</Text>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setValorIvaTemp(valorIva);
                                                            setMostrarModalValorIva(true);
                                                        }}
                                                        style={{ marginLeft: 6 }}
                                                    >
                                                        <Icon_editar width={25} height={25} />
                                                    </TouchableOpacity>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setValorIvaTemp(valorIva);
                                                        setMostrarModalValorIva(true);
                                                    }}
                                                >
                                                    <Text style={styles.valor}>
                                                        {valorIva ? `${parseFloat(valorIva).toFixed(2)} ${moeda.simbolo}` : '---'}
                                                    </Text>
                                                </TouchableOpacity>

                                            </View>

                                            {/* Valor */}
                                            <View style={[styles.linhaInfo, { flex: 1, minWidth: '50%', marginLeft: 15 }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                    <Text style={styles.label}>Total:</Text>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setValorTemp(valor);
                                                            setMostrarModalValor(true);
                                                        }}
                                                        style={{ marginLeft: 6 }}
                                                    >
                                                        <Icon_editar width={25} height={25} />
                                                    </TouchableOpacity>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setValorTemp(valor);
                                                        setMostrarModalValor(true);
                                                    }}
                                                >
                                                    <Text style={styles.valor}>
                                                        {valor ? `${parseFloat(valor).toFixed(2)} ${moeda.simbolo}` : '---'}
                                                    </Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>



                                    </View>


                                    {(uriFotoCapturada || uri) ? (
                                        <TouchableOpacity onPress={() => setImagemAmpliada(true)}>
                                            <Image
                                                source={{ uri: uriFotoCapturada ?? uri! }}
                                                style={[styles.image, { height: height * 0.49 }]}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.imagePlaceholder, { height: height * 0.49 }]}
                                            onPress={() => {
                                                if (onAbrirCameraManual) {
                                                    onAbrirCameraManual();  // 👈 sinaliza para pausar a câmara
                                                }
                                                setMostrarModalCamera(true);  // abre o modal da câmara normalmente
                                            }}
                                        >
                                            <MaterialIcons name="photo-camera" size={40} color="#aaa" />
                                        </TouchableOpacity>

                                    )}






                                </View>
                                <View style={[styles.caixaNotas, { height: width * 0.20 }]}>

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
                                            resetarCampos();
                                            aoFechar();
                                            aoEliminar();
                                        }}
                                    >
                                        <LixoIcon width={18} height={18} style={styles.iconeBotao} />
                                        <Text style={styles.txtBotao}>Eliminar</Text>
                                    </TouchableOpacity>



                                    <TouchableOpacity
                                        style={[
                                            styles.btnGuardar,
                                            !camposPreenchidos() && { opacity: 0.5 }
                                        ]}
                                        disabled={!camposPreenchidos()}
                                        onPress={() => {
                                            Keyboard.dismiss();

                                            if (!categoriaSelecionada && !subcategoriaSelecionada) {
                                                console.log('❌ Deve selecionar uma categoria ou subcategoria.');
                                                return;
                                            }


                                            console.log('✅ Nota guardada:', nota);
                                            aoFechar()
                                            setTimeout(() => {
                                                navigation.navigate('PaginaSucessoManual', {
                                                    categoriaId: categoriaSelecionada?.id ?? null,
                                                    subcategoriaId: subcategoriaSelecionada?.id ?? null,
                                                    nota: nota || null,
                                                    numeroFatura: numeroFatura,
                                                    codigoATCUD: atcud,
                                                    dataFatura: formatarDataParaBD(dataFatura),
                                                    nifEmitente: nifEstabelecimento,
                                                    nomeEmpresa: emissor,
                                                    nifCliente: null,
                                                    totalIva: valorIva,
                                                    valorTotal: valor,
                                                    imagemUri: uriFotoCapturada ?? null,
                                                });



                                            }, 300);
                                        }}
                                    >
                                        <CheckIcon width={18} height={18} style={styles.iconeBotao} />
                                        <Text style={styles.txtBotao}>Guardar</Text>
                                    </TouchableOpacity>


                                </View>


                            </View>
                        </TouchableWithoutFeedback>
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


            <Modal isVisible={mostrarModalEstabelecimento} onBackButtonPress={() => setMostrarModalEstabelecimento(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir Estabelecimento</Text>
                    <TextInput
                        value={emissorTemp}
                        onChangeText={setEmissorTemp}
                        placeholder="Digite o nome"
                        style={styles.inputModal}
                        maxLength={15}
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalEstabelecimento(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setEmissor(emissorTemp);
                                setMostrarModalEstabelecimento(false);
                                console.log('✅ Estabelecimento salvo:', emissorTemp);
                            }}
                            style={styles.botaoGuardar}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal isVisible={mostrarModalContribuinte} onBackButtonPress={() => setMostrarModalContribuinte(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir Nº de Contribuinte</Text>
                    <TextInput
                        value={contribuinteTemp}
                        onChangeText={setContribuinteTemp}
                        placeholder="Digite o NIF"
                        style={styles.inputModal}
                        keyboardType="number-pad"
                        maxLength={9}
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalContribuinte(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setContribuinte(contribuinteTemp);
                                setMostrarModalContribuinte(false);
                                console.log('✅ Contribuinte salvo:', contribuinteTemp);
                            }}
                            style={styles.botaoGuardar}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal isVisible={mostrarModalData} onBackButtonPress={() => setMostrarModalData(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir Data</Text>
                    <TextInput
                        value={dataFaturaTemp}
                        onChangeText={(text) => {
                            let cleaned = text.replace(/[^0-9]/g, '');
                            if (cleaned.length > 2 && cleaned.length <= 4) {
                                cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                            } else if (cleaned.length > 4) {
                                cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
                            }
                            if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
                            setDataFaturaTemp(cleaned);
                        }}
                        placeholder="dd/mm/aaaa"
                        style={styles.inputModal}
                        keyboardType="number-pad"
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalData(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setDataFatura(dataFaturaTemp);
                                setMostrarModalData(false);
                                console.log('✅ Data salva:', dataFaturaTemp);
                            }}
                            style={[
                                styles.botaoGuardar,
                                !validarData(dataFaturaTemp) && { opacity: 0.5 }
                            ]}
                            disabled={!validarData(dataFaturaTemp)}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>


            <Modal isVisible={mostrarModalValor} onBackButtonPress={() => setMostrarModalValor(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir Valor</Text>
                    <TextInput
                        value={valorTemp}
                        onChangeText={setValorTemp}
                        placeholder="0.00"
                        style={styles.inputModal}
                        keyboardType="decimal-pad"
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalValor(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setValor(valorTemp);
                                setMostrarModalValor(false);

                            }}
                            style={styles.botaoGuardar}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal isVisible={mostrarModalNifEstabelecimento} onBackButtonPress={() => setMostrarModalNifEstabelecimento(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir NIF do Estabelecimento</Text>
                    <TextInput
                        value={nifEstabelecimentoTemp}
                        onChangeText={setNifEstabelecimentoTemp}
                        placeholder="Digite o NIF"
                        style={styles.inputModal}
                        keyboardType="number-pad"
                        maxLength={9}
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalNifEstabelecimento(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setNifEstabelecimento(nifEstabelecimentoTemp);
                                setMostrarModalNifEstabelecimento(false);

                            }}
                            style={styles.botaoGuardar}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal isVisible={mostrarModalNumeroFatura} onBackButtonPress={() => setMostrarModalNumeroFatura(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir Número da Fatura</Text>
                    <TextInput
                        value={numeroFaturaTemp}
                        onChangeText={setNumeroFaturaTemp}
                        placeholder="FS 00000000000000/000000"
                        style={styles.inputModal}
                        maxLength={24}
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalNumeroFatura(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setNumeroFatura(numeroFaturaTemp);
                                setMostrarModalNumeroFatura(false);

                            }}
                            style={styles.botaoGuardar}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            <Modal isVisible={mostrarModalValorIva} onBackButtonPress={() => setMostrarModalValorIva(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir Valor do IVA</Text>
                    <TextInput
                        value={valorIvaTemp}
                        onChangeText={setValorIvaTemp}
                        placeholder="0.00"
                        style={styles.inputModal}
                        keyboardType="decimal-pad"
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalValorIva(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setValorIva(valorIvaTemp);
                                setMostrarModalValorIva(false);

                            }}
                            style={styles.botaoGuardar}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal isVisible={mostrarModalAtcud} onBackButtonPress={() => setMostrarModalAtcud(false)}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 19, marginBottom: 10, color: '#164878' }}>Inserir Numero ATCUD</Text>
                    <TextInput
                        value={atcudTemp}
                        onChangeText={setAtcudTemp}
                        placeholder="AAAAAAAA-000000"
                        style={styles.inputModal}
                        maxLength={25}
                    />
                    <View style={styles.botoesModal}>
                        <TouchableOpacity
                            onPress={() => setMostrarModalAtcud(false)}
                            style={styles.botaoCancelar}
                        >
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setAtcud(atcudTemp);
                                setMostrarModalAtcud(false);

                            }}
                            style={styles.botaoGuardar}
                        >
                            <Text style={styles.textoBotao}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ModalCameraCheia
                visivel={mostrarModalCamera}
                aoFechar={() => {
                    setMostrarModalCamera(false);

                }}
                onFotoCapturada={(uriFoto) => {

                    setUriFotoCapturada(uriFoto);
                }}
            />


            {(uriFotoCapturada || uri) && (
                <Modal isVisible={imagemAmpliada} onBackdropPress={() => setImagemAmpliada(false)} style={{ margin: 0 }}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity style={styles.closeFullscreen} onPress={() => setImagemAmpliada(false)}>
                            <Text style={{ color: 'white', fontSize: 24, zIndex: 10 }}>✕</Text>
                        </TouchableOpacity>

                        <ImageViewer
                            imageUrls={[{ url: (uriFotoCapturada ?? uri)! }]}
                            enableSwipeDown
                            onSwipeDown={() => setImagemAmpliada(false)}
                            renderIndicator={() => <></>}
                            backgroundColor="black"
                        />
                    </View>
                </Modal>
            )}



        </Modal >




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
        marginBottom: 1,
        marginTop: 4,
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
        alignItems: 'stretch',
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
    inputModal: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: 16,
    },
    botoesModal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 30,
    },
    botaoCancelar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E76A5A',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 50,
    },
    textoBotao: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    imagePlaceholder: {
        width: width * 0.34,
        alignSelf: 'stretch',
        borderRadius: 10,
        marginRight: 10,
        marginTop: 10,
        backgroundColor: '#E0E0E0', // cinza clarinho
        justifyContent: 'center',
        alignItems: 'center',
    },



    botaoGuardar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#164878',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 50,
    },







});

export default Modal_Info_Fatura_Preencher;
