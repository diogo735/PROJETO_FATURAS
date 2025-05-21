import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useMoeda } from '../../MOEDA';

const { width, height } = Dimensions.get('window');

interface GraficoMetaProps {
  dias: string[];
  dados: number[];
  valorMeta: number;
  cor?: string;
}
const GraficoMeta: React.FC<Partial<GraficoMetaProps>> = (props) => {
  const { moeda } = useMoeda();

  const dadosTeste = {
    dias: ['1 abr.', ],
    dados: [8,],
    valorMeta: 655,
  };
  const dias = props?.dias ?? dadosTeste.dias;
  const dados = props?.dados ?? dadosTeste.dados;
  const valorMeta = props?.valorMeta ?? dadosTeste.valorMeta;
  const corFinal = props?.cor ?? '#2565A3';

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: dias,
          datasets: [
            {
              data: dados,
              strokeWidth: 2,
              color: () => corFinal,
              withDots: true,
            },
            {
              data: new Array(dados.length).fill(valorMeta),
              strokeWidth: 2,
              color: () => '#2565A3',
              withDots: false,
              
            },
          ],
          legend: [],
        }}
        width={width * 0.9}
        height={height * 0.25}
        xLabelsOffset={0}
        yAxisSuffix={moeda.simbolo}
        yAxisInterval={1}
        chartConfig={{
          fillShadowGradient: corFinal,
          fillShadowGradientOpacity: 0.3,
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: () => corFinal,
          labelColor: () => '#7D8A98',
         /* */propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#fff',
            fill: corFinal,
          },
          propsForBackgroundLines: {
            stroke: '#D1D9E0',
            strokeDasharray: '4',

          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withShadow={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'green',
    padding: 3,
    margin: 9,
    borderRadius: 20,
    borderColor: '#DEDEDE',
    borderWidth: 1

  },
  chart: {
    borderRadius: 12,
  },

});

export default GraficoMeta;
