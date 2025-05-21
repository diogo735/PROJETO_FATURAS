import React from 'react';
import { Image, Text, Dimensions } from 'react-native';
import Animated, {
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App'; // ajuste o caminho conforme seu projeto

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Categoria {
  categoria_id: number;
  nome_cat: string;
  cor_cat: string;
  img_cat?: string;
  total_valor: number;
}

interface Props {
  categoria: Categoria;
  centroSegmento: number;
  radius: number;
  strokeWidth: number;
  size: number;
  animatedProgress: Animated.SharedValue<number>;
  getImagemCategoria: (img_cat: string) => any;
}

const Bolinha: React.FC<Props> = ({
  categoria,
  centroSegmento,
  radius,
  strokeWidth,
  size,
  animatedProgress,
  getImagemCategoria,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const animatedAngle = useDerivedValue(() => {
    return interpolate(animatedProgress.value, [0, 1], [-Math.PI / 2, centroSegmento]);
  }, [animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const x = size / 2 + (radius + strokeWidth + 30) * Math.cos(animatedAngle.value);
    const y = size / 2 + (radius + strokeWidth + 30) * Math.sin(animatedAngle.value);

    return {
      position: 'absolute',
      width: width * 0.166,
      height: width * 0.166,
      backgroundColor: categoria.cor_cat,
      borderRadius: (width * 0.166) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [
        { translateX: x - (width * 0.166) / 2 },
        { translateY: y - (width * 0.166) / 2 },
      ],
    };
  });

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={() => {
        navigation.getParent()?.navigate('DetalhesCategoria', {
          categoriaId: categoria.categoria_id,
          nomeCategoria: categoria.nome_cat,
          imgCategoria: categoria.img_cat,
          corCategoria: categoria.cor_cat,
        });
      }}
    >
      {categoria.img_cat && (
        <Image
          source={getImagemCategoria(categoria.img_cat)}
          style={{
            width: width * 0.08,
            height: width * 0.08,
            marginBottom: width * 0.04,
            resizeMode: 'contain',
          }}
        />
      )}
      <Text
        style={{
          fontSize: width * 0.035,
          color: 'white',
          fontWeight: 'bold',
          position: 'absolute',
          top: width * 0.10,
          textAlign: 'center',
          width: '100%',
        }}
      >
        {`${parseInt(categoria.total_valor.toString(), 10)}€`}
      </Text>
    </AnimatedPressable>
  );
};

export default Bolinha;
