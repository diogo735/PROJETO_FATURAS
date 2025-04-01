// src/components/SettingsScreen.tsx
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, Alert, Dimensions, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
const { height, width } = Dimensions.get('window');
import FiltroIcon from '../../assets/icons/icon_filtros_movimentos.svg';
import FiltroIconActive from '../../assets/icons/icon_filtros_aplicados.svg';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { scale } from 'react-native-size-matters';
import { useRef, useEffect } from 'react';
import BalancoGeral from './componentes/balanco_geral';
import { buscarMovimentosPorMesAno, obterBalancoGeral } from '../../BASEDEDADOS/movimentos';
import { Image } from 'react-native';
import ModalFiltros from './componentes/modal_filtros';
import { useFocusEffect } from '@react-navigation/native';
import { Animated } from 'react-native';

import { useCallback } from 'react';


interface MovimentoComCategoria {
  id: number;
  nota: string;
  valor: number;
  data_movimento: string;
  nome_movimento: string;
  categoria_id: number;
  img_cat: string;
  cor_cat: string;
}
interface Filtros {
  categoriasSelecionadas: number[];
  faixaSelecionada: string | null;
  montanteInicial: string;
  montanteFinal: string;
  tipoSelecionado: 'Receita' | 'Despesa' | null;
  ordenacaoSelecionada: 'data' | 'maior' | 'menor' | null;
}

import ListaMovimentosAgrupada from './componentes/lista_moviementos/lsita_movimentos';

const ITEM_LARGURA = 125;

const Pagina_movimentos: React.FC = () => {

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const gerarMeses = () => {
    const lista = [];
    const dataBase = new Date(hoje.getFullYear(), hoje.getMonth() - 12, 1); // 12 meses atrás

    for (let i = 0; i < 14; i++) {
      const data = new Date(dataBase.getFullYear(), dataBase.getMonth() + i, 1);
      lista.push({
        nome: data.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
        ano: data.getFullYear(),
        mesIndex: data.getMonth(),
      });
    }

    return lista;
  };
  const meses = gerarMeses();
  const mesAtual = meses.find(m => m.ano === hoje.getFullYear() && m.mesIndex === hoje.getMonth());

  const [mesSelecionado, setMesSelecionado] = useState(mesAtual ?? meses[12]); // fallback para o último se não achar
  const scrollRef = useRef<ScrollView>(null);

  const [movimentos, setMovimentos] = useState<MovimentoComCategoria[]>([]);
  const [balancoGeral, setBalancoGeral] = useState({
    totalMovimentos: 0,
    totalDespesas: 0,
    totalReceitas: 0
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros | null>(null);

  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: false }); // ou true se quiser animação
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (mesSelecionado) {
        const mes = mesSelecionado.mesIndex + 1;
        const ano = mesSelecionado.ano;
        carregarMovimentos(mes, ano);
        carregarBalanco(mes, ano);
      }
    }, [mesSelecionado, filtrosAplicados])
  );
  

  const carregarBalanco = async (mes: number, ano: number) => {
    try {
      const resumo = await obterBalancoGeral(mes, ano);
      setBalancoGeral(resumo);
    } catch (error) {
      console.error("Erro ao carregar resumo mensal:", error);
    }
  };


  const carregarMovimentos = async (mes: number, ano: number) => {
    try {
      const todosMovimentos = await buscarMovimentosPorMesAno(mes, ano) || [];

      let filtrados = [...todosMovimentos];

      console.log("📦 Todos os movimentos carregados:", todosMovimentos.length);
      console.log("📋 Filtros aplicados:", filtrosAplicados);

      if (filtrosAplicados) {
        const {
          categoriasSelecionadas,
          faixaSelecionada,
          montanteInicial,
          montanteFinal,
          tipoSelecionado,
          ordenacaoSelecionada,
        } = filtrosAplicados;

        // Categoria
        if (categoriasSelecionadas.length > 0 && !(categoriasSelecionadas.length === 1 && categoriasSelecionadas[0] === 0)) {
          filtrados = filtrados.filter(m => categoriasSelecionadas.includes(m.categoria_id));
        }//console.log("🔎 Filtrando por categoria:", categoriasSelecionadas);


        // Tipo de movimento
        if (tipoSelecionado) {
          filtrados = filtrados.filter(m => m.nome_movimento === tipoSelecionado);
        }
        console.log("🔎 Filtrando por tipo:", tipoSelecionado);


        // Faixa de valor
        if (faixaSelecionada) {
          if (faixaSelecionada === 'Até 50€') {
            filtrados = filtrados.filter(m => Math.abs(m.valor) <= 50);
          } else if (faixaSelecionada === '50€–100€') {
            filtrados = filtrados.filter(m => Math.abs(m.valor) > 50 && Math.abs(m.valor) <= 100);
          } else if (faixaSelecionada === 'Mais de 100€') {
            filtrados = filtrados.filter(m => Math.abs(m.valor) > 100);
          }
        }//console.log("🔎 Faixa de valor:", faixaSelecionada);


        // Montantes personalizados
        if (montanteInicial || montanteFinal) {
          const min = parseFloat(montanteInicial) || 0;
          const max = parseFloat(montanteFinal) || Infinity;

          filtrados = filtrados.filter(m => {
            const valAbs = Math.abs(m.valor);
            return valAbs >= min && valAbs <= max;
          });
        }//console.log("🔎 Montante inicial:", montanteInicial, "final:", montanteFinal);


        // Ordenação
        if (ordenacaoSelecionada) {
          if (ordenacaoSelecionada === 'data') {
            filtrados.sort((a, b) => new Date(a.data_movimento).getTime() - new Date(b.data_movimento).getTime());
          } else if (ordenacaoSelecionada === 'maior') {
            filtrados.sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
          } else if (ordenacaoSelecionada === 'menor') {
            filtrados.sort((a, b) => Math.abs(a.valor) - Math.abs(b.valor));
          }
        }//console.log("📊 Ordenar por:", ordenacaoSelecionada);
      }
      console.log("✅ Movimentos após filtro:", filtrados.length);
      setMovimentos(filtrados);
    } catch (error) {
      console.error("Erro ao carregar movimentos:", error);
    }
  };

  const temFiltrosAtivos = () => {
    if (!filtrosAplicados) return false;

    const {
      categoriasSelecionadas,
      faixaSelecionada,
      montanteInicial,
      montanteFinal,
      tipoSelecionado,
      ordenacaoSelecionada,
    } = filtrosAplicados;

    return (
      (categoriasSelecionadas.length > 0 && !(categoriasSelecionadas.length === 1 && categoriasSelecionadas[0] === 0)) ||
      faixaSelecionada !== null ||
      montanteInicial !== '' ||
      montanteFinal !== '' ||
      tipoSelecionado !== null ||
      ordenacaoSelecionada !== null
    );
  };



  useLayoutEffect(() => {
    const centralizarMesAtual = () => {

      const index = meses.findIndex(m => m.nome === mesSelecionado.nome && m.ano === mesSelecionado.ano);
      if (index !== -1) {
        const itemLargura = 125;
        let offsetX = (itemLargura * index) - (width / 2) + (itemLargura / 2);

        offsetX = Math.max(offsetX, 0);
        const maxX = itemLargura * meses.length - width;
        offsetX = Math.min(offsetX, maxX);

        if (scrollRef.current) {
          scrollRef.current.scrollTo({ x: offsetX, y: 0, animated: false });
        }
      }
    };

    centralizarMesAtual();
  }, [mesSelecionado, meses]);

  useFocusEffect(
    React.useCallback(() => {
      //console.log("🔁 Resetando filtros ao focar na tela");
      setFiltrosAplicados(null);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movimentos</Text>
        <TouchableOpacity onPress={() => setFiltrosVisiveis(true)}>
          {temFiltrosAtivos() ? (
            <FiltroIconActive width={30} height={30} fill="#fff" />
          ) : (
            <FiltroIcon width={28} height={28} />
          )}
        </TouchableOpacity>

      </View>

      {/* Conteúdo da Página */}

      <View style={styles.mesSelectorContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10, // Adiciona padding à esquerda e à direita
            alignItems: 'center'
          }}
        >
          {meses.map((mes, index) => {
            const ativo = mes.nome === mesSelecionado.nome && mes.ano === mesSelecionado.ano;
            return (
              <TouchableOpacity
                key={index}
                style={styles.mesItem}
                onPress={() => {
                  const mesSelecionavel =
                    mes.ano < hoje.getFullYear() ||
                    (mes.ano === hoje.getFullYear() && mes.mesIndex <= hoje.getMonth());

                  if (!mesSelecionavel) return; // impede seleção de mês futuro

                  setMesSelecionado(mes);

                  let offsetX = (ITEM_LARGURA * index) - (width / 2) + (ITEM_LARGURA / 2) + 10;
                  offsetX = Math.max(offsetX, 0);
                  const maxX = ITEM_LARGURA * meses.length - width;
                  offsetX = Math.min(offsetX, maxX);

                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ x: offsetX, y: 0, animated: true });
                  }
                }}

              >
                <Text style={[styles.mesTexto, ativo && styles.mesTextoAtivo]}>
                  {mes.nome}
                </Text>

                {mes.ano !== anoAtual && (
                  <Text style={[styles.anoTexto, ativo && styles.anoTextoAtivo]}>
                    {mes.ano}
                  </Text>
                )}

                {ativo && (
                  <View
                    style={[
                      styles.indicadorAtivo,

                    ]}
                  />
                )}

              </TouchableOpacity>
            );
          })}
        </ScrollView>

      </View>

      {/* nclua aqui o conteúdo da lista */}
      <View style={styles.corpoLista}>
        <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
          {movimentos.length === 0 ? (
            <View style={styles.semMovimentosContainer}>
              <Image
                source={require('../../assets/imagens/sem_movimentos.png')}
                style={styles.imagemSemMovimento}
                resizeMode="contain"
              />
              <Text style={styles.textoSemMovimento}>
                Nenhum movimento para {mesSelecionado?.nome}
              </Text>
            </View>
          ) : (
            <>
              <BalancoGeral resumo={balancoGeral} expandidoInicial={!temFiltrosAtivos()} />
              <ListaMovimentosAgrupada movimentos={movimentos} />
            </>
          )}
        </ScrollView>
        <ModalFiltros
          visivel={filtrosVisiveis}
          aoFechar={() => setFiltrosVisiveis(false)}
          filtrosSalvos={filtrosAplicados}
          setFiltrosSalvos={setFiltrosAplicados}
        />

      </View>
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
    fontSize: scale(20),
    fontWeight: 'bold',
    letterSpacing: 18 * 0.05,
  },
  mesSelectorContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1.9,
    borderBottomColor: '#E0E0E0',
    height: height * 0.07,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  mesItem: {
    alignItems: 'center',
    width: ITEM_LARGURA,
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
    height: '100%',
  },
  mesTexto: {
    fontSize: scale(16),
    color: '#B0B0B0',
    fontWeight: '400',
  },
  mesTextoAtivo: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  anoTexto: {
    fontSize: 11,
    color: '#B0B0B0',
  },
  anoTextoAtivo: {
    color: '#FFA500',
  },
  indicadorAtivo: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 5,
    bottom: 0,
    backgroundColor: '#FFA300',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  corpoLista: {
    flex: 1,
    //backgroundColor: '#ADD8E6',
    alignItems: 'center',          // Centraliza na horizontal
    justifyContent: 'flex-start', //  Alinha tudo ao topo
    paddingTop: 10,               //  Espaçamento no topo
    gap: 15,                      //  Espaçamento entre os itens 
  },

  semMovimentosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.2,
    gap: 10,
  },

  imagemSemMovimento: {
    width: 200,
    height: 200,
    opacity: 0.7,
  },

  textoSemMovimento: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },


});
export default Pagina_movimentos;
