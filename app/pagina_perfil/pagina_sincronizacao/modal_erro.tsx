import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface ModalErroProps {
  visivel: boolean;
tipoErro: 'wifi' | 'servidor' | 'dados';
  aoFechar: () => void;
}

const ModalErro: React.FC<ModalErroProps> = ({ visivel, tipoErro, aoFechar }) => {
  const imagem =
  tipoErro === 'wifi'
    ? require('../../../assets/imagens/sem_wifi.png')
    : tipoErro === 'dados'
    ? require('../../../assets/imagens/4g.png')
    : require('../../../assets/imagens/sem_servidor.png');


  const mensagem =
  tipoErro === 'wifi'
    ? 'Sem ligação à internet'
    : tipoErro === 'dados'
    ? 'Estás a usar dados móveis'
    : 'Erro no servidor';

  const subtexto =
  tipoErro === 'wifi'
    ? 'Verifica a tua ligação Wi-Fi ou dados móveis.'
    : tipoErro === 'dados'
    ? 'Ativaste a opção para sincronizar apenas via Wi-Fi. Liga o Wi-Fi ou altera a configuração.'
    : 'O servidor pode estar em manutenção ou indisponível. Tenta novamente mais tarde.';


  return (
    <Modal visible={visivel} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image source={imagem} style={styles.imagem} resizeMode="contain" />
          <Text style={styles.texto}>{mensagem}</Text>
          <Text style={styles.subtexto}>{subtexto}</Text>
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
    fontSize: 20,
    color: '#2565A3',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#3592EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 99,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtexto: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

});
