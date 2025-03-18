import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Circle, Line, G, Text } from 'react-native-svg';
import { Dimensions } from 'react-native';
import { red } from 'react-native-reanimated/lib/typescript/Colors';
import ImagemCentral from '../../../assets/imagens/porco_grafico.svg';
import { Image as ImageSVG } from 'react-native-svg'; // Importe SVG diretamente
const { width } = Dimensions.get('window');
const outerCircleRadius = width * 0.085;
const { height } = Dimensions.get('window');
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';
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
const imagensCategorias: Record<string, any> = {
  "compras_pessoais.png": require("../../../assets/imagens/categorias/compras_pessoais.png"),
  "contas_e_servicos.png": require("../../../assets/imagens/categorias/contas_e_servicos.png"),
  "despesas_gerais.png": require("../../../assets/imagens/categorias/despesas_gerais.png"),
  "educacao.png": require("../../../assets/imagens/categorias/educacao.png"),
  "estimacao.png": require("../../../assets/imagens/categorias/estimacao.png"),
  "financas.png": require("../../../assets/imagens/categorias/financas.png"),
  "habitacao.png": require("../../../assets/imagens/categorias/habitacao.png"),
  "lazer.png": require("../../../assets/imagens/categorias/lazer.png"),
  "outros.png": require("../../../assets/imagens/categorias/outros.png"),
  "restauracao.png": require("../../../assets/imagens/categorias/restauracao.png"),
  "saude.png": require("../../../assets/imagens/categorias/saude.png"),
  "transportes.png": require("../../../assets/imagens/categorias/transportes.png"),
};
const Grafico_Circular: React.FC<GraficoCircularProps> = ({ categorias, tipoSelecionado }) => {
  const radius = width * 0.24;
  const strokeWidth = width * 0.077;
  const size = (radius + strokeWidth + outerCircleRadius + 50) * 2;
  const circumference = 2 * Math.PI * radius;



  
  const rotation = useSharedValue(0);



  useEffect(() => {

    rotation.value = 0;


    //  Animação da rotação do gráfico (2s)
    rotation.value = withTiming(360, { duration: 2000, easing: Easing.out(Easing.exp) }, () => {

    });
  }, [categorias, tipoSelecionado]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));


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
            x={size / 2 - width * 0.2}
            y={size / 2 - radius - height * 0.08}
            fontSize={width * 0.05}
            fontWeight="bold"
            fill={tipoSelecionado === 'despesas' ? '#F2A0A0' : '#7CD47C'}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            Nenhuma{tipoSelecionado === 'despesas' ? 'despesa' : 'Receita'}            registrada !
          </Text>
        </Svg>
        {tipoSelecionado === "receitas" ? (
          <View style={styles.imagemCentro}>
            <ImagemCentral
              width="100%"
              height="100%"
              fill={tipoSelecionado === "receitas" ? "#4AAF53" : "#E12D2D"}
            />
          </View>
        ) : null}

      </View>
    );
  }
  const tamanhoMinimo = circumference / 12;
  // 📌 Calculando o valor total para normalizar os tamanhos dos segmentos
  const totalGeral = categorias.reduce((acc, categoria) => acc + categoria.total_valor, 0);
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


  return (

    <View style={[styles.container]}>
      <Animated.View style={animatedStyle}>
        <Svg width={size} height={size}>
          <G originX={size / 2} originY={size / 2}>
            {valoresAjustados.map((categoria, index) => {
              const segmento = categoria.valorFinal;
              const offset = -acumulado;
              const espacoEntreSegmentos = strokeWidth * 1.15;
              // Encontrar o centro do segmento
              const centroSegmento = (acumulado + (segmento - espacoEntreSegmentos) / 2) / circumference * 2 * Math.PI - Math.PI / 2;

          
              // sair do centro exato do segmento
              const ajusteLinha = strokeWidth * 0.5;
          
              const xInner = (size / 2) + (radius - ajusteLinha) * Math.cos(centroSegmento);
              const yInner = (size / 2) + (radius - ajusteLinha) * Math.sin(centroSegmento);
              const xOuter = (size / 2) + (radius + strokeWidth + 30) * Math.cos(centroSegmento);
              const yOuter = (size / 2) + (radius + strokeWidth + 30) * Math.sin(centroSegmento);

              acumulado += segmento;
              

              return (
                <React.Fragment key={`segmento-${categoria.categoria_id}`}>
                  {/* Segmento do gráfico */}
                  <Circle
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
                  />

                  {/* Linha tracejada alinhada ao meio do segmento */}
                  <Line
                    x1={xInner}
                    y1={yInner}
                    x2={xOuter}
                    y2={yOuter}
                    stroke={categoria.cor_cat}
                    strokeWidth={1.9}
                    strokeDasharray="4"
                  />


                  <G>
                    <Circle cx={xOuter} cy={yOuter} r={width * 0.083} fill={categoria.cor_cat || "#000"} />
                    {/* Ícone da categoria dentro da bolinha */}
                    {categoria.img_cat && imagensCategorias[categoria.img_cat] && (
                      <ImageSVG
                        x={xOuter - width * 0.04}
                        y={yOuter - width * 0.06}
                        width={width * 0.083}
                        height={width * 0.083}
                        href={imagensCategorias[categoria.img_cat]}
                        preserveAspectRatio="xMidYMid meet"

                      />

                    )}
                    <Text
                      x={xOuter}
                      y={yOuter + width * 0.06}
                      fontSize={width * 0.035}
                      fill="white"
                      textAnchor="middle"
                      fontWeight="bold"

                    >
                      {`${parseInt(categoria.total_valor.toString(), 10)}€`}
                    </Text>

                  </G>

                </React.Fragment>
              );
            })}

          </G>
        </Svg>
      </Animated.View>
      {/* 📌 Imagem central no meio do gráfico */}
      <View style={styles.imagemCentro}>
        <ImagemCentral width="100%" height="100%" fill="#E22121" />
      </View>
    </View>

  );

};

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
