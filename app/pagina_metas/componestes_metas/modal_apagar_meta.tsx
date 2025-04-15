import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, Dimensions } from 'react-native';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
    visivel: boolean;
    nomeMeta?: string;
    aoCancelar: () => void;
    aoApagar: (onSucesso: () => void, onErro: () => void) => void;
}

const ModalConfirmarApagar: React.FC<Props> = ({ visivel, nomeMeta, aoCancelar, aoApagar }) => {
    const [estado, setEstado] = useState<'confirmar' | 'sucesso' | 'erro'>('confirmar');
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (estado === 'sucesso' || estado === 'erro') {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0); // resetar ao voltar pro modo "confirmar"
        }
    }, [estado]);

    // Resetar estado sempre que o modal for reaberto
    useEffect(() => {
        if (visivel) setEstado('confirmar');
    }, [visivel]);

    const renderConteudo = () => {
        if (estado === 'sucesso') {
            return (
                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
                    <Text style={styles.titulo}>Meta eliminada com sucesso!</Text>
                    <TouchableOpacity onPress={aoCancelar} style={styles.botaoOk}>
                        <Text style={styles.textoOk}>OK</Text>
                    </TouchableOpacity>
                </Animated.View>
            );

        }

        if (estado === 'erro') {
            return (
                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>

                    <Ionicons name="close-circle" size={50} color="#F44336" />
                    <Text style={styles.titulo}>Erro ao eliminar meta</Text>
                    <TouchableOpacity onPress={aoCancelar} style={[styles.botaoOk, { backgroundColor: '#F44336' }]}>
                        <Text style={styles.textoOk}>OK</Text>
                    </TouchableOpacity>
                </Animated.View>
            );
        }

        // estado === 'confirmar'
        return (
            <>
                <Ionicons name="trash" size={50} color="#F54338" />
                <Text style={styles.titulo}>Eliminar Meta?</Text>
                <Text style={styles.subtitulo}>{nomeMeta}</Text>

                <View style={styles.botoesContainer}>
                    <TouchableOpacity onPress={aoCancelar} style={styles.botaoCancelar}>
                        <Text style={styles.textoCancelar}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            aoApagar(
                                () => setEstado('sucesso'),
                                () => setEstado('erro')
                            );
                        }}
                        style={styles.botaoExcluir}
                    >
                        <Text style={styles.textoExcluir}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    };

    return (
        <Modal transparent visible={visivel} animationType="fade" onRequestClose={aoCancelar}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {renderConteudo()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '80%',
        alignItems: 'center' as const,
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        marginTop: 10,
        color: '#164878',
        textAlign: 'center' as const,
    },
    subtitulo: {
        fontSize: 16,
        fontWeight: 'bold' as const,
        color: '#164878',
        marginTop: 6,
        marginBottom: 20,
        textAlign: 'center' as const,
    },
    botoesContainer: {
        flexDirection: 'row' as const,
        width: '100%',
        justifyContent: 'space-between' as const,
    },
    botaoCancelar: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#B0B0B0',
        borderRadius: 99,
        paddingVertical: 12,
        alignItems: 'center' as const,
    },
    textoCancelar: {
        color: 'white',
        fontWeight: 'bold' as const,
    },
    botaoExcluir: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: '#F54338',
        borderRadius: 99,
        paddingVertical: 12,
        alignItems: 'center' as const,
    },
    textoExcluir: {
        color: 'white',
        fontWeight: 'bold' as const,
    },
    botaoOk: {
        marginTop: 20,
        backgroundColor: '#164878',
        borderRadius: 99,
        paddingVertical: 12,
        paddingHorizontal: 40,
    },
    textoOk: {
        color: 'white',
        fontWeight: 'bold' as const,
        fontSize: 16,
    },
});

export default ModalConfirmarApagar;
