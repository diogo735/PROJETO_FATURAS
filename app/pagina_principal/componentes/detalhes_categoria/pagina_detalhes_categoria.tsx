import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../../../App'; // ajuste o caminho conforme a pasta

const { width, height } = Dimensions.get('window');

type Props = {
  route: RouteProp<RootStackParamList, 'DetalhesCategoria'>;
};

const DetalhesCategoria: React.FC<Props> = ({ route }) => {
  const { categoriaId, nomeCategoria } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{nomeCategoria}</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../../../../assets/adaptive-icon.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <Text style={styles.text}>Página de detalhes da categoria {nomeCategoria} (ID: {categoriaId})</Text>
        {/* Você pode exibir mais informações aqui */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#2565A3',
    height: height * 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  text: { fontSize: 16, color: '#2565A3', fontWeight: 'bold' },
});

export default DetalhesCategoria;
