import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native';

const { height } = Dimensions.get('window');
import Modal from 'react-native-modal';

const PaginaNotificacoes = () => {
    const navigation = useNavigation();
    const [modalVisivel, setModalVisivel] = React.useState(false);
    const scrollOffsetY = React.useRef(0);

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>🔔 Notificações</Text>

            <TouchableOpacity style={styles.botaoAbrirModal} onPress={() => setModalVisivel(true)}>
                <Text style={styles.textoBotao}>Abrir Notificações</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
                <Text style={styles.textoBotao}>Voltar</Text>
            </TouchableOpacity>


            <Modal
                isVisible={modalVisivel}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                onBackdropPress={() => setModalVisivel(false)}
                onSwipeComplete={() => setModalVisivel(false)}
                swipeDirection={['down']}
                scrollOffset={scrollOffsetY.current}
                scrollOffsetMax={300} // ou o valor máximo do seu scroll
                style={styles.modal}
            >


                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPressOut={() => setModalVisivel(false)}>
                        <View style={styles.handle} />
                    </TouchableWithoutFeedback>

                    <Text style={styles.modalTitulo}>🔔 Notificações</Text>

                    <View style={styles.caixaAzul}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            onScroll={(e) => {
                                scrollOffsetY.current = e.nativeEvent.contentOffset.y;
                            }}
                            scrollEventThrottle={16}
                        >


                            {Array.from({ length: 10 }).map((_, index) => (
                                <TouchableOpacity key={index} style={styles.botaoVermelho}>
                                    <Text style={styles.textoBotaoVermelho}>Alerta {index + 1}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>


        </View>

    );
};

export default PaginaNotificacoes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 20,
    },
    botaoVoltar: {
        backgroundColor: '#164878',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    botaoFechar: {
        backgroundColor: '#164878',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 15,
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
    modalTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 12,
    },
    caixaAzul: {
        backgroundColor: '#2985DE',
        borderRadius: 12,
        padding: 12,
        maxHeight: '100%',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    botaoVermelho: {
        backgroundColor: '#E12D2D',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    textoBotaoVermelho: {
        color: 'white',
        fontWeight: 'bold',
    },
    botaoAbrirModal: {
        backgroundColor: '#164878',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    textoBotao: {
        color: 'white',
        fontWeight: 'bold',
    },


});
