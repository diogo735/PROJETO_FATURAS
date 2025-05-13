import React from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../assets/imagens/icon_app_porco.svg';
const { width, height } = Dimensions.get('window');
import { useFonts, Andika_700Bold } from '@expo-google-fonts/andika';

import { Afacad_500Medium } from '@expo-google-fonts/afacad';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
const Pagina_Comecar = () => {


    type NavigationProp = StackNavigationProp<RootStackParamList, 'PaginaComecarQR'>;
    const navigation = useNavigation<NavigationProp>();

    const [fontsLoaded] = useFonts({
        Andika_700Bold,
        Afacad_500Medium,
    });


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
            <View style={styles.logoContainer}>
                <Logo width={width * 0.65} height={height * 0.15} />
                <Text style={styles.logoText}>
                    <Text style={[styles.logoTextIntro, !fontsLoaded && { fontFamily: 'System' }
                    ]}>Bem vindo a </Text>
                    <Text style={[styles.logoTextBrand, !fontsLoaded && { fontFamily: 'System' }
                    ]}>PiggyWallet</Text>
                </Text>
                <Text style={[styles.subText, !fontsLoaded && { fontFamily: 'System' }
                ]}>
                    A sua maneira nova de gerira a sua{'\n'} vida financeira
                </Text>

                <TouchableOpacity
                    style={styles.botaoComecar}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('PaginaComecarQR')}
                >
                    <Text style={[styles.textoBotao, !fontsLoaded && { fontFamily: 'System' }
                    ]}>Começar</Text>
                </TouchableOpacity>
            </View>
        </View>




    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer: {
        position: 'absolute',
        top: '32%',
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
        fontSize: 41,
        color: 'white',
        fontFamily: 'Andika_700Bold',
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


});

export default Pagina_Comecar;
