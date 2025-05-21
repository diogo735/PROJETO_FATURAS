import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType, Pressable } from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App'; // ajuste o caminho
import { FadeIn, FadeOut } from 'react-native-reanimated';


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

interface GraficoCircularVazioProps {
    tipoSelecionado: 'receitas' | 'despesas';
}


const Grafico_CircularVazio: React.FC<GraficoCircularVazioProps> = ({ tipoSelecionado }) => {
    const radius = width * 0.24;
    const strokeWidth = width * 0.077;
    const size = (radius + strokeWidth + outerCircleRadius + 50) * 2;

    // Este é o tipo fixado durante a transição
    const [tipoVisivel, setTipoVisivel] = React.useState<'receitas' | 'despesas'>(tipoSelecionado);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setTipoVisivel(tipoSelecionado);
        }, 100);

        return () => clearTimeout(timeout);
    }, [tipoSelecionado]);

    return (
        <Animated.View
            style={styles.container}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
        >
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={tipoVisivel === 'despesas' ? '#F2A0A0' : '#7CD47C'}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
            </Svg>

            <Text
                style={{
                    position: "absolute",
                    alignSelf: "center",
                    top: size / 2 - radius - height * 0.1,
                    fontSize: width * 0.05,
                    fontWeight: "bold",
                    color: tipoVisivel === 'despesas' ? '#F2A0A0' : '#7CD47C',
                    textAlign: "center",
                    width: "100%",
                }}
            >
                Nenhuma {tipoVisivel === 'despesas' ? 'Despesa' : 'Receita'} Registrada!
            </Text>

            <View style={styles.imagemCentro}>
                <ImagemCentral
                    width="100%"
                    height="100%"
                    fill={tipoVisivel === "receitas" ? "#4AAF53" : "#E12D2D"}
                />
            </View>
        </Animated.View>
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

export default Grafico_CircularVazio;