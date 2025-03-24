import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters';

const SaldoWidget = ({ saldoTotal }: { saldoTotal: number }) => {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  return (
    <LinearGradient
      colors={['#164878', '#1F67AB', '#2985DE']} // Gradiente azul correto
      locations={[0, 0.44, 1]} // Parâmetros do gradiente
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container} // Aplica o borderRadius corretamente
    >
      {/* Linha do título */}
      <Text style={styles.label}>Saldo total</Text>

      {/* Linha do saldo + ícone */}
      <View style={styles.saldoRow}>
      <Text style={styles.saldo}>{mostrarSaldo ? `${saldoTotal.toFixed(2)} €` : '- - -'}</Text>


        {/* Botão do olho ao lado do saldo */}
        <TouchableOpacity onPress={() => setMostrarSaldo(!mostrarSaldo)}>
          <MaterialIcons 
            name={mostrarSaldo ? 'visibility' : 'visibility-off'} 
            size={scale(24)} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(15), // Mantém o arredondamento
    width: '95%',
    height: scale(90),
    alignSelf: 'center',
    marginTop: "4%",
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  label: {
    color: 'white',
    fontSize: scale(14),
    marginBottom: scale(5),
  },
  saldoRow: {
    flexDirection: 'row', // Mantém saldo e ícone na mesma linha
    justifyContent: 'space-between', // Mantém espaço entre os elementos
    alignItems: 'center', // Alinha verticalmente
  },
  saldo: {
    color: 'white',
    fontSize: scale(32),
    fontWeight: 'bold',
  },
 
});

export default SaldoWidget;
