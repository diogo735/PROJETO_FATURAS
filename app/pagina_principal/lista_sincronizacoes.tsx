import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { listarSincronizacoes } from '../../BASEDEDADOS/sincronizacao';
import Modal from 'react-native-modal';


const ListaSincronizacoes = () => {
    const [sincronizacoes, setSincronizacoes] = useState<any[]>([]);
    useEffect(() => {
        const carregar = async () => {
            const fila = await listarSincronizacoes();

            setSincronizacoes(fila);
        };

        carregar();
    }, []);


    const [modalVisivel, setModalVisivel] = useState(false);
    const [itemSelecionado, setItemSelecionado] = useState<any | null>(null);

    const abrirModal = (item: any) => {
        setItemSelecionado(item);
        setModalVisivel(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Lista de Sincronizações</Text>

            <FlatList
                data={sincronizacoes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => abrirModal(item)}>
                        <View style={styles.item}>
                            <Text style={styles.tipo}>{item.tipo.toUpperCase()} - {item.operacao}</Text>
                            <Text style={styles.data}>{new Date(item.created_at).toLocaleString()}</Text>
                            <Text numberOfLines={1} style={styles.payload}>📦 {item.payload}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                contentContainerStyle={{ paddingTop: 20 }}
            />
            <Modal
                isVisible={modalVisivel}
                onBackdropPress={() => setModalVisivel(false)}
                animationIn="zoomIn"
                animationOut="zoomOut"
            >
                <View style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 15,
                }}>
                    {itemSelecionado && (
                        <>
                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#2565A3' }}>
                                {itemSelecionado.tipo.toUpperCase()} - {itemSelecionado.operacao}
                            </Text>

                            <Text style={{ marginTop: 10, fontSize: 12, color: '#777' }}>
                                {new Date(itemSelecionado.created_at).toLocaleString()}
                            </Text>

                            <View style={{ marginTop: 15 }}>
                                <Text style={{ fontWeight: 'bold', color: '#164878' }}>Conteúdo:</Text>
                                <Text style={{ fontSize: 14, color: '#333' }}>
                                    {JSON.stringify(JSON.parse(itemSelecionado.payload), null, 2)}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => setModalVisivel(false)}
                                style={{
                                    marginTop: 20,
                                    backgroundColor: '#2565A3',
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Fechar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>

        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2565A3',
    },
    item: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 1,
    },
    tipo: {
        fontWeight: 'bold',
        color: '#164878',
    },
    data: {
        color: '#7a7a7a',
        fontSize: 12,
        marginVertical: 4,
    },
    payload: {
        fontSize: 13,
        color: '#333',
    },

});

export default ListaSincronizacoes;
