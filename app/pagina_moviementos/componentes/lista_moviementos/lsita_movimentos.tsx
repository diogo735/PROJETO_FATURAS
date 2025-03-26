import React from 'react';
import { SectionList, Text, StyleSheet, View, Dimensions } from 'react-native';
import MovimentoCard from './1_movimento'; // caminho conforme seu projeto
import moment from 'moment';
const { height, width } = Dimensions.get('window');
import 'moment/locale/pt-br'; // ✅ importa o idioma português

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

const ListaMovimentosAgrupada: React.FC<Props> = ({ movimentos }) => {
    const sections = agruparMovimentosPorData(movimentos);
    return (
        <SectionList
            sections={sections}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            // Renderiza cada item (movimento) usando seu card
            renderItem={({ item }) => (
                <MovimentoCard
                    nome={item.nota} // agora o campo de nota é usado como "nome"
                    valor={Math.abs(item.valor)}
                    hora={item.data_movimento ? moment(item.data_movimento).format('HH:mm') : '--:--'}
                    cor={item.cor_cat}
                    imagem={item.img_cat}
                    tipo={item.nome_movimento === 'Despesa' ? 'Despesa' : 'Receita'}
                />
            )}
            // Cabeçalho de cada seção (a data)
            renderSectionHeader={({ section }) => (
                <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        paddingTop: 0,
        //backgroundColor: 'red',
        width: width * 0.95
    },
    sectionHeader: {
        fontSize: 15,
        fontWeight: '300',
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginBottom: 0,
        marginTop: 5,
        color: '#999B9F'
    },
});

export default ListaMovimentosAgrupada;
