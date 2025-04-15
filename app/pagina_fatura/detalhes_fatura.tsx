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
import { atualizarMovimentoPorFatura } from '../../BASEDEDADOS/faturas';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalOpcoesFatura from './componentes/modal_opcoes_fatura';
import ModalEditarFatura from './componentes/modal_opçoes_editar';
import { buscarCategoriaPorId } from '../../BASEDEDADOS/categorias';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type FaturaRouteProp = RouteProp<RootStackParamList, 'Fatura'>;
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


async function converterImagemParaBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();

        return await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result?.toString() || null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Erro ao converter imagem:", error);
        return null;
    }
}

const DetalhesFatura: React.FC<Props> = ({ route }) => {
    const { id } = route.params;
    const [fatura, setFatura] = useState<Fatura | null>(null);
    const [categoriaInfo, setCategoriaInfo] = useState<{
        id: number;
        nome_categoria: string;
        cor_categoria: string;
        icone_categoria: string;
    } | null>(null);

    const navigation = useNavigation();
    const textoVat = fatura?.nif_emitente ? `NIF: PT${fatura.nif_emitente}` : 'NIF: ---';
    const [imagemAmpliada, setImagemAmpliada] = useState(false);

    const [mostrarModalOpcoes, setMostrarModalOpcoes] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
    const [mostrarModalDownload, setMostrarModalDownload] = useState(false);

    const editarFatura = () => {
        if (!categoriaInfo) {
            console.warn('⚠️ Categoria ainda não carregada, não pode abrir o modal!');
            return;
        }

        setMostrarModalOpcoes(false);
        setMostrarModalEditar(true);
    };

    const partilharFatura = async () => {
        if (!fatura) return;
        const nomeSeguro = `Fatura_${fatura.numero_fatura.replace(/[\\/:"*?<>|]/g, "_")}.pdf`;
        let imagemBase64 = '';
        if (fatura.imagem_fatura) {
            const base64 = await converterImagemParaBase64(fatura.imagem_fatura);
            if (base64) {
                imagemBase64 = `
            <div style="page-break-before: always; padding: 40px; text-align: center;">
              <h2 style="color: #2565A3; font-family: Arial;">Foto capturada da fatura:</h2>
              <img src="${base64}" style="margin-top: 20px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
          `;
            }
        }

        const html = `
            <html>
                <head>
                <meta charset="utf-8" />
                <style>
                    body {
                    font-family: Arial, sans-serif;
                    padding: 40px 40px;
                    background-color: #F5F7FB;
                    }
                    .card {
                    background: white;
                    border-radius: 14px;
                    padding: 40px;
                    max-width: 100%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    }
                    .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    }
                    .tipo-doc {
                    font-size: 18px;
                    color: #5A7D9A;
                    }
                    .categoria {
                    background-color: #2565A3;
                    color: white;
                    padding: 8px 18px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    }
                    .bloco {
                    margin-bottom: 28px;
                    }
                    .titulo {
                    font-size: 20px;
                    color: #2565A3;
                    font-weight: bold;
                    margin-bottom: 10px;
                    }
                    .valor {
                    font-size: 17px;
                    color: #698B9C;
                    }
                    .linha {
                    height: 1px;
                    background-color: #D9D9D9;
                    margin: 25px 0;
                    }
                    .empresa {
                    font-size: 19px;
                    font-weight: bold;
                    color: #2565A3;
                    }
                    .vat {
                    font-size: 17px;
                    color: #7C9CBF;
                    }
                    .pagamento {
                    font-size: 18px;
                    color: #A0AEB9;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    }
                    .total {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2565A3;
                    display: flex;
                    justify-content: space-between;
                    margin-top: 18px;
                    }
                </style>
                </head>
                <body>
                <div class="card">
                    <div class="header">
                    <div class="tipo-doc">${fatura.tipo_documento}</div>
                    <div class="categoria">${categoriaInfo?.nome_categoria ?? '---'}</div>
                    </div>

                    <div class="bloco">
                    <div class="titulo">Data</div>
                    <div class="valor">${formatarData(fatura.data_fatura)}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Nº Documento</div>
                    <div class="valor">${fatura.numero_fatura}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Descrição</div>
                    <div class="valor">${fatura.descricao || 'Sem descrição'}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Empresa</div>
                    <div class="empresa">${fatura.nome_empresa || 'Empresa Privada'}</div>
                    <div class="vat">NIF: PT${fatura.nif_emitente || '---'}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Dados</div>
                    <div class="valor">${formatarContribuinte(fatura.nif_cliente)}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Pagamento</div>
                    <div class="pagamento"><span>Subtotal</span><span>${(fatura.total_final - fatura.total_iva).toFixed(2)}€</span></div>
                    <div class="pagamento"><span>IVA (23%)</span><span>${fatura.total_iva.toFixed(2)}€</span></div>
                    <div class="total"><span>Total</span><span>${fatura.total_final.toFixed(2)}€</span></div>
                    </div>
                </div>
                ${imagemBase64}
                </body>
            </html>
            `;



        try {
            const { uri: originalUri } = await Print.printToFileAsync({ html });

            const novoCaminho = FileSystem.documentDirectory + nomeSeguro;

            await FileSystem.moveAsync({
                from: originalUri,
                to: novoCaminho,
            });

            console.log('📄 PDF criado em:', novoCaminho);
            await Sharing.shareAsync(novoCaminho);
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
        }

        setMostrarModalOpcoes(false);
    };



    const downloadPDF = async () => {
        if (!fatura) return;

        const nomeSeguro = `Fatura_${fatura.numero_fatura.replace(/[\\/:"*?<>|]/g, "_")}.pdf`;
        let imagemBase64 = '';
        if (fatura.imagem_fatura) {
            const base64 = await converterImagemParaBase64(fatura.imagem_fatura);
            if (base64) {
                imagemBase64 = `
            <div style="page-break-before: always; padding: 40px; text-align: center;">
              <h2 style="color: #2565A3; font-family: Arial;">Foto capturada da fatura:</h2>
              <img src="${base64}" style="margin-top: 20px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
          `;
            }
        }

        const html = `
            <html>
                <head>
                <meta charset="utf-8" />
                <style>
                    body {
                    font-family: Arial, sans-serif;
                    padding: 40px 40px;
                    background-color: #F5F7FB;
                    }
                    .card {
                    background: white;
                    border-radius: 14px;
                    padding: 40px;
                    max-width: 100%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    }
                    .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    }
                    .tipo-doc {
                    font-size: 18px;
                    color: #5A7D9A;
                    }
                    .categoria {
                    background-color: #2565A3;
                    color: white;
                    padding: 8px 18px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    }
                    .bloco {
                    margin-bottom: 28px;
                    }
                    .titulo {
                    font-size: 20px;
                    color: #2565A3;
                    font-weight: bold;
                    margin-bottom: 10px;
                    }
                    .valor {
                    font-size: 17px;
                    color: #698B9C;
                    }
                    .linha {
                    height: 1px;
                    background-color: #D9D9D9;
                    margin: 25px 0;
                    }
                    .empresa {
                    font-size: 19px;
                    font-weight: bold;
                    color: #2565A3;
                    }
                    .vat {
                    font-size: 17px;
                    color: #7C9CBF;
                    }
                    .pagamento {
                    font-size: 18px;
                    color: #A0AEB9;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    }
                    .total {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2565A3;
                    display: flex;
                    justify-content: space-between;
                    margin-top: 18px;
                    }
                </style>
                </head>
                <body>
                <div class="card">
                    <div class="header">
                    <div class="tipo-doc">${fatura.tipo_documento}</div>
                    <div class="categoria">${categoriaInfo?.nome_categoria ?? '---'}</div>
                    </div>

                    <div class="bloco">
                    <div class="titulo">Data</div>
                    <div class="valor">${formatarData(fatura.data_fatura)}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Nº Documento</div>
                    <div class="valor">${fatura.numero_fatura}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Descrição</div>
                    <div class="valor">${fatura.descricao || 'Sem descrição'}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Empresa</div>
                    <div class="empresa">${fatura.nome_empresa || 'Empresa Privada'}</div>
                    <div class="vat">NIF: PT${fatura.nif_emitente || '---'}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Dados</div>
                    <div class="valor">${formatarContribuinte(fatura.nif_cliente)}</div>
                    </div>

                    <div class="linha"></div>

                    <div class="bloco">
                    <div class="titulo">Pagamento</div>
                    <div class="pagamento"><span>Subtotal</span><span>${(fatura.total_final - fatura.total_iva).toFixed(2)}€</span></div>
                    <div class="pagamento"><span>IVA (23%)</span><span>${fatura.total_iva.toFixed(2)}€</span></div>
                    <div class="total"><span>Total</span><span>${fatura.total_final.toFixed(2)}€</span></div>
                    </div>
                </div>
                ${imagemBase64}
                </body>
            </html>
            `; // tua parte HTML completa aqui

        try {
            // pede permissão de escrita
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Permissão para salvar arquivos',
                        message: 'O app precisa de acesso à memória para guardar o PDF da fatura.',
                        buttonPositive: 'OK',
                    }
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    alert('Permissão negada para salvar PDF');
                    return;
                }
            }

            const { uri: originalUri } = await Print.printToFileAsync({ html });

            const destinoFinal = `${RNFS.DownloadDirectoryPath}/${nomeSeguro}`;

            await RNFS.moveFile(originalUri.replace('file://', ''), destinoFinal);

            console.log('✅ PDF guardado em:', destinoFinal);
            setMostrarModalDownload(true);
        } catch (error) {
            console.error('❌ Erro ao guardar PDF:', error);
            alert('Erro ao guardar o PDF');
        }

        setMostrarModalOpcoes(false);
    };

    const guardarEdicao = async (novaDescricao: string, idFatura: number, novaCategoriaId: number) => {
        console.log('📝 Guardando alterações:', novaDescricao, novaCategoriaId);

        const sucesso = await atualizarMovimentoPorFatura(idFatura, novaDescricao, novaCategoriaId);

        if (sucesso) {
            console.log('✅ Movimento atualizado com sucesso!');
            const novaFatura = await consultarFatura(id);
            setFatura(novaFatura);
            setMostrarModalSucesso(true);
            try {
                const categoria = await obterCategoriaPorMovimentoId(novaFatura.movimento_id);
                if (categoria) {
                    const categoriaCompleta = await buscarCategoriaPorId(categoria.id_categoria);
                    if (categoriaCompleta) {
                        setCategoriaInfo({
                            id: categoriaCompleta.id,
                            nome_categoria: categoria.nome_categoria,
                            cor_categoria: categoriaCompleta.cor_cat,
                            icone_categoria: categoriaCompleta.img_cat,
                        });
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao atualizar categoria visual:', error);
            }
        }

        setMostrarModalEditar(false);

    };

    useEffect(() => {
        async function carregarFatura() {
            const dados = await consultarFatura(id);
            setFatura(dados);
            //console.log('🧾 Fatura carregada:', dados);

            try {
                const categoria = await obterCategoriaPorMovimentoId(dados.movimento_id);
                //console.log('🔎 categoria por movimento:', categoria);

                if (categoria) {
                    const categoriaCompleta = await buscarCategoriaPorId(categoria.id_categoria);
                    if (categoriaCompleta) {
                        setCategoriaInfo({
                            id: categoriaCompleta.id,
                            nome_categoria: categoria.nome_categoria,
                            cor_categoria: categoriaCompleta.cor_cat,
                            icone_categoria: categoriaCompleta.img_cat,
                        });
                    }
                };
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

                <TouchableOpacity style={styles.botaoRedondo} onPress={() => setMostrarModalOpcoes(true)}>
                    <MaterialIcons name="more-vert" size={scale(24)} color="#FFFFFF" />
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
                                <Text
                                    style={styles.nomeEmpresa}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
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
            <ModalOpcoesFatura
                visivel={mostrarModalOpcoes}
                aoFechar={() => setMostrarModalOpcoes(false)}
                onEditar={editarFatura}
                onDownloadPDF={downloadPDF}
                onPartilhar={partilharFatura}
            />
            {fatura && (
                <ModalEditarFatura
                    visivel={mostrarModalEditar}
                    aoFechar={() => setMostrarModalEditar(false)}
                    onGuardar={guardarEdicao}
                    idFatura={fatura.id}
                    descricaoInicial={fatura.descricao}
                    categoriaInicial={
                        categoriaInfo
                            ? {
                                id: categoriaInfo.id,
                                nome_cat: categoriaInfo.nome_categoria,
                                cor_cat: categoriaInfo.cor_categoria,
                                img_cat: categoriaInfo.icone_categoria,
                            }
                            : undefined
                    }
                />

            )}
            <Modal isVisible={mostrarModalSucesso} animationIn="zoomIn" animationOut="zoomOut" onBackdropPress={() => setMostrarModalSucesso(false)}>
                <View style={{
                    backgroundColor: 'white',
                    padding: 25,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <MaterialIcons name="check-circle" size={50} color="#50AF4A" />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 15, color: '#2565A3', textAlign: 'center' }}>
                        Fatura atualizada com sucesso!
                    </Text>
                    <TouchableOpacity
                        onPress={() => setMostrarModalSucesso(false)}
                        style={{
                            backgroundColor: '#2565A3',
                            borderRadius: 25,
                            paddingVertical: 10,
                            paddingHorizontal: 55,
                            alignSelf: 'center',
                            marginTop: 30,
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
                    </TouchableOpacity>

                </View>
            </Modal>
            <Modal
                isVisible={mostrarModalDownload}
                animationIn="zoomIn"
                animationOut="zoomOut"
                onBackdropPress={() => setMostrarModalDownload(false)}
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        padding: 25,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <MaterialIcons name="file-download-done" size={50} color="#2565A3" />
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginTop: 15,
                            color: '#2565A3',
                            textAlign: 'center',
                        }}
                    >
                        PDF guardado com sucesso!
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 14, color: '#5A7D9A', textAlign: 'center' }}>
                        O ficheiro foi guardado na pasta Downloads do dispositivo.
                    </Text>

                    <TouchableOpacity
                        onPress={() => setMostrarModalDownload(false)}
                        style={{
                            backgroundColor: '#2565A3',
                            borderRadius: 25,
                            paddingVertical: 10,
                            paddingHorizontal: 50,
                            alignSelf: 'center',
                            marginTop: 25,
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </Modal>








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
        top: 2,
        height: height * 0.77,
        // backgroundColor: 'red',
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
        flexShrink: 1,
        flexWrap: 'wrap',
        maxWidth: width * 0.40, // ajusta conforme o espaço disponível
        lineHeight: 14,
    },
    bloco: {
        marginVertical: 13,
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
        maxWidth: width * 0.65, // evita ultrapassar o container
        lineHeight: 20,
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
    botaoRedondo: {
        backgroundColor: 'transparent', // bolha branca translúcida
        borderRadius: 30,
        padding: 1,
        justifyContent: 'center',
        alignItems: 'center',

    }


});

export default DetalhesFatura;
