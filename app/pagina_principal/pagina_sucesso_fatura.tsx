import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, CommonActions, useRoute } from '@react-navigation/native';
import CheckIcone from '../../assets/icons/pagina_camera/sucesso.svg';
import Guardaricon from '../../assets/icons/pagina_camera/guardando.svg';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { registarFatura_BDLOCAL } from '../../BASEDEDADOS/faturas';
import { Animated, Easing } from 'react-native';
import { useRef } from 'react'; // já deve ter
import IconeRotativo from '../../assets/imagens/wallpaper.svg';
import * as FileSystem from 'expo-file-system';

type PaginaSucessoRouteProp = RouteProp<RootStackParamList, 'PaginaSucesso'>;

async function salvarImagemPermanentemente(uri: string): Promise<string | null> {
  try {
    const nomeArquivo = `fatura_${Date.now()}.jpg`;
    const pastaDestino = `${FileSystem.documentDirectory}faturas/`;

    // Cria a pasta se ainda não existir
    const existe = await FileSystem.getInfoAsync(pastaDestino);
    if (!existe.exists) {
      await FileSystem.makeDirectoryAsync(pastaDestino, { intermediates: true });
    }

    const caminhoFinal = pastaDestino + nomeArquivo;

    await FileSystem.moveAsync({
      from: uri,
      to: caminhoFinal,
    });

    console.log("📦 Imagem salva em:", caminhoFinal);
    return caminhoFinal;
  } catch (error) {
    console.error("❌ Erro ao mover imagem:", error);
    return null;
  }
}

export default function PaginaSucesso() {
  const [carregando, setCarregando] = useState(true);
  const [faturaId, setFaturaId] = useState<number | null>(null);

  const animSucesso = useRef(new Animated.Value(0)).current;
  const animBotao = useRef(new Animated.Value(0)).current;
  const [imagemSalva, setImagemSalva] = useState<string | null>(null);


  const route = useRoute<PaginaSucessoRouteProp>();
  const { conteudoQr, categoriaId, subcategoriaId, nota, nomeEmpresa, imagemUri } = route.params;

  const dadosFatura = interpretarQrConteudo(conteudoQr ?? '');

  const navigation = useNavigation();
  const animacao = useRef(new Animated.Value(0)).current;

  const rotateInterpolation = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(animacao, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('white');
    NavigationBar.setButtonStyleAsync('dark');
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // ← bloqueia o voltar
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  function obterDataHoraAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');

    return `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
  }

  useEffect(() => {
    const registrar = async () => {
      setCarregando(true);
      let imagemSalva = null;
      if (imagemUri) {
        imagemSalva = await salvarImagemPermanentemente(imagemUri);
        setImagemSalva(imagemSalva);
      }
      const dadosParaSalvar = {
        dataMovimento: obterDataHoraAtual(),
        categoriaId,
        subcategoriaId,
        nota,
        tipoDocumento: dadosFatura.tipoDocumento,
        numeroFatura: dadosFatura.numeroDocumento,
        dataFatura: `${dadosFatura.data.split('/').reverse().join('-')}`,
        nifEmitente: dadosFatura.nifEmpresa,
        nomeEmpresa,
        nifCliente: dadosFatura.nifCliente,
        totalIva: parseFloat(dadosFatura.iva13 || '0'),
        totalFinal: parseFloat(dadosFatura.total || '0'),
        imagemFatura: imagemSalva
      };

      console.log('📦 Dados que vão ser enviados para o BD:', dadosParaSalvar);

      const faturaIdCriada = await registarFatura_BDLOCAL(dadosParaSalvar);

      setFaturaId(faturaIdCriada);


      Animated.timing(animSucesso, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();


      // anima botão com delay
      setTimeout(() => {
        Animated.timing(animBotao, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();


        setCarregando(false);
      }, 3000);
    };


    registrar();
  }, []);


  const voltarParaMainApp = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      })
    );
  };
  function interpretarQrConteudo(qr: string) {
    //console.log('🧾 QR bruto recebido:', qr);
    const dados = Object.fromEntries(
      qr.split('*').map(parte => {
        const [chave, valor] = parte.split(':');
        return [chave, valor];
      })
    );

    function formatarData(dataStr?: string): string {
      if (!dataStr || dataStr.length !== 8) return '---';
      return `${dataStr.slice(6, 8)}/${dataStr.slice(4, 6)}/${dataStr.slice(0, 4)}`;
    }

    return {
      nifEmpresa: dados.A || '---',
      nifCliente: dados.B || '---',
      pais: dados.C || '---',
      tipoDocumento: dados.D === 'FS' ? 'Fatura Simplificada' : dados.D || '---',
      estado: dados.E || '---',
      data: formatarData(dados.F),
      numeroDocumento: dados.G || '---',
      atcud: dados.H || '---',
      paisIva: dados.I1 || '---',
      baseIva13: dados.I7 || '---',
      iva13: dados.I4 || dados.I8 || dados.N || '0',
      isento: dados.N || '---',
      total: dados.O || '---',
      hash: dados.Q || '---',
      certificado: dados.R || '---',
    };
  }

  return (

    <SafeAreaView style={styles.container}>
      {carregando ? (
        <>
          <View style={styles.content}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ marginBottom: 20 }}>
                <Guardaricon width={120} height={120} />
              </View>
              <Text style={styles.texto}>Guardando a fatura ...</Text>
            </View>
          </View>
          <Animated.View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ rotate: rotateInterpolation }],
              marginBottom: 20,
            }}
          >
            <IconeRotativo width={50} height={50} fill="#2565A3" />
          </Animated.View>
        </>
      ) : (
        <>
          {/* ✅ Animação do conteúdo central */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: animSucesso,
                transform: [
                  {
                    scale: animSucesso.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <CheckIcone width={140} height={140} />
            <Text style={styles.texto}>
              Fatura guardada com{'\n'}
              <Text style={styles.texto}>SUCESSO!</Text>
            </Text>
          </Animated.View>

          {/* ✅ Botão no rodapé, com animação separada */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: animBotao,
                transform: [
                  {
                    translateY: animBotao.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity style={styles.botao} onPress={voltarParaMainApp}>
              <Text style={styles.botaoTexto}>Entendi</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );



}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  texto: {
    fontSize: 18,
    color: '#164878',
    textAlign: 'center',
    marginTop: 30,
    fontWeight: '900',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  footer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 15,
  },

  botao: {
    backgroundColor: '#164878',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detalhe: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },

});
