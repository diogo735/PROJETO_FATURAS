import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Svg, { Circle, Line, G, } from 'react-native-svg';
import { Dimensions } from 'react-native';
import { red } from 'react-native-reanimated/lib/typescript/Colors';
import ImagemCentral from '../../../assets/imagens/porco_grafico.svg';
import { Image as ImageSVG } from 'react-native-svg'; // Importe SVG diretamente
const { width } = Dimensions.get('window');
const outerCircleRadius = width * 0.085;
const { height } = Dimensions.get('window');
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useAnimatedProps, interpolate, useDerivedValue } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';
import { Text } from "react-native";
// 📌 Definição da interface baseada na tabela `movimentos`
interface DadosGrafico {
  categoria_id: number;
  nome_cat: string;
  cor_cat: string;
  img_cat?: string;
  total_valor: number;
  valorCalculado?: number; // Adicionar como opcional
  valorFinal?: number;
}
type CategoriaAjustada = DadosGrafico & {
  valorCalculado: number;
  valorFinal: number;
};

interface GraficoCircularProps {
  categorias: DadosGrafico[];
  tipoSelecionado: 'receitas' | 'despesas';
}
function getImagemCategoria(img_cat: string): ImageSourcePropType {
  if (!img_cat) {
    return require('../../../assets/imagens/categorias/outros.png');
  }

  // Se for imagem do usuário ou remota
  if (img_cat.startsWith('file') || img_cat.startsWith('http')) {
    return { uri: img_cat };
  }

  // Se for imagem local pré-definida
  const imagensLocais: Record<string, ImageSourcePropType> = {
    'compras_pessoais.png': require('../../../assets/imagens/categorias/compras_pessoais.png'),
    'contas_e_servicos.png': require('../../../assets/imagens/categorias/contas_e_servicos.png'),
    'despesas_gerais.png': require('../../../assets/imagens/categorias/despesas_gerais.png'),
    'educacao.png': require('../../../assets/imagens/categorias/educacao.png'),
    'estimacao.png': require('../../../assets/imagens/categorias/estimacao.png'),
    'financas.png': require('../../../assets/imagens/categorias/financas.png'),
    'habitacao.png': require('../../../assets/imagens/categorias/habitacao.png'),
    'lazer.png': require('../../../assets/imagens/categorias/lazer.png'),
    'outros.png': require('../../../assets/imagens/categorias/outros.png'),
    'restauracao.png': require('../../../assets/imagens/categorias/restauracao.png'),
    'saude.png': require('../../../assets/imagens/categorias/saude.png'),
    'transportes.png': require('../../../assets/imagens/categorias/transportes.png'),
    'alugel.png': require('../../../assets/imagens/categorias/receitas/alugel.png'),
    'caixa-de-ferramentas.png': require('../../../assets/imagens/categorias/receitas/caixa-de-ferramentas.png'),
    'deposito.png': require('../../../assets/imagens/categorias/receitas/deposito.png'),
    'dinheiro.png': require('../../../assets/imagens/categorias/receitas/dinheiro.png'),
    'lucro.png': require('../../../assets/imagens/categorias/receitas/lucro.png'),
    'presente.png': require('../../../assets/imagens/categorias/receitas/presente.png'),
    'salario.png': require('../../../assets/imagens/categorias/receitas/salario.png'),
  };

  return imagensLocais[img_cat] || imagensLocais['outros.png'];
}

const Grafico_Circular: React.FC<GraficoCircularProps> = ({ categorias, tipoSelecionado }) => {
  const radius = width * 0.24;
  const strokeWidth = width * 0.077;
  const size = (radius + strokeWidth + outerCircleRadius + 50) * 2;
  const circumference = 2 * Math.PI * radius;


  if (!categorias.length) {
    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          {/* Círculo padrão (cor diferente para despesas e receitas) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tipoSelecionado === 'despesas' ? '#F2A0A0' : '#7CD47C'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Texto dentro do SVG */}
          <Text
            style={{
              position: "absolute",
              alignSelf: "center",
              top: size / 2 - radius - height * 0.1, // Equivalente ao y
              fontSize: width * 0.05,
              fontWeight: "bold",
              color: tipoSelecionado === 'despesas' ? '#F2A0A0' : '#7CD47C',
              textAlign: "center",
              width: "100%",
            }}
          >
            Nenhuma {tipoSelecionado === 'despesas' ? 'Despesa' : 'Receita'} registrada!
          </Text>

        </Svg>

        <View style={styles.imagemCentro}>
          <ImagemCentral
            width="100%"
            height="100%"
            fill={tipoSelecionado === "receitas" ? "#4AAF53" : "#E12D2D"}
          />
        </View>


      </View>
    );
  }





  const tamanhoMinimo = circumference / 5.5;
  //  Calculando o valor total para normalizar os tamanhos dos segmentos
  const totalGeral = categorias.length > 0 ? categorias.reduce((acc, categoria) => acc + (categoria.total_valor || 0), 0) : 1;
  // Ajuste de valores para garantir o tamanho mínimo
  let valoresAjustados: CategoriaAjustada[] = categorias.map(categoria => ({
    ...categoria,
    valorCalculado: Math.max((categoria.total_valor / totalGeral) * circumference, tamanhoMinimo),
    valorFinal: 0 // Inicializa para evitar erro
  }));

  const somaAjustada = valoresAjustados.reduce((acc, cat) => acc + cat.valorCalculado, 0);
  const fatorAjuste = circumference / somaAjustada;

  valoresAjustados = valoresAjustados.map(cat => ({
    ...cat,
    valorFinal: cat.valorCalculado * fatorAjuste
  }));
  let acumulado = 0;


  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    //animatedProgress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });
    animatedProgress.value = withTiming(1, { duration: 1000 });
  }, []);




  return (

    <View style={[styles.container]}>

      <Svg width={size} height={size}>
        <G originX={size / 2} originY={size / 2}>
          {valoresAjustados.map((categoria, index) => {
            const segmento = categoria.valorFinal;
            const offset = -acumulado;
            const espacoEntreSegmentos = strokeWidth * 1.15;
            // Encontrar o centro do segmento
            const centroSegmento = (acumulado + (segmento - espacoEntreSegmentos) / 2) / circumference * 2 * Math.PI - Math.PI / 2;

            const ajusteLinha = strokeWidth * 0.5;

            acumulado += segmento;

            const animatedProps = useAnimatedProps(() => ({
              strokeDasharray: `${Math.max(0, segmento - espacoEntreSegmentos) * animatedProgress.value} ${circumference}`,
              strokeDashoffset: offset * animatedProgress.value,
            }));
            const centroSegmentoSeguro = isNaN(centroSegmento) || centroSegmento === undefined
              ? -Math.PI / 2
              : centroSegmento;
            const animatedAngle = useDerivedValue(() => {
              if (animatedProgress.value === 0) return -Math.PI / 2;
              return interpolate(animatedProgress.value, [0, 1], [-Math.PI / 2, centroSegmentoSeguro]);
            }, [animatedProgress]);



            // 🟢 Animação da linha, agora também usando animatedAngle.value corretamente
            const animatedLineProps = useAnimatedProps(() => {
              return {
                x1: size / 2 + (radius - ajusteLinha) * Math.cos(animatedAngle.value),
                y1: size / 2 + (radius - ajusteLinha) * Math.sin(animatedAngle.value),
                x2: size / 2 + (radius + strokeWidth + 30) * Math.cos(animatedAngle.value),
                y2: size / 2 + (radius + strokeWidth + 30) * Math.sin(animatedAngle.value),
              };
            });

            const animatedContainerStyle = useAnimatedStyle(() => {
              return {
                position: "absolute",
                width: width * 0.166, // Tamanho da bolinha
                height: width * 0.166,
                backgroundColor: categoria.cor_cat || "#000",
                borderRadius: (width * 0.166) / 2,
                justifyContent: "center",
                alignItems: "center",
                transform: [
                  { translateX: (size / 2 + (radius + strokeWidth + 30) * Math.cos(animatedAngle.value)) - (width * 0.166) / 2 },
                  { translateY: (size / 2 + (radius + strokeWidth + 30) * Math.sin(animatedAngle.value)) - (width * 0.166) / 2 },
                ],
              };
            });

            return (
              <React.Fragment key={`segmento-${categoria.categoria_id}`}>
                {/* Segmento do gráfico */}
                <AnimatedCircle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={categoria.cor_cat}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${Math.max(0, segmento - espacoEntreSegmentos)} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  rotation={-90}
                  originX={size / 2}
                  originY={size / 2}
                  animatedProps={animatedProps}
                />

                {/* 🟢 Linha animada */}
                <AnimatedLine
                  stroke={categoria.cor_cat}
                  strokeWidth={1.9}
                  strokeDasharray="4"
                  animatedProps={animatedLineProps}
                />

                <Animated.View style={animatedContainerStyle}>
                  {categoria.img_cat && (
                    <Image
                      source={getImagemCategoria(categoria.img_cat)}
                      style={{
                        width: width * 0.08,
                        height: width * 0.08,
                        marginBottom: width * 0.04,
                        resizeMode: "contain",
                      }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: width * 0.035,
                      color: "white",
                      fontWeight: "bold",
                      position: "absolute",
                      top: width * 0.10,
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    {`${parseInt(categoria.total_valor.toString(), 10)}€`}
                  </Text>

                </Animated.View>

              </React.Fragment>
            );
          })}

        </G>
      </Svg>


      <View style={styles.imagemCentro}>
        <ImagemCentral width="100%" height="100%" fill="#E22121" />
      </View>
    </View>

  );

};
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',

  },
  imagemCentro: {
    width: "30%",
    height: "30%",
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scaleX: -1 }],
  },
});

export default Grafico_Circular;