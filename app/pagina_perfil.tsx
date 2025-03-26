import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';

//PARA TESTES
import { apagarTodosMovimentos, inserirMovimentoTesteUnico,inserirTodosMovimentosTeste,inserirMovimentoTesteNormal } from '../BASEDEDADOS/movimentos';
const Pagina_perfil: React.FC = () => {
  return (
    <View style={{ gap: 10, marginTop: 20 }}>
      <TouchableOpacity onPress={apagarTodosMovimentos} style={styles.botao}>
        <Text style={styles.textoBotao}>🗑 Apagar Movimentos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => inserirMovimentoTesteUnico()}
        style={styles.botao}
      >
        <Text style={styles.textoBotao}>➕ Inserir 1 Movimento</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={inserirTodosMovimentosTeste} style={styles.botao}>
        <Text style={styles.textoBotao}>📥 Inserir  TODAS CAT</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={inserirMovimentoTesteNormal} style={styles.botao}>
        <Text style={styles.textoBotao}>- Inserir Normais</Text>
      </TouchableOpacity>
    </View>

  );
};

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#164878',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Pagina_perfil;
