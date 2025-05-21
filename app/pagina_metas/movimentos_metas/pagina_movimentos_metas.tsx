import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import GraficoMeta from './garfico_das_metas';
const { height } = Dimensions.get('window');
import { useEffect, useState } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { listarMovimentosPorMeta } from '../../../BASEDEDADOS/metas';
import ListaMovimentosAgrupada from '../../pagina_moviementos/componentes/lista_moviementos/lsita_movimentos';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Easing } from 'react-native';
import IconeRotativo from '../../../assets/imagens/wallpaper.svg';
import { Animated, } from 'react-native';
import { Image } from 'react-native';
import { buscarCorDaMeta } from '../../../BASEDEDADOS/metas';

import { Movimento } from '../../../BASEDEDADOS/tipos_tabelas';
import { useMoeda } from '../../MOEDA';

type MovimentoComDetalhes = Movimento & {
    nome_movimento: string;
    img_cat: string;
    cor_cat: string;
    nota: string;
    cor_subcat?: string;
};

type ParamList = {
    MovimentosDaMeta: { id_meta: number };
};



const MovimentosDaMeta: React.FC = () => {
    const navigation = useNavigation();
const { moeda } = useMoeda();

    const route = useRoute<RouteProp<ParamList, 'MovimentosDaMeta'>>();
    const { id_meta } = route.params;
    const [loading, setLoading] = useState(true);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const rotateInterpolation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [fluxoTotal, setFluxoTotal] = useState(0);
    const [numMovimentos, setNumMovimentos] = useState(0);
    const [diasGrafico, setDiasGrafico] = useState<string[]>([]);
    const [dadosGrafico, setDadosGrafico] = useState<number[]>([]);
    const [valorMeta, setValorMeta] = useState<number>(0);

    const [corMeta, setCorMeta] = useState<string>('#2565A3');

    const [movimentos, setMovimentos] = useState<MovimentoComDetalhes[]>([]);


    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    useEffect(() => {
        async function carregar() {
            setLoading(true);
            const lista = await listarMovimentosPorMeta(id_meta) as MovimentoComDetalhes[];
            const cor = await buscarCorDaMeta(id_meta);

            if (cor) {
                setCorMeta(cor);
            }


            const ordenados = lista.sort((a: Movimento, b: Movimento) => {
                return new Date(a.data_movimento).getTime() - new Date(b.data_movimento).getTime();
            });

            const formatador = new Intl.DateTimeFormat('pt-PT', {
                day: 'numeric',
                month: 'short',
            });

            const dias = ordenados.map((mov: Movimento) => formatador.format(new Date(mov.data_movimento)));
            const dados = ordenados.map((mov: Movimento) => Number(mov.valor));

            const valorMeta = 7;

            setMovimentos(ordenados);
            setFluxoTotal(ordenados.reduce((acc: number, mov: Movimento) => acc + Number(mov.valor), 0));
            setNumMovimentos(ordenados.length);
            setDiasGrafico(dias);
            setDadosGrafico(dados);
            setValorMeta(valorMeta);
            setLoading(false);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }


        fadeAnim.setValue(0);
        carregar();
    }, [id_meta]);



    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Movimentos da Meta</Text>
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                        <Animated.View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                transform: [{ rotate: rotateInterpolation }],
                                marginBottom: 20,
                            }}
                        >
                            <IconeRotativo width={50} height={50} fill="#2565A3" />
                        </Animated.View>
                        <Text style={{ color: '#2565A3', fontWeight: 'bold', marginTop: 0 }}>
                            A carregar movimentos...
                        </Text>
                    </View>
                ) : movimentos.length > 0 ? (

                    <Animated.View style={{ opacity: fadeAnim }}>
                        <GraficoMeta
                            dias={diasGrafico}
                            dados={dadosGrafico}
                            valorMeta={valorMeta}
                            cor={corMeta}
                        />





                        <View style={{ paddingHorizontal: 5 }}>
                            <ListaMovimentosAgrupada movimentos={movimentos} />
                        </View>

                        <View style={{ marginTop: 20, alignItems: 'center', marginBottom: 40 }}>
                            <Text style={{ color: '#CDCDCD' }}>
                                Fluxo de meta total: {fluxoTotal.toFixed(2)} {moeda.simbolo}
                            </Text>
                            <Text style={{ color: '#CDCDCD' }}>
                                {numMovimentos} movimento{numMovimentos !== 1 ? 's' : ''}
                            </Text>
                        </View>

                    </Animated.View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={require('../../../assets/imagens/sem_movimentos.png')}
                            style={{ width: 160, height: 160, marginBottom: 15 }}
                            resizeMode="contain"
                        />
                        <Text style={{ color: '#777', fontSize: 16 }}>
                            Meta ainda sem movimentos
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        letterSpacing: 18 * 0.05,
        marginLeft: 15,
    },
    content: {
        paddingHorizontal: 5,
        paddingTop: 5,
        flex: 1
    },

});

export default MovimentosDaMeta;
