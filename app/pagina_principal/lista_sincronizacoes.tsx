import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { listarSincronizacoes, sincronizarTudoApiParaApp } from '../../BASEDEDADOS/sincronizacao';
import Modal from 'react-native-modal';
import { limparFilaDeSincronizacao } from '../../BASEDEDADOS/sincronizacao';
import { Alert } from 'react-native';
import { processarItemDeSincronizacao } from '../../BASEDEDADOS/sincronizacao';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');
import SincronizarSVG from '../../assets/imagens/sincronizar.svg';
import CheckSVG from '../../assets/icons/modal_sincronizar/certo.svg';
import ErrorSVG from '../../assets/icons/modal_sincronizar/errado.svg';
import Animated, { FadeInDown, FadeIn, Layout, useSharedValue, withTiming, useAnimatedStyle, FadeOut } from 'react-native-reanimated';
import { ActivityIndicator } from 'react-native';
import { BackHandler } from 'react-native';
import { Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import ModalErro from '../pagina_perfil/pagina_sincronizacao/modal_erro';
import { buscarUsuarioAtual } from '../../BASEDEDADOS/user';

interface ItemSincronizacao {
    id: string;
    tipo: string;
    operacao: string;
    payload: string;
    descricao?: string;
}

const ListaSincronizacoes = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { quantidade } = route.params as { quantidade: number };
    const progressoAnimado = useSharedValue(0);

    const [wifiOnly, setWifiOnly] = useState(false);

    const [estado, setEstado] = useState<'pergunta' | 'processando' | 'sucesso' | 'insucesso'>('pergunta');
    const [itens, setItens] = useState<{ texto: string; status: 'loading' | 'success' | 'error' }[]>([]);
    const [concluidos, setConcluidos] = useState<number[]>([]);
    const [erros, setErros] = useState<number[]>([]);
    const progresso = itens.findIndex(item => item.status === 'loading');
    const indiceAtual = progresso === -1 ? itens.length - 1 : progresso;
    const [erroModalVisivel, setErroModalVisivel] = useState(false);
    const [tipoErro, setTipoErro] = useState<'wifi' | 'servidor' | 'dados'>('wifi');

    useEffect(() => {
        if (estado === 'processando') {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
            return () => backHandler.remove(); // limpa quando sair do estado
        }
    }, [estado]);

    useEffect(() => {
        const carregarPreferencias = async () => {
            const user = await buscarUsuarioAtual();
            setWifiOnly(user?.sincronizacao_wifi === 1);
        };

        carregarPreferencias();
    }, []);

    function descricaoAmigavel(tipo: string, operacao: string): string {
        const mapaTipo: Record<string, { nome: string; genero: 'm' | 'f' }> = {
            movimentos: { nome: 'movimento', genero: 'm' },
            faturas: { nome: 'fatura', genero: 'f' },
            sub_categorias: { nome: 'subcategoria', genero: 'f' },
            categorias: { nome: 'categoria', genero: 'f' },
            user: { nome: 'perfil', genero: 'm' }
        };

        const mapaOperacao: Record<string, string> = {
            create: 'criaste',
            update: 'atualizaste',
            delete: 'eliminaste'
        };

        // Caso especial: user + update → "atualizaste o perfil"
        if (tipo === 'user' && operacao === 'update') {
            return 'atualizaste o perfil';
        }

        const entidadeInfo = mapaTipo[tipo] || { nome: tipo, genero: 'm' };
        const acao = mapaOperacao[operacao] || operacao;

        const artigo = entidadeInfo.genero === 'm' ? 'um' : 'uma';

        return `${acao} ${artigo} ${entidadeInfo.nome}`;
    }




    const iniciarSincronizacao = async () => {
        setEstado('processando');

        const estadoRede = await NetInfo.fetch();

        if (!estadoRede.isConnected || !estadoRede.isInternetReachable) {
            setTipoErro('wifi');
            setErroModalVisivel(true);
            return;
        }

        if (wifiOnly && estadoRede.type !== 'wifi') {
            setTipoErro('dados');
            setErroModalVisivel(true);
            return;
        }

        const listaReal: ItemSincronizacao[] = await listarSincronizacoes();
        const totalItens = listaReal.length + 1; // +1 para a verificação com a nuvem

        setItens(
            listaReal.map(item => ({
                texto: descricaoAmigavel(item.tipo, item.operacao),
                status: 'loading',
            }))
        );

        let houveErro = false;

        for (let i = 0; i < listaReal.length; i++) {
            const item = listaReal[i];
            const sucesso = await processarItemDeSincronizacao(item);

            if (!sucesso) houveErro = true;

            setItens(prev =>
                prev.map((itemAntigo, index) =>
                    index === i
                        ? { ...itemAntigo, status: sucesso ? 'success' : 'error' }
                        : itemAntigo
                )
            );

            progressoAnimado.value = withTiming(((i + 1) / totalItens) * 100, {
                duration: 400,
            });

            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Adiciona o item "A verificar tudo com a nuvem"
        setItens(prev => [
            ...prev,
            { texto: 'A verificar tudo com a nuvem...', status: 'loading' }
        ]);

        await new Promise(resolve => setTimeout(resolve, 400));

        try {
            await sincronizarTudoApiParaApp();

            setItens(prev =>
                prev.map((item, index) =>
                    index === totalItens - 1
                        ? { ...item, status: 'success' }
                        : item
                )
            );
        } catch (e) {
            houveErro = true;

            setItens(prev =>
                prev.map((item, index) =>
                    index === totalItens - 1
                        ? { ...item, status: 'error' }
                        : item
                )
            );

            setTipoErro('servidor');
            setErroModalVisivel(true);
        }

        progressoAnimado.value = withTiming(100, { duration: 400 });

        setTimeout(() => {
            setEstado(houveErro ? 'insucesso' : 'sucesso');
        }, 300);
    };




    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${progressoAnimado.value}%`,
    }));




    return (
        <View style={styles.overlay}>
            <View style={styles.modalBox}>

                <Animated.View
                    key={estado}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(100)}
                    style={{ width: '100%', alignItems: 'center' }}
                >
                    {estado === 'pergunta' && (
                        <>
                            <SincronizarSVG width={100} height={100} style={styles.imagem} />
                            <Text style={styles.titulo}>Sincronizar alterações</Text>
                            <Text style={styles.textoDescricao}>
                                Tens {quantidade} sincronizações pendentes com a nuvem{'\n'}Queres sincronizar agora?
                            </Text>
                            <View style={styles.botoesContainer}>
                                <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
                                    <Text style={styles.textoCancelar}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.botaoConfirmar} onPress={iniciarSincronizacao}>
                                    <Text style={styles.textoConfirmar}>Sim</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {estado === 'processando' && (
                        <>
                            <Text style={styles.titulo2}>Sincronizando ...</Text>
                            <View style={styles.listaContainer}>
                                {itens
                                    .slice(
                                        Math.max(0, Math.min(progresso - 2, itens.length - 3)),
                                        Math.min(itens.length, progresso + 1)
                                    )
                                    .map((item, iRender) => {

                                        const i = Math.max(0, progresso - 2) + iRender;
                                        return (
                                            <Animated.View
                                                key={i}
                                                entering={FadeInDown.duration(300)}
                                                layout={Layout.springify()}
                                                style={[
                                                    styles.itemLinha,
                                                    i === progresso ? styles.itemAtualLinha : {},
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.itemTexto,
                                                        i === progresso ? styles.itemTextoAtual : {},
                                                    ]}
                                                >
                                                    {item.texto}
                                                </Text>
                                                {item.status === 'success' ? (
                                                    <CheckSVG width={16} height={16} />
                                                ) : item.status === 'error' ? (
                                                    <ErrorSVG width={16} height={16} />
                                                ) : (
                                                    <ActivityIndicator size="small" color="#2565A3" />
                                                )}
                                            </Animated.View>
                                        );
                                    })}
                            </View>
                            <View style={styles.progressBarContainer}>
                                <Animated.View style={[styles.progressBar, progressBarStyle]} />
                            </View>
                        </>
                    )}

                    {estado === 'sucesso' && (
                        <>
                            <CheckSVG width={100} height={100} style={styles.imagem} />
                            <Text style={styles.titulo}>Sincronização concluída!</Text>
                            <Text style={[styles.textoDescricao, { textAlign: 'center' }]}>
                                As tuas alterações foram sincronizadas com sucesso com a nuvem.
                            </Text>
                            <TouchableOpacity
                                style={[styles.botaoOk, { marginTop: 10 }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.textoConfirmar}>OK</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {estado === 'insucesso' && (
                        <>
                            <Image
                                source={require('../../assets/imagens/incompleto.png')} // caminho relativo à pasta do arquivo
                                style={[styles.imagem, { width: 100, height: 100 }]}
                                resizeMode="contain"
                            />

                            <Text style={styles.titulo}>Sincronização incompleta</Text>
                            <Text style={[styles.textoDescricao, { textAlign: 'center' }]}>
                                Algumas alterações não foram sincronizadas com sucesso. Tenta novamente mais tarde.
                            </Text>
                            <View style={{ width: '100%', marginTop: 10 }}>
                                {itens
                                    .map((item, i) =>
                                        item.status === 'error' ? (
                                            <View key={i} style={styles.itemLinha}>
                                                <Text style={[styles.itemTexto, { color: '#B00020' }]}>
                                                    {item.texto}
                                                </Text>
                                                <ErrorSVG width={16} height={16} />
                                            </View>
                                        ) : null
                                    )}
                            </View>
                            <TouchableOpacity
                                style={[styles.botaoOk, { marginTop: 20 }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.textoConfirmar}>Voltar</Text>
                            </TouchableOpacity>
                        </>
                    )}

                </Animated.View>
                <ModalErro
                    visivel={erroModalVisivel}
                    tipoErro={tipoErro}
                    aoFechar={() => {
                        setErroModalVisivel(false);
                        navigation.goBack(); // Sai da página
                    }}
                />

            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 32,
        paddingVertical: 25,
        paddingHorizontal: 20,
        // marginTop: height,
        //marginLeft: width * 0.9,
        width: width * 0.85,
        //height: height * 0.45,
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    imagem: {
        width: '30%',
        height: '30%',
        marginBottom: 20,
        alignSelf: 'center',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2565A3',
        textAlign: 'center',
        marginBottom: 15,
    },
    textoDescricao: {
        fontSize: 14,
        color: '#164878',
        textAlign: 'left',
        marginBottom: 25,
    },
    botoesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    botaoCancelar: {
        flex: 1,
        borderColor: '#2565A3',
        borderWidth: 1.5,
        borderRadius: 25,
        paddingVertical: 8,
        alignItems: 'center',
        marginRight: 10,
    },
    textoCancelar: {
        color: '#2565A3',
        fontSize: 16,
        fontWeight: '600',
    },
    botaoConfirmar: {
        flex: 1,
        backgroundColor: '#2565A3',
        borderRadius: 25,
        paddingVertical: 10,
        alignItems: 'center',
        marginLeft: 10,
    },
    textoConfirmar: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    itemLinha: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    itemTexto: {
        flex: 1,
        fontSize: 14,
        color: '#164878',
    },
    itemAtual: {
        fontWeight: 'bold',
    },
    check: {
        fontSize: 16,
        color: 'green',
    },
    loading: {
        fontSize: 16,
        color: '#2565A3',
    },
    progressBarContainer: {
        height: 8,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#2565A3',
        borderRadius: 10,
    },
    erro: {
        fontSize: 16,
        color: 'red',
    },
    itemAtualLinha: {
        transform: [{ scale: 1.05 }],
    },
    itemTextoAtual: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#164878',
    },

    titulo2: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2565A3',
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    listaContainer: {
        width: '100%',
        marginBottom: 20,
        minHeight: 70,
        justifyContent: 'flex-start',
    },
    botaoOk: {
        backgroundColor: '#2565A3',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },



});
export default ListaSincronizacoes;
