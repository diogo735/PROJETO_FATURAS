import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import NavbarPaginaPrincipal from './componentes/navbar_pagprincipal';
import SaldoWidget from '../pagina_principal/componentes/saldo_widget';
import Grafico_Circular from './componentes/grafico_circular';
import Primeiro_Container from './componentes/conteiner_primiero';
import { Categoria } from '../../BASEDEDADOS/tipos_tabelas';



import { listarCategorias } from '../../BASEDEDADOS/categorias';



const Pagina_principal: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const carregarCategorias = async () => {
      const dados = await listarCategorias();
      if (dados) {
        setCategorias(dados);
      } else {
        setCategorias([]); // evita undefined
      }
    };
    carregarCategorias();
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
      <SaldoWidget />

      <Primeiro_Container>
        {categorias.length > 0 ? (
         <>
         {/*{console.log('Categorias enviadas:', categorias.length)}*/}
         <Grafico_Circular categorias={categorias} />
       </>
        ) : (
          <Text>Carregando categorias...</Text>
        )}
      </Primeiro_Container>


      <View style={styles.conteudo}>
        <Text>Home Screendffffffffffff</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  corpo: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Pagina_principal;
