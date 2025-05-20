import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import NavbarPaginaPrincipal from './componentes/navbar_pagprincipal';
import SaldoWidget from '../pagina_principal/componentes/saldo_widget';
import Grafico_Circular from './componentes/grafico_circular';
import { obterTotalReceitas, obterTotalDespesas, listarMovimentosUltimos30Dias, obterSaldoMensalAtual } from '../../BASEDEDADOS/movimentos';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import UltimosMovimentos from './componentes/ultimos_moviemtos/ultimos_moviemntos';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { ScrollView } from 'react-native';
const { width, height } = Dimensions.get('window');

import { obterSomaMovimentosPorCategoriaDespesa, obterSomaMovimentosPorCategoriaReceita } from '../../BASEDEDADOS/movimentos';
import Botoes from './componentes/botoes_despesa_receita';
import { Dimensions } from 'react-native';


import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';




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



const Pagina_principal: React.FC = () => {

  const [tipoSelecionado, setTipoSelecionado] = useState<'receitas' | 'despesas'>('despesas');// Estado para armazenar qual tipo de movimento está ativo (inicialmente "despesas")

  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);//armazena os dados do gráfico
  const [saldoMensal, setSaldoMensal] = useState(0);

  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [carregarGrafico, setCarregarGrafico] = useState(false);
  const [movimentosRecentes, setMovimentosRecentes] = useState<Movimento[]>([]);
  const opacidadeTela = useSharedValue(0);
  const opacidadeGrafico = useSharedValue(1); // <- gráfico visível por padrão

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




  /*
  useFocusEffect(
    useCallback(() => {
      const carregarDadosComTransicao = async () => {

        opacidadeGrafico.value = withTiming(0, { duration: 200 });

        setCarregarGrafico(true);
        setTimeout(async () => {
          // Carrega dados do gráfico
          let dados: DadosGrafico[] = [];
          if (tipoSelecionado === 'despesas') {
            dados = await obterSomaMovimentosPorCategoriaDespesa() || [];
          } else {
            dados = await obterSomaMovimentosPorCategoriaReceita() || [];
          }
          setDadosGrafico(dados);


          const receitas = await obterTotalReceitas();
          const despesas = await obterTotalDespesas();
          setTotalReceitas(receitas);
          setTotalDespesas(despesas);

          setCarregarGrafico(false);
          opacidadeGrafico.value = withTiming(1, { duration: 200 });
        }, 160);
        const dadosMovimentos = await listarMovimentosUltimos30Dias();
        setMovimentosRecentes(dadosMovimentos || []);

        const saldo = await obterSaldoMensalAtual();
        setSaldoMensal(saldo);
      };


      carregarDadosComTransicao();
    }, [tipoSelecionado]));
*/

  useEffect(() => {
    if (route?.params) {
      setSaldoMensal(route.params.saldoMensal || 0);
      setTotalReceitas(route.params.totalReceitas || 0);
      setTotalDespesas(route.params.totalDespesas || 0);
      setMovimentosRecentes(route.params.movimentosRecentes || []);

      // seleciona qual gráfico mostrar de início
      setDadosGrafico(
        tipoSelecionado === 'despesas'
          ? route.params.dadosGraficoDespesas || []
          : route.params.dadosGraficoReceitas || []
      );

      setTimeout(() => {
        opacidadeGrafico.value = withTiming(1, { duration: 400 });
        setDadosProntos(true);
      }, 50);
    }
  }, [route.params]);


  useEffect(() => {
    if (route?.params) {
      const novoGrafico =
        tipoSelecionado === 'despesas'
          ? route.params.dadosGraficoDespesas || []
          : route.params.dadosGraficoReceitas || [];

      setDadosGrafico(novoGrafico);
    }
  }, [tipoSelecionado]);




  const handleNotificacaoPress = () => {
    navigation.navigate('Notificacoes');
  };

  return (
    <Animated.View style={[styles.corpo, estiloAnimado]}>
      <NavbarPaginaPrincipal
        nome="Diogo Ferreira"
        foto={require('../../assets/imagens/1.jpg')}
        onPressNotificacao={handleNotificacaoPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <SaldoWidget saldoTotal={saldoMensal} mesAtual={nomeMes} />


        {/**/}
        <View style={styles.containerGrafico}>
          {Array.isArray(dadosGrafico) && dadosGrafico.length > 0 ? (
            <Grafico_Circular
              key={`grafico-${tipoSelecionado}`}
              categorias={dadosGrafico}
              tipoSelecionado={tipoSelecionado}
            />
          ) : (
            <Text style={{ color: '#888', padding: 20 }}>Sem dados para exibir</Text>
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
    //backgroundColor: '#ADD8E6', // Azul claro como fundo
  },

});

/////////////////////////////////////////////////////////////////////////////////




export default Pagina_principal;
