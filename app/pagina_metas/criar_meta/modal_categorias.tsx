import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Modal from 'react-native-modal';

const { width } = Dimensions.get('window');

interface Props {
  visivel: boolean;
  aoFechar: () => void;
  aoSelecionarCategoria: (categoria: string) => void;
}

const categoriasMock = [
  'Habitação', 'Transporte', 'Alimentação', 'Educação', 'Lazer', 'Saúde', 'Compras'
];

const ModalCategorias: React.FC<Props> = ({ visivel, aoFechar, aoSelecionarCategoria }) => {
  return (
    <Modal
      isVisible={visivel}
      onBackdropPress={aoFechar}
      swipeDirection="down"
      onSwipeComplete={aoFechar}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.titulo}>Escolher Categoria</Text>

        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
          {categoriasMock.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.item}
              onPress={() => {
                aoSelecionarCategoria(cat);
                aoFechar();
              }}
            >
              <Text style={styles.texto}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#999',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164878',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  texto: {
    fontSize: 16,
    color: '#164878',
    fontWeight: '600',
  },
});

export default ModalCategorias;
