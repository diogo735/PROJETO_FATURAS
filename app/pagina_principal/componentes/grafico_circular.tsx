import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G} from 'react-native-svg';
import { Categoria } from '../../../BASEDEDADOS/tipos_tabelas';
import ImagemCentral from '../../../assets/imagens/porco_grafico.svg'; // Importe SVG diretamente

import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
interface GraficoCircularProps {
  categorias: Categoria[];
}

const Grafico_Circular: React.FC<GraficoCircularProps> = ({ categorias }) => {
    const radius = width*0.24;
    const strokeWidth = width*0.077;
    const outerCircleRadius = width*0.08; // raio das bolinhas externas
    const size = (radius + strokeWidth + outerCircleRadius + 50) * 2;
    const circumference = 2 * Math.PI * radius;
    const totalCategorias = categorias.length;
  
    if (!categorias.length) {
      return <Text>Sem categorias disponíveis</Text>;
    }
  
    const angleStep = (2 * Math.PI) / totalCategorias;
  
    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <G rotation={-90} originX={size / 2} originY={size / 2}>
            {categorias.map((categoria, index) => {
              const angle = angleStep * index + angleStep / 2;

              
              // Coordenadas do círculo externo
              const xOuter = (size / 2) + (radius + strokeWidth + 30) * Math.cos(angle);
              const yOuter = (size / 2) + (radius + strokeWidth + 30) * Math.sin(angle);
  
              // Coordenadas para a linha tracejada
              const xInner = (size / 2) + radius * Math.cos(angle);
              const yInner = (size / 2) + radius * Math.sin(angle);
  
              return (
                <G key={categoria.id}>
                  {/* Linha pontilhada */}
                  <Line
                    x1={xInner}
                    y1={yInner}
                    x2={xOuter}
                    y2={yOuter}
                    stroke={categoria.cor_cat || '#000'}
                    strokeWidth={1.9}
                    strokeDasharray="4"
                  />
  
                  {/* Círculo externo (bolinha) */}
                  <Circle
                    cx={xOuter}
                    cy={yOuter}
                    r={outerCircleRadius}
                    fill={categoria.cor_cat || '#000'}
                  />
                </G>
              );
            })}
          </G>
  
          {/* Gráfico circular principal */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="none"
          />
  
          {categorias.map((categoria, index) => (
            <Circle
              key={`segmento-${categoria.id}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={categoria.cor_cat}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference / totalCategorias} ${circumference}`}
              strokeDashoffset={-(circumference / totalCategorias) * index}
              rotation={-90}
              originX={size / 2}
              originY={size / 2}
            />
          ))}
        </Svg>

      {/* Imagem SVG no centro */}
      <View style={styles.imagemCentro}>
        <ImagemCentral width="100%" height="100%" fill="#E22121" />
      </View>
    </View>
  );
};

const offsetInicial = (index: number, totalCategorias: number, circumference: number) => {
  return (circumference / totalCategorias) * index;
};

const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    imagemCentro: {
      width: "30%",
      height: "30%",
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  export default Grafico_Circular;