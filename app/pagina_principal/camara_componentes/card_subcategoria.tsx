import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SubCategoria } from '../../../BASEDEDADOS/tipos_tabelas';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
    subcategoria: SubCategoria;
    selecionadaId: number | null;
    aoSelecionar: (id: number) => void;
}

const SubcategoriaSelecionavel: React.FC<Props> = ({ subcategoria, selecionadaId, aoSelecionar }) => {
    const ativa = selecionadaId === subcategoria.id;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => aoSelecionar(subcategoria.id)}
            activeOpacity={0.6}
        >
            <View style={[styles.iconeWrapper, { backgroundColor: subcategoria.cor_subcat }]}>
                <FontAwesome name={subcategoria.icone_nome} size={20} color="#fff" />
            </View>
            <Text style={styles.nome}>{subcategoria.nome_subcat}</Text>
            {ativa ? (
                <View style={styles.radioSelecionado}>
                    <Ionicons name="checkmark" size={15} color="#fff" />
                </View>
            ) : (
                <View style={styles.radio} />
            )}

        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth:1,
        borderColor:'#D9D9D9',
        borderRadius: 12,
        padding: 10,
        marginHorizontal: 15,
        marginTop:-5,
        marginBottom: 12,
    },
    iconeWrapper: {
        width: 40,
        height: 40,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    nome: {
        fontSize: 15,
        color: '#164878',
        flex: 1,
        fontWeight: '500',
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 99,
        borderWidth: 2,
        borderColor: '#607D8B',
      },
      
      radioSelecionado: {
        width: 18,
        height: 18,
        borderRadius: 99,
        backgroundColor: '#164878',
        justifyContent: 'center',
        alignItems: 'center',
      },
      
});

export default SubcategoriaSelecionavel;
