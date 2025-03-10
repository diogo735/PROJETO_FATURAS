import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Pagina_principal: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda a tela
    backgroundColor: 'white', // Define o fundo branco
    justifyContent: 'center', // Opcional: centraliza o conteúdo verticalmente
    alignItems: 'center', // Opcional: centraliza o conteúdo horizontalmente
  },
});

export default Pagina_principal;
