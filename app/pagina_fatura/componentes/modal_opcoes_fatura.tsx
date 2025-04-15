// ModalOpcoesFatura.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width,height } = Dimensions.get('window');

interface Props {
  visivel: boolean;
  aoFechar: () => void;
  onEditar?: () => void;
  onDownloadPDF?: () => void;
  onPartilhar?: () => void;
}

const ModalOpcoesFatura: React.FC<Props> = ({ visivel, aoFechar, onEditar, onDownloadPDF, onPartilhar }) => {
  return (
    <Modal
      isVisible={visivel}
      onBackdropPress={aoFechar}
      onBackButtonPress={aoFechar}
      backdropOpacity={0.4}
      useNativeDriver
    >
      <View style={styles.modalBox}>
        <Text style={styles.titulo}>Opções</Text>
        <View style={styles.linhaSeparadora} />

        <TouchableOpacity style={styles.botaoEditar} onPress={onEditar}>
          <MaterialIcons name="edit" size={22} color="#2565A3" />
          <Text style={styles.textoEditar}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoPDF} onPress={onDownloadPDF}>
          <MaterialIcons name="download" size={22} color="white" />
          <Text style={styles.textoBotaoBranco}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoPartilhar} onPress={onPartilhar}>
          <MaterialIcons name="share" size={22} color="white" />
          <Text style={styles.textoBotaoBranco}>Partilhar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  linhaSeparadora: {
    height: 1,
    width: '100%',
    backgroundColor: '#E0E0E0', 
    marginBottom:15,
    marginTop:10
  },
  
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164878', 
  },
  botaoEditar: {
    borderWidth: 1.7,
    borderColor: '#2565A3',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 15,
    width: "100%",
    justifyContent: 'center',
  },
  textoEditar: {
    color: '#2565A3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  botaoPDF: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 15,
    width:"100%",
    justifyContent: 'center',
  },
  botaoPartilhar: {
    backgroundColor: '#2565A3',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: "100%",
    justifyContent: 'center',
  },
  textoBotaoBranco: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ModalOpcoesFatura;
