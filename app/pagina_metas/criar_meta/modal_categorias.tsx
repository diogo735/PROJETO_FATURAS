import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ImageSourcePropType } from 'react-native';
import Modal from 'react-native-modal';
import { listarCategoriasDespesa } from '../../../BASEDEDADOS/categorias';
import { Categoria } from '../../../BASEDEDADOS/tipos_tabelas';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { listarSubCategorias } from '../../../BASEDEDADOS/sub_categorias';
import { SubCategoria } from '../../../BASEDEDADOS/tipos_tabelas';
import SubcategoriaSelecionavel from '../../pagina_principal/camara_componentes/card_subcategoria';

const { width } = Dimensions.get('window');

interface Props {
  visivel: boolean;
  aoFechar: () => void;
  aoSelecionarCategoria: (categoriaId: number | null) => void;
  categoriaSelecionada?: number | null;
  aoSelecionarSubcategoria?: (subCategoriaId: number | null) => void;
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

const ModalCategorias: React.FC<Props> = ({ visivel, aoFechar, aoSelecionarCategoria, categoriaSelecionada, aoSelecionarSubcategoria }) => {
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<number | null>(null);
  const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
  const [subSelecionadaId, setSubSelecionadaId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (visivel && typeof categoriaSelecionada === 'number') {
      setCategoriaSelecionadaId(categoriaSelecionada);
    }
  }, [visivel, categoriaSelecionada]);


  useEffect(() => {
    const carregarCategorias = async () => {
      const lista = await listarCategoriasDespesa();
      const subs = await listarSubCategorias();
      if (lista) setCategorias(lista);
      if (subs) setSubcategorias(subs);
    };
    carregarCategorias();
  }, []);

  const getSubcategoriasDaCategoria = (categoriaId: number) => {
    return subcategorias.filter(sub => sub.categoria_id === categoriaId);
  };


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
          {categorias.map((cat) => (
            <React.Fragment key={cat.id}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  setCategoriaSelecionadaId(cat.id);
                  setSubSelecionadaId(null);
                  aoSelecionarCategoria(cat.id);
                  aoSelecionarSubcategoria?.(null);
                  setTimeout(() => aoFechar(), 200);
                }}
                
              >
                <View style={[styles.iconeWrapper, { backgroundColor: cat.cor_cat }]}>
                  <Image
                    source={getImagemCategoria(cat.img_cat)}
                    style={styles.icone}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.nomeCategoria}>{cat.nome_cat}</Text>
                {categoriaSelecionadaId === cat.id ? (
                  <View style={styles.radioSelecionado}>
                    <Ionicons name="checkmark" size={15} color="#fff" />
                  </View>
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
                    setSubSelecionadaId(id);
                    setCategoriaSelecionadaId(null); // limpa categoria
                    aoSelecionarCategoria(null);
                    aoSelecionarSubcategoria?.(id);
                    setTimeout(() => aoFechar(), 200);
                  }}
                />
              ))}


            </React.Fragment>
          ))}



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


});

export default ModalCategorias;
