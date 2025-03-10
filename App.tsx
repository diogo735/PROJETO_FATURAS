import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import TabNavigator from './componentes/barra_navegacao';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 🔥 StatusBar Transparente */}
      <StatusBar backgroundColor="transparent" translucent={true} barStyle="dark-content" />
      
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
};

// ** Estilos Globais **
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'white', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
  },
});

export default App;
