import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SwitchCustomizado from '../componentes/switch_customizado';
import Slider from '@react-native-community/slider';

interface Props {
    alertaAtivo: boolean;
    onToggle: (value: boolean) => void;
    percentual: number;
    valor: number;
}

const AlertaCard: React.FC<Props> = ({ alertaAtivo, onToggle, percentual, valor }) => {
    return (
        <View style={styles.card}>
            <View style={styles.alertaHeader}>
                <View>
                    <View style={styles.alertaTituloRow}>
                        <Ionicons name="notifications" size={17} color="#164878" />
                        <Text style={styles.alertaTitulo}>Alertas</Text>
                    </View>
                    <Text style={styles.alertaSubTitulo}>Receber alertas ao atingir ...</Text>
                </View>

                <SwitchCustomizado value={alertaAtivo} onValueChange={onToggle} />
            </View>

            <View style={styles.alertaValores}>
                <Text style={styles.alertaPorcentagem}>{percentual}%</Text>
                <Text style={styles.alertaValor}>{valor}€</Text>
            </View>

            <View style={styles.alertaSliderContainer}>
                <Slider
                     style={{ width: '100%' }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={percentual}
                    onValueChange={(val) => {
                        onToggle(true); // opcional: ativa alerta ao mover
                        // aqui você pode passar um onChangePercentual também se quiser
                    }}
                    onSlidingComplete={(val) => {
                        // opcional: chamar setPercentual externo
                    }}
                    minimumTrackTintColor="#2565A3"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#2565A3"
                />
            </View>

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
        paddingLeft: 20
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
        paddingVertical: 10
    },
});

export default AlertaCard;
