import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text as RNText, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SwitchCustomizado from '../componentes/switch_customizado';
import Slider from '@react-native-community/slider';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useMoeda } from '../../../MOEDA';



interface Props {
    alertaAtivo: boolean;
    onToggle: (value: boolean) => void;
    valor: number | null;
    valorCalculadoAlerta?: number;
    onValorCalculadoChange: (valorCalculado: number) => void;
    
  }
  


const AlertaCard: React.FC<Props> = ({ alertaAtivo, onToggle, valor, onValorCalculadoChange, valorCalculadoAlerta }) => {
    

    let valorInicial = 75;
    if (valor !== null && !isNaN(valor) && valorCalculadoAlerta && valorCalculadoAlerta > 0) {
      valorInicial = (valorCalculadoAlerta / valor) * 100;
    }
    
        const { moeda } = useMoeda();

    const percentual = useSharedValue(valorInicial);
    const [sliderValue, setSliderValue] = useState(valorInicial);


    return (
        <View style={styles.card}>
            <View style={styles.alertaHeader}>
                <View>
                    <View style={styles.alertaTituloRow}>
                        <Ionicons name="notifications" size={17} color="#164878" />
                        <RNText style={styles.alertaTitulo}>Alertas</RNText>
                    </View>
                    <RNText style={styles.alertaSubTitulo}>
                        Receber alertas ao atingir ...
                    </RNText>
                </View>
                <SwitchCustomizado value={alertaAtivo} onValueChange={onToggle} />
            </View>

            {alertaAtivo && valor !== null && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>

                    <View style={styles.alertaValores}>
                        <Text style={styles.alertaPorcentagem}>
                            {Math.floor(sliderValue)}%
                        </Text>

                        <Text style={styles.alertaValor}>
                            {valor !== null && !isNaN(valor)
                                ? `${Math.floor((valor * sliderValue) / 100)}${moeda.simbolo}`
                                : `0${moeda.simbolo}`}
                        </Text>
                    </View>


                </Animated.View>
            )}

            {alertaAtivo && valor !== null && (
                <View style={styles.alertaSliderContainer}>
                    <Slider
                        style={{ width: '100%' }}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={percentual.value}
                        onValueChange={(value) => {
                            setSliderValue(value)
                            if (valor !== null && !isNaN(valor)) {
                              const calculado = Math.floor((valor * value) / 100);
                              onValorCalculadoChange(calculado);
                            } else {
                              onValorCalculadoChange(0);
                            }
                          }}
                          
                          
                        minimumTrackTintColor="#2565A3"
                        maximumTrackTintColor="#587088"
                        thumbTintColor="#2565A3"
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F5F5F5',
        margin: 10,
        marginBottom: 5,
        padding: 10,
        borderRadius: 14,
        elevation: 0,
    },
    alertaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    alertaTituloRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    alertaTitulo: {
        color: '#164878',
        fontWeight: 'bold',
        fontSize: 17,
    },
    alertaSubTitulo: {
        color: '#164878',
        fontSize: 13,
        fontWeight: '500',
        paddingTop: 3,
        paddingLeft: 20,
    },
    alertaValores: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 10,
        paddingHorizontal: 10,

    },
    alertaPorcentagem: {
        fontSize: 40,
        fontWeight: '800',
        color: '#000',
    },
    alertaValor: {
        fontSize: 40,
        fontWeight: '800',
        color: '#000',
    },
    alertaSliderContainer: {
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
});

export default AlertaCard;
