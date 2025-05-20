import React from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MovimentoItem from './movimento_item';
import { format, isToday } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../../../App';
type NavigationProps = StackNavigationProp<RootStackParamList, 'Movimentos'>
const { width, height } = Dimensions.get('window');
interface Props {
    movimentos: any[];
}
const UltimosMovimentos: React.FC<Props> = ({ movimentos }) => {
    const navigation = useNavigation<NavigationProps>();

    const handleVerTodos = () => {
        navigation.navigate('Movimentos');
    };


    function formatarHora(dataStr: string): string {
        const data = new Date(dataStr);
        return data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    }

    function agruparPorDia(movimentos: any[]): { [chave: string]: any[] } {
        return movimentos.reduce((acc, movimento) => {
            const data = new Date(movimento.data_movimento);
            const chave = isToday(data) ? 'Hoje' : format(data, "d 'de' MMMM yyyy", { locale: pt });

            if (!acc[chave]) acc[chave] = [];
            acc[chave].push(movimento);
            return acc;
        }, {} as { [chave: string]: any[] });
    }
    function formatarNumero(valor: number): string {
        return valor % 1 === 0 ? valor.toString() : valor.toFixed(2);
    }

    function agruparPorHoraCheia(movimentos: any[]): { [hora: string]: any[] } {
        return movimentos.reduce((acc, movimento) => {
            const data = new Date(movimento.data_movimento);
            const horaCheia = data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }).split(':')[0] + ':00';

            if (!acc[horaCheia]) acc[horaCheia] = [];
            acc[horaCheia].push(movimento);
            return acc;
        }, {} as { [hora: string]: any[] });
    }
    function capitalizar(texto: string) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Últimos Movimentos</Text>
                <TouchableOpacity onPress={handleVerTodos}>
                    <View style={styles.verTodosContainer}>
                        <Text style={styles.verTodos}>Ver Todos</Text>
                        <MaterialIcons name="chevron-right" size={17} color="#1F67AB" />
                    </View>

                </TouchableOpacity>
            </View>

            {/* lista */}
            <View style={styles.listaContainer}>
                {movimentos.length === 0 ? (
                    <View style={styles.nenhumMovimentoContainer}>
                        <Image
                            source={require('../../../../assets/imagens/sem_movimentos.png')}
                            style={styles.nenhumMovimentoImagem}
                            resizeMode="contain"
                        />

                        <Text style={styles.nenhumMovimentoTexto}>Nenhum movimento registado!</Text>
                    </View>
                ) : (
                    Object.entries(agruparPorDia(movimentos)).map(([dia, lista]) => {
                        const totalDespesas = lista
                            .filter(m => m.nome_movimento === 'Despesa')
                            .reduce((acc, m) => acc + parseFloat(m.valor), 0);

                        const totalReceitas = lista
                            .filter(m => m.nome_movimento === 'Receita')
                            .reduce((acc, m) => acc + parseFloat(m.valor), 0);

                        return (
                            <View key={dia}>
                                <View style={styles.dataWrapper}>
                                    <Text style={styles.numeroDia}>
                                        {format(new Date(lista[0]?.data_movimento), 'd')}
                                    </Text>

                                    <View style={styles.colunaTexto}>
                                        <Text style={styles.diaMesAno}>
                                            {capitalizar(format(new Date(lista[0]?.data_movimento), 'EEEE', { locale: pt }))}
                                        </Text>
                                        <Text style={styles.diaMesAno}>
                                            {capitalizar(format(new Date(lista[0]?.data_movimento), 'MMMM yyyy', { locale: pt }))}
                                        </Text>
                                    </View>

                                    <View style={styles.resumoDia}>
                                        <Text
                                            style={[
                                                styles.totalReceita,
                                                totalReceitas === 0 && { color: '#969696' },
                                            ]}
                                        >
                                            +{formatarNumero(Number(totalReceitas) || 0)} €
                                        </Text>

                                        <Text
                                            style={[
                                                styles.totalDespesa,
                                                totalDespesas === 0 && { color: '#969696' },
                                            ]}
                                        >
                                            -{formatarNumero(Number(totalDespesas) || 0)} €
                                        </Text>
                                    </View>

                                </View>

                                <View style={styles.linhaDoDia}>
                                    <View
                                        style={[
                                            styles.trilhoDoDia,
                                            {
                                                backgroundColor:
                                                    lista[0]?.nome_movimento === 'Despesa' ? '#FCA5A5' : '#A7F3D0',
                                            },
                                        ]}
                                    />
                                </View>

                                {Object.entries(agruparPorHoraCheia(lista)).map(([horaCheia, movimentosHora], horaIndex, horaArray) => (
                                    <View key={horaCheia} style={{ marginBottom: horaIndex < horaArray.length - 1 ? 10 : 0 }}>
                                        <View style={styles.row}>
                                            {/* COLUNA ESQUERDA */}
                                            <View style={styles.linhaEsquerda}>
                                                <Text style={styles.hora}>{horaCheia}</Text>
                                                <View
                                                    style={[
                                                        styles.linhaVerticalContainer,
                                                        {
                                                            height: movimentosHora.length * 70,
                                                            marginTop: 0,
                                                        },
                                                    ]}
                                                >
                                                    {movimentosHora.map((mov, i) => (
                                                        <View
                                                            key={i}
                                                            style={{
                                                                height: 70,
                                                                width: 6,
                                                                backgroundColor:
                                                                    mov.nome_movimento === 'Despesa' ? '#FCA5A5' : '#A7F3D0',
                                                                borderTopLeftRadius: i === 0 ? 100 : 0,
                                                                borderTopRightRadius: i === 0 ? 100 : 0,
                                                                borderBottomLeftRadius: i === movimentosHora.length - 1 ? 100 : 0,
                                                                borderBottomRightRadius: i === movimentosHora.length - 1 ? 100 : 0,
                                                            }}
                                                        />
                                                    ))}
                                                </View>
                                            </View>

                                            {/* COLUNA DIREITA - Movimentos */}
                                            <View style={styles.movimentosDaHora}>
                                                {movimentosHora.map((mov, i) => (
                                                    <View key={i} style={{ marginBottom: i < movimentosHora.length - 1 ? 10 : 0 }}>
                                                        <MovimentoItem
                                                            nome={
                                                                mov.nota?.trim()
                                                                    ? mov.nota
                                                                    : mov.nome_movimento === 'Despesa'
                                                                        ? 'Despesa sem nome'
                                                                        : 'Receita sem nome'
                                                            }
                                                            valor={mov.valor}
                                                            hora={formatarHora(mov.data_movimento)}
                                                            cor={mov.cor_subcat || mov.cor_cat}
                                                            imagem={mov.icone_nome || mov.img_cat}
                                                            tipo={mov.nome_movimento}
                                                            onPress={() => navigation.navigate('Fatura', { id: mov.id })}
                                                        />

                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        );
                    }))}
            </View>


            {movimentos.length > 0 && (
                <TouchableOpacity onPress={handleVerTodos}>
                    <Text style={styles.verTodosFim}>Ver Todos</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '95%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: width * 0.03,
        alignSelf: 'center',
        marginTop: height * 0.045,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titulo: {
        fontSize: 15.45,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 8,
    },
    verTodosContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verTodos: {
        fontSize: 12.36,
        color: '#1F67AB',
        fontWeight: '500',
    },
    listaContainer: {
        //backgroundColor: '#EDF6FF',
        borderRadius: 12,
        padding: 0,
        paddingBottom: 0,
        marginTop: -height * 0.009,
    },
    verTodosFim: {
        marginTop: height * 0.025,
        color: '#1F67AB',
        fontWeight: '500',
        fontSize: 12.36,
        textAlign: 'center',
        marginBottom: height * 0.010,
        textDecorationLine: 'underline'
    },
    tituloDia: {
        fontWeight: 'bold',
        fontSize: 24.87,
        color: '#164878',
        marginTop: 14,
        marginBottom: 6,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 0,
    },

    linhaEsquerda: {
        width: 55,
        alignItems: 'center',
        alignSelf: 'stretch',
    },


    hora: {
        fontSize: 16.61,
        color: '#164878',
        marginBottom: 2,
    },
    linhaVerticalContainer: {
        width: 6,
        justifyContent: 'space-between',

        marginBottom: 4,
    },
    metadeLinha: {
        height: '48%',
        width: '100%',
    },
    movimentosDaHora: {
        flex: 1,
        marginTop: 28,
    },
    linhaDoDia: {
        width: 55,
        alignItems: 'center',
        marginBottom: 2,
    },

    trilhoDoDia: {
        height: 16,
        width: 6,
        borderRadius: 6,
    },
    dataWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 4,
        marginBottom: 4,
    },

    numeroDia: {
        fontSize: 24.87,
        fontWeight: 'bold',
        color: '#164878',
        marginTop: -1,
    },

    colunaTexto: {
        flexDirection: 'column',
    },
    diaMesAno: {
        fontSize: 12.5,
        fontWeight: '500',
        color: '#164878',
        marginTop: 0,
    },
    resumoDia: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
        flex: 1,
        marginRight: 10,
    },

    totalReceita: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4AAF53',
    },

    totalDespesa: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F54338',
    },
    nenhumMovimentoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0,
    },

    nenhumMovimentoImagem: {
        width: 180,
        height: 180,
        marginBottom: 0,
        opacity: 0.6,
    },

    nenhumMovimentoTexto: {
        fontSize: 13,
        color: '#969696',
        fontWeight: '500',
    },


});

export default UltimosMovimentos;
