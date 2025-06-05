// ModalSincronizacao.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
const { height, width } = Dimensions.get('window');
interface Props {
  visivel: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
  quantidade: number;
  style?: any; 
}

export default function ModalSincronizacao({ visivel, aoCancelar, aoConfirmar, quantidade ,style}: Props) {
  return (
  <Modal
  isVisible={visivel}
  onBackdropPress={aoCancelar}
  onBackButtonPress={aoCancelar}
  backdropOpacity={0.4}
  useNativeDriver
  animationIn="zoomIn"
  animationOut="zoomOut"
  style={style || { justifyContent: 'center', alignItems: 'center' }} // 👈 usa o style recebido ou padrão
>

      <View style={styles.container}>
        <Image
          source={require('../../../assets/imagens/icon_app_porco.png')}
          style={styles.icone}
        />
        <Text style={styles.titulo}>Sincronizar alterações</Text>
        <Text style={styles.mensagem}>
          Tens {quantidade} sincronizações pendentes com a nuvem{'\n'}
          Queres sincronizar agora?
        </Text>
        <View style={styles.botoes}>
          <TouchableOpacity onPress={aoCancelar} style={styles.cancelar}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={aoConfirmar} style={styles.confirmar}>
            <Text style={styles.textoConfirmar}>Sim</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginLeft:3,
    marginTop:32,
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 22,
    width: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  icone: {
    width: 80,
    height: 80,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  mensagem: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelar: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 12,
    borderColor: '#0A2E50',
    borderWidth: 1,
    alignItems: 'center',
  },
  confirmar: {
    flex: 1,
    marginLeft: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0A5EFF',
    alignItems: 'center',
  },
  textoCancelar: {
    color: '#0A2E50',
    fontWeight: '600',
  },
  textoConfirmar: {
    color: '#fff',
    fontWeight: '600',
  },
});
