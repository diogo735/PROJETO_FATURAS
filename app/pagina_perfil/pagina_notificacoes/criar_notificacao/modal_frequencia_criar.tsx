import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';

const { height } = Dimensions.get('window');

type ModalFrequenciaProps = {
    visivel: boolean;
    onFechar: () => void;
    frequenciaSelecionada: string;
    onSelecionar: (valor: string) => void;
};

const opcoes = ['Uma vez', 'Diariamente', 'Semanalmente', 'Mensalmente'];

const ModalFrequencia = ({ visivel, onFechar, frequenciaSelecionada, onSelecionar }: ModalFrequenciaProps) => {
    return (
        <Modal
            isVisible={visivel}
            onBackdropPress={onFechar}
            onSwipeComplete={onFechar}
            swipeDirection="down"
            style={styles.modal}
        >
            <View style={styles.modalContainer}>
                <View style={styles.dragIndicator} />

                <Text style={styles.titulo}>Selecionar Frequência</Text>

                {opcoes.map((opcao) => (
                    <TouchableOpacity
                        key={opcao}
                        style={[
                            styles.botao,
                            frequenciaSelecionada === opcao && styles.botaoSelecionado,
                        ]}
                        onPress={() => onSelecionar(opcao)}
                    >
                        <Text
                            style={[
                                styles.textoBotao,
                                frequenciaSelecionada === opcao && styles.textoSelecionado,
                            ]}
                        >
                            {opcao}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Modal>
    );
};

export default ModalFrequencia;

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0, 
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 43,
        borderTopRightRadius: 43,
        padding: '5%',
    },
    dragIndicator: {
        alignSelf: 'center',
        width: 53,
        height: '2%',
        borderRadius: 999,
        backgroundColor: '#C4C4C4',
        marginBottom: '3%',
    },
    titulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2565A3',
        marginBottom: '5%',
    },
    botao: {
        borderWidth: 1.5,
        borderColor: '#BABABA',
        borderRadius: 20,
        paddingVertical: '5%',
        alignItems: 'center',
        marginBottom: '5%',
    },
    botaoSelecionado: {
        backgroundColor: '#2565A3',
        borderColor: '#2565A3',
    },
    textoBotao: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2565A3',
    },
    textoSelecionado: {
        color: '#fff',
    },
});
