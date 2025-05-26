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
import Pagina_Comecar_QR from './app/paginas_de_intruducao/pagina_qr';
import { RouteProp } from '@react-navigation/native';
import PaginaMovimentos from './app/pagina_moviementos/pagina_movimentos';
import PaginaMetas from './app/pagina_metas/pagina_metas';
import Pagina_perfil from './app/pagina_perfil/pagina_perfil';
import DetalhesFatura from './app/pagina_fatura/detalhes_fatura';
import PaginaCamera from './app/pagina_principal/pagina_camera';
import MovimentosDaMeta from './app/pagina_metas/movimentos_metas/pagina_movimentos_metas';
import EditarMeta from './app/pagina_metas/pagina_editar_meta';
import PaginaCategorias from './app/pagina_perfil/pagina_categorias/pagina_categorias';
import CriarCategoria from './app/pagina_perfil/pagina_categorias/criar_categoria/criar_categoria';
import EditarSubCategoria
  from './app/pagina_perfil/pagina_categorias/editar_categoria/editar_categoria';
import PaginaNotificacoes from './app/pagina_principal/pagina_notificacoes/pagina_notificacoes';
import PaginaSucessoManual from './app/pagina_principal/pagina_sucesso_manual_fatura';
import DetalhesCategoria from './app/pagina_principal/componentes/detalhes_categoria/pagina_detalhes_categoria';
import Pagina_Comecar from './app/paginas_de_intruducao/pagina_comecar';
import Pagina_Login from './app/paginas_login/pagina_login';
import PaginaLogin_Email from './app/paginas_login/pagina_login_email';
import PaginaEsqueceuPass from './app/paginas_login/pagina_esqueceu_pass';
import PaginaVerificarEmail from './app/paginas_login/pagian_verifique_email';
import { useState, } from 'react';
import { criarTabelaUsers, existeUsuario } from './BASEDEDADOS/user';

import PaginaDetalhePerfil from './app/pagina_perfil/pagina_perfil/pagina_editar_perfil';
import PaginaMoeda from './app/pagina_perfil/pagina_moeda/pagina_moeda';
import { MoedaProvider } from './app/MOEDA';

const { height, width } = Dimensions.get('window');
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as Notify from 'expo-notifications';
import { CRIARBD } from './BASEDEDADOS/databaseInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaginaNotificacoesMinhas from './app/pagina_perfil/pagina_notificacoes/pagina_notificiacoes';
import CriarNotificacao from './app/pagina_perfil/pagina_notificacoes/criar_notificacao/criar_notificacao';
import EditarNotificacao from './app/pagina_perfil/pagina_notificacoes/criar_notificacao/editar_notificacao';
import { iniciarTarefaBackground } from './app/backgorund/notificacoes_user';
import PaginaSeguranca from './app/pagina_perfil/pagina_seguranca/pagiona_seguranca';
import TelaCodigo from './app/pagina_perfil/pagina_seguranca/tela_codgio';
import PaginaCodigo from './app/PAGINA_CODIGO';
import Pagina_Permissoes from './app/paginas_de_intruducao/pagina_premissoes';

Notify.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: true,
  })
});

interface DadosGrafico {
  categoria_id: number;
  nome_cat: string;
  cor_cat: string;
  img_cat: string;
  total_valor: number;
}

interface Movimento {
  id: number;
  valor: number;
  data: string;
  categoria_id: number;


}

export type RootStackParamList = {
  Pagina_Permissoes: undefined;
  PaginaCodigo: undefined;
  TelaCodigo: { modo?: 'criar' | 'alterar' };
  PaginaSeguranca: undefined;
  EditarNotificacao: { id: string };
  CriarNotificacao: undefined;
  PaginaNotificacoesMinhas: undefined;
  PerfilDetalhe: undefined;
  PaginaMoeda: undefined;
  Splash: undefined;
  SplashScren_intruducao: undefined;
  MainApp: {
    dadosGraficoDespesas: DadosGrafico[];
    dadosGraficoReceitas: DadosGrafico[];
    saldoMensal: number;
    totalReceitas: number;
    totalDespesas: number;
    movimentosRecentes: Movimento[];
    nomeUsuario: string;
    fotoUsuario: string | null;
  };

  Movimentos: undefined;
  Metas: undefined;
  Perfil: undefined;
  Fatura: { id: number };
  CriarMeta: undefined;
  Camera: undefined;
  PaginaSucesso: {
    conteudoQr: string | null;
    categoriaId: number | null;
    subcategoriaId: number | null;
    nota: string | null;
    nomeEmpresa: string | null;
    imagemUri: string | null;
    codigoAtcud: string | null;
  };
  MovimentosDaMeta: { id_meta: number };
  EditarMeta: { id_meta: number };
  PaginaCategorias: undefined;
  CriarCategoria: { tipo: 'Despesas' | 'Receitas'; onCategoriaCriada?: () => void };
  EditarSubcategoria: { id_subcategoria: number };
  Notificacoes: undefined;
  PaginaSucessoManual: {
    categoriaId: number | null;
    subcategoriaId: number | null;
    nota: string | null;
    nomeEmpresa: string | null;
    numeroFatura: string;
    codigoATCUD: string;
    nifEmitente: string;
    dataFatura: string;
    totalIva: string;
    nifCliente: string | null,
    valorTotal: string;
    imagemUri: string | null;
  };
  DetalhesCategoria: { categoriaId: number; nomeCategoria: string, imgCategoria: string, corCategoria: string; };
  PaginaComecarQR: undefined;
  Pagina_Login: undefined;
  Pagina_Login_Email: undefined;
  Pagina_Esqueceu_Pass: undefined;
  Pagina_Verificar_Email: undefined;




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
      <PagLoadingEntrar />
      {/*<PagLoadingEntrar /> */}
    </View>
  );
};

const SplashScren_intruducao = (props: any) => {
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
      <Pagina_Comecar />
      {/*<PagLoadingEntrar /> */}
    </View>
  );
};


// DEMAIS TELAS: com paddingTop para status bar
const MainAppScreen = ({ route }: { route: RouteProp<RootStackParamList, 'MainApp'> }) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <TabNavigator initialParams={route.params} />
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
    <Pagina_perfil {...props} />
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
const CategoriasScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaCategorias {...props} />
  </View>
);

const CriarCategoriaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <CriarCategoria {...props} />
  </View>
);

const EditarSubcategoriaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <EditarSubCategoria {...props} />
  </View>
);

const NotificacoesScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaNotificacoes {...props} />
  </View>
);
const PaginaSucessoManualScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaSucessoManual {...props} />
  </View>
);
const DetalhesCategoriaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <DetalhesCategoria {...props} />
  </View>
);
const PaginaComecarQRScreen = (props: any) => (
  <View style={{ flex: 1 }}>
    <StatusBar translucent backgroundColor="transparent" style="light" />
    <Pagina_Comecar_QR {...props} />
  </View>
);

const PaginaLoginScreen = (props: any) => (
  <View style={{ flex: 1 }}>
    <StatusBar translucent backgroundColor="transparent" style="light" />
    <Pagina_Login {...props} />
  </View>
);

const PaginaLoginEmail = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaLogin_Email {...props} />
  </View>
);
const PaginaEsqueceuPassScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaEsqueceuPass {...props} />
  </View>
);
const PaginaVerificarEmailScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaVerificarEmail {...props} />
  </View>
);

const PaginaEditarPerfilScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaDetalhePerfil {...props} />
  </View>
);

const PaginamoedaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaMoeda {...props} />
  </View>
);

const PaginaNotificacoesMinhasScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaNotificacoesMinhas {...props} />
  </View>
);

const PaginaNotificacoesCriar = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <CriarNotificacao {...props} />
  </View>
);

const PaginaNotificacoesEditaR = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <EditarNotificacao {...props} />
  </View>
);

const PaginaSegurancaScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaSeguranca {...props} />
  </View>
);

const TelaCodigoScreen = (props: any) => (
  <View style={styles.defaultContainer}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <TelaCodigo {...props} />
  </View>
);

const PaginaCodigoScreen = (props: any) => (
  <View style={{ flex: 1 }}>
    <StatusBar translucent backgroundColor="transparent" style="dark" />
    <PaginaCodigo {...props} />
  </View>
);

const PaginaPermissoesScreen = (props: any) => (
  <View style={{ flex: 1 }}>
    <StatusBar translucent backgroundColor="transparent" style="light" />
    <Pagina_Permissoes {...props} />
  </View>
);

//////////////////////////////////////////////////////////////////
const App: React.FC = () => {
  const [telaInicial, setTelaInicial] = useState<string | null>(null);



  useEffect(() => {
    async function iniciarApp() {
      iniciarTarefaBackground();
      await SplashScreen.preventAutoHideAsync();




      try {
        await CRIARBD();
        await criarTabelaUsers();


        const existe = await existeUsuario();
        const codigo = await AsyncStorage.getItem('@codigo_app');

        if (codigo) {
          setTelaInicial('PaginaCodigo');
        } else {
          setTelaInicial(existe ? 'Splash' : 'SplashScren_intruducao');
        }

      } catch (err) {
        console.error("Erro ao inicializar o app:", err);
        setTelaInicial('SplashScren_intruducao');
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    iniciarApp();
  }, []);


  if (!telaInicial) return null;


  return (
    <MoedaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={telaInicial as keyof RootStackParamList}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="SplashScren_intruducao" component={SplashScren_intruducao} />
          <Stack.Screen name="Splash" component={SplashScren} options={{
            animation: 'fade',
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 350 } },
              close: { animation: 'timing', config: { duration: 250 } },
            },
          }} />
          <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainApp" component={MainAppScreen} options={{
            animation: 'fade',
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 350 } },
              close: { animation: 'timing', config: { duration: 250 } },
            },
          }} />

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
          <Stack.Screen name="PaginaSucessoManual" component={PaginaSucessoManualScreen} />


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

          <Stack.Screen name="PaginaCategorias" component={CategoriasScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }} />
          <Stack.Screen
            name="CriarCategoria"
            component={CriarCategoriaScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="EditarSubcategoria"
            component={EditarSubcategoriaScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen name="Notificacoes" component={NotificacoesScreen} options={{
            animation: 'fade',
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 350 } },
              close: { animation: 'timing', config: { duration: 250 } },
            },
          }} />
          <Stack.Screen
            name="DetalhesCategoria"
            component={DetalhesCategoriaScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />


          <Stack.Screen
            name="PaginaComecarQR"
            component={PaginaComecarQRScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Pagina_Login"
            component={PaginaLoginScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Pagina_Login_Email"
            component={PaginaLoginEmail}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 250 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />


          <Stack.Screen
            name="Pagina_Esqueceu_Pass"
            component={PaginaEsqueceuPassScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Pagina_Verificar_Email"
            component={PaginaVerificarEmailScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="PerfilDetalhe"
            component={PaginaEditarPerfilScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="PaginaMoeda"
            component={PaginamoedaScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="PaginaNotificacoesMinhas"
            component={PaginaNotificacoesMinhasScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="CriarNotificacao"
            component={PaginaNotificacoesCriar}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="EditarNotificacao"
            component={PaginaNotificacoesEditaR}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="PaginaSeguranca"
            component={PaginaSegurancaScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="TelaCodigo"
            component={TelaCodigoScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="PaginaCodigo"
            component={PaginaCodigoScreen}
            options={{
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen
            name="Pagina_Permissoes"
            component={PaginaPermissoesScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </MoedaProvider>
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
