import React from 'react';
import { View, TouchableOpacity, ImageBackground, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import Pagina_principal from '../app/pagina_principal/pagina_principal';
import Pagina_movimentos from '../app//pagina_moviementos/pagina_movimentos';
import Pagina_metas from '../app/pagina_metas/pagina_metas';
import Pagina_perfil from '../app/pagina_perfil/pagina_perfil';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { GestureResponderEvent } from 'react-native';
const { width: largura, height: altura } = Dimensions.get('window');

import Homeicon from '../assets/icons/home.svg';
import Faturasicon from '../assets/icons/faturas.svg';
import Metasicon from '../assets/icons/metas.svg';
import Perfilicon from '../assets/icons/perfil.svg';
import ScanIcon from '../assets/icons/scan.svg';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';


const Tab = createBottomTabNavigator();

const FundoImagem = require('../assets/imagens/FUNDO.png');

const TabNavigator = ({ initialParams }: { initialParams?: RootStackParamList['MainApp'] }) => {

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: { marginHorizontal: 3 },
                animationEnabled: true,
                headerShown: false,
                animationTypeForReplace: 'push', // ou 'pop' se quiser
                animation: 'fade', // <- FADE entre telas
                tabBarBackground: () => (
                    <ImageBackground source={FundoImagem} style={styles.tabBarBackground} />
                ),
                tabBarIcon: ({ focused }) => {
                    let IconComponent;
                    if (route.name === 'Home') {
                        IconComponent = Homeicon;
                    } else if (route.name === 'Movimentos') {
                        IconComponent = Faturasicon;
                    } else if (route.name === 'Metas') {
                        IconComponent = Metasicon;
                    } else if (route.name === 'Perfil') {
                        IconComponent = Perfilicon;
                    }

                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: altura * 0.030 }}>
                            {IconComponent ? (
                                <IconComponent width={27} height={27} fill={focused ? '#FFA500' : '#BFBFBF'} />
                            ) : (
                                <Ionicons name="alert-circle-outline" size={27} color="red" /> // Ícone de fallback
                            )}
                        </View>
                    );
                },

            })}
        >
            <Tab.Screen
                name="Home"
                component={Pagina_principal}
                initialParams={initialParams}
                options={{
                    lazy: false,
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            style={props.style}
                            onPress={props.onPress}
                            activeOpacity={1}
                        >
                            {props.children}
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tab.Screen
                name="Movimentos"
                component={Pagina_movimentos}
                options={{
                    lazy: false,
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            style={props.style}
                            onPress={props.onPress}
                            activeOpacity={1}
                        >
                            {props.children}
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Botão Central Personalizado */}
            <Tab.Screen
                name="Scan"
                options={{
                    tabBarButton: () => {
                        const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

                        return (
                            <TouchableOpacity
                                style={styles.customButton}
                                onPress={() => navigation.navigate('Camera')}
                            >
                                <View style={styles.innerButton}>
                                    <ScanIcon width={30} height={30} fill="white" />
                                </View>
                            </TouchableOpacity>
                        );
                    },
                }}
            >
                {() => null}
            </Tab.Screen>



            <Tab.Screen
                name="Metas"
                component={Pagina_metas}
                options={{
                    lazy: false,
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            style={props.style}
                            onPress={props.onPress}
                            activeOpacity={1}
                        >
                            {props.children}
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tab.Screen
                name="Perfil"
                component={Pagina_perfil}
                options={{
                    lazy: false,
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            style={props.style}
                            onPress={props.onPress}
                            activeOpacity={1}
                        >
                            {props.children}
                        </TouchableOpacity>
                    ),
                }}
            />
        </Tab.Navigator>

    );
};

// ** Estilização do Tab Bar e Botão Flutuante**
const styles = StyleSheet.create({
    tabBarBackground: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        borderRadius: 25,
        overflow: 'hidden',
    },
    tabBar: {
        position: 'absolute',
        bottom: altura * 0.02,
        marginHorizontal: largura * 0.025,
        height: altura * 0.09,
        width: largura * 0.95,
        borderRadius: 25,
        backgroundColor: 'transparent',
        elevation: 0,
        shadowColor: 'transparent',
        paddingBottom: 5,
        overflow: 'visible',
        borderTopWidth: 0
    },
    customButton: {
        top: -altura * 0.022,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerButton: {
        width: largura * 0.18,
        height: largura * 0.18,
        borderRadius: 99,
        backgroundColor: '#164878',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'transparent',
        elevation: 0,
    },
});

export default TabNavigator;
