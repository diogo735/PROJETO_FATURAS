import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import NavbarPaginaPrincipal from './componentes/navbar_pagprincipal';
import SaldoWidget from '../pagina_principal/componentes/saldo_widget';
import Grafico_Circular from './componentes/grafico_circular';
import { obterTotalReceitas, obterTotalDespesas } from '../../BASEDEDADOS/movimentos';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';



import { ScrollView } from 'react-native';
const { width, height } = Dimensions.get('window');

import { obterSomaMovimentosPorCategoriaDespesa, obterSomaMovimentosPorCategoriaReceita } from '../../BASEDEDADOS/movimentos';
import Botoes from './componentes/botoes_despesa_receita';
import { Dimensions } from 'react-native';

interface DadosGrafico {
  categoria_id: number;
  nome_cat: string;
  cor_cat: string;
  img_cat: string;
  total_valor: number;
}
const Pagina_principal: React.FC = () => {

  const [tipoSelecionado, setTipoSelecionado] = useState<'receitas' | 'despesas'>('receitas');// Estado para armazenar qual tipo de movimento está ativo (inicialmente "despesas")

  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);//armazena os dados do gráfico

  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [carregarGrafico, setCarregarGrafico] = useState(false);

  const opacidadeGrafico = useSharedValue(0);

  const estiloAnimado = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacidadeGrafico.value, { duration: 200 }),
    };
  });

  //  carregar os movimentos quando o botão for alterado
  useEffect(() => {
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
    };

    carregarDadosComTransicao();
  }, [tipoSelecionado]);


  const handleNotificacaoPress = () => {
    Alert.alert('Notificações', 'Você clicou no botão de notificações!');
  };

  return (
    <View style={styles.corpo}>
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
        <SaldoWidget />

        <Animated.View style={[styles.containerGrafico, estiloAnimado]}>
          {carregarGrafico ? (
            <View style={{ height: width * 0.804 + 100 }} /> //  ocupa o mesmo espaço do gráfico 
          ) : (
            <Grafico_Circular categorias={dadosGrafico} tipoSelecionado={tipoSelecionado} />
          )}
        </Animated.View>







        <Botoes
          tipoSelecionado={tipoSelecionado}
          setTipoSelecionado={setTipoSelecionado}
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
        />


      </ScrollView>
    </View>
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
    paddingBottom: 150,
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
