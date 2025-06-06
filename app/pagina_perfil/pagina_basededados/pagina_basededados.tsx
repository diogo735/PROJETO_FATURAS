import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList, Modal, Easing, ActivityIndicator } from 'react-native';
import { scale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('window');
import IconSync from '../../../assets/icons/Sync_branco.svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App'; // a
import {
    contarCategorias,
    contarSubCategorias,
    contarMetas,
    contarMovimentos,
    contarFaturas
} from '../../../BASEDEDADOS/database';

import { exportarFaturas } from '../pagina_sincronizacao/funcoes_exportar';
import ModalData from './modal_data'; // ajuste o caminho se necessário
import ModalFormato from './modal_formato';


const PaginaBasededados = () => {


    type NotificacaoNavigationProp = StackNavigationProp<RootStackParamList, 'PaginaBasededados'>;
    const navigation = useNavigation<NotificacaoNavigationProp>();
    type LinhaTabela = {
        nome: string;
        quantidade: number;
    };

    const [dadosTabelas, setDadosTabelas] = useState<LinhaTabela[]>([]);
    const [mostrarModalData, setMostrarModalData] = useState(false);
    const [opcaoPeriodo, setOpcaoPeriodo] = useState<'' | 'mes' | 'tres_meses' | 'ano' | 'historico'>('mes');
    const [rotuloPeriodo, setRotuloPeriodo] = useState('Este mês');
    const [mostrarModalFormato, setMostrarModalFormato] = useState(false);
    const [formatoSelecionado, setFormatoSelecionado] = useState<'csv' | 'excel'>('csv');
    const [exportando, setExportando] = useState(false);




    useEffect(() => {
        const carregarDados = async () => {
            const categorias = await contarCategorias();
            const subcategorias = await contarSubCategorias();
            const metas = await contarMetas();
            const movimentos = await contarMovimentos();
            const faturas = await contarFaturas();

            setDadosTabelas([
                { nome: 'Categorias', quantidade: categorias },
                { nome: 'Sub_Categorias', quantidade: subcategorias },
                { nome: 'Metas', quantidade: metas },
                { nome: 'Movimentos', quantidade: movimentos },
                { nome: 'Faturas', quantidade: faturas },
            ]);
        };

        carregarDados();
    }, []);

    function calcularIntervaloPorOpcao(opcao: 'mes' | 'tres_meses' | 'ano' | 'historico') {
        const hoje = new Date();
        let dataInicio: Date;
        const dataFim = new Date();

        if (opcao === 'mes') {
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        } else if (opcao === 'tres_meses') {
            dataInicio = new Date(hoje);
            dataInicio.setMonth(hoje.getMonth() - 3);
        } else if (opcao === 'ano') {
            dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
        } else {
            dataInicio = new Date(2000, 0, 1); // início arbitrário para "histórico"
        }

        return { dataInicio, dataFim };
    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Base de dados</Text>
                </View>

            </View>
            <View style={styles.body}>
                <View style={styles.content}>
                    <View style={styles.tabelaHeader}>
                        <Text style={[styles.colunaNome, styles.tituloColuna]}>Tabela</Text>
                        <Text style={[styles.colunaContador, styles.tituloColuna]}>Quantidade de dados</Text>

                    </View>

                    <FlatList
                        data={dadosTabelas}
                        keyExtractor={(item) => item.nome}
                        renderItem={({ item }) => (
                            <View style={styles.tabelaLinha}>
                                <Text style={styles.colunaNome}>{item.nome}</Text>
                                <Text style={styles.colunaContador}>{item.quantidade}</Text>
                            </View>
                        )}
                    />
                    <View style={{ marginTop: 30 }}>
                        <Text style={styles.tituloExportar}>Exportar</Text>

                        <TouchableOpacity
                            style={styles.botaoOpcao}
                            onPress={() => setMostrarModalData(true)}
                        >
                            <View style={styles.itemOpcao}>
                                <MaterialIcons name="calendar-today" size={20} color="#2565A3" />
                                <Text style={styles.labelOpcao}>Período</Text>
                            </View>
                            <View style={styles.valorOpcaoWrapper}>
                                <Text style={styles.valorOpcao}>{rotuloPeriodo}</Text>
                                <MaterialIcons name="chevron-right" size={20} color="#999" />
                            </View>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.botaoOpcao}
                            onPress={() => setMostrarModalFormato(true)}
                        >

                            <View style={styles.itemOpcao}>
                                <MaterialIcons name="insert-drive-file" size={20} color="#2565A3" />
                                <Text style={styles.labelOpcao}>Formato</Text>
                            </View>
                            <View style={styles.valorOpcaoWrapper}>
                                <Text style={styles.valorOpcao}>
                                    {formatoSelecionado === 'csv' ? 'CSV (.csv)' : 'Excel (.xlsx)'}
                                </Text>

                                <MaterialIcons name="chevron-right" size={20} color="#999" />
                            </View>
                        </TouchableOpacity>

                    </View>

                </View>


                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.botaoSincronizar}
                        onPress={async () => {
                            setExportando(true);
                            try {
                                const { dataInicio, dataFim } = calcularIntervaloPorOpcao(opcaoPeriodo as 'mes' | 'tres_meses' | 'ano' | 'historico');

                                await exportarFaturas({
                                    dataInicio: dataInicio.toISOString().split('T')[0],
                                    dataFim: dataFim.toISOString().split('T')[0],
                                    formato: formatoSelecionado,
                                });
                            } catch (e) {
                                console.error('Erro ao exportar:', e);
                            } finally {
                                setExportando(false);
                            }
                        }}

                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {exportando ? (
                                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                            ) : (
                                <MaterialIcons name="file-upload" size={20} color="#fff" style={{ marginRight: 10 }} />
                            )}
                            <Text style={styles.textoBotao}>
                                {exportando ? 'A exportar...' : 'Exportar dados'}
                            </Text>
                        </View>

                    </TouchableOpacity>

                </View>

            </View>
            <ModalData
                visivel={mostrarModalData}
                aoFechar={() => setMostrarModalData(false)}
                opcaoSelecionada={opcaoPeriodo}
                setOpcaoSelecionada={setOpcaoPeriodo}
                aoConfirmar={(inicio, fim, rotulo) => {
                    setRotuloPeriodo(rotulo);
                    // aqui você pode armazenar `inicio` e `fim` se quiser exportar depois
                }}
            />
            <ModalFormato
                visivel={mostrarModalFormato}
                aoFechar={() => setMostrarModalFormato(false)}
                opcaoSelecionada={formatoSelecionado}
                aoConfirmar={(formato) => {
                    setFormatoSelecionado(formato);
                }}
            />



        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    body: {
        flex: 1,
        justifyContent: 'space-between',
    },

    header: {
        backgroundColor: '#2565A3',
        height: height * 0.08,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
    },
    headerTitle: {
        color: 'white',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: scale(0.9),
        marginLeft: 15,
    },
    textoNegrito: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 20,
    },
    texto: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    content: {
        paddingHorizontal: '5%',
        marginVertical: '5%',
        justifyContent: 'flex-start',
    },
    footer: {
        paddingHorizontal: '5%',
        paddingVertical: 12,
        backgroundColor: '#FDFDFD',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },

    botaoSincronizar: {
        backgroundColor: '#2565A3',
        paddingVertical: 14,
        borderRadius: 33,
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoBotao: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    tabelaHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tabelaLinha: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    colunaNome: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    colunaContador: {
        flex: 1,
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    tituloColuna: {
        fontWeight: 'bold',
        color: '#2565A3',
    },
    tituloExportar: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2565A3',
        marginBottom: 10,
    },

    botaoOpcao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    itemOpcao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    labelOpcao: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2565A3',
    },

    valorOpcao: {
        fontSize: 14,
        color: '#888',
    },
    valorOpcaoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6, // ou use marginLeft no ícone se preferir
    },

});

export default PaginaBasededados;