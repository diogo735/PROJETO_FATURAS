import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ImageSourcePropType } from 'react-native';
import Modal from 'react-native-modal';
import { listarCategoriasComTipo } from '../../../BASEDEDADOS/categorias';
import { Categoria } from '../../../BASEDEDADOS/tipos_tabelas';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SetaDespesas from '../../../assets/icons/pagina_camera/despesa.svg';
import SetaReceitas from '../../../assets/icons/pagina_camera/receita.svg';

import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { Animated, Easing } from 'react-native';
import Iconratio from '../../../assets/imagens/wallpaper.svg';
import { listarSubCategorias } from '../../../BASEDEDADOS/sub_categorias';
import { SubCategoria } from '../../../BASEDEDADOS/tipos_tabelas';
import { useIsFocused } from '@react-navigation/native';

import SubcategoriaSelecionavel from './card_subcategoria';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
const { width, height } = Dimensions.get('window');
interface Props {
  visivel: boolean;
  aoFechar: () => void;
  aoSelecionarCategoria: (categoriaId: number | null) => void;
  categoriaAtual?: (Categoria & { tipo_nome: string }) | null;
  subcategoriaAtual?: number | null;
  aoSelecionarSubcategoria: (subCategoriaId: number | null) => void;
  onCategoriaCriada?: () => void;
}
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';



function getImagemCategoria(img_cat: any): ImageSourcePropType {
  // Se já for um objeto (tipo require), retorna diretamente
  if (typeof img_cat === 'object' && img_cat !== null && img_cat.uri === undefined) {
    return img_cat;
  }

  if (!img_cat || typeof img_cat !== 'string') {
    return require('../../../assets/imagens/categorias/outros.png');
  }

  // Se for imagem do usuário ou remota
  if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
    return { uri: img_cat };
  }

  const imagensLocais: Record<string, ImageSourcePropType> = {
    'compras_pessoais.png': require('../../../assets/imagens/categorias/compras_pessoais.png'),
    'contas_e_servicos.png': require('../../../assets/imagens/categorias/contas_e_servicos.png'),
    'despesas_gerais.png': require('../../../assets/imagens/categorias/despesas_gerais.png'),
    'educacao.png': require('../../../assets/imagens/categorias/educacao.png'),
    'estimacao.png': require('../../../assets/imagens/categorias/estimacao.png'),
    'financas.png': require('../../../assets/imagens/categorias/financas.png'),
    'habitacao.png': require('../../../assets/imagens/categorias/habitacao.png'),
    'lazer.png': require('../../../assets/imagens/categorias/lazer.png'),
    'outros.png': require('../../../assets/imagens/categorias/outros.png'),
    'restauracao.png': require('../../../assets/imagens/categorias/restauracao.png'),
    'saude.png': require('../../../assets/imagens/categorias/saude.png'),
    'transportes.png': require('../../../assets/imagens/categorias/transportes.png'),
    'alugel.png': require('../../../assets/imagens/categorias/receitas/alugel.png'),
    'caixa-de-ferramentas.png': require('../../../assets/imagens/categorias/receitas/caixa-de-ferramentas.png'),
    'deposito.png': require('../../../assets/imagens/categorias/receitas/deposito.png'),
    'dinheiro.png': require('../../../assets/imagens/categorias/receitas/dinheiro.png'),
    'lucro.png': require('../../../assets/imagens/categorias/receitas/lucro.png'),
    'presente.png': require('../../../assets/imagens/categorias/receitas/presente.png'),
    'salario.png': require('../../../assets/imagens/categorias/receitas/salario.png'),
  };

  return imagensLocais[img_cat] || imagensLocais['outros.png'];
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ModalCategorias: React.FC<Props> = ({ visivel, aoFechar, aoSelecionarCategoria, categoriaAtual, aoSelecionarSubcategoria, subcategoriaAtual, onCategoriaCriada }) => {
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<(Categoria & { tipo_nome: string })[]>([]);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const despesas = categorias.filter(cat => cat.tipo_nome === 'Despesa');
  const receitas = categorias.filter(cat => cat.tipo_nome === 'Receita');

  const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
  const [subSelecionadaId, setSubSelecionadaId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [prontoParaMostrar, setProntoParaMostrar] = useState(false);
  const [alturaCapturada, setAlturaCapturada] = useState(false);

  const [mostrarDespesas, setMostrarDespesas] = useState(true);

  const despesasAnim = useRef(new Animated.Value(1)).current;
  const receitasAnim = useRef(new Animated.Value(1)).current;
  const alturaRealReceitas = useRef(0);
  const [mostrarReceitas, setMostrarReceitas] = useState(true);
  const rotacaoDespesas = useRef(new Animated.Value(1)).current;
  const rotacaoReceitas = useRef(new Animated.Value(1)).current;
  const alturaRealDespesas = useRef(0);

  const rotacaoDespesasInterpolada = rotacaoDespesas.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'], // ← invertido
  });

  const rotacaoReceitasInterpolada = rotacaoReceitas.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'], // ← invertido
  });


  const animarDespesas = (abrir: boolean) => {
    Animated.parallel([
      Animated.timing(despesasAnim, {
        toValue: abrir ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotacaoDespesas, {
        toValue: abrir ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setMostrarDespesas(abrir);
    });
  };


  const toggleDespesas = () => {
    animarDespesas(!mostrarDespesas);
  };

  const animarReceitas = (abrir: boolean) => {
    Animated.parallel([
      Animated.timing(receitasAnim, {
        toValue: abrir ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotacaoReceitas, {
        toValue: abrir ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setMostrarReceitas(abrir);
    });
  };


  const toggleReceitas = () => {
    animarReceitas(!mostrarReceitas);
  };






  //NAO ESTA A MOSTRA NA PRIMEIRA VEZ AS DESPEAS É PRESISO CLICAR DUAS VEZES NO BOTAO
  useEffect(() => {
    if (visivel) {
      const ehReceita = categoriaAtual?.tipo_nome === 'Receita';
      const ehDespesa = categoriaAtual?.tipo_nome === 'Despesa';

      const mostrarSoDespesas = !ehReceita && !ehDespesa;

      // Animações visuais
      despesasAnim.setValue(ehDespesa || mostrarSoDespesas ? 1 : 0);
      receitasAnim.setValue(ehReceita ? 1 : 0);

      // Ícones de seta
      rotacaoDespesas.setValue(ehDespesa || mostrarSoDespesas ? 1 : 0);
      rotacaoReceitas.setValue(ehReceita ? 1 : 0);

      // Estados de controle (abertura)
      setMostrarDespesas(ehDespesa || mostrarSoDespesas);
      setMostrarReceitas(ehReceita);

      setCategoriaSelecionadaId(categoriaAtual?.id ?? null);
      setSubSelecionadaId(subcategoriaAtual ?? null);
    }
  }, [visivel]);










  const carregarCategorias = async () => {
    setCarregando(true); // Mostra spinner
    const lista = await listarCategoriasComTipo();
    const subs = await listarSubCategorias();
    if (lista) setCategorias(lista);
    if (subs) setSubcategorias(subs);
    setCarregando(false);
  };

  useEffect(() => {
    const carregarCategorias = async () => {
      setCarregando(true);
      const lista = await listarCategoriasComTipo();
      const subs = await listarSubCategorias();
      if (lista) setCategorias(lista);
      if (subs) setSubcategorias(subs);
      setCarregando(false);
      setProntoParaMostrar(true); // ✅ agora está pronto
    };

    if (visivel) {
      setProntoParaMostrar(false); // reset
      carregarCategorias();
    }
  }, [visivel]);




  const getSubcategoriasDaCategoria = (categoriaId: number) => {
    return subcategorias.filter(sub => sub.categoria_id === categoriaId);
  };

  const [modalCriarVisivel, setModalCriarVisivel] = useState(false);

  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    if (visivel) {
      rotateValue.setValue(0);

      const animateRotation = () => {
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          if (isMounted) {
            rotateValue.setValue(0);
            animateRotation();
          }
        });
      };

      animateRotation();
    }

    return () => {
      isMounted = false;
    };
  }, [visivel]);
  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const alturaModal = height * 0.7;

  if (!visivel || !prontoParaMostrar) return null;
  return (
    <Modal
      isVisible={visivel && prontoParaMostrar}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      onBackdropPress={aoFechar}
      onBackButtonPress={aoFechar}
      onSwipeComplete={aoFechar}
      swipeDirection="down"
      useNativeDriver={false}
      style={styles.modal}
    >
      <View style={[styles.container, carregando && { minHeight: alturaModal }]}>
        <View style={styles.handle} />
        
            <View style={styles.tituloLinha}>
              <Text style={styles.titulo}>Selecionar Categoria</Text>

              <TouchableOpacity onPress={() => setModalCriarVisivel(true)}>
                <Text style={styles.botaoCriarTexto}>+ Criar categoria</Text>
              </TouchableOpacity>
            </View>


            <ScrollView contentContainerStyle={{ paddingVertical: 1, }} showsVerticalScrollIndicator={false}>

              {/* Grupo DESPESAS */}
              <TouchableOpacity onPress={toggleDespesas}
                style={styles.grupoHeader}>
                <View style={styles.headerEsquerda}>
                  <SetaDespesas width={18} height={18} style={{ marginRight: 10 }} />
                  <Text style={[styles.grupoTitulo, { color: '#FF5733' }]}>Despesas</Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: rotacaoDespesasInterpolada }] }}>
                  <Ionicons name="chevron-up" size={20} color="#FF5733" />
                </Animated.View>


              </TouchableOpacity>

              <View
                style={{ position: 'absolute', opacity: 0, zIndex: -1, left: 0, right: 0 }}
                onLayout={(e) => {
                  alturaRealDespesas.current = e.nativeEvent.layout.height;
                  setAlturaCapturada(true);
                }}
                
              >
                {despesas.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <TouchableOpacity style={styles.card} activeOpacity={1}>
                      <View style={[styles.iconeWrapper, { backgroundColor: cat.cor_cat }]} />
                      <Text style={styles.nomeCategoria}>{cat.nome_cat}</Text>
                      <View style={styles.radio} />
                    </TouchableOpacity>
                    {getSubcategoriasDaCategoria(cat.id).map((sub) => (
                      <SubcategoriaSelecionavel
                        key={sub.id}
                        subcategoria={sub}
                        selecionadaId={null}
                        aoSelecionar={() => { }}
                      />
                    ))}

                  </React.Fragment>
                ))}
              </View>

              <Animated.View
                style={{
                  overflow: 'hidden',
                  height: alturaCapturada ? despesasAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, alturaRealDespesas.current],
                  }) : 0,
                }}
              >
                
                {despesas.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => {
                        const novaSelecao = categoriaSelecionadaId === cat.id ? null : cat.id;
                        aoSelecionarCategoria(novaSelecao);
                        aoSelecionarSubcategoria(null);
                        setCategoriaSelecionadaId(novaSelecao);
                        setSubSelecionadaId(null);
                        setTimeout(() => {
                          aoFechar();
                        }, 200);
                      }}
                    >
                      <View style={[styles.iconeWrapper, { backgroundColor: cat.cor_cat }]}>
                        <Image source={getImagemCategoria(cat.img_cat)} style={styles.icone} resizeMode="contain" />
                      </View>
                      <Text style={styles.nomeCategoria}>{cat.nome_cat}</Text>
                      {categoriaSelecionadaId === cat.id ? (
                        <View style={styles.radioSelecionado}><Ionicons name="checkmark" size={15} color="#fff" /></View>
                      ) : (
                        <View style={styles.radio} />
                      )}
                    </TouchableOpacity>

                    {getSubcategoriasDaCategoria(cat.id).map((sub) => (
                      <SubcategoriaSelecionavel
                        key={sub.id}
                        subcategoria={sub}
                        selecionadaId={subSelecionadaId}
                        aoSelecionar={(id) => {
                          const isMesmaSelecionada = subSelecionadaId === id;
                          const novaSelecao = isMesmaSelecionada ? null : id;
                          setSubSelecionadaId(novaSelecao);
                          setCategoriaSelecionadaId(null);
                          aoSelecionarSubcategoria(novaSelecao);
                          aoSelecionarCategoria(null);
                          aoFechar();
                        }}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </Animated.View>




              {/* Grupo RECEITAS */}
              <TouchableOpacity onPress={toggleReceitas} style={styles.grupoHeader}>
                <View style={styles.headerEsquerda}>
                  <SetaReceitas width={18} height={18} style={{ marginRight: 10 }} />
                  <Text style={[styles.grupoTitulo, { color: '#4AAF53' }]}>Receitas</Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: rotacaoReceitasInterpolada }] }}>
                  <Ionicons name="chevron-up" size={20} color="#4AAF53" />
                </Animated.View>

              </TouchableOpacity>

              <View
                style={{ position: 'absolute', opacity: 0, zIndex: -1, left: 0, right: 0 }}
                onLayout={(e) => {
                  alturaRealReceitas.current = e.nativeEvent.layout.height;
                  setAlturaCapturada(true);
                }}
              >
                {receitas.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <TouchableOpacity style={styles.card} activeOpacity={1}>
                      <View style={[styles.iconeWrapper, { backgroundColor: cat.cor_cat }]} />
                      <Text style={styles.nomeCategoria}>{cat.nome_cat}</Text>
                      <View style={styles.radio} />
                    </TouchableOpacity>
                    {getSubcategoriasDaCategoria(cat.id).map((sub) => (
                      <SubcategoriaSelecionavel
                        key={sub.id}
                        subcategoria={sub}
                        selecionadaId={null}
                        aoSelecionar={() => { }}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </View>

              <Animated.View
                style={{
                  overflow: 'hidden',
                  height:  alturaCapturada ? receitasAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, alturaRealReceitas.current],
                  }) : 0,
                }}
              >
                {receitas.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => {
                        const novaSelecao = categoriaSelecionadaId === cat.id ? null : cat.id;
                        aoSelecionarCategoria(novaSelecao);
                        aoSelecionarSubcategoria(null);
                        setCategoriaSelecionadaId(novaSelecao);
                        setSubSelecionadaId(null);
                        setTimeout(() => {
                          aoFechar();
                        }, 200);
                      }}
                    >
                      <View style={[styles.iconeWrapper, { backgroundColor: cat.cor_cat }]}>
                        <Image source={getImagemCategoria(cat.img_cat)} style={styles.icone} resizeMode="contain" />
                      </View>
                      <Text style={styles.nomeCategoria}>{cat.nome_cat}</Text>
                      {categoriaSelecionadaId === cat.id ? (
                        <View style={styles.radioSelecionado}><Ionicons name="checkmark" size={15} color="#fff" /></View>
                      ) : (
                        <View style={styles.radio} />
                      )}
                    </TouchableOpacity>

                    {getSubcategoriasDaCategoria(cat.id).map((sub) => (
                      <SubcategoriaSelecionavel
                        key={sub.id}
                        subcategoria={sub}
                        selecionadaId={subSelecionadaId}
                        aoSelecionar={(id) => {
                          const isMesmaSelecionada = subSelecionadaId === id;
                          const novaSelecao = isMesmaSelecionada ? null : id;
                          setSubSelecionadaId(novaSelecao);
                          setCategoriaSelecionadaId(null);
                          aoSelecionarSubcategoria(novaSelecao);
                          aoSelecionarCategoria(null);
                          aoFechar();
                        }}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </Animated.View>


            </ScrollView>
        
        <Modal isVisible={modalCriarVisivel} onBackdropPress={() => setModalCriarVisivel(false)}>
          <View style={styles.modalCriarCategoria}>
            <Text style={styles.modalTitulo}>Tipo de Categoria</Text>
            <View style={styles.linhaSeparadora} />
            <TouchableOpacity
              style={[styles.botaoOpcao, { backgroundColor: '#FF3B30' }]}
              onPress={() => {
                setModalCriarVisivel(false);
                navigation.navigate('CriarCategoria', {
                  tipo: 'Despesas',
                  onCategoriaCriada: () => {
                    carregarCategorias();
                    onCategoriaCriada?.();
                  }
                });
              }}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.textoOpcao}>Criar categoria Despesa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoOpcao, { backgroundColor: '#34C759' }]}
              onPress={() => {
                setModalCriarVisivel(false);
                navigation.navigate('CriarCategoria', {
                  tipo: 'Receitas',
                  onCategoriaCriada: () => {
                    carregarCategorias();
                    onCategoriaCriada?.();
                  }
                });
              }}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.textoOpcao}>Criar categoria Receita</Text>
            </TouchableOpacity>
          </View>
        </Modal>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: height * 0.7
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#999',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164878',
    marginBottom: 0,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  texto: {
    fontSize: 16,
    color: '#164878',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  iconeWrapper: {
    width: 50,
    height: 50,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icone: {
    width: 24,
    height: 24,
  },
  nomeCategoria: {
    flex: 1,
    fontSize: 16,
    color: '#164878',
    fontWeight: '600',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: '#607D8B',
  },
  radioSelecionado: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: '#164878',
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  grupoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'tomato',
  },
  headerEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tituloLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  botaoCriarTexto: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    backgroundColor: '#2867A4',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 99,
  },
  modalCriarCategoria: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#164878',
  },
  botaoOpcao: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  textoOpcao: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linhaSeparadora: {
    height: 1,
    width: '100%',
    backgroundColor: '#E0E0E0',

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,

  },
});

export default ModalCategorias;
