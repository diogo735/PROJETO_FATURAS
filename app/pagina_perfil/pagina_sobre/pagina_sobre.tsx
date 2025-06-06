import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList, Modal, Easing, ActivityIndicator } from 'react-native';
import { scale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('window');
import IconSync from '../../../assets/icons/Sync_branco.svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App'; // a
import * as Application from 'expo-application';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LaravelIcon from '../../../assets/icons/laravel.svg';
import ReactlIcon from '../../../assets/icons/React.svg';
const PaginaSobre = () => {


    type NotificacaoNavigationProp = StackNavigationProp<RootStackParamList, 'PaginaSobre'>;
    const navigation = useNavigation<NotificacaoNavigationProp>();

    const [versaoApp, setVersaoApp] = useState('');
    useEffect(() => {
        setVersaoApp(Application.nativeApplicationVersion || '1.0');
    }, []);


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#2565A3" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Sobre</Text>
                </View>

            </View>
            <View style={styles.body}>

                <View style={{ alignItems: 'center', marginTop: 0 }}>
                    <Image
                        source={require('../../../assets/ios_icon.png')} // ajuste o caminho
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 0,
                            resizeMode: 'cover',
                            marginBottom: 10,
                        }}
                    />


                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2565A3' }}>
                        PiggyWallet
                    </Text>
                    <Text style={{ color: '#888', marginTop: 4 }}>Versão {versaoApp}</Text>
                    <Text style={{ color: '#aaa', marginTop: 2 }}>por ENOVO</Text>

                    <View style={{ marginTop: 30, alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '400', color: '#2565A3', marginBottom: 20 }}>
                            Equipa de Desenvolvimento
                        </Text>

                        {/* Membro 1 */}
                        <View style={{ marginBottom: 12, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialIcons name="brush" size={16} color="#2565A3" />
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#2565A3' }}>
                                    Designer Mobile
                                </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#333' }}>Diogo Ferreira</Text>
                        </View>

                        <View style={{ marginBottom: 12, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <ReactlIcon width={16} height={16} fill="#2565A3" />
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#2565A3' }}>
                                    Designer React Native
                                </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#333' }}>Diogo Ferreira</Text>
                        </View>
                        <View style={{ marginBottom: 12, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="logo-android" size={18} color="#2565A3" />
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#2565A3' }}>
                                    Programador Android
                                </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#333' }}>Diogo Ferreira</Text>
                        </View>
                        <View style={{ marginBottom: 12, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="logo-apple" size={18} color="#2565A3" />
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#2565A3' }}>
                                    Programador IOS
                                </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#333' }}>Diogo Ferreira</Text>
                        </View>
                        <View style={{ marginBottom: 12, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <LaravelIcon width={16} height={16} fill="#2565A3" />
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#2565A3' }}>
                                    Desenvolvedor Laravel
                                </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#333' }}>Diogo Ferreira</Text>
                        </View>
                    </View>
                </View>





            </View>




        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    body: {
        flex: 1,
        justifyContent: 'center',   // centraliza verticalmente
        alignItems: 'center',       // centraliza horizontalmente
        paddingHorizontal: '5%',
        backgroundColor: '#FDFDFD',
    },


    header: {
        backgroundColor: '#FDFDFD',
        height: height * 0.08,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
    },
    headerTitle: {
        color: '#2565A3',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: scale(0.9),
        marginLeft: 15,
    },
    textoNegrito: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 20,
    },
    texto: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    content: {
        paddingHorizontal: '5%',
        marginVertical: '5%',
        justifyContent: 'flex-start',
    },
});

export default PaginaSobre;