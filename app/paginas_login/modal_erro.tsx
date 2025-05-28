import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface ModalErroProps {
  visivel: boolean;
  tipoErro: 'wifi' | 'servidor';
  aoFechar: () => void;
}

const ModalErro: React.FC<ModalErroProps> = ({ visivel, tipoErro, aoFechar }) => {
  const imagem = require('../assets/minha_imagem.png'); // 🔁 sua imagem local
  const mensagem = tipoErro === 'wifi' ? 'Sem ligação à internet' : 'Erro no servidor';

  return (
    <Modal visible={visivel} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image source={imagem} style={styles.imagem} resizeMode="contain" />
          <Text style={styles.texto}>{mensagem}</Text>

          <TouchableOpacity style={styles.botao} onPress={aoFechar}>
            <Text style={styles.botaoTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalErro;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  imagem: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  texto: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#3592EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
