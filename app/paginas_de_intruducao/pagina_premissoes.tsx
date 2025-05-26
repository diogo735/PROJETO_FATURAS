import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import * as Camera from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

const Pagina_Permissoes = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const pedirPermissoes = async () => {
    const { status: cameraStatus } = await Camera.useCameraPermissions();
    const { status: notifStatus } = await Notifications.requestPermissionsAsync();

    if (cameraStatus === 'granted' && notifStatus === 'granted') {
      navigation.navigate('Pagina_Login'); // ou para onde quiseres seguir
    } else {
      alert('Precisamos dessas permissões para continuar.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Permissões necessárias</Text>
      <Text style={styles.descricao}>
        Precisamos de acesso à câmara e notificações para o bom funcionamento da app.
      </Text>

      <TouchableOpacity onPress={pedirPermissoes} style={styles.botao}>
        <Text style={styles.textoBotao}>Permitir</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022B4C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  descricao: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 40,
  },
  botao: {
    backgroundColor: '#2565A3',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Pagina_Permissoes;
