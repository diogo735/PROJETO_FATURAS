import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { setStatusBarTranslucent } from 'expo-status-bar';
import PagLoadingEntrar from './app/pagina_loading_entrar';
import TabNavigator from './componentes/barra_navegacao';
import * as NavigationBar from 'expo-navigation-bar';
import CriarMeta from './app/pagina_metas/criar_meta/criar_meta';


import PaginaMovimentos from './app/pagina_moviementos/pagina_movimentos';
import PaginaMetas from './app/pagina_metas/pagina_metas';
import PaginaPerfil from './app/pagina_perfil';
import DetalhesFatura from './app/pagina_fatura/detalhes_fatura';
import PaginaCamera from './app/pagina_principal/pagina_camera';



const { height, width } = Dimensions.get('window');
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as Notify from 'expo-notifications';


Notify.setNotificationHandler({
  handleNotification : async()=> ({
    shouldPlaySound:true,
    shouldShowAlert:true,
    shouldSetBadge:true,
  })    
});

export type RootStackParamList = {
  Splash: undefined;
  MainApp: undefined;
  Movimentos: undefined;
  Metas: undefined;
  Perfil: undefined;
  Fatura: { id: number };
  CriarMeta: undefined;
  Camera:undefined;

};


const Stack = createStackNavigator<RootStackParamList>();

// SPLASH: fullscreen com barra transparente (status + navigation)
const SplashScreen = (props: any) => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Remove cor de fundo da UI
      SystemUI.setBackgroundColorAsync('transparent');
      NavigationBar.setBehaviorAsync('overlay-swipe');
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);
  

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <PagLoadingEntrar {...props} />
    </View>
  );
};

// DEMAIS TELAS: com paddingTop para status bar
const MainAppScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <TabNavigator {...props} />
  </View>
);

const MovimentosScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaMovimentos {...props} />
  </View>
);

const MetasScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaMetas {...props} />
  </View>
);

const PerfilScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaPerfil {...props} />
  </View>
);

const FaturaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <DetalhesFatura {...props} />
  </View>
);
const CriarMetaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <CriarMeta {...props} />
  </View>
);
const CameraScreen = (props: any) => (
  <View style={{ flex: 1 }}>
    <StatusBar translucent backgroundColor="transparent" style="light" />
    <PaginaCamera {...props} />
  </View>
);


const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainApp" component={MainAppScreen} />
        <Stack.Screen name="Movimentos" component={MovimentosScreen} />
        <Stack.Screen name="Metas" component={MetasScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Fatura" component={FaturaScreen} />
        <Stack.Screen name="CriarMeta" component={CriarMetaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : height*0.056,
  },
});

export default App;
