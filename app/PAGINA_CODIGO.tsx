import React, { useRef } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarUsuarioAtual } from '../BASEDEDADOS/user';
const { width, height } = Dimensions.get('window');
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from '../assets/imagens/wallpaper.svg';
import { Vibration } from 'react-native';

import { Animated, Easing } from 'react-native';

const AnimatedSvg = Animated.createAnimatedComponent(Icon);

const PaginaCodigo = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [codigo, setCodigo] = useState('');
  const maxDigitos = 6;
  const bolinhasAnimadas = useRef<Animated.Value[]>([]).current;
  const [carregando, setCarregando] = useState(false);
  const [codigoCorreto, setCodigoCorreto] = useState(false);
  const [codigoErrado, setCodigoErrado] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [dataUltimoAcesso, setDataUltimoAcesso] = useState('');
  const [saudacao, setSaudacao] = useState('Bom dia');

  useEffect(() => {
    async function buscarDataUltimoAcesso() {
      const dados = await AsyncStorage.getItem('@codigo_app');
      if (dados) {
        const objeto = JSON.parse(dados);
        if (objeto.data_ultimo_acesso) {
          setDataUltimoAcesso(objeto.data_ultimo_acesso);
        }
      }
    }

    buscarDataUltimoAcesso();
  }, []);

  const shakeStyle = {
    transform: [{
      translateX: shakeAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-8, 8],
      }),
    }],
  };


  const [nome, setNome] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  useEffect(() => {
    async function carregarUsuario() {
      const usuario = await buscarUsuarioAtual();
      if (usuario) {
        setNome(usuario.nome);
        const hora = new Date().getHours();

        if (hora >= 7 && hora < 12) {
          setSaudacao('Bom dia');
        } else if (hora >= 12 && hora < 20) {
          setSaudacao('Boa tarde');
        } else {
          setSaudacao('Boa noite');
        }

        setFotoUri(usuario.imagem);
      }
    }
    carregarUsuario();
  }, []);
  const inserirDigito = (digito: string) => {
    if (codigo.length < maxDigitos) {
      const novoValor = [...codigo, digito].join('');
      setCodigo(novoValor);

      const novaAnim = new Animated.Value(0);
      bolinhasAnimadas.push(novaAnim);

      Animated.timing(novaAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const apagarDigito = () => {
    const index = codigo.length - 1;

    if (index >= 0) {
      Animated.timing(bolinhasAnimadas[index], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        bolinhasAnimadas.pop();
        setCodigo((prev) => prev.slice(0, -1));
      });
    }
  };

  const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', ''];
const atualizarDataUltimoAcesso = async () => {
  try {
    const dados = await AsyncStorage.getItem('@codigo_app');
    if (dados) {
      const objeto = JSON.parse(dados);

      const agora = new Date();
      const dataFormatada = agora.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      objeto.data_ultimo_acesso = dataFormatada;

      await AsyncStorage.setItem('@codigo_app', JSON.stringify(objeto));
      console.log('Data de último acesso atualizada com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao atualizar a data de último acesso:', error);
  }
};



  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let animacaoLoop: Animated.CompositeAnimation;

    if (carregando) {
      fadeLoading.setValue(0);
      rotateAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeLoading, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      fadeLoading.setValue(0);
    }
  }, [carregando]);



  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const fadeLoading = useRef(new Animated.Value(0)).current;



  return (

    <View style={styles.container}>
      {carregando && (
        <Animated.View style={[styles.overlay, { opacity: fadeLoading }]}>
          <View style={styles.loadingBox}>
            <Animated.View style={{ transform: [{ rotate: spin }], alignItems: 'center', justifyContent: 'center' }}>
              <Icon width={height * 0.07} height={height * 0.07} fill="#fff" />
            </Animated.View>
          </View>
        </Animated.View>
      )}




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
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
        <Text style={styles.boasVindas}>{saudacao}{nome ? `, ${nome}` : ''}</Text>

      </View>
      <View style={styles.codigoContainer}>
        <View style={styles.codigoCirculos}>
          {codigo.length === 0 ? (
            <Text style={styles.inserirTexto}>Insere o teu código</Text>
          ) : (
            <Animated.View style={[styles.bolinhaWrapper, shakeStyle]}>
              {codigo.split('').map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.bolinha,
                    {
                      opacity: bolinhasAnimadas[index] ?? 1,
                      transform: [{ scale: bolinhasAnimadas[index] ?? 1 }],
                      backgroundColor: codigoCorreto
                        ? '#28a745'
                        : codigoErrado
                          ? '#D8000C'
                          : '#FFC773',
                    },
                  ]}
                />
              ))}
            </Animated.View>


          )}
        </View>

        <View style={styles.teclado}>
          {teclas.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tecla,
                (item === '←' && codigo.length === 0) ||
                  (item === '' && codigo.length === 0)
                  ? { backgroundColor: 'transparent' }
                  : item === '' && styles.teclaVazia
              ]}

              onPress={() => {
                if (item === '←') {
                  apagarDigito();
                } else if (item === '') {
                  setCarregando(true);

                  setTimeout(async () => {
                    const dados = await AsyncStorage.getItem('@codigo_app');
                    const codigoSalvo = dados ? JSON.parse(dados).codigo : null;

                    Animated.timing(fadeLoading, {
                      toValue: 0,
                      duration: 300,
                      useNativeDriver: true,
                    }).start(async () => {
                      setCarregando(false);
                      if (codigo === codigoSalvo) {


                        setCodigoCorreto(true);
                        await atualizarDataUltimoAcesso();
                        setTimeout(() => {
                          navigation.navigate('Splash');
                        }, 1000);
                      } else {
                        setCodigoErrado(true);
                        Vibration.vibrate(300);

                        // animação de shake
                        Animated.sequence([
                          Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
                          Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
                          Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
                          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                        ]).start(() => {
                          setTimeout(() => {
                            setCodigoErrado(false);
                            setCodigo('');
                            bolinhasAnimadas.splice(0, bolinhasAnimadas.length);
                          }, 200);
                        });

                      }
                    });
                  }, 1200);



                } else {
                  inserirDigito(item);
                }
              }}

              disabled={
                (item === '←' && codigo.length === 0) ||
                (item === '' && codigo.length === 0)
              }


            >
              {item === '←' ? (
                codigo.length > 0 && (
                  <Ionicons name="backspace-outline" size={26} color="#fff" />
                )
              ) : item === '' ? (
                codigo.length > 0 && (
                  <Ionicons name="arrow-forward-outline" size={26} color="#2565A3" />
                )
              ) : (
                <Text style={styles.teclaTexto}>{item}</Text>
              )}


            </TouchableOpacity>
          ))}

        </View>


      </View>

      {dataUltimoAcesso ? (
        <Text style={styles.ultimoAcesso}>
          Último acesso dia {dataUltimoAcesso.replace(',', ' às')} h
        </Text>
      ) : null}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  teclaVazia: {
    backgroundColor: '#fff',
  },
  inserirTexto: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
  },

  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: '5%',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bolinhaWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
    borderRadius: 50,
  },

  boasVindas: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  codigoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16%',
  },

  codigoCirculos: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: '0%',
    gap: 15,
  },
  bolinha: {
    width: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: '#FFC773',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bolinhaPreenchida: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  teclado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '90%',
    minHeight: 300,
  },
  tecla: {
    width: '22%',
    height: '22%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#164878',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: '3.6%',
  },
  teclaTexto: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  ultimoAcesso: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
    marginTop: 20,
    opacity: 0.8,
    alignSelf: 'center',
    position: 'absolute',
    bottom: '3%',
  },



  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },

  loadingBox: {
    backgroundColor: 'transparent',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },


  loadingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },

});

export default PaginaCodigo;
