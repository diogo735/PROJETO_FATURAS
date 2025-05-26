
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
const { width, height } = Dimensions.get('window');
import Icon from '../../assets/paginas_intruducao/permissao.svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React, { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Alert, Linking } from 'react-native';



const Pagina_Permissoes = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [cameraPermitida, setCameraPermitida] = useState(false);
  const [armazenamentoPermitido, setArmazenamentoPermitido] = useState(false);
  const [notificacoesPermitidas, setNotificacoesPermitidas] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const pedirCamera = async () => {
    if (cameraPermission?.canAskAgain === false) {
      Alert.alert(
        'Permissão bloqueada',
        'Ative a câmara manualmente nas definições do seu dispositivo.',
        [
          { text: 'Abrir definições', onPress: () => Linking.openSettings() },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    const permission = await requestCameraPermission();
    if (permission?.granted) setCameraPermitida(true);
  };


  const pedirArmazenamento = async () => {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

    if (!canAskAgain) {
      Alert.alert(
        'Permissão bloqueada',
        'Ative o acesso ao armazenamento nas definições.',
        [
          { text: 'Abrir definições', onPress: () => Linking.openSettings() },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    const { status: requestStatus } = await MediaLibrary.requestPermissionsAsync();
    if (requestStatus === 'granted') setArmazenamentoPermitido(true);
  };


  const pedirNotificacoes = async () => {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();

    if (!canAskAgain) {
      Alert.alert(
        'Permissão bloqueada',
        'Ative as notificações nas definições do dispositivo.',
        [
          { text: 'Abrir definições', onPress: () => Linking.openSettings() },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    const { status: requestStatus } = await Notifications.requestPermissionsAsync();
    if (requestStatus === 'granted') setNotificacoesPermitidas(true);
  };


  const podeAvancar = cameraPermitida && armazenamentoPermitido && notificacoesPermitidas;
  const animacaoAvancar = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (podeAvancar) {
      Animated.sequence([
        Animated.timing(animacaoAvancar, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animacaoAvancar, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [podeAvancar]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={['#022B4C', '#2985DE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.container}>
        <Icon width={width * .3} height={width * .3} style={{ marginBottom: '5%' }} />
        <Text style={styles.titulo}>Permissões</Text>
        <Text style={styles.descricao}>Concede as permissões para uma melhor experiência.</Text>

        <View style={styles.lista}>
          <ItemPermissao
            icone="camera"
            titulo="Camera"
            permitido={cameraPermitida}
            aoPermitir={pedirCamera}
          />
          <SeparadorBolinhas />
          <ItemPermissao
            icone="folder"
            titulo="Armazenamento"
            permitido={armazenamentoPermitido}
            aoPermitir={pedirArmazenamento}
          />
          <SeparadorBolinhas />
          <ItemPermissao
            icone="notifications"
            titulo="Notificações"
            permitido={notificacoesPermitidas}
            aoPermitir={pedirNotificacoes}
          />
        </View>

        <Animated.View
          style={[
            styles.botaoAvancar, // 👈 aqui está o position: 'absolute'
            {
              transform: [{ scale: animacaoAvancar }],
              backgroundColor: podeAvancar ? '#3592EB' : '#ccc',
            }
          ]}
        >
          <TouchableOpacity
            disabled={!podeAvancar}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Pagina_Login' }],
              });
            }}

            activeOpacity={0.8}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} // ocupa todo Animated.View
          >
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

      </View>
    </View>
  );
};

const ItemPermissao = ({ icone, titulo, permitido, aoPermitir }: any) => {
  const animacao = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (permitido) {
      Animated.sequence([
        Animated.timing(animacao, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animacao, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [permitido]);

  return (
    <View style={styles.item}>
      <View style={styles.iconeWrapper}>
        <Ionicons name={icone} size={22} color="#fff" />
      </View>

      <Text style={styles.itemTitulo}>{titulo}</Text>

      <TouchableOpacity
        onPress={aoPermitir}
        disabled={permitido}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale: animacao }],
            },
            styles.botaoPermitir,
            { backgroundColor: permitido ? '#4CAF50' : '#FFA726' },
          ]}
        >
          <MaterialCommunityIcons
            name={permitido ? 'check' : 'lock'}
            size={20}
            color="#fff"
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};


const SeparadorBolinhas = () => (
  <View style={styles.bolinhasContainer}>
    {Array.from({ length: 4 }).map((_, index) => (
      <View key={index} style={styles.bolinhaSeparadora} />
    ))}
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: '25%',
    paddingHorizontal: '5%',
  },
  titulo: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descricao: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: '7%',
    textAlign: 'center',
  },
  lista: {
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    paddingVertical: 12,
    paddingHorizontal: '3%',
    borderRadius: 16,

  },

  iconeWrapper: {
    width: 50,
    height: 50,
    backgroundColor: '#2987E3',
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '5%',
  },

  itemTitulo: {
    flex: 1,
    fontWeight: '600',
    fontSize: 18,
    color: '#fff',
  },

  botaoPermitir: {
    paddingHorizontal: '7%',
    paddingVertical: '15%',
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',

    // Sombra para Android
    elevation: 5,

    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },


  botaoAvancar: {
    position: 'absolute',
    bottom: '5%',
    right: '5%',
    width: width * 0.17,
    height: width * 0.17,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',

    // Sombra Android
    elevation: 6,

    // Sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  bolinhasContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: 0,
    marginLeft: '9%',
    gap: 8,
  },

  bolinhaSeparadora: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#2987E3',
    opacity: 0.5,
  },


});

export default Pagina_Permissoes;
