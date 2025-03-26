// src/components/SettingsScreen.tsx
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, Alert, Dimensions, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
const { height, width } = Dimensions.get('window');
import FiltroIcon from '../../assets/icons/icon_filtros_movimentos.svg';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { scale } from 'react-native-size-matters';
import { useRef, useEffect } from 'react';
import BalancoGeral from './componentes/balanco_geral';
import { buscarMovimentosPorMesAno, obterBalancoGeral } from '../../BASEDEDADOS/movimentos';
import { Image } from 'react-native';
import ModalFiltros from './componentes/modal_filtros';


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
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: false }); // ou true se quiser animação
    }
  }, []);

  useEffect(() => {
    if (mesSelecionado) {
      const mes = mesSelecionado.mesIndex + 1;
      const ano = mesSelecionado.ano;
      carregarMovimentos(mes, ano);
      carregarBalanco(mes, ano);
    }
  }, [mesSelecionado]);
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
      const movimentosCarregados = await buscarMovimentosPorMesAno(mes, ano) || [];
      // console.log("Movimentos Carregados:", movimentosCarregados); 
      setMovimentos(movimentosCarregados);
    } catch (error) {
      console.error("Erro ao carregar movimentos:", error);
    }
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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movimentos</Text>
        <TouchableOpacity onPress={() => setFiltrosVisiveis(true)}>
          <FiltroIcon width={28} height={28} fill="#fff" />
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
              <BalancoGeral resumo={balancoGeral} />
              <ListaMovimentosAgrupada movimentos={movimentos} />
            </>
          )}
        </ScrollView>
        <ModalFiltros visivel={filtrosVisiveis} aoFechar={() => setFiltrosVisiveis(false)} />
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
