import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { scale } from 'react-native-size-matters';
const { height, width } = Dimensions.get('window');
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconNova from '../../../assets/icons/pagina_notificacoa/ativas.svg';
import Iconnao from '../../../assets/icons/pagina_notificacoa/naoativo.svg';
import IconConfig from '../../../assets/icons/Sync.svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { G } from 'react-native-svg'; // se usar SVG direto
import { buscarUsuarioAtual } from '../../../BASEDEDADOS/user';

const NavbarPaginaPrincipal = ({
  nome,
  foto,
  onPressNotificacao,
  hasNotificacoesNovas,
  onPressConfig,
  conteudo
}: {
  nome: string;
  foto: string | number;
  onPressNotificacao: () => void;
  hasNotificacoesNovas: boolean;
  onPressConfig: () => void;
  conteudo: string;
}) => {
  const izonnotificao_size = width * 0.06;
  const [saudacao, setSaudacao] = useState('');
  const opacidade = useSharedValue(0);
  const escala = useSharedValue(0.8);
const [syncAutoDesativada, setSyncAutoDesativada] = useState(false);

useEffect(() => {
  const verificarPreferencias = async () => {
    const user = await buscarUsuarioAtual();
    setSyncAutoDesativada(user?.sincronizacao_automatica === 0);
  };

  verificarPreferencias();
}, []);

  const atualizarSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 7 && hora < 12) {
      setSaudacao('Bom dia');
    } else if (hora >= 12 && hora < 20) {
      setSaudacao('Boa tarde');
    } else {
      setSaudacao('Boa noite');
    }
  };

  useEffect(() => {
    atualizarSaudacao();

    const intervalo = setInterval(() => {
      atualizarSaudacao();
    }, 60 * 1000);

    return () => clearInterval(intervalo);
  }, []);



  const rotacao = useSharedValue(0);

  useEffect(() => {
    if (conteudo !== '') {
      // Entrada suave
      opacidade.value = withTiming(1, { duration: 300 });
      escala.value = withTiming(1, { duration: 300 });

      // Gira 2 voltas
      rotacao.value = withSequence(
        withTiming(720, {
          duration: 1000,
          easing: Easing.out(Easing.exp),
        }),
        withTiming(0, { duration: 0 })
      );
    } else {
      // Esconde suavemente
      opacidade.value = withTiming(0, { duration: 200 });
      escala.value = withTiming(0.8, { duration: 200 });
    }
  }, [conteudo]);

  const estiloAnimado = useAnimatedStyle(() => ({
    opacity: opacidade.value,
    transform: [
      { scale: escala.value },
      { rotate: `${rotacao.value}deg` }
    ],
  }));



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
          <Text style={styles.greeting}>{saudacao},</Text>
          <Text style={styles.name}>{nome}</Text>
        </View>

        {/* Botão de Notificação */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {/* Botão de Configurações */}
          {syncAutoDesativada && conteudo !== '' && (
            <TouchableOpacity style={styles.notificationButton} onPress={onPressConfig}>
              <View style={{ position: 'relative' }}>
                <Animated.View style={estiloAnimado}>
                  <IconConfig width={26} height={26} />
                </Animated.View>

                <Text
                  style={[
                    styles.exclamacao,
                    conteudo === '!' ? styles.exclamacaoAlinhamentoExclamacao : styles.exclamacaoAlinhamentoNumero
                  ]}
                >
                  {conteudo}
                </Text>
              </View>
            </TouchableOpacity>
          )}




          {/* Botão de Notificação */}
          <TouchableOpacity style={styles.notificationButton} onPress={onPressNotificacao}>
            {hasNotificacoesNovas ? (
              <IconNova width={izonnotificao_size} height={izonnotificao_size} />
            ) : (
              <Iconnao width={izonnotificao_size} height={izonnotificao_size} />
            )}
          </TouchableOpacity>
        </View>


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
    width: width,
    paddingHorizontal: width * 0.025,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profilePic: {
    width: width * 0.11,
    height: width * 0.11,
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
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: '27%',
    right: '27%',
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: '#164878',
  },
  exclamacao: {
    position: 'absolute',
    top: '38%',
    transform: [{ translateX: -10 }, { translateY: -5 }],
    color: 'red',
    fontSize: 12,
    fontWeight: '900',
    zIndex: 10,
  },
  exclamacaoAlinhamentoNumero: {
    left: '46%',
  },
  exclamacaoAlinhamentoExclamacao: {
    left: '51%',
  },



});

export default NavbarPaginaPrincipal;
