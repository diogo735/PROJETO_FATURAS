import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AlertaIcon from '../../assets/icons/sair.svg';


interface ModalLogoutProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    email?: string | null;
    pendentes?: number;
    loading?: boolean;
}

const ModalLogout: React.FC<ModalLogoutProps> = ({ visible, onConfirm, onCancel, email, pendentes, loading }) => {
    const [contador, setContador] = useState(5);

    useEffect(() => {
        if (visible) {
            setContador(5); // reinicia sempre que o modal abre
            const intervalo = setInterval(() => {
                setContador((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalo);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(intervalo);
        }
    }, [visible]);

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <AlertaIcon width={60} height={60} style={styles.iconeSvg} />
                    <Text style={styles.title}>Terminar Sessão</Text>
                    <Text style={styles.subtitle}>
                        {!email
                            ? 'Visto que não tens conta associada, vais perder todos os dados. Tens a certeza que queres sair?'
                            : pendentes && pendentes > 0
                                ? `Tens ${pendentes} alterações por sincronizar. Se saíres agora, vais perdê-las !?`
                                : 'Tens a certeza que queres sair da conta?'}
                    </Text>



                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                (contador > 0 || loading) && { backgroundColor: '#aaa' }
                            ]}
                            onPress={onConfirm}
                            disabled={contador > 0 || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmText}>
                                    {contador > 0 ? `Aguarda ${contador}s` : 'Sim, sair'}
                                </Text>
                            )}
                        </TouchableOpacity>


                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#000000aa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconeSvg: {
        marginBottom: 20,
    },

    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D92C2C',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
        borderRadius: 99,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelText: {
        color: '#333',
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#D92C2C',
        borderRadius: 99,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ModalLogout;
