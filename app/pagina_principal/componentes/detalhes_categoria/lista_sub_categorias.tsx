import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');
type SubCategoria = {
    nome: string;
    cor: string;
    icone: string;
    valor: number;
    percentagem: number;
};

type Props = {
    subcategorias: SubCategoria[];
};

const ListaSubCategorias: React.FC<Props> = ({ subcategorias }) => {
    return (
        <View style={styles.container}>
            {subcategorias.map((item, index) => (
                <View key={index} style={styles.item}>
                    {/* círculo com ícone */}
                    <View style={[styles.circulo, { backgroundColor: item.cor }]}>
                        <MaterialCommunityIcons name={item.icone} color="white" size={25} />
                    </View>

                    {/* Nome + linha + % */}
                    <View style={styles.info}>
                        <Text style={styles.nome}>{item.nome}</Text>

                        <View style={styles.linhaComPercentagem}>
                            <View style={[styles.linha, { backgroundColor: item.cor, width: `${item.percentagem}%` }]} />
                            <Text style={styles.percentagem}>
                                {Number.isInteger(item.percentagem)
                                    ? item.percentagem
                                    : item.percentagem.toFixed(1)
                                }%
                            </Text>

                        </View>
                    </View>


                    {/* Valor */}
                    <Text style={styles.valor}>{item.valor} €</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginVertical:'3%'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    circulo: {
        width: height * 0.07,
        height: height * 0.07,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: '5%',
    },
    nome: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    linhaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linha: {
        height: 4,
        borderRadius: 2,
    },

    valor: {
        color: 'red',
        fontWeight: 'bold',
        marginLeft: '15%',
    },
    linhaComPercentagem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    percentagem: {
        fontSize: 12,
        fontWeight: '300',
        color: 'gray',
        marginLeft: '3%',
    },



});

export default ListaSubCategorias;
