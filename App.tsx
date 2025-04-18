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
import PaginaSucesso from './app/pagina_principal/pagina_sucesso_fatura';
import * as SplashScreen from 'expo-splash-screen';

import PaginaMovimentos from './app/pagina_moviementos/pagina_movimentos';
import PaginaMetas from './app/pagina_metas/pagina_metas';
import PaginaPerfil from './app/pagina_perfil';
import DetalhesFatura from './app/pagina_fatura/detalhes_fatura';
import PaginaCamera from './app/pagina_principal/pagina_camera';
import MovimentosDaMeta from './app/pagina_metas/movimentos_metas/pagina_movimentos_metas';
import EditarMeta from './app/pagina_metas/pagina_editar_meta';


const { height, width } = Dimensions.get('window');
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as Notify from 'expo-notifications';

SplashScreen.preventAutoHideAsync();

Notify.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: true,
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
  Camera: undefined;
  PaginaSucesso: {
    conteudoQr: string | null;
    categoriaId: number | null;
    nota: string | null;
    nomeEmpresa: string | null;
    imagemUri: string | null;
  };
  MovimentosDaMeta: { id_meta: number };
  EditarMeta: { id_meta: number };


};


const Stack = createStackNavigator<RootStackParamList>();

// SPLASH: fullscreen com barra transparente (status + navigation)
const SplashScren = (props: any) => {
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
const PaginaSucessoScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaSucesso {...props} />
  </View>
);
const MovimentosMetaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <MovimentosDaMeta {...props} />
  </View>
);
const EditarMetaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <EditarMeta {...props} />
  </View>
);


const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScren} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainApp" component={MainAppScreen} />
        <Stack.Screen name="Movimentos" component={MovimentosScreen} />
        <Stack.Screen name="Metas" component={MetasScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen
          name="Fatura"
          component={FaturaScreen}
          options={{
            animation: 'fade',

            transitionSpec: {
              open: { animation: 'timing', config: { duration: 350 } },
              close: { animation: 'timing', config: { duration: 250 } },
            },
          }}
        />

        <Stack.Screen name="CriarMeta" component={CriarMetaScreen} />
        <Stack.Screen name="PaginaSucesso" component={PaginaSucessoScreen} />
        <Stack.Screen
          name="MovimentosDaMeta"
          component={MovimentosMetaScreen}
          options={{
            animation: 'fade',

            transitionSpec: {
              open: { animation: 'timing', config: { duration: 350 } },
              close: { animation: 'timing', config: { duration: 250 } },
            },
          }}

        />
        <Stack.Screen
          name="EditarMeta"
          component={EditarMetaScreen}
          options={{
            animation: 'fade',
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 350 } },
              close: { animation: 'timing', config: { duration: 250 } },
            },
          }}
        />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : height * 0.056,
  },
});

export default App;
