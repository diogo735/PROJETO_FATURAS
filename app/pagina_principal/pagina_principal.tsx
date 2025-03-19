import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import NavbarPaginaPrincipal from './componentes/navbar_pagprincipal';
import SaldoWidget from '../pagina_principal/componentes/saldo_widget';
import Grafico_Circular from './componentes/grafico_circular';


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

  //  carregar os movimentos quando o botão for alterado
  useEffect(() => {
    const carregarMovimentos = async () => {
      let dados: DadosGrafico[] = [];

      if (tipoSelecionado === 'despesas') {
        dados = await obterSomaMovimentosPorCategoriaDespesa()|| [];
      } else {
        dados = await obterSomaMovimentosPorCategoriaReceita()|| [];
      }
      setDadosGrafico(dados.length > 0 ? dados : []);
    };
    carregarMovimentos();
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

        <View style={styles.containerGrafico}>
          <Grafico_Circular categorias={dadosGrafico} tipoSelecionado={tipoSelecionado} />
        </View>

        <Botoes tipoSelecionado={tipoSelecionado} setTipoSelecionado={setTipoSelecionado} />

       
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

export default Pagina_principal;
