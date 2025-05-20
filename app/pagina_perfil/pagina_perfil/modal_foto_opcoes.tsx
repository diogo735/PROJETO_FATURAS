// ModalOpcoesCamera.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface Props {
    visivel: boolean;
    aoFechar: () => void;
    onAbrirGaleria?: () => void;
    onInserirManual?: () => void;
}

const ModalOpcoesCamera_editarfoto: React.FC<Props> = ({ visivel, aoFechar, onAbrirGaleria, onInserirManual }) => {
    return (
        <Modal
            isVisible={visivel}
            onBackdropPress={aoFechar}
            onBackButtonPress={aoFechar}
            backdropOpacity={0.4}
            useNativeDriver
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            animationInTiming={250}
            animationOutTiming={200}
            hideModalContentWhileAnimating={true}
        >
            <View style={styles.modalBox}>
                <Text style={styles.titulo}>Alterar Imagem </Text>
                <View style={styles.linhaSeparadora} />

                <TouchableOpacity style={styles.botaoGaleria} onPress={onAbrirGaleria}>
                    <MaterialIcons name="photo-library" size={22} color="white" />
                    <Text style={styles.textoBotaoBranco}>Inserir da Galeria</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoManual} onPress={onInserirManual}>
                    <MaterialIcons name="photo-camera" size={22} color="white" />
                    <Text style={styles.textoBotaoBranco}>Tirar Fotografia</Text>
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
        marginBottom: 15,
        marginTop: 10,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#164878',
    },
    botaoGaleria: {
        backgroundColor: '#2565A3',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 15,
        width: '100%',
        justifyContent: 'center',
      },
      botaoManual: {
        backgroundColor: '#4CAF50',
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

export default ModalOpcoesCamera_editarfoto;
