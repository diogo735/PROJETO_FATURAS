import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import NavbarPaginaPrincipal from './componentes/navbar_pagprincipal';
import SaldoWidget from '../pagina_principal/componentes/saldo_widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obterTotalReceitas, obterTotalDespesas, listarMovimentosUltimos30Dias, obterSaldoMensalAtual } from '../../BASEDEDADOS/movimentos';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import UltimosMovimentos from './componentes/ultimos_moviemtos/ultimos_moviemntos';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { BackHandler } from 'react-native';
import Modal from 'react-native-modal';

import { ScrollView } from 'react-native';
const { width, height } = Dimensions.get('window');

import { obterSomaMovimentosPorCategoriaDespesa, obterSomaMovimentosPorCategoriaReceita } from '../../BASEDEDADOS/movimentos';
import Botoes from './componentes/botoes_despesa_receita';
import { Dimensions } from 'react-native';

import { RefreshControl } from 'react-native';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

import Grafico_Circular from './componentes/grafico_circular';
import Grafico_CircularVazio from './componentes/grafico_circular_vazio';


interface DadosGrafico {
  categoria_id: number;
  nome_cat: string;
  cor_cat: string;
  img_cat: string;
  total_valor: number;
}

interface Movimento {
  id: number;
  valor: number;
  data: string;
  categoria_id: number;
  // outros campos, se existirem
}

import { RouteProp, useRoute } from '@react-navigation/native';
import { buscarUsuarioAtual } from '../../BASEDEDADOS/user';
import { listarSincronizacoesPendentes } from '../../BASEDEDADOS/sincronizacao';




const Pagina_principal: React.FC = () => {

  const [tipoSelecionado, setTipoSelecionado] = useState<'receitas' | 'despesas'>('despesas');// Estado para armazenar qual tipo de movimento está ativo (inicialmente "despesas")

  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);//armazena os dados do gráfico
  const [saldoMensal, setSaldoMensal] = useState(0);

  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [carregarGrafico, setCarregarGrafico] = useState(false);
  const [movimentosRecentes, setMovimentosRecentes] = useState<Movimento[]>([]);
  const opacidadeTela = useSharedValue(0);
  const opacidadeGrafico = useSharedValue(1);
  const [refreshing, setRefreshing] = useState(false);
  const [primeiraVez, setPrimeiraVez] = useState(true);
  const [mostrarModalSync, setMostrarModalSync] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const route = useRoute<RouteProp<RootStackParamList, 'MainApp'>>();

  const hoje = new Date();
  const nomeMes = hoje.toLocaleString('pt-PT', { month: 'long' }).replace(/^\w/, c => c.toUpperCase());
  const [dadosProntos, setDadosProntos] = useState(false);

  const estiloAnimado = useAnimatedStyle(() => ({
    opacity: opacidadeTela.value,
  }));


  useEffect(() => {
    opacidadeTela.value = withTiming(1, { duration: 400 });
  }, []);

  const [nomeUsuario, setNomeUsuario] = useState('');
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);

  const carregarDadosLocais = async () => {
    try {
      setDadosProntos(false);

      const dados =
        tipoSelecionado === 'despesas'
          ? await obterSomaMovimentosPorCategoriaDespesa()
          : await obterSomaMovimentosPorCategoriaReceita();

      setDadosGrafico(dados || []);
      setTotalReceitas(await obterTotalReceitas());
      setTotalDespesas(await obterTotalDespesas());
      setMovimentosRecentes(await listarMovimentosUltimos30Dias());
      const saldo = await obterSaldoMensalAtual();
      setSaldoMensal(typeof saldo === 'number' ? saldo : 0);
      
    } catch (err) {
      console.error("❌ Erro ao carregar dados locais:", err);
    } finally {
      setDadosProntos(true);
    }
  };


  const [sincronizacoesPendentes, setSincronizacoesPendentes] = useState<number>(0);

  const verificarSincronizacoes = async () => {
    try {
      const lista = await listarSincronizacoesPendentes();
      setSincronizacoesPendentes(lista.length);
    } catch (err) {
      console.error("Erro ao verificar sincronizações:", err);
    }
  };
  useFocusEffect(
    useCallback(() => {
      verificarSincronizacoes();
    }, [])
  );


  useEffect(() => {
    if (route?.params) {
      setNomeUsuario(route.params.nomeUsuario || '');
      setFotoUsuario(route.params.fotoUsuario || null);
    }
  }, [route.params]);

  useEffect(() => {
    const verificarNotificacoes = async () => {
      const valor = await AsyncStorage.getItem('hasNotificacoesNovas');
      setHasNotificacoesNovas(valor === 'true');
    };

    verificarNotificacoes();
  }, []);

  useEffect(() => {
    opacidadeTela.value = withTiming(1, { duration: 400 });
  }, []);


  useEffect(() => {
    if (route?.params) {
      setNomeUsuario(route.params.nomeUsuario || '');
      setFotoUsuario(route.params.fotoUsuario || null);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      const carregarUsuario = async () => {
        const user = await buscarUsuarioAtual();
        if (user) {
          setNomeUsuario(user.nome);
          setFotoUsuario(user.imagem);
        }
      };

      carregarUsuario();
    }, [])
  );
  const [hasNotificacoesNovas, setHasNotificacoesNovas] = useState(true);

  const handleNotificacaoPress = async () => {
    setHasNotificacoesNovas(false);
    await AsyncStorage.setItem('hasNotificacoesNovas', 'false');
    navigation.navigate('Notificacoes');
  };

  useFocusEffect(
    useCallback(() => {
      carregarDadosLocais();
    }, [tipoSelecionado])
  );





  useEffect(() => {
    if (route?.params) {
      setSaldoMensal(route.params.saldoMensal);
      setTotalReceitas(route.params.totalReceitas || 0);
      setTotalDespesas(route.params.totalDespesas || 0);
      setMovimentosRecentes(route.params.movimentosRecentes || []);

      setDadosGrafico(
        tipoSelecionado === 'despesas'
          ? route.params.dadosGraficoDespesas || []
          : route.params.dadosGraficoReceitas || []
      );

      setTimeout(() => {
        opacidadeGrafico.value = withTiming(1, { duration: 400 });
        setDadosProntos(true);
        setPrimeiraVez(false);
      }, 50);
    }
  }, [route.params]);

  useEffect(() => {
    if (route?.params?.updated) {
      carregarDadosLocais();
      navigation.setParams({ updated: undefined });
    }
  }, [route?.params?.updated]);


  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosLocais();
    setRefreshing(false);
  };




  return (
    <Animated.View style={[styles.corpo, estiloAnimado]}>
      <NavbarPaginaPrincipal
        onPressConfig={() => {
          navigation.navigate('ListaSincronizacoes', { quantidade: sincronizacoesPendentes });
        }}
        nome={nomeUsuario}
        foto={
          fotoUsuario
            ? { uri: fotoUsuario }
            : require('../../assets/imagens/sem_foto.png')
        }
        onPressNotificacao={handleNotificacaoPress}
        hasNotificacoesNovas={hasNotificacoesNovas}
        conteudo={sincronizacoesPendentes > 9 ? '!' : sincronizacoesPendentes > 0 ? String(sincronizacoesPendentes) : ''}
      />


      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2565A3']}
            tintColor="#2565A3"
          />
        }
      >

        <SaldoWidget saldoTotal={saldoMensal} mesAtual={nomeMes} />


        {/**/}
        <View style={styles.containerGrafico}>
          {dadosGrafico.length > 0 ? (
            <Grafico_Circular
              categorias={dadosGrafico}
              tipoSelecionado={tipoSelecionado}
            />
          ) : (
            <Grafico_CircularVazio
              tipoSelecionado={tipoSelecionado}
            />
          )}
        </View>






        <Botoes
          tipoSelecionado={tipoSelecionado}
          setTipoSelecionado={setTipoSelecionado}
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
        />

        <UltimosMovimentos movimentos={movimentosRecentes} />



      </ScrollView>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  corpo: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: height * 0.16,

  },
  conteudo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerGrafico: {
    width: '95%', // Ocupa toda a largura da tela
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    justifyContent: 'flex-start',

  },



});




/////////////////////////////////////////////////////////////////////////////////




export default Pagina_principal;
