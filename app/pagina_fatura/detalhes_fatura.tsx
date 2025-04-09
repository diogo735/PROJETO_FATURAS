// detalhes_fatura.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageSourcePropType } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { scale } from 'react-native-size-matters';
const { height, width } = Dimensions.get('window');
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { consultarFatura } from '../../BASEDEDADOS/faturas';
import { obterCategoriaPorMovimentoId } from '../../BASEDEDADOS/movimentos';
import CalendarioIcon from '../../assets/icons/pagina_fatura/calendario.svg';
import DecumetnoIcon from '../../assets/icons/pagina_fatura/ndecumento.svg';
import Nota from '../../assets/icons/pagina_fatura/nota.svg';
import Dados from '../../assets/icons/pagina_fatura/dados.svg';
import Pagamento from '../../assets/icons/pagina_fatura/pagamento.svg';
import Empresa from '../../assets/icons/pagina_fatura/empresa.svg';
import AnexoIcon from '../../assets/icons/pagina_fatura/imagem.svg';
type FaturaRouteProp = RouteProp<RootStackParamList, 'Fatura'>;
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';


interface Props {
    route: FaturaRouteProp;
}
interface Fatura {
    id: number;
    movimento_id: number;
    tipo_documento: string;
    numero_fatura: string;
    data_fatura: string;
    nif_emitente: string;
    nome_empresa: string | null;
    nif_cliente: string | null;
    descricao: string | null;
    total_iva: number;
    total_final: number;
    imagem_fatura: string | null;
}
function obterImagemCategoria(img_cat: string): ImageSourcePropType {
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
const DetalhesFatura: React.FC<Props> = ({ route }) => {
    const { id } = route.params;
    const [fatura, setFatura] = useState<Fatura | null>(null);
    const [categoriaInfo, setCategoriaInfo] = useState<{ nome_categoria: string, icone_categoria: string } | null>(null);

    const navigation = useNavigation();
    const textoVat = fatura?.nif_emitente ? `NIF: PT${fatura.nif_emitente}` : 'NIF: ---';
    const [imagemAmpliada, setImagemAmpliada] = useState(false);

    useEffect(() => {
        async function carregarFatura() {
            const dados = await consultarFatura(id);
            setFatura(dados);
            // console.log('🧾 Fatura carregada:', dados);

            try {
                const categoria = await obterCategoriaPorMovimentoId(dados.movimento_id);
                setCategoriaInfo(categoria);
            } catch (error) {
                console.error('❌ Erro ao obter categoria do movimento:', error);
            }


        }

        carregarFatura();
    }, [id]);
    function formatarData(data: string | undefined) {
        if (!data) return '---';

        const [ano, mes, dia] = data.split('-');
        const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

        return `${dia} ${meses[parseInt(mes, 10) - 1]}, ${ano}`;
    }
    function formatarContribuinte(nif?: string | null): string {
        if (!nif || ['999999990', '999999999', '000000000'].includes(nif)) {
            return 'Sem NIF';
        }
        return `NIF: ${nif}`;
    }

    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalhes da Fatura</Text>
                </View>

                <TouchableOpacity onPress={() => console.log('Mais opções')}>
                    <MaterialIcons name="more-vert" size={scale(24)} color="#fff" />
                </TouchableOpacity>
            </View>


            <View style={styles.main}>
                <View style={styles.container2}>
                    <Image
                        source={require('../../assets/icons/pagina_fatura/fundo.png')}
                        style={styles.imagemCentral}
                        resizeMode="stretch"
                    />


                    {/* Conteúdo por cima do fundo */}
                    <View style={styles.conteudo}>
                        <View style={styles.topoLinha}>
                            {fatura && (
                                <Text style={styles.textoTipoDoc}>{fatura.tipo_documento}</Text>
                            )}

                            {categoriaInfo && (
                                <View style={styles.etiquetaCategoria}>
                                    <Image
                                        source={obterImagemCategoria(categoriaInfo.icone_categoria)}
                                        style={styles.iconeCategoria}
                                    />
                                    <Text style={styles.textoCategoria}>{categoriaInfo.nome_categoria}</Text>
                                </View>
                            )}



                        </View>
                        {/* DATAAAA */}
                        <View style={styles.bloco}>
                            <View style={styles.linhaTitulo}>
                                <CalendarioIcon width={18} height={18} style={styles.icone} />

                                <Text style={styles.titulo}>Data</Text>
                            </View>
                            <Text style={styles.valor}>{formatarData(fatura?.data_fatura)}</Text>
                        </View>

                        <View style={styles.linhaSeparadora} />

                        {/* NUMER DE DECUMENTO */}
                        <View style={styles.bloco}>

                            <View style={styles.linhaTitulo}>
                                <DecumetnoIcon width={18} height={18} style={styles.icone} />

                                <Text style={styles.titulo}>Nº Decumento</Text>
                            </View>
                            <Text style={styles.valor}>{fatura?.numero_fatura}</Text>
                        </View>

                        <View style={styles.linhaSeparadora} />

                        {/* DESCRIÇÃO */}
                        <View style={styles.bloco}>

                            <View style={styles.linhaTitulo}>
                                <Nota width={18} height={18} style={styles.icone} />

                                <Text style={styles.titulo}>Descrição</Text>
                            </View>
                            <Text style={styles.valor}>{fatura?.descricao || 'Sem descrição'}</Text>
                        </View>

                        <View style={styles.linhaSeparadora} />

                        {/* empresa */}
                        <View style={styles.empresaContainer}>

                            <Empresa width={50} height={50} />


                            <View>
                                <Text style={styles.nomeEmpresa}>
                                    {(fatura?.nome_empresa && fatura?.nome_empresa !== fatura?.nif_emitente)
                                        ? fatura.nome_empresa
                                        : 'Empresa Privada'}
                                </Text>

                                <Text style={styles.vat}>{textoVat}</Text>

                            </View>
                        </View>


                        <View style={styles.linhaSeparadora} />

                        {/* CLIENTE*/}
                        <View style={styles.bloco}>

                            <View style={styles.linhaTitulo}>
                                <Dados width={18} height={18} style={styles.icone} />

                                <Text style={styles.titulo}>Dados</Text>
                            </View>
                            <Text style={styles.valor}>
                                {formatarContribuinte(fatura?.nif_cliente)}
                            </Text>


                        </View>
                        <View style={styles.linhaSeparadora} />

                        {/*VALOR */}
                        <View style={styles.bloco}>
                            <View style={styles.linhaTitulo}>
                                <Pagamento width={18} height={18} style={styles.icone} />
                                <Text style={styles.titulo}>Pagamento</Text>
                            </View>

                            <View style={styles.pagamentoLinha}>
                                <Text style={styles.labelPagamento}>Subtotal</Text>
                                <Text style={styles.valorPagamento}>{(fatura?.total_final! - fatura?.total_iva!).toFixed(2)}€</Text>
                            </View>

                            <View style={styles.pagamentoLinha}>
                                <Text style={styles.labelPagamento}>IVA (23%)</Text>
                                <Text style={styles.valorPagamento}>{fatura?.total_iva.toFixed(2)}€</Text>
                            </View>

                            <View style={styles.pagamentoLinha}>
                                <Text style={styles.labelTotal}>Total</Text>
                                <Text style={styles.valorTotal}>{fatura?.total_final.toFixed(2)}€</Text>
                            </View>
                        </View>



                    </View>


                </View>
            </View>
            <View style={styles.footer}>

                <TouchableOpacity
                    style={styles.botaoAnexo}
                    onPress={() => {
                        console.log('✅ Botão Ver Anexo clicado');
                        setImagemAmpliada(true);
                    }}
                >

                    <View style={styles.conteudoBotaoAnexo}>
                        <AnexoIcon width={18} height={18} />
                        <Text style={styles.textoAnexo}>Ver anexo fatura</Text>
                    </View>
                </TouchableOpacity>

            </View>
            {fatura?.imagem_fatura && (
                <Modal
                    isVisible={imagemAmpliada}
                    onBackdropPress={() => setImagemAmpliada(false)}
                    style={{ margin: 0 }}
                >
                    <View style={{ flex: 1, backgroundColor: 'black' }}>
                        <TouchableOpacity
                            style={styles.closeFullscreen}
                            onPress={() => setImagemAmpliada(false)}
                        >
                            <View style={styles.bolhaFechar}>
                                <Text style={styles.txtFechar}>✕</Text>
                            </View>
                        </TouchableOpacity>


                        <ImageViewer
                            imageUrls={[{ url: fatura.imagem_fatura }]}
                            enableSwipeDown
                            onSwipeDown={() => setImagemAmpliada(false)}
                            renderIndicator={() => <></>}
                            backgroundColor="black"
                        />
                    </View>
                </Modal>
            )}



        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: 'green',
    },

    container2: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
        position: 'relative',
        //backgroundColor: 'red',
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginLeft: 15
    },
    imagemCentral: {
        position: 'absolute',
        top: 5,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    conteudo: {
        zIndex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '85%',
        top: -15,
        height: height * 0.70,
        // backgroundColor: '#F2F2F2',
        flexDirection: 'column'


    },
    topoLinha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 5,
        marginTop: 5,
    },

    textoTipoDoc: {
        fontSize: 14,
        fontWeight: '400',
        color: '#5A7D9A',
    },

    etiquetaCategoria: {
        flexDirection: 'row',
        backgroundColor: '#2565A3',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        alignItems: 'center',
    },

    iconeCategoria: {
        width: 16,
        height: 16,
        marginRight: 6,
    },

    textoCategoria: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    bloco: {
        marginVertical: 15,
        alignSelf: 'flex-start',
        paddingHorizontal: 10
    },

    linhaTitulo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    icone: {
        width: 16,
        height: 16,
        marginRight: 8,
    },

    titulo: {
        color: '#2565A3',
        fontWeight: 'bold',
        fontSize: 17,
    },

    valor: {
        fontSize: 13,
        color: '#698B9C',
        marginLeft: 25,
    },
    linhaSeparadora: {
        width: '85%',
        height: 0.8,
        backgroundColor: '#D9D9D9',
        opacity: 0.7,
    },
    pagamentoLinha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginRight: 0,
        marginLeft: 25,
        marginBottom: 4,
    },

    labelPagamento: {
        fontSize: 14,
        color: '#A0AEB9',
        fontWeight: '400',
    },

    valorPagamento: {
        fontSize: 14,
        color: '#A0AEB9',
        fontWeight: '400',
    },

    labelTotal: {
        fontSize: 18,
        fontWeight: '900',
        color: '#2565A3',
        marginTop: 4,
    },

    valorTotal: {
        fontSize: 18,
        fontWeight: '900',
        color: '#2565A3',
        marginTop: 4,
    },

    empresaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 15,
        alignSelf: 'flex-start',
        paddingHorizontal: 10
    },

    iconeFundo: {
        width: 40,
        height: 40,
        backgroundColor: '#EDEFF2',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    nomeEmpresa: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2565A3',
    },

    vat: {
        fontSize: 14,
        color: '#7C9CBF',
        marginTop: 2,
    },
    botaoAnexo: {
        borderWidth: 1.5,
        borderColor: '#2565A3',
        borderRadius: 19,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        width: '88%',
        marginTop: 0,
    },

    conteudoBotaoAnexo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    iconeAnexo: {
        color: '#2565A3',
    },

    textoAnexo: {
        fontSize: 16,
        color: '#2565A3',
        fontWeight: '600',
        //textDecorationLine: 'underline',
    },
    footer: {
        paddingBottom: 10,
        borderColor: '#E3E3E3',
        // backgroundColor: 'red',
        alignItems: 'center',
    },
    closeFullscreen: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    bolhaFechar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      
      txtFechar: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
      },
      

});

export default DetalhesFatura;
