import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ImageSourcePropType } from 'react-native';
import Modal from 'react-native-modal';
import { listarCategoriasComTipo } from '../../../BASEDEDADOS/categorias';
import { Categoria } from '../../../BASEDEDADOS/tipos_tabelas';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SetaDespesas from '../../../assets/icons/pagina_camera/despesa.svg';
import SetaReceitas from '../../../assets/icons/pagina_camera/receita.svg';
const { width } = Dimensions.get('window');
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { Animated, Easing } from 'react-native';

interface Props {
  visivel: boolean;
  aoFechar: () => void;
  aoSelecionarCategoria: (categoriaId: number | null) => void;
  categoriaAtual?: (Categoria & { tipo_nome: string }) | null;
}



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

const ModalCategorias: React.FC<Props> = ({ visivel, aoFechar, aoSelecionarCategoria, categoriaAtual }) => {
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<(Categoria & { tipo_nome: string })[]>([]);

  const [mostrarDespesas, setMostrarDespesas] = useState(true);
  const [mostrarReceitas, setMostrarReceitas] = useState(true);
  const despesas = categorias.filter(cat => cat.tipo_nome === 'Despesa');
  const receitas = categorias.filter(cat => cat.tipo_nome === 'Receita');
  const alturaAnimadaDespesas = useState(new Animated.Value(1))[0]; // começa visível
  const [alturaDespesasVisivel, setAlturaDespesasVisivel] = useState(true);
  const alturaAnimadaReceitas = useState(new Animated.Value(0))[0]; // começa fechado
  const [alturaReceitasVisivel, setAlturaReceitasVisivel] = useState(false);

  const animarDespesas = () => {
    const paraAbrir = !alturaDespesasVisivel;

    Animated.timing(alturaAnimadaDespesas, {
      toValue: paraAbrir ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    setAlturaDespesasVisivel(paraAbrir);
  };

  const animarReceitas = () => {
    const paraAbrir = !alturaReceitasVisivel;

    Animated.timing(alturaAnimadaReceitas, {
      toValue: paraAbrir ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    setAlturaReceitasVisivel(paraAbrir);
  };


  useEffect(() => {
    if (visivel) {
      const ehReceita = !!(categoriaAtual && categoriaAtual.tipo_nome === 'Receita');


      alturaAnimadaDespesas.setValue(ehReceita ? 0 : 1);
      alturaAnimadaReceitas.setValue(ehReceita ? 1 : 0);

      setAlturaDespesasVisivel(!ehReceita);
      setAlturaReceitasVisivel(ehReceita);
    }
  }, [visivel]);




  useEffect(() => {
    const carregarCategorias = async () => {
      const lista = await listarCategoriasComTipo();
      if (lista) setCategorias(lista);
    };

    carregarCategorias();
  }, []);




  return (
    <Modal
      isVisible={visivel}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      onBackdropPress={aoFechar}
      onSwipeComplete={aoFechar}
      swipeDirection="down"
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.titulo}>Selecionar Categoria</Text>

        <ScrollView contentContainerStyle={{ paddingVertical: 1 }} showsVerticalScrollIndicator={false}>

          {/* Grupo DESPESAS */}
          <TouchableOpacity onPress={animarDespesas}
            style={styles.grupoHeader}>
            <View style={styles.headerEsquerda}>
              <SetaDespesas width={18} height={18} style={{ marginRight: 10 }} />
              <Text style={[styles.grupoTitulo, { color: '#FF5733' }]}>Despesas</Text>
            </View>
            <Ionicons name={alturaDespesasVisivel ? 'chevron-up' : 'chevron-down'} size={20} color="#FF5733" />
          </TouchableOpacity>





          <Animated.View
            style={{
              overflow: 'hidden',
              height: alturaAnimadaDespesas.interpolate({
                inputRange: [0, 1],
                outputRange: [0, despesas.length * 70], // altura estimada (70px por item)
              }),
            }}
          >
            {despesas.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.card}
                onPress={() => {
                  const novaSelecao = categoriaSelecionadaId === cat.id ? null : cat.id;
                  aoSelecionarCategoria(novaSelecao);
                  setCategoriaSelecionadaId(novaSelecao);
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
            ))}
          </Animated.View>


          {/* Grupo RECEITAS */}
          <TouchableOpacity onPress={animarReceitas} style={styles.grupoHeader}>
            <View style={styles.headerEsquerda}>
              <SetaReceitas width={18} height={18} style={{ marginRight: 10 }} />
              <Text style={[styles.grupoTitulo, { color: '#4AAF53' }]}>Receitas</Text>
            </View>
            <Ionicons name={alturaReceitasVisivel ? 'chevron-up' : 'chevron-down'} size={20} color="#4AAF53" />
          </TouchableOpacity>


          <Animated.View
            style={{
              overflow: 'hidden',
              height: alturaAnimadaReceitas.interpolate({
                inputRange: [0, 1],
                outputRange: [0, receitas.length * 70], // ajuste se a altura for diferente
              }),
            }}
          >
            {receitas.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.card}
                onPress={() => {
                  const novaSelecao = categoriaSelecionadaId === cat.id ? null : cat.id;
                  aoSelecionarCategoria(novaSelecao);
                  setCategoriaSelecionadaId(novaSelecao);
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
            ))}
          </Animated.View>


        </ScrollView>

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
    maxHeight: '70%',
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
    marginBottom: 12,
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
  }


});

export default ModalCategorias;
