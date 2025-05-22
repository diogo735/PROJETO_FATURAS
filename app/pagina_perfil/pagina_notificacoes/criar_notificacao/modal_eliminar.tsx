import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import Icon from '../../../../assets/icons/pagina_notificacoes_minhas/apagar.svg';
interface Props {
  visivel: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
  texto?: string;
  subtexto?: string;
}

const ModalConfirmacao: React.FC<Props> = ({
  visivel,
  onCancelar,
  onConfirmar,
  texto = 'Eliminar notificação?',
  subtexto = 'Desejas mesmo eliminar esta notificação?',
}) => {
  const animacao = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visivel) {
      Animated.timing(animacao, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } else {
      Animated.timing(animacao, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    }
  }, [visivel]);

  const opacidade = animacao;
  const escala = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  if (!visivel) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: opacidade,
      }}
    >
      <Animated.View
        style={{
          backgroundColor: 'white',
          padding: 24,
          borderRadius: 16,
          width: '80%',
          alignItems: 'center',
          transform: [{ scale: escala }],
        }}
      >
         <Icon width={60} height={60} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2565A3', marginBottom: 10 }}>
          {texto}
        </Text>
        <Text style={{ textAlign: 'center', color: '#555', marginBottom: 20 }}>
          {subtexto}
        </Text>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity
            onPress={onCancelar}
            style={{
              backgroundColor: '#C4C4C4',
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onConfirmar}
            style={{
              backgroundColor: '#F44336',
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default ModalConfirmacao;
