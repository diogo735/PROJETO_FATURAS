import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import NavbarPaginaPrincipal from './componentes/navbar_pagprincipal';
import SaldoWidget from '../pagina_principal/componentes/saldo_widget';
import Grafico_Circular from './componentes/grafico_circular';

import { Categoria } from '../../BASEDEDADOS/tipos_tabelas';
import { ScrollView } from 'react-native';
const { width, height } = Dimensions.get('window');


import { listarCategorias, } from '../../BASEDEDADOS/categorias';
import { obterSomaMovimentosPorCategoria } from '../../BASEDEDADOS/movimentos';
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
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);

  useEffect(() => {
    const carregarMovimentos = async () => {
      const dados: DadosGrafico[] = await obterSomaMovimentosPorCategoria();
      if (dados.length > 0) {
        setDadosGrafico(dados);
      } else {
        setDadosGrafico([]);
      }
    };
    carregarMovimentos();
  }, []);

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
          {dadosGrafico.length > 0 ? (
            <Grafico_Circular categorias={dadosGrafico} />
          ) : (
            <Text>Carregando dados do gráfico...</Text>
          )}
        </View>

        <Botoes />

        <View style={styles.conteudo}>
          <Text>Home Screen</Text>
        </View>
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
    backgroundColor: '#ADD8E6', // Azul claro como fundo

  },


});

export default Pagina_principal;
