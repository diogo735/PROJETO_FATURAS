import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; // ajuste o caminho se necessário
import CardMetas from './componestes_metas/card_meta';
import { listarMetas } from '../../BASEDEDADOS/metas';
type NavigationProp = StackNavigationProp<RootStackParamList>;
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import ModalOpcoesMeta from './componestes_metas/modal_opcoes_meta';
import ModalConfirmarApagar from './componestes_metas/modal_apagar_meta';
import { apagarMeta } from '../../BASEDEDADOS/metas';


type Meta = {
  id_meta: number;
  nome_cat: string;
  cor_cat: string;
  img_cat: string;
  valor_meta: number;
  data_inicio: string;
  data_fim: string;
  repetir_meta: number;
  recebe_alerta: number | null;
  valor_usado?: number;
};


interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Ionicons name="add-outline" size={25} color="white" />
      <Text style={styles.fabText}>Criar Meta</Text>
    </TouchableOpacity>
  );
};


const Pagina_metas: React.FC = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [metaSelecionada, setMetaSelecionada] = useState<Meta | null>(null);
  const [modalConfirmacaoVisible, setModalConfirmacaoVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        const dados = await listarMetas();
        setMetas(dados);
      };
      carregar();
    }, [])
  );


  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metas Mensais</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CriarMeta')}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Página */}
      {metas.length === 0 ? (
        <View style={styles.content}>
          <Image source={require('../../assets/imagens/sem_metas.png')} style={styles.image} />
          <Text style={styles.title}>Sem Metas</Text>
          <Text style={styles.subtitle}>
            Sem metas definidas para este mês.{"\n"}Crie uma para controlar as suas despesas!
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          {metas.map((meta) => (
            <TouchableOpacity
              key={meta.id_meta}
              onPress={() => {
                setMetaSelecionada(meta);
                setModalVisivel(true);
              }}
              activeOpacity={0.8}
            >
              <CardMetas meta={meta} />
            </TouchableOpacity>
          ))}

        </View>
      )}

      {metas.length === 0 && (
        <FloatingActionButton onPress={() => navigation.navigate('CriarMeta')} />
      )}

      <ModalOpcoesMeta
        visivel={modalVisivel}
        aoFechar={() => setModalVisivel(false)}
        aoVerMovimentos={() => {
          setModalVisivel(false);
          if (metaSelecionada?.id_meta !== undefined) {
            navigation.navigate('MovimentosDaMeta', { id_meta: metaSelecionada.id_meta });
          }
        }}
        aoEditar={() => {
          setModalVisivel(false);
          if (metaSelecionada?.id_meta !== undefined) {
            navigation.navigate('EditarMeta', { id_meta: metaSelecionada.id_meta });
          }
        }}

        aoApagar={() => {
          setModalVisivel(false);
          setModalConfirmacaoVisible(true);
        }}

      />

      <ModalConfirmarApagar
        visivel={modalConfirmacaoVisible}
        nomeMeta={metaSelecionada?.nome_cat}
        aoCancelar={() => setModalConfirmacaoVisible(false)}
        aoApagar={async (onSucesso, onErro) => {
          try {
            if (metaSelecionada?.id_meta) {
              await apagarMeta(metaSelecionada.id_meta);
              const novas = await listarMetas();
              setMetas(novas);
              onSucesso(); // ✅ mostra mensagem de sucesso
            }
          } catch (error) {
            console.error('Erro ao apagar meta:', error);
            onErro(); // ❌ mostra erro
          }
        }}
      />



    </View>

  );
};

// ** Estilos **
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  }
  ,
  image: {
    width: height * 0.2,
    height: height * 0.2,
    marginBottom: 10,
    resizeMode: 'contain',
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.22,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164878',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#BABABA',
    fontWeight: '300',
  },
  fab: {
    position: 'absolute',
    bottom: height * 0.137,
    right: width * 0.03,
    backgroundColor: '#FFA500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 39,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: 'white',
    fontSize: scale(18),
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Pagina_metas;
