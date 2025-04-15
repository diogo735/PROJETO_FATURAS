import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface Props {
  visivel: boolean;
  aoFechar: () => void;
  aoVerMovimentos: () => void;
  aoEditar: () => void;
  aoApagar: () => void;
  
}

const ModalOpcoesMeta: React.FC<Props> = ({ visivel, aoFechar, aoVerMovimentos, aoEditar, aoApagar }) => {
  return (
    <Modal
      isVisible={visivel}
      onBackdropPress={aoFechar}
      onBackButtonPress={aoFechar}
      backdropOpacity={0.4}
      useNativeDriver
       //animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View style={styles.modalBox}>
        <Text style={styles.titulo}>Opções da Meta</Text>
        <View style={styles.linhaSeparadora} />

        <TouchableOpacity style={styles.botaoVer} onPress={aoVerMovimentos}>
          <MaterialIcons name="list" size={22} color="#ffffff" />
          <Text style={styles.textoVer}>Ver Movimentos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoEditar} onPress={aoEditar}>
          <MaterialIcons name="edit" size={22} color="#ffffff" />
          <Text style={styles.textoEditar}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoApagar} onPress={aoApagar}>
          <MaterialIcons name="delete" size={22} color="white" />
          <Text style={styles.textoBotaoBranco}>Eliminar Meta</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  linhaSeparadora: {
    height: 1,
    width: '100%',
    backgroundColor: '#E0E0E0',
    marginBottom: 15,
    marginTop: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164878',
  },
  botaoVer: {
    backgroundColor:'#4CB055',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  textoVer: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  botaoEditar: {
    backgroundColor:'#FFA723',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  textoEditar: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  botaoApagar: {
    backgroundColor: '#DC3545',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    justifyContent: 'center',
  },
  textoBotaoBranco: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ModalOpcoesMeta;
