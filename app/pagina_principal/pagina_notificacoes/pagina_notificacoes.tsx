import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native';

const { height } = Dimensions.get('window');
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters';

const PaginaNotificacoes = () => {
    const navigation = useNavigation();
    const [modalVisivel, setModalVisivel] = React.useState(false);
    const scrollOffsetY = React.useRef(0);

    return (
        <View style={styles.container}>
            {/* NAVBAR AZUL */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={24} color="#2565A3" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notificações</Text>
                </View>
            </View>

            {/* */}
            <View style={styles.main}>

            </View>


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
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 20,
    },
    header: {
        backgroundColor: 'white',
        height: height * 0.08,
        width:'100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
    },
    headerTitle: {
        color: '#2565A3',
        fontSize: scale(17),
        fontWeight: 'bold',
        marginLeft: scale(20),
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        width: '100%',
    },


});
