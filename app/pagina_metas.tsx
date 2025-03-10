import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar,Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
const { height,width } = Dimensions.get('window');
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';



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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metas Mensais</Text>
        <TouchableOpacity onPress={() => alert('Opções')}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Página */}
      <View style={styles.content}>
      <Image source={require('../assets/imagens/sem_metas.png')} style={styles.image} />
        <Text style={styles.title}>Sem Metas</Text>
        <Text style={styles.subtitle}>
          Sem metas definidas para este mês.{"\n"}Crie uma para controlar as suas despesas!
        </Text>
      </View>
      <FloatingActionButton onPress={() => alert('Criando nova meta!')} />
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
    width: height*0.2, 
    height: height*0.2,
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
    paddingTop: height*0.22,
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
    bottom: height*0.137, 
    right: width*0.03, 
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
