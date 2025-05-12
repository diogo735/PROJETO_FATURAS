import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ImageSourcePropType, Animated } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../../../App'; // ajuste o caminho conforme a pasta
import GraficoBarras
  from './grafico_categoria';
import ListaSubCategorias from './lista_sub_categorias';
import ListaMovimentos_de_umaCategoria from './lista_movimentos_categoria';
const { width, height } = Dimensions.get('window');
import { ScrollView } from 'react-native';
import { listarMovimentosPorCategoriaMesAno, obterSomaMovimentosPorCategoriaEMes, obterSomaMovimentosPorIntervaloFormatado, obterSomaMovimentosPorSubCategoriaEMes } from '../../../../BASEDEDADOS/movimentos';
import { obterTipoMovimentoPorCategoriaId } from '../../../../BASEDEDADOS/categorias';
import { listarSubCategoriasPorCategoriaId } from '../../../../BASEDEDADOS/sub_categorias';
import EmptySvg from '../../../../assets/icons/pagina_categorias/sem_categorias.svg';
import IconRotativo from '../../../../assets/imagens/wallpaper.svg';
import Nomov from '../../../../assets/icons/pagina_categorias/sem_movimentos.svg';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';



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
type SubcategoriaDetalhada = {
  id: number;
  nome: string;
  cor: string;
  icone: string;
  valor: number;
  percentagem: number;
};



const DetalhesCategoria: React.FC<Props> = ({ route }) => {
  const { categoriaId, nomeCategoria, imgCategoria, corCategoria } = route.params;
  const [totalMovimentos, setTotalMovimentos] = React.useState<number>(0);
  const [tipoCategoria, setTipoCategoria] = React.useState<string | null>(null);
  const [valoresY, setValoresY] = React.useState<number[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();
  const [mesSelecionado, setMesSelecionado] = React.useState<string>(() => {
    const hoje = new Date();
    const mes = hoje.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  });
  const [valoresX, setValoresX] = React.useState<string[]>([]);
  const [indiceHoje, setIndiceHoje] = React.useState<number>(-1);
  const [valoresBarras, setValoresBarras] = React.useState<number[]>([]);
  const [subcategorias, setSubcategorias] = React.useState<SubcategoriaDetalhada[]>([]);
  const [movimentosCategoria, setMovimentosCategoria] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);
  const fadeAnimVazio = React.useRef(new Animated.Value(0)).current;

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


  React.useEffect(() => {
    if (!carregando && totalMovimentos === 0) {
      Animated.timing(fadeAnimVazio, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [carregando, totalMovimentos]);

  function gerarLabelsComHoje(dataMes: Date): string[] {
  const ano = dataMes.getFullYear();
  const mes = dataMes.getMonth();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const step = Math.floor(ultimoDia / 5);

  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const mesmoMes = hoje.getMonth() === mes && hoje.getFullYear() === ano;

  const nomesMeses = [
    'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
    'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
  ];

  const labels: string[] = [];
  for (let i = 0; i < 5; i++) {
    const diaInicio = 1 + i * step;
    const diaFim = i === 4 ? ultimoDia : (i + 1) * step;
    const intervalo = `dia ${diaInicio} a ${diaFim}`;

    if (mesmoMes && diaHoje >= diaInicio && diaHoje <= diaFim) {
      labels.push(`Hoje`);
    } else {
      labels.push(intervalo);
    }
  }

  return labels;
}


  function gerarValoresY(valorTotal: number): number[] {
    const partes = 5;
    const passo = valorTotal / (partes - 1);

    const valores = [];
    for (let i = 0; i < partes; i++) {
      valores.push(parseFloat((i * passo).toFixed(2)));
    }

    return valores;
  }

  function dividirMesEm5Intervalos(dataMes: Date): { inicio: string, fim: string }[] {
    const ano = dataMes.getFullYear();
    const mes = dataMes.getMonth(); // 0-indexado
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const tamanhoGrupo = Math.floor(ultimoDia / 5);

    const intervalos = [];
    for (let i = 0; i < 5; i++) {
      const diaInicio = i * tamanhoGrupo + 1;
      const diaFim = i === 4 ? ultimoDia : (i + 1) * tamanhoGrupo;

      const dataInicio = new Date(ano, mes, diaInicio).toISOString().slice(0, 10); // yyyy-mm-dd
      const dataFim = new Date(ano, mes, diaFim).toISOString().slice(0, 10);

      intervalos.push({ inicio: dataInicio, fim: dataFim });
    }

    return intervalos;
  }

  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (carregando) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [carregando]);


  React.useEffect(() => {
    async function atualizarDados() {
      try {
        setCarregando(true);
        fadeAnim.setValue(0);
        fadeAnimVazio.setValue(0);
        const total = await obterSomaMovimentosPorCategoriaEMes(
          categoriaId,
          dataSelecionada.getMonth() + 1,
          dataSelecionada.getFullYear()
        );
        setTotalMovimentos(total);

        const tipo = await obterTipoMovimentoPorCategoriaId(categoriaId);
        setTipoCategoria(tipo);

        const labels = gerarLabelsComHoje(dataSelecionada);
        setValoresX(labels);

        const indice = labels.findIndex(label => label === "Hoje");
        setIndiceHoje(indice);

        const y = gerarValoresY(Math.abs(total));
        setValoresY(y);

        const intervalos = dividirMesEm5Intervalos(dataSelecionada);
        const valoresBarras = await Promise.all(
          intervalos.map(i =>
            obterSomaMovimentosPorIntervaloFormatado(categoriaId, i.inicio, i.fim)
          )
        );
        setValoresBarras(valoresBarras);

        // Subcategorias com totais e percentagens
        const subcats = await listarSubCategoriasPorCategoriaId(categoriaId);
        const mes = dataSelecionada.getMonth() + 1;
        const ano = dataSelecionada.getFullYear();

        const subcatsComTotais = await Promise.all(
          subcats.map(async (s: { id: number; nome: string; cor: string; icone: string }) => {
            const valor = await obterSomaMovimentosPorSubCategoriaEMes(s.id, mes, ano);
            return {
              ...s,
              valor: Math.abs(valor),
            };
          })
        );

        const totalSubcats = subcatsComTotais.reduce((acc, s) => acc + s.valor, 0);
        const subcatsFinal = subcatsComTotais
          .map(s => ({
            ...s,
            percentagem: totalSubcats ? parseFloat(((s.valor / totalSubcats) * 100).toFixed(1)) : 0,
          }))
          .sort((a, b) => b.percentagem - a.percentagem);


        setSubcategorias(subcatsFinal);

        const movimentos = await listarMovimentosPorCategoriaMesAno(categoriaId, mes, ano);
        setMovimentosCategoria(movimentos);
        setCarregando(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();

      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setCarregando(false);
      }
    }

    atualizarDados();
  }, [dataSelecionada]);

const swipeGesture = Gesture.Pan()
  .activeOffsetX([-10, 10]) // precisa mover mais de 10px na horizontal
  .failOffsetY([-10, 10])   // se mover mais de 10px no Y, falha
  .onEnd((event) => {
    if (Math.abs(event.translationX) > 50) {
      if (event.translationX > 0) {
        runOnJS(goToPreviousMonth)();
      } else {
        runOnJS(goToNextMonth)();
      }
    }
  });

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
<GestureDetector gesture={swipeGesture}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {carregando ? (
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: height * 0.3 }}>
            <Animated.View
              style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
                marginBottom: 20,
              }}
            >
              <IconRotativo width={50} height={50} fill="#2565A3" />
            </Animated.View>
            <Text style={{ color: '#2565A3', fontWeight: 'bold' }}>A carregar</Text>
          </View>
        ) : (
          <>
            {totalMovimentos === 0 ? (
              <Animated.View
                style={[
                  styles.vazioContainer2,
                  {
                    opacity: fadeAnimVazio,
                    transform: [{
                      translateY: fadeAnimVazio.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  },
                ]}
              >
                <Nomov width={width * 0.3} height={width * 0.3} />
                <Text style={styles.mensagemVazio}>
                  O mês de {mesSelecionado.toLowerCase()} não teve movimentos!
                </Text>
              </Animated.View>

            ) : (
              <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text
                    style={[
                      styles.totalValue,
                      {
                        color:
                          tipoCategoria === 'Despesa'
                            ? 'red'
                            : tipoCategoria === 'Receita'
                              ? 'green'
                              : 'black',
                      },
                    ]}
                  >
                    {tipoCategoria === 'Despesa'
                      ? '- '
                      : tipoCategoria === 'Receita'
                        ? '+ '
                        : ''}
                    {Math.abs(totalMovimentos).toFixed(2)} €
                  </Text>
                </View>

                <GraficoBarras
                  cor={corCategoria}
                  valoresX={valoresX}
                  valoresY={valoresY}
                  valoresBarras={valoresBarras}
                  indiceHoje={indiceHoje}
                  tipoCategoria={tipoCategoria}
                />

                <Text style={styles.tituloSubcategoria}>Sub Categorias</Text>

                {subcategorias.length > 0 ? (
                  <ListaSubCategorias
                    subcategorias={subcategorias}
                    tipoCategoria={tipoCategoria}
                  />
                ) : (
                  <View style={styles.vazioContainer}>
                    <EmptySvg width={width * 0.1} height={width * 0.1} />
                    <Text style={styles.mensagemVazio}>Ainda não tens categorias!</Text>
                  </View>
                )}

                <Text style={styles.tituloSubcategoria}>Movimentos</Text>
                <ListaMovimentos_de_umaCategoria movimentos={movimentosCategoria} />
              </Animated.View>
            )}
          </>
        )}

      </ScrollView></GestureDetector>
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
    //color: 'red',
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

  vazioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  vazioContainer2: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: height * .3,
  },

  mensagemVazio: {
    marginTop: 15,
    fontSize: 16,
    color: '#CBCBCB',
    fontWeight: '500',
    textAlign: 'center', // ← essencial
    textAlignVertical: 'center',
  },

});


export default DetalhesCategoria;
