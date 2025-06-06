import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  visivel: boolean;
  opcaoSelecionada: 'csv' | 'excel';
  aoFechar: () => void;
  aoConfirmar: (formato: 'csv' | 'excel') => void;
}

const ModalFormato: React.FC<Props> = ({
  visivel,
  aoFechar,
  aoConfirmar,
  opcaoSelecionada,
}) => {
  const [formatoTemp, setFormatoTemp] = useState<'csv' | 'excel'>(opcaoSelecionada);

  useEffect(() => {
    if (visivel) {
      setFormatoTemp(opcaoSelecionada);
    }
  }, [visivel, opcaoSelecionada]);

  const opcoes = [
    { chave: 'csv', rotulo: 'CSV (.csv)' },
    { chave: 'excel', rotulo: 'Excel (.xlsx)' },
  ] as const;

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
        <Text style={styles.titulo}>Selecionar Formato</Text>

        {opcoes.map(({ chave, rotulo }) => (
          <TouchableOpacity
            key={chave}
            style={styles.opcao}
            onPress={() => setFormatoTemp(chave)}
          >
            {formatoTemp === chave ? (
              <View style={styles.radioSelecionado}>
                <Ionicons name="checkmark" size={13} color="#fff" />
              </View>
            ) : (
              <View style={styles.radio} />
            )}
            <Text style={styles.opcaoTexto}>{rotulo}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.botoes}>
          <TouchableOpacity style={styles.cancelar} onPress={aoFechar}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.guardar}
            onPress={() => {
              aoConfirmar(formatoTemp);
              aoFechar();
            }}
          >
            <Text style={styles.textoGuardar}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164878',
    marginBottom: 16,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#607D8B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioSelecionado: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#164878',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  opcaoTexto: {
    fontSize: 15,
    color: '#164878',
    fontWeight: '500',
    marginTop: 0,
    marginLeft: 5,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 20,
  },
  cancelar: {
    flex: 1,
    backgroundColor: '#ACC8F7',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  textoCancelar: {
    fontWeight: 'bold',
    color: '#164878',
  },
  guardar: {
    flex: 1,
    backgroundColor: '#164878',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  textoGuardar: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ModalFormato;
