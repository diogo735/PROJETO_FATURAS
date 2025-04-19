import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SubCategoria } from '../../../../BASEDEDADOS/tipos_tabelas';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ModalOpcoesSubcategoria from './modal_opcoes_categoria';
import ModalConfirmarExclusao from '../eliminar_categoria/modal_eliminar_eliminar_categoria';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../App';

interface Props {
    visivel: boolean;
    subcategorias: SubCategoria[];
    tipoSelecionado: 'Despesas' | 'Receitas';
    aoAtualizarCategorias?: () => void;
}



const SubcategoriaLista: React.FC<Props> = ({ visivel, subcategorias, tipoSelecionado,aoAtualizarCategorias }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const corRamo = tipoSelecionado === 'Despesas' ? '#FF3B30' : '#34C759';

    const [modalVisible, setModalVisible] = useState(false);
    const [subSelecionada, setSubSelecionada] = useState<SubCategoria | null>(null);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);


    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: visivel ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [visivel]);



    return (
        <Animated.View
            style={{
                overflow: 'hidden',
                paddingLeft: 30,
                paddingRight: 15,
                borderStartColor: 'red',
                paddingTop: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 4],
                }),
                height: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, subcategorias.length * 80],
                }),
                position: 'relative',
            }}
        >
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 35,
                    left: 20,
                    width: 3,
                    borderRadius: 22,
                    backgroundColor: corRamo,
                }}
            />

            {subcategorias.map((sub, index) => (
                <View key={sub.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Ramo esquerdo com traço ├── */}
                    <View style={styles.ramoWrapper}>
                        {/* Linha horizontal que liga ao cartão */}
                        <View style={[styles.linhaHorizontal, { backgroundColor: corRamo }]} />
                        {index < subcategorias.length - 1 && (
                            <View style={[styles.ramoVertical, { backgroundColor: corRamo }]} />
                        )}

                    </View>


                    <TouchableOpacity
                        onPress={() => {
                            setSubSelecionada(sub);
                            setModalVisible(true);
                        }}


                        style={styles.card}
                        activeOpacity={0.5}
                    >
                        <View style={[styles.iconeWrapper, { backgroundColor: sub.cor_subcat }]}>
                            <FontAwesome name={sub.icone_nome} size={22} color="#fff" />
                        </View>
                        <Text style={styles.nomeCategoria}>{sub.nome_subcat}</Text>
                        <MaterialIcons name="edit" size={18} color="#164878" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                </View>
            ))}
            <ModalOpcoesSubcategoria
                visivel={modalVisible && subSelecionada !== null}
                aoFechar={() => {
                    setModalVisible(false);
                    setTimeout(() => setSubSelecionada(null), 300); // após animação de fechar
                }}
                aoEditar={() => {
                    setModalVisible(false);

                    if (subSelecionada) {
                        navigation.navigate('EditarSubcategoria', { id_subcategoria: subSelecionada.id });
                        setSubSelecionada(null);
                    }

                }}

                aoApagar={() => {
                    setModalVisible(false);

                    setModalConfirmarVisible(true);

                }}

            />
            <ModalConfirmarExclusao
                visivel={modalConfirmarVisible && subSelecionada !== null}
                nomeSubcategoria={subSelecionada?.nome_subcat || ''}
                idSubcategoria={subSelecionada ? subSelecionada.id : 0}
                setVisivel={setModalConfirmarVisible} 
                corSubcategoria={subSelecionada?.cor_subcat || '#ccc'}
                icone={subSelecionada?.icone_nome || 'question'}
                aoCancelar={() => {
                    setModalConfirmarVisible(false);
                    setSubSelecionada(null);
                }}
                aoConfirmar={() => {        
                    setModalConfirmarVisible(false);
                    setSubSelecionada(null);
                }}
                onSucesso={aoAtualizarCategorias}
            />


        </Animated.View>
    );
};

const styles = StyleSheet.create({
    subItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: 12,
        marginVertical: 4,
        padding: 10,
        paddingLeft: 12,
        marginLeft: 20,
    },
    subIconeWrapper: {
        width: 30,
        height: 30,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        marginLeft: 20,
        marginRight: 5,
    },
    iconeWrapper: {
        width: 50,
        height: 50,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    nomeCategoria: {
        fontSize: 16,
        color: '#164878',
        fontWeight: '600',
        flex: 1,
    },
    ramoWrapper: {
        width: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
    },

    linhaHorizontal: {
        height: 3,
        width: 30,
        borderRadius: 99,
        alignSelf: 'flex-start',
        marginTop: 0,
        marginLeft: -10,
        marginRight: 0
    },
    ramoVertical: {
        position: 'absolute',
        top: 0,
        left: 9,
        right: 0,
        bottom: 0,
        width: 2,

    }



});

export default SubcategoriaLista;
