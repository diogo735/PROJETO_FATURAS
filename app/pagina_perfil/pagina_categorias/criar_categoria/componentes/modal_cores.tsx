import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';

interface Props {
    visivel: boolean;
    aoFechar: () => void;
    corSelecionada: string;
    aoSelecionarCor: (cor: string) => void;
}

const coresDisponiveis: string[] = [
    '#00BFFF', '#BA55D3', '#9ACD32', '#FFA500', '#FF4500',
    '#1E90FF', '#DA70D6', '#8FBC8F', '#FFC107', '#FFB300',
    '#FFD54F', '#FBC02D', '#FFD700', '#FF6347',
    '#DC143C', '#B22222', '#C71585', '#FF69B4', '#FF1493',
    '#9932CC', '#9400D3', '#8A2BE2', '#4B0082', '#6A5ACD',
    '#7B68EE', '#4169E1', '#4682B4', '#191970', '#2E8B57',
    '#3CB371', '#20B2AA', '#5F9EA0', '#00CED1', '#40E0D0',
    '#48D1CC', '#00FA9A', '#7FFFD4', '#66CDAA', '#008080',
    '#008000', '#228B22', '#006400', '#556B2F', '#808000',
    '#B8860B', '#DAA520', '#D2691E', '#A0522D', '#8B4513',
    '#A52A2A', '#800000', '#8B0000', '#FF0000', '#FF8C00',
    '#FF7F50', '#FF6347', '#FF4590', '#FF1493', '#FF69B4',
    '#FF1493', '#FF1493', '#B03060', '#E30B5C', '#C71585',
    '#DB7093', '#DC143C', '#CD5C5C', '#F08080', '#FA8072',
    '#B22222', '#800080', '#9370DB', '#8B008B', '#9400D3',
    '#000080', '#00008B', '#0000CD', '#0000FF', '#1E90FF',
    '#4682B4', '#5F9EA0', '#6495ED', '#7B68EE', '#6A5ACD',
    // Novos amarelos

];


const ModalCores: React.FC<Props> = ({ visivel, aoFechar, corSelecionada, aoSelecionarCor }) => {
    //console.log('🎨 ModalCores recebeu corSelecionada:', corSelecionada);

    return (
        <Modal
            isVisible={visivel}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={300}
            animationOutTiming={300}
            onBackdropPress={aoFechar}
            onSwipeComplete={aoFechar}
            swipeDirection="down"
            style={styles.modal}
        >
            <View style={styles.overlay}>
                <View style={styles.modalInterno}>
                    <View style={styles.handle} />
                    <Text style={styles.titulo}>Selecionar uma cor</Text>

                    <FlatList
                        data={coresDisponiveis}
                        keyExtractor={(item) => item}
                        numColumns={6}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.bolinha,
                                    { backgroundColor: item },
                                    corSelecionada.toLowerCase() === item.toLowerCase() && styles.selecionada

                                ]}
                                onPress={() => {
                                    aoSelecionarCor(item);
                                    aoFechar();
                                }}
                            >
                                {corSelecionada.toLowerCase() === item.toLowerCase() && (
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                )}

                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default ModalCores;

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',

    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#999',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 10,
    },
    modalInterno: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 16,
        maxHeight: '70%',
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#164878',
    },
    bolinha: {
        width: 42,
        height: 42,
        borderRadius: 21,
        margin: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selecionada: {
        borderWidth: 3,
        borderColor: '#2565A3',
    },
});
