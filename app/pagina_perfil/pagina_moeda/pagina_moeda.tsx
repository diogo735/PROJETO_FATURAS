import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList, Modal } from 'react-native';
import { scale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
const { height, width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import Iconsvg from '../../../assets/icons/moedas.svg';
const PaginaMoeda = () => {
    const navigation = useNavigation();
    const moedas = [
        { pais: '🇺🇸', nome: 'United States Dollar', simbolo: '$', codigo: 'USD' },
        { pais: '🇪🇺', nome: 'Euro', simbolo: '€', codigo: 'EUR' },
        { pais: '🇬🇧', nome: 'British Pound', simbolo: '£', codigo: 'GBP' },
        { pais: '🇯🇵', nome: 'Japanese Yen', simbolo: '¥', codigo: 'JPY' },
        { pais: '🇨🇦', nome: 'Canadian Dollar', simbolo: 'CA$', codigo: 'CAD' },
        { pais: '🇨🇭', nome: 'Swiss Franc', simbolo: 'CHF', codigo: 'CHF' },
        { pais: '🇦🇺', nome: 'Australian Dollar', simbolo: 'A$', codigo: 'AUD' },
        { pais: '🇳🇿', nome: 'New Zealand Dollar', simbolo: 'NZ$', codigo: 'NZD' },
        { pais: '🇸🇬', nome: 'Singapore Dollar', simbolo: 'S$', codigo: 'SGD' },
        { pais: '🇭🇰', nome: 'Hong Kong Dollar', simbolo: 'HK$', codigo: 'HKD' },
        { pais: '🇳🇴', nome: 'Norwegian Krone', simbolo: 'kr', codigo: 'NOK' },
        { pais: '🇸🇪', nome: 'Swedish Krona', simbolo: 'kr', codigo: 'SEK' },
        { pais: '🇩🇰', nome: 'Danish Krone', simbolo: 'kr', codigo: 'DKK' },
        { pais: '🇧🇷', nome: 'Brazilian Real', simbolo: 'R$', codigo: 'BRL' },
        { pais: '🇲🇽', nome: 'Mexican Peso', simbolo: '$', codigo: 'MXN' },
        { pais: '🇷🇺', nome: 'Russian Ruble', simbolo: '₽', codigo: 'RUB' },
        { pais: '🇮🇳', nome: 'Indian Rupee', simbolo: '₹', codigo: 'INR' },
        { pais: '🇨🇳', nome: 'Chinese Yuan', simbolo: '¥', codigo: 'CNY' },
        { pais: '🇰🇷', nome: 'South Korean Won', simbolo: '₩', codigo: 'KRW' },
        { pais: '🇿🇦', nome: 'South African Rand', simbolo: 'R', codigo: 'ZAR' },
        { pais: '🇹🇷', nome: 'Turkish Lira', simbolo: '₺', codigo: 'TRY' },
        { pais: '🇸🇦', nome: 'Saudi Riyal', simbolo: '﷼', codigo: 'SAR' },
        { pais: '🇦🇪', nome: 'UAE Dirham', simbolo: 'د.إ', codigo: 'AED' },
        { pais: '🇮🇱', nome: 'Israeli Shekel', simbolo: '₪', codigo: 'ILS' },
        { pais: '🇹🇭', nome: 'Thai Baht', simbolo: '฿', codigo: 'THB' },
    ];


    const [moedaSelecionada, setMoedaSelecionada] = useState<string>('EUR');
    const [mostrarModalMoeda, setMostrarModalMoeda] = useState(false);
    const [novaMoeda, setNovaMoeda] = useState<{ codigo: string, simbolo: string } | null>(null);


    useEffect(() => {
        const carregarMoeda = async () => {
            const valor = await AsyncStorage.getItem('moedaSelecionada');
            if (valor) {
                const { codigo } = JSON.parse(valor);
                setMoedaSelecionada(codigo);
            }
        };

        carregarMoeda();
    }, []);

    const [contadorConfirmar, setContadorConfirmar] = useState(3);
    const [botaoAtivo, setBotaoAtivo] = useState(false);
    useEffect(() => {
        let intervalo: NodeJS.Timeout;

        if (mostrarModalMoeda) {
            setBotaoAtivo(false);
            setContadorConfirmar(3);

            intervalo = setInterval(() => {
                setContadorConfirmar((prev) => {
                    if (prev === 1) {
                        clearInterval(intervalo);
                        setBotaoAtivo(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalo);
    }, [mostrarModalMoeda]);


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => {

                            navigation.goBack();

                        }}
                    >
                        <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Moeda</Text>
                </View>
            </View>
            <FlatList
                data={moedas}
                keyExtractor={(item) => item.codigo}
                contentContainerStyle={{ padding: 10 }}
                renderItem={({ item }) => {
                    const selecionado = moedaSelecionada === item.codigo;

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => {
                                if (item.codigo !== moedaSelecionada) {
                                    setNovaMoeda({ codigo: item.codigo, simbolo: item.simbolo });
                                    setMostrarModalMoeda(true);
                                }
                            }}



                        >
                            {/* Emoji da bandeira */}
                            <View style={[styles.iconeWrapper, { backgroundColor: '#E5E5E5' }]}>
                                <Text style={{ fontSize: 18 }}>{item.pais}</Text>
                            </View>

                            {/* Nome e símbolo */}
                            <Text style={styles.nomeCategoria}>
                                {item.nome} ({item.simbolo})
                            </Text>

                            {/* Bolinha de seleção */}
                            {selecionado ? (
                                <View style={styles.radioSelecionado}>
                                    <MaterialIcons name="check" size={15} color="#fff" />
                                </View>
                            ) : (
                                <View style={styles.radio} />
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            <Modal
                transparent
                animationType="fade"
                visible={mostrarModalMoeda}
                onRequestClose={() => setMostrarModalMoeda(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 20,
                        width: '85%',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 5
                    }}>
                        <Iconsvg width={90} height={90} style={{ marginBottom: 20 }} />

                        <Text style={{ fontSize: 16, color: '#1B639C', textAlign: 'center', fontWeight: 'bold', marginBottom: 25 }}>
                            Ao mudares a moeda ,apenas estás a mudar o simbolo,nao serão convertidos os movimentos com base no cambio !
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    backgroundColor: '#eee',
                                    borderRadius: 99,
                                    alignItems: 'center',
                                }}
                                onPress={() => setMostrarModalMoeda(false)}
                            >
                                <Text style={{ color: '#666', fontWeight: '600' }}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    backgroundColor: botaoAtivo ? '#2565A3' : '#ccc',
                                    borderRadius: 99,
                                    alignItems: 'center',
                                }}
                                disabled={!botaoAtivo}
                                onPress={async () => {
                                    if (!botaoAtivo || !novaMoeda) return;
                                    setMoedaSelecionada(novaMoeda.codigo);
                                    await AsyncStorage.setItem('moedaSelecionada', JSON.stringify(novaMoeda));
                                    setMostrarModalMoeda(false);
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>
                                    {botaoAtivo ? 'Confirmar' : `Confirmar (${contadorConfirmar})`}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    texto: {
        fontSize: 18,
        color: '#2565A3',
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#2565A3',
        height: height * 0.08,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        elevation: 0,
    },
    headerTitle: {
        color: 'white',
        fontSize: scale(17),
        fontWeight: 'bold',
        letterSpacing: 18 * 0.05,
        marginLeft: 15,
    },
    content: {
        paddingHorizontal: '5%',
        marginVertical: '1%',
        justifyContent: 'flex-start',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    iconeWrapper: {
        width: 50,
        height: 50,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    nomeCategoria: {
        flex: 1,
        fontSize: 15,
        color: '#164878',
        fontWeight: '600',
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 99,
        borderWidth: 2,
        borderColor: '#607D8B',
    },
    radioSelecionado: {
        width: 22,
        height: 22,
        borderRadius: 99,
        backgroundColor: '#164878',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PaginaMoeda;
