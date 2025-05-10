import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ImageSourcePropType } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../../../App'; // ajuste o caminho conforme a pasta
import GraficoBarras
  from './grafico_categoria';
import ListaSubCategorias from './lista_sub_categorias';
import ListaMovimentos_de_umaCategoria from './lista_movimentos_categoria';
const { width, height } = Dimensions.get('window');
import { ScrollView } from 'react-native';

type Props = {
  route: RouteProp<RootStackParamList, 'DetalhesCategoria'>;
};
function getImagemCategoria(img_cat: string): ImageSourcePropType {
  if (!img_cat) {
    return require('../../../../assets/imagens/categorias/outros.png');
  }

  if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
    return { uri: img_cat };
  }

  const imagensLocais: Record<string, ImageSourcePropType> = {
    'compras_pessoais.png': require('../../../../assets/imagens/categorias/compras_pessoais.png'),
    'contas_e_servicos.png': require('../../../../assets/imagens/categorias/contas_e_servicos.png'),
    'despesas_gerais.png': require('../../../../assets/imagens/categorias/despesas_gerais.png'),
    'educacao.png': require('../../../../assets/imagens/categorias/educacao.png'),
    'estimacao.png': require('../../../../assets/imagens/categorias/estimacao.png'),
    'financas.png': require('../../../../assets/imagens/categorias/financas.png'),
    'habitacao.png': require('../../../../assets/imagens/categorias/habitacao.png'),
    'lazer.png': require('../../../../assets/imagens/categorias/lazer.png'),
    'outros.png': require('../../../../assets/imagens/categorias/outros.png'),
    'restauracao.png': require('../../../../assets/imagens/categorias/restauracao.png'),
    'saude.png': require('../../../../assets/imagens/categorias/saude.png'),
    'transportes.png': require('../../../../assets/imagens/categorias/transportes.png'),
    'alugel.png': require('../../../../assets/imagens/categorias/receitas/alugel.png'),
    'caixa-de-ferramentas.png': require('../../../../assets/imagens/categorias/receitas/caixa-de-ferramentas.png'),
    'deposito.png': require('../../../../assets/imagens/categorias/receitas/deposito.png'),
    'dinheiro.png': require('../../../../assets/imagens/categorias/receitas/dinheiro.png'),
    'lucro.png': require('../../../../assets/imagens/categorias/receitas/lucro.png'),
    'presente.png': require('../../../../assets/imagens/categorias/receitas/presente.png'),
    'salario.png': require('../../../../assets/imagens/categorias/receitas/salario.png'),
  };

  return imagensLocais[img_cat] || imagensLocais['outros.png'];
}

const DetalhesCategoria: React.FC<Props> = ({ route }) => {
  const { categoriaId, nomeCategoria, imgCategoria, corCategoria } = route.params;
  const navigation = useNavigation();
  const [mesSelecionado, setMesSelecionado] = React.useState<string>(() => {
    const hoje = new Date();
    const mes = hoje.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  });

  const dataAtual = new Date();
  const dataMinima = new Date(dataAtual);
  dataMinima.setFullYear(dataAtual.getFullYear() - 1);
  dataMinima.setDate(1);
  dataMinima.setHours(0, 0, 0, 0);

  const [dataSelecionada, setDataSelecionada] = React.useState<Date>(new Date());
  const isAfterOrSameMonth = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() > date2.getFullYear() ||
      (date1.getFullYear() === date2.getFullYear() && date1.getMonth() >= date2.getMonth())
    );
  };

  const isBeforeOrSameMonth = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() < date2.getFullYear() ||
      (date1.getFullYear() === date2.getFullYear() && date1.getMonth() <= date2.getMonth())
    );
  };

  const goToPreviousMonth = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setMonth(novaData.getMonth() - 1);
    if (isAfterOrSameMonth(novaData, dataMinima)) {
      setDataSelecionada(novaData);
      atualizarTextoMes(novaData);
    }

  };

  const goToNextMonth = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setMonth(novaData.getMonth() + 1);
    if (isBeforeOrSameMonth(novaData, dataAtual)) {
      setDataSelecionada(novaData);
      atualizarTextoMes(novaData);
    }

  };

  const atualizarTextoMes = (data: Date) => {
    const mes = data.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    setMesSelecionado(mes.charAt(0).toUpperCase() + mes.slice(1));
  };

  const dadosSubCategoria = [
    {
      id: 1,
      nota: 'Supermercado',
      valor: -50,
      data_movimento: '2025-05-10T12:00:00Z',
      nome_movimento: 'Despesa',
      categoria_id: 3,
      img_cat: 'compras_pessoais.png',
      cor_cat: '#FF5733',
      img_subcat: 'shopping',
      cor_subcat: '#FFAA33',
    },
    {
      id: 3,
      nota: 'Supermercado',
      valor: -50,
      data_movimento: '2025-05-10T12:00:00Z',
      nome_movimento: 'Despesa',
      categoria_id: 3,
      img_cat: 'compras_pessoais.png',
      cor_cat: '#FF5733',
      img_subcat: 'shopping',
      cor_subcat: '#FFAA33',
    },
    {
      id: 4,
      nota: 'Supermercado',
      valor: -50,
      data_movimento: '2025-05-10T12:00:00Z',
      nome_movimento: 'Despesa',
      categoria_id: 3,
      img_cat: 'compras_pessoais.png',
      cor_cat: '#FF5733',
      img_subcat: 'shopping',
      cor_subcat: '#FFAA33',
    },
    {
      id: 2,
      nota: 'Salário',
      valor: 1500,
      data_movimento: '2025-05-09T09:00:00Z',
      nome_movimento: 'Receita',
      categoria_id: 7,
      img_cat: 'salario.png',
      cor_cat: '#4CAF50',
    },
  ];




  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: corCategoria }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <Image
            source={getImagemCategoria(imgCategoria)}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{nomeCategoria}</Text>
        </View>

        <View style={styles.headerMonthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth} disabled={dataSelecionada <= dataMinima}>
            <MaterialIcons
              name="chevron-left"
              size={30}
              color={dataSelecionada <= dataMinima ? 'rgba(255,255,255,0.3)' : 'white'}
            />
          </TouchableOpacity>

          <Text style={styles.headerMonthText}>{mesSelecionado}</Text>

          {dataSelecionada.getMonth() < dataAtual.getMonth() || dataSelecionada.getFullYear() < dataAtual.getFullYear() ? (
            <TouchableOpacity onPress={goToNextMonth}>
              <MaterialIcons name="chevron-right" size={30} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 30 }} />
          )}
        </View>


      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>-159.63 €</Text>
        </View>

        <GraficoBarras
          cor="#C0C0C0"
          valoresX={["1 de abr.", "7 de abr.", "Hoje", "20 de abr.", "26 de abr."]}
          valoresY={[0, -20, -40, -60, -80]}
          valoresBarras={[10, 40, 70, 40, 75]}
          indiceHoje={2}
        />

        <Text style={styles.tituloSubcategoria}>Sub Categorias</Text>

        <ListaSubCategorias
          subcategorias={[
            { nome: 'Saúde', cor: '#E74C3C', icone: 'heart', valor: 50, percentagem: 100 },
            { nome: 'Compras pessoais', cor: '#FF00FF', icone: 'shopping', valor: 9, percentagem: 11.8 },
            { nome: 'Transportes', cor: '#E67E22', icone: 'car', valor: 16, percentagem: 35.5 },
            { nome: 'Lazer', cor: '#9B59B6', icone: 'drama-masks', valor: 3, percentagem: 3.8 },
          ]}
        />

        <Text style={styles.tituloSubcategoria}>Movimentos</Text>

        <ListaMovimentos_de_umaCategoria movimentos={dadosSubCategoria} />
      </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: height * 0.23,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    overflow: 'hidden',
  },


  headerTop: {
    height: height * 0.08,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerImage: {
    width: width * 0.15,
    height: width * 0.15,
    marginTop: - (height * 0.05),
    marginBottom: 9,
  },

  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  content: {
    paddingBottom: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: height,
  },



  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  headerMonthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
    marginHorizontal: width * 0.09,
  },

  headerMonthText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 16,
    color: '#2565A3',
    fontWeight: 'bold',
  },

  totalValue: {
    fontSize: 22,
    color: 'red',
    fontWeight: 'bold',
  },
  tituloSubcategoria: {
    fontSize: 18,
    color: '#2565A3',
    fontWeight: 'bold',
    marginTop: '2%',
    marginBottom: '0%',
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },


});


export default DetalhesCategoria;
