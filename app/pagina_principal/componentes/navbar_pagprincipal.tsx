import React from 'react';
import { View, Text, Image, StyleSheet,TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { scale } from 'react-native-size-matters';
const { height,width } = Dimensions.get('window');
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const NavbarPaginaPrincipal = ({ nome, foto, onPressNotificacao }: { nome: string; foto: string | number; onPressNotificacao: () => void }) => {
  const izonnotificao_size=width*0.06;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Foto de perfil */}
          <Image 
            source={typeof foto === 'string' ? { uri: foto } : foto} 
            style={styles.profilePic} 
          />
  
          {/* Nome e Saudação */}
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>Bom dia,</Text>
            <Text style={styles.name}>{nome}</Text>
          </View>
  
          {/* Botão de Notificação */}
          <TouchableOpacity style={styles.notificationButton} onPress={onPressNotificacao}>
            <MaterialIcons name="notifications-none" size={izonnotificao_size} color="#003366" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 0,
    justifyContent: 'center',
    height: height * 0.09,
    width:width,
    paddingHorizontal: width * 0.025,
    
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
  },
  profilePic: {
    width: width*0.11,
    height: width*0.11,
    borderRadius: 99,
  },
  textContainer: {
    flex: 1,
    marginLeft: scale(10),
  },
  greeting: {
    color: '#7a7a7a',
    fontSize: scale(14),
  },
  name: {
    color: '#164878',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  notificationButton: {
    backgroundColor: '#E0E7F1', 
    width: width*0.11,
    height: width*0.11,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NavbarPaginaPrincipal;
