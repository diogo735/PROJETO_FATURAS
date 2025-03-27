// detalhes_fatura.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { scale } from 'react-native-size-matters';
const { height, width } = Dimensions.get('window');
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

type FaturaRouteProp = RouteProp<RootStackParamList, 'Fatura'>;

interface Props {
    route: FaturaRouteProp;
}

const DetalhesFatura: React.FC<Props> = ({ route }) => {
    const { id } = route.params;
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalhes da Fatura</Text>
                </View>

                <TouchableOpacity onPress={() => console.log('Mais opções')}>
                    <MaterialIcons name="more-vert" size={scale(24)} color="#fff" />
                </TouchableOpacity>
            </View>



            <Text>ID do Movimento: {id}</Text>
            {/* Adicione mais detalhes se quiser */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    header: {
        backgroundColor: '#2565A3',
        height: height * 0.08,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        elevation: 0,
    },
    headerTitle: {
        color: 'white',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: 18 * 0.05,
        marginLeft:15
    },

});

export default DetalhesFatura;
