import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width,height } = Dimensions.get('window');

interface GraficoMetaProps {
  dias: string[];     // ['1 abr.', '5 abr.', '10 abr.', '15 abr.', '20 abr.']
  dados: number[];    // valores acumulados
  valorMeta: number;  // linha tracejada da meta
}

const GraficoMeta: React.FC<GraficoMetaProps> = ({ dias, dados, valorMeta }) => {
  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: dias,
          datasets: [
            {
              data: dados,
              strokeWidth: 2,
              color: () => '#2565A3',
              withDots: true,
            },
            {
              data: new Array(dias.length).fill(valorMeta),
              strokeWidth: 2,
              color: () => '#2565A3',
              withDots: false,
            },
          ],
          legend: [],
        }}
        width={width*0.9}
        height={height*0.25}
        xLabelsOffset={0}
        yAxisSuffix="€"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: () => '#2565A3',
          labelColor: () => '#7D8A98',
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#fff',
            fill: '#2565A3',
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
        withShadow={false}
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
    borderColor:'#DEDEDE',
    borderWidth:1
    
  },
  chart: {
    borderRadius: 12,
  },
  
});

export default GraficoMeta;
