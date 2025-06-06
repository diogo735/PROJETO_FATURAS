import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList, Modal, Easing } from 'react-native';
import { scale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('window');
import IconSync from '../../../assets/icons/Sync_branco.svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App'; // a
import { atualizarPreferenciasSincronizacao, atualizarUltimaSincronizacao, buscarUsuarioAtual } from '../../../BASEDEDADOS/user';
import SwitchCustomizado from './switch_customizado';
import { ActivityIndicator } from 'react-native';
import { sincronizarTudoApiParaApp, sincronizarTudoAppParaApi } from '../../../BASEDEDADOS/sincronizacao';
import { Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import ModalErro from './modal_erro';


const PaginaSincronizacao = () => {


    type NotificacaoNavigationProp = StackNavigationProp<RootStackParamList, 'PaginaSincronizacao'>;
    const navigation = useNavigation<NotificacaoNavigationProp>();
    const [autoSync, setAutoSync] = useState(false);
    const [wifiOnly, setWifiOnly] = useState(false);
    const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string | null>(null);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [refrescar, setRefrescar] = useState(false);

    useEffect(() => {
        const carregarDados = async () => {
            const user = await buscarUsuarioAtual();
            setAutoSync(user?.sincronizacao_automatica === 1);
            setWifiOnly(user?.sincronizacao_wifi === 1);
            setUltimaSincronizacao(user?.ultima_sincronizacao || null);
        };

        carregarDados();
    }, [refrescar]); // ← Dependência incluída
    const [erroModalVisivel, setErroModalVisivel] = useState(false);
    const [tipoErro, setTipoErro] = useState<'wifi' | 'servidor' | 'dados'>('wifi');



    function formatarDataLegivel(dataIso: string): string {
        try {
            const data = new Date(dataIso);
            return new Intl.DateTimeFormat('pt-PT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(data).replace(',', ' às');
        } catch {
            return dataIso;
        }
    }



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Sincronização</Text>
                </View>

            </View>
            <View style={styles.body}>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.cardTitle}>Sincronização automática</Text>
                            <SwitchCustomizado
                                value={autoSync}
                                onValueChange={async (valor) => {
                                    setAutoSync(valor);
                                    await atualizarPreferenciasSincronizacao(valor, wifiOnly);
                                }}
                            />
                        </View>
                        <Text style={styles.cardDescription}>
                            Vais premitir que a aplicação sincronize dados automaticamente em segundo plano.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.cardTitle}>Sincronizar apenas por Wi-Fi</Text>
                            <SwitchCustomizado
                                value={wifiOnly}
                                onValueChange={async (valor) => {
                                    setWifiOnly(valor);
                                    await atualizarPreferenciasSincronizacao(autoSync, valor);
                                }}
                            />
                        </View>
                        <Text style={styles.cardDescription}>
                            A sincronização só irá acontecer quando tiveres ligação Wi-fi ,evitando dados móveis.
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.cardTitle}>Última sincronização</Text>
                        </View>
                        <Text style={styles.cardDescription}>
                            {ultimaSincronizacao
                                ? formatarDataLegivel(ultimaSincronizacao)
                                : 'Ainda não sincronizaste nenhuma vez.'}
                        </Text>

                    </View>


                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.botaoSincronizar}
                        onPress={async () => {
                            setModalVisivel(true);
                            try {
                                const estado = await NetInfo.fetch();

                                if (!estado.isConnected || !estado.isInternetReachable) {
                                    setTipoErro('wifi');
                                    setErroModalVisivel(true);
                                    return;
                                }

                                if (wifiOnly && estado.type !== 'wifi') {
                                    setTipoErro('dados');
                                    setErroModalVisivel(true);
                                    return;
                                }

                                await sincronizarTudoAppParaApi();     // ← se falhar, vai para o catch
                                await sincronizarTudoApiParaApp();     // ← idem
                                await atualizarUltimaSincronizacao();

                            } catch (error) {
                                console.error('Erro ao sincronizar:', error);
                                setTipoErro('servidor');             
                                setErroModalVisivel(true);
                            } finally {
                                setModalVisivel(false);
                                setRefrescar(prev => !prev);
                            }
                        }}



                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconSync width={18} height={18} fill="white" style={{ marginRight: 10 }} />
                            <Text style={styles.textoBotao}>Sincronizar agora</Text>
                        </View>
                    </TouchableOpacity>

                </View>

            </View>
            <ModalErro
                visivel={erroModalVisivel}
                tipoErro={tipoErro}
                aoFechar={() => setErroModalVisivel(false)}
            />

            <Modal transparent visible={modalVisivel} animationType="fade">
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 30,
                        borderRadius: 20,
                        alignItems: 'center',
                        width: '80%'
                    }}>
                        <Image
                            source={require('../../../assets/imagens/sincronizar.png')}
                            style={{ width: 80, height: 80, marginBottom: 20 }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2565A3', marginBottom: 15 }}>
                            A sincronizar com a nuvem...
                        </Text>
                        <ActivityIndicator size="large" color="#2565A3" />
                    </View>
                </View>
            </Modal>

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
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2565A3',
    },
    cardDescription: {
        fontSize: 13,
        color: '#4884BE',
        marginTop: 8,
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

});

export default PaginaSincronizacao;