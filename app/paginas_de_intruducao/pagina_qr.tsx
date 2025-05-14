import React from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../assets/imagens/icon_app_porco.svg';
const { width, height } = Dimensions.get('window');
import { useFonts, Andika_700Bold } from '@expo-google-fonts/andika';
import gifQr from '../../assets/paginas_intruducao/qr2.gif';
import gifCategorias from '../../assets/paginas_intruducao/categorias2.gif';
import gifMetas from '../../assets/paginas_intruducao/metas2.gif';
import { Afacad_500Medium } from '@expo-google-fonts/afacad';
import { TouchableOpacity } from 'react-native';
import { scale } from 'react-native-size-matters';
import { Image } from 'react-native'; // ✅ COR
import ArrowRight from '../../assets/paginas_intruducao/SETINHA.svg';
import { useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

const Pagina_Comecar_QR = () => {

    const [fontsLoaded] = useFonts({
        Andika_700Bold,
        Afacad_500Medium,
    });
    const dotScales = useRef([0, 1, 2].map(() => new Animated.Value(1))).current;

    const [paginaAtual, setPaginaAtual] = useState(0); // 0 = QR, 1 = Categorias, 2 = Metas
    const translateX = useRef(new Animated.Value(0)).current;
    type NavigationProp = StackNavigationProp<RootStackParamList, 'Pagina_Login'>;
    const navigation = useNavigation<NavigationProp>();
    
    const proximaPagina = () => {
        if (paginaAtual < 2) {
          // animação normal para próxima página
          Animated.timing(dotScales[paginaAtual], {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
      
          Animated.timing(dotScales[paginaAtual + 1], {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }).start();
      
          Animated.timing(translateX, {
            toValue: -(paginaAtual + 1) * width,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }).start(() => {
            setPaginaAtual(paginaAtual + 1);
          });
        } else {
          navigation.navigate('Pagina_Login');
        }
      };
      

    const paginas = [
        {
            gif: gifQr,
            titulo: 'Digitaliza as faturas',
            descricao: 'Aponta a câmara, digitaliza e controla \nas tuas finanças.',
        },
        {
            gif: gifCategorias,
            titulo: 'Organiza por categorias',
            descricao: 'Classifica os teus movimentos e cria as tuas próprias categorias.',
        },
        {
            gif: gifMetas,
            titulo: 'Cria as tuas metas',
            descricao: 'Define objetivos e acompanha o teu \nprogresso facilmente.',
        },
    ];


    return (
        <View style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            <LinearGradient
                colors={['#022B4C', '#2985DE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            <Animated.View
                style={{
                    flexDirection: 'row',
                    width: width * 3, // espaço total para 3 páginas
                    transform: [{ translateX }],
                }}
            >
                {paginas.map((pagina, index) => (
                    <View key={index} style={[styles.logoContainer, { width }]}>
                        <Image source={pagina.gif} style={styles.gif} />
                        <Text style={[styles.logoTextIntro, !fontsLoaded && { fontFamily: 'System' }]}>
                            {pagina.titulo}
                        </Text>
                        <Text style={[styles.subText, !fontsLoaded && { fontFamily: 'System' }]}>
                            {pagina.descricao}
                        </Text>
                    </View>
                ))}
            </Animated.View>

            <View style={styles.dotsContainer}>
                {[0, 1, 2].map(i => {
                    const isActive = i === paginaAtual;
                    return (
                        <Animated.View
                        key={i}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: paginaAtual === i ? '#187EE0' : '#90ACC6',
                            transform: [{ scale: dotScales[i] }],
                            opacity: paginaAtual === i ? 1 : 0.5,
                          },
                        ]}
                      />
                      
                    );
                })}
            </View>



            {/* Seta fixa no canto inferior direito */}
            <TouchableOpacity style={styles.arrowContainer} onPress={proximaPagina}>
                <ArrowRight width={25} height={25} />
            </TouchableOpacity>

        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer: {
        top: '0%',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    logoText: {
        marginTop: '3%',
        textAlign: 'center',
        lineHeight: width * 0.15,
    },

    logoTextIntro: {
        fontSize: scale(27),
        color: 'white',
        fontFamily: 'Andika_700Bold',
        marginTop: -height * .09
    },

    logoTextBrand: {
        fontSize: 55,
        fontFamily: 'Andika_700Bold',
        color: '#FFA723',
    },

    subText: {
        fontSize: 17,
        fontFamily: 'Afacad_500Medium',
        color: '#E4E4E4',
        textAlign: 'center',
        marginTop: '3%',
        lineHeight: 23,
        width: width * 0.8,
    },
    botaoComecar: {
        marginTop: '23%',
        backgroundColor: '#3591EB',
        paddingVertical: '4%',
        paddingHorizontal: '15%',
        borderRadius: 99,
        alignItems: 'center',
    },

    textoBotao: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Afacad_500Medium',
    },
    gif: {
        width: width * 0.8,
        resizeMode: 'contain',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: '17%',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#90ACC6',
        marginHorizontal: 4,
    },

    dotActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#187EE0',
        marginHorizontal: 4,
    },

    arrowContainer: {
        position: 'absolute',
        bottom: '5%',
        right: '7%',
    },



});

export default Pagina_Comecar_QR;
