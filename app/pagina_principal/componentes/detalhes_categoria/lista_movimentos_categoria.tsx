import React from 'react';
import { SectionList, Text, StyleSheet, View, Dimensions } from 'react-native';
import MovimentoCard2 from './1_movimos_de_uma_categoria';
import moment from 'moment';
const { height, width } = Dimensions.get('window');
import 'moment/locale/pt-br';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../App';
import { useMoeda } from '../../../MOEDA';

type NavigationProp = StackNavigationProp<RootStackParamList>;



// Exemplo de dados em seções


interface Movimento {
    id: number;
    nota: string;
    valor: number;
    data_movimento: string;
    nome_movimento: string;
    categoria_id: number;
    img_cat: string;
    cor_cat: string;
    img_subcat?: string;
    cor_subcat?: string;
}

interface Props {
    movimentos: Movimento[];
}
// Funçã
// o para agrupar os movimentos por data
const agruparMovimentosPorData = (movimentos: Movimento[]) => {
    const mapa: { [data: string]: Movimento[] } = {};

    movimentos.forEach((mov) => {
        moment.locale('pt-br');
        // Formata a data para algo como "quinta-feira, 20 de fevereiro"
        const data = moment(mov.data_movimento);
        const anoAtual = moment().year();

        const dataFormatada = data.year() === anoAtual
            ? data.format('dddd, D [de] MMMM')
            : data.format('dddd, D [de] MMMM [de] YYYY');

        if (!mapa[dataFormatada]) {
            mapa[dataFormatada] = [];
        }
        mapa[dataFormatada].push(mov);
    });

    // Converte o objeto mapa para um array de seções
    const sections = Object.keys(mapa).map((data) => ({
        title: data,
        data: mapa[data],
    }));

    return sections;
};

const ListaMovimentos_de_umaCategoria: React.FC<Props> = ({ movimentos }) => {
const { moeda } = useMoeda();

    const navigation = useNavigation<NavigationProp>();
    const sections = agruparMovimentosPorData(movimentos);
    return (
        <SectionList
            sections={sections}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}

            renderItem={({ item }) => (
                <MovimentoCard2
                    nome={
                        item.nota?.trim()
                            ? item.nota
                            : item.nome_movimento === 'Despesa'
                                ? 'Despesa sem nome'
                                : 'Receita sem nome'
                    }
                    valor={Math.abs(item.valor)}
                    hora={item.data_movimento ? moment(item.data_movimento).format('HH:mm') : '--:--'}
                    cor={item.cor_subcat || item.cor_cat}
                    imagem={item.img_subcat || item.img_cat}

                    tipo={item.nome_movimento === 'Despesa' ? 'Despesa' : 'Receita'}
                    onPress={() => navigation.navigate('Fatura', { id: item.id })}
                />
            )}
            // Cabeçalho de cada seção (a data)
            renderSectionHeader={({ section }) => {
                const total = section.data.reduce((acc, item) => acc + item.valor, 0);

                const tipo = section.data[0]?.nome_movimento;
                const prefixo = tipo === 'Despesa' ? '- ' : tipo === 'Receita' ? '+ ' : '';

                const totalFormatado = `${prefixo}${Math.abs(total).toFixed(2)} ${moeda.simbolo}`;


                return (
                    <View style={styles.headerRow}>
                        <Text style={styles.sectionHeader}>{section.title}</Text>
                        <Text style={styles.sectionTotal}>{totalFormatado}</Text>
                    </View>
                );
            }}

            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        paddingTop: 0,
        width: width * 0.94
    },
    sectionHeader: {
        fontSize: 15,
        fontWeight: '300',
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginBottom: 0,
        marginTop: 0,
        color: '#999B9F'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 8,
    },

    sectionTotal: {
        fontSize: 15,
        fontWeight: '300',
        color: '#999B9F',
    },

});

export default ListaMovimentos_de_umaCategoria;

