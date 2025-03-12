import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';

import PagLoadingEntrar from './app/pagina_loading_entrar'; // Tela de entrada que carrega o BD
import TabNavigator from './componentes/barra_navegacao'; // Navegação principal

import PaginaMovimentos from './app/pagina_movimentos';
import PaginaMetas from './app/pagina_metas';
import PaginaPerfil from './app/pagina_perfil';


// Definição do tipo do Stack Navigator
type RootStackParamList = {
  TelaEntrada: undefined;
  MainApp: undefined;
  Movimentos: undefined;
  Metas: undefined;
  Perfil: undefined;
};

// Criando o Stack Navigator com os tipos definidos
const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle="dark-content" />

      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Tela Inicial que carrega o banco de dados */}
          <Stack.Screen name="TelaEntrada" component={PagLoadingEntrar} />

          {/* Navegação principal do App */}
          <Stack.Screen name="MainApp" component={TabNavigator} />

          {/* Telas adicionais que podem ser abertas fora do TabNavigator */}
          <Stack.Screen name="Movimentos" component={PaginaMovimentos} />
          <Stack.Screen name="Metas" component={PaginaMetas} />
          <Stack.Screen name="Perfil" component={PaginaPerfil} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;
