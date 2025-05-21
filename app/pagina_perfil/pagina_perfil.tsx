import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale } from 'react-native-size-matters';
import { Image } from 'react-native';
import SetaDireita from '../../assets/pagina_perfil/setinha.svg';
import { ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário

import IconEditar from '../../assets/pagina_perfil/perfil.png';
import MoedaIcon from '../../assets/pagina_perfil/change.png';
import IconAbout from '../../assets/pagina_perfil/about.png';
import IconApplication from '../../assets/pagina_perfil/application.png';
import IconBell from '../../assets/pagina_perfil/bell.png';

import IconCloud from '../../assets/pagina_perfil/cloud.png';
import IconDrive from '../../assets/pagina_perfil/google-drive.png';
import IconHelp from '../../assets/pagina_perfil/help-web-button.png';
import IconLike from '../../assets/pagina_perfil/like.png';
import IconLogout from '../../assets/pagina_perfil/logout.png';
import IconPadlock from '../../assets/pagina_perfil/padlock.png';

import IconServer from '../../assets/pagina_perfil/server.png';
import IconSupport from '../../assets/pagina_perfil/support.png';
import { buscarUsuarioAtual } from '../../BASEDEDADOS/user';
import { limparTabelaMovimentos as limparMovimentosBD } from '../../BASEDEDADOS/movimentos';


const { height, width } = Dimensions.get('window');

const Pagina_perfil: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [imagem, setImagem] = useState(null);
const handleLogout = async () => {
  try {
   await limparMovimentosBD();
    console.log('Movimentos limpos.');

    // Se tiver outras coisas para limpar, adicione aqui

   
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    Alert.alert('Erro', 'Não foi possível fazer logout.');
  }
};

 useFocusEffect(
  React.useCallback(() => {
    const carregarUsuario = async () => {
      const user = await buscarUsuarioAtual();
      if (user) {
        setNome(user.nome);
        setEmail(user.email);
        setImagem(user.imagem);
      }
    };

    carregarUsuario();
  }, [])
);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conta</Text>
      </View>

      {/* Conteúdo da Página */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.perfilContainer}>
          <View style={styles.imagemWrapper}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.fotoPerfil} />
            ) : (
              <Image source={require('../../assets/imagens/sem_foto.png')} style={styles.fotoPerfil} />
            )}

          </View>
          <Text style={styles.nome}>{nome || 'Nome não disponível'}</Text>
          <Text style={styles.email}>{email || 'Conta sem Login'}</Text>

        </View>

        <View style={styles.secao}>
          <Text style={styles.labelSecao}>Geral</Text>

          <TouchableOpacity style={styles.botaoItem} onPress={() => navigation.navigate('PerfilDetalhe')}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconEditar}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Editar Perfil</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => navigation.navigate('PaginaMoeda')}>
            <View style={styles.itemEsquerda}>
              <Image
                source={MoedaIcon}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Moeda</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => navigation.navigate('PaginaCategorias')}
          >
            <View style={styles.itemEsquerda}>
              <Image
                source={IconApplication}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Minhas Categorias</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconBell}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Notificações</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <Text style={styles.labelSecao}>Configurações</Text>
          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconPadlock}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Segurança</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconCloud}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Sincronização</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconServer}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Base de dados</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconDrive}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Google Drive</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <Text style={styles.labelSecao}>Outros</Text>
          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconSupport}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Contacto</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconLike}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Avalie-nos</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconAbout}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Sobre</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoItem} onPress={() => Alert.alert("Editar perfil")}>
            <View style={styles.itemEsquerda}>
              <Image
                source={IconHelp}
                style={styles.iconePNG}
              />
              <Text style={styles.textoItem}>Ajuda</Text>
            </View>
            <SetaDireita width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout}>
            <View style={styles.logoutContent}>
              <Image source={IconLogout} style={styles.iconeLogout} />
              <Text style={styles.textoLogout}>Fazer Logout</Text>
            </View>
          </TouchableOpacity>


        </View>
      </ScrollView>
    </View>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {

    height: height * 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  headerTitle: {
    color: '#2565A3',
    fontSize: scale(20),
    fontWeight: 'bold',
    letterSpacing: 18 * 0.05,
  },
  content: {
    paddingTop: height * 0.05,
    paddingHorizontal: 15,
    paddingBottom: height * 0.15,
    gap: 10,
  },
  perfilContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  imagemWrapper: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fotoPerfil: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nome: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#164878',
  },
  email: {
    paddingTop: 5,
    fontSize: scale(12),
    color: '#6E7B8B',
    fontWeight: '400',
  },
  secao: {
    paddingHorizontal: 5,
    gap: 8,
  },
  labelSecao: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#BFBFBF',
    marginBottom: 3,
    marginTop: 10
  },
  botaoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  itemEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textoItem: {
    fontSize: scale(15),
    color: '#2565A3',
    fontWeight: '600',
  },
  iconePNG: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  botaoLogout: {
    backgroundColor: '#D92C2C',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 0,
    flexDirection: 'row',

  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeLogout: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 10,
  },
  textoLogout: {
    color: 'white',
    fontSize: scale(15),
    fontWeight: 'bold',
  },


});

export default Pagina_perfil;
function limparTabelaMovimentos() {
  throw new Error('Function not implemented.');
}

