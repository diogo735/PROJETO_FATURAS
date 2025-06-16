import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar, Platform } from 'react-native';
;
import Logo from '../assets/imagens/icon_app_porco.svg';
import { useFonts, Nokora_400Regular, Nokora_900Black } from '@expo-google-fonts/nokora';
import IconeRotativo from '../assets/imagens/wallpaper.svg';
import { inicializarBaseDeDados } from '../BASEDEDADOS/database';
import EnovoSVG from '../assets/imagens/by_enovo.svg';
import * as SplashScreen from 'expo-splash-screen';
import { verificarNotificacoesDeTodasMetas } from '../BASEDEDADOS/metas';
const { width, height } = Dimensions.get('window');
import { obterTotalReceitas, obterTotalDespesas, listarMovimentosUltimos30Dias, obterSaldoMensalAtual, obterSomaMovimentosPorCategoriaDespesa, obterSomaMovimentosPorCategoriaReceita, sincronizarMovimentosAPI } from '../BASEDEDADOS/movimentos';
import { buscarUsuarioAtual, obter_imagem_user } from '../BASEDEDADOS/user';
import { buscarDadosDoUsuarioAPI } from '../APIs/login';
import * as FileSystem from 'expo-file-system';
import { sincronizarFaturasAPI } from '../BASEDEDADOS/faturas';
import { sincronizarSubcategoriasAPI } from '../BASEDEDADOS/sub_categorias';
import NetInfo from '@react-native-community/netinfo';

type RootStackParamList = {
  MainApp: undefined;
};




const PagLoadingEntrar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const baixarImagemParaLocal = async (url: string, nomeArquivo: string) => {
    try {
      const caminhoLocal = `${FileSystem.documentDirectory}${nomeArquivo}`;
      const download = await FileSystem.downloadAsync(url, caminhoLocal);

      console.log('✅ Imagem baixada com sucesso:', download.uri);

      return { sucesso: true, uri: download.uri };
    } catch (error) {
      console.error('❌ Erro ao baixar imagem:', error);
      return { sucesso: false, uri: null };
    }
  };







  useEffect(() => {
    const carregarBD = async () => {
      try {
        await inicializarBaseDeDados();
        await verificarNotificacoesDeTodasMetas();

        const user = await buscarUsuarioAtual();
        const temEmail = !!user?.email;

        const estado = await NetInfo.fetch();
        const estaOnline = estado.isConnected && estado.isInternetReachable;

        // 🔄 Se o usuário tiver email e estiver online → sincroniza
        // 🔄 Tenta sincronizar, mas se falhar continua
        if (temEmail && estaOnline) {
          try {
            await sincronizarSubcategoriasAPI();
            await sincronizarMovimentosAPI();
            await sincronizarFaturasAPI();

            const userRemoto = await buscarDadosDoUsuarioAPI();
            const resultado = await baixarImagemParaLocal(userRemoto.imagem, 'foto_usuario.jpg');
            if (resultado.sucesso) {
              await obter_imagem_user(resultado.uri); // atualiza imagem local
            }
          } catch (erroSync) {
            console.warn('⚠️ Erro durante sincronização (seguindo com dados locais):', (erroSync as Error).message);
          }

        }
        
        const userAtualizado = await buscarUsuarioAtual();
        const nome = userAtualizado?.nome || 'Usuário';
        const foto = userAtualizado?.imagem || null;

        // 📥 Carrega dados locais (sempre)
        const dadosMovimentos = await listarMovimentosUltimos30Dias();
        const saldo = await obterSaldoMensalAtual();
        const receitas = await obterTotalReceitas();
        const despesas = await obterTotalDespesas();
        const dadosDespesas = await obterSomaMovimentosPorCategoriaDespesa();
        const dadosReceitas = await obterSomaMovimentosPorCategoriaReceita();

        await SplashScreen.hideAsync();

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{
              name: 'MainApp',
              params: {
                dadosGraficoDespesas: Array.isArray(dadosDespesas) && dadosDespesas.length > 0 ? dadosDespesas : [],
                dadosGraficoReceitas: Array.isArray(dadosReceitas) && dadosReceitas.length > 0 ? dadosReceitas : [],
                saldoMensal: saldo,
                totalReceitas: receitas,
                totalDespesas: despesas,
                movimentosRecentes: dadosMovimentos,
                nomeUsuario: nome,
                fotoUsuario: foto,
              }
            }]
          });
        }, 900);

      } catch (error) {
        console.error('❌ Erro ao carregar o banco de dados:', error);
      }
    };

    carregarBD();
  }, []);



  const rotateValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    rotateValues.forEach((rotateValue) => {
      const animateRotation = () => {
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          rotateValue.setValue(0);
          animateRotation();
        });
      };

      animateRotation();
    });
  }, []);
  const [fontsLoaded] = useFonts({
    Nokora_Regular: Nokora_400Regular,
    Nokora_Black: Nokora_900Black,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="white" />;
  }

  const initialRotations = [45, 120, 80, 20, 160];

  const rotateInterpolations = rotateValues.map((rotateValue, index) =>
    rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: [`${initialRotations[index]}deg`, `${initialRotations[index] + 360}deg`],
    })
  );


  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={['#022B4C', '#2985DE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.logoContainer}>
        <Logo width={width * 0.67} height={height * 0.17} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.logoTextBold}>Piggy</Text>Wallet
        </Text>
        <View style={{ width: '100%', alignItems: 'flex-end', paddingRight: 0 }}>
          <View style={styles.byEnoycContainer}>
            <EnovoSVG width={width * 0.23} height={height * 0.03} />
          </View>
        </View>
      </View>

      {/* Ícones animados */}
      <Animated.View style={[styles.iconContainer, {
        top: -height * 0.04, left: -width * 0.18,
        transform: [{ rotate: rotateInterpolations[0] }]
      }]}>
        <IconeRotativo width={width * 0.8} height={width * 0.8} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      <Animated.View style={[styles.iconContainer, {
        top: height * 0.31, left: width * 0.8,
        transform: [{ rotate: rotateInterpolations[1] }]
      }]}>
        <IconeRotativo width={width * 0.3} height={width * 0.3} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      <Animated.View style={[styles.iconContainer, {
        top: height * 0.56, left: -width * 0.19,
        transform: [{ rotate: rotateInterpolations[2] }]
      }]}>
        <IconeRotativo width={width * 0.5} height={width * 0.5} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      <Animated.View style={[styles.iconContainer, {
        top: height * 0.67, left: width * 0.7,
        transform: [{ rotate: rotateInterpolations[3] }]
      }]}>
        <IconeRotativo width={width * 0.6} height={width * 0.6} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      <Animated.View style={[styles.iconContainer, {
        top: height * 0.96, left: width * 0.06,
        transform: [{ rotate: rotateInterpolations[4] }]
      }]}>
        <IconeRotativo width={width * 0.75} height={width * 0.75} fill="rgba(255,255,255,0.08)" />
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
    marginBottom: 0,
  },
  iconContainer: {
    position: 'absolute',
  },

  logoContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -width * 0.3 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.6,
  },
  textContainer: {
    marginTop: "7.5%",
    position: 'absolute',
    top: '55%',
    //left: '0%',
    justifyContent: 'center',
    //transform: [{ translateX: -width * 0.25 }],
    alignItems: 'center',
  },

  logoText: {
    fontSize: 30.55,
    color: 'white',
    fontFamily: 'Nokora_Regular',
    textAlign: 'center',
  },

  logoTextBold: {
    fontFamily: 'Nokora_Black',
  },

  byEnoycContainer: {
    marginTop: -width * 0.02,

  },


});

export default PagLoadingEntrar;

