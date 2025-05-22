import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import ModalFrequencia from './modal_frequencia_criar';
import IconCheck from '../../../../assets/icons/pagina_categorias/criar_categoria/check.svg';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { salvarNotificacao } from '../../../storage/notificacoes_personalizadas';


const { height } = Dimensions.get('window');

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Animated, Easing } from 'react-native';



import IconTitulo from '../../../../assets/icons/pagina_notificacoes_minhas/titulo.svg';
import IconHora from '../../../../assets/icons/pagina_notificacoes_minhas/hora.svg';
import IconFrequencia from '../../../../assets/icons/pagina_notificacoes_minhas/calendario.svg';
import IconNota from '../../../../assets/icons/pagina_notificacoes_minhas/nota.svg';
import IconSetaBaixo from '../../../../assets/icons/pagina_notificacoes_minhas/setinha_para_baixo.svg';




const CriarNotificacao: React.FC = () => {
    const navigation = useNavigation();
    const [mostrarModal, setMostrarModal] = useState(false);

    const [mostrarPickerHora, setMostrarPickerHora] = useState(false);


    const [titulo, setTitulo] = useState('Lembrete Diário');
    const [nota, setNota] = useState('O dia tá quase a chegar ao fim, não te esqueças de adicionar os teus movimentos!');
    const [horaSelecionada, setHoraSelecionada] = useState('20:00');
    const [frequencia, setFrequencia] = useState('Diariamente');

    const camposPreenchidos = titulo && horaSelecionada && frequencia && nota;

    const handleConfirmHora = (date: Date) => {
        const hora = date.toLocaleTimeString('pt-PT', {
            hour: '2-digit',
            minute: '2-digit',
        });
        setHoraSelecionada(hora);
        setMostrarPickerHora(false);
    };

    return (

        <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>

                            <Ionicons name="close" size={26} color="#164878" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Criar notificação</Text>


                    </View>

                    <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">

                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabel}>
                                <IconTitulo width={21} height={21} />
                                <Text style={styles.labelText}>Título</Text>
                            </View>
                            <TextInput
                                value={titulo}
                                onChangeText={setTitulo}
                                placeholder="adicionar título..."
                                placeholderTextColor="#D0DAE4"
                                style={styles.input}
                                maxLength={20}
                            />

                        </View>


                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabel}>
                                <IconHora width={21} height={21} />
                                <Text style={styles.labelText}>Hora</Text>
                            </View>

                            <TouchableOpacity style={styles.inputComSeta} onPress={() => setMostrarPickerHora(true)}>
                                <Text
                                    style={[
                                        styles.textoSimulado,
                                        horaSelecionada ? styles.textoPreenchido : null
                                    ]}
                                >
                                    {horaSelecionada || 'definir hora...'}
                                </Text>
                                <IconSetaBaixo width={16} height={16} />
                            </TouchableOpacity>


                        </View>



                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabel}>
                                <IconFrequencia width={21} height={21} />
                                <Text style={styles.labelText}>Frequencia da notificação</Text>
                            </View>

                            <TouchableOpacity style={styles.inputComSeta} onPress={() => setMostrarModal(true)}>
                                <Text
                                    style={[
                                        styles.textoSimulado,
                                        frequencia ? styles.textoPreenchido : null
                                    ]}
                                >
                                    {frequencia || 'definir frequência...'}
                                </Text>

                                <IconSetaBaixo width={16} height={16} />
                            </TouchableOpacity>
                        </View>


                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabel}>
                                <IconNota width={21} height={21} />
                                <Text style={styles.labelText}>Nota</Text>
                            </View>
                            <TextInput
                                value={nota}
                                onChangeText={setNota}
                                placeholder="adicionar nota..."
                                placeholderTextColor="#D0DAE4"
                                style={[styles.input, { height: '45%', textAlignVertical: 'top' }]}
                                multiline
                                maxLength={90}
                            />

                        </View>
                    </ScrollView>


                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.botaoFinal,
                                !camposPreenchidos && { backgroundColor: '#6195C8' }
                            ]}
                            disabled={!camposPreenchidos}
                            onPress={async () => {
                                await salvarNotificacao({
                                    titulo,
                                    hora: horaSelecionada,
                                    frequencia,
                                    nota,
                                });
                                navigation.goBack(); 
                            }}
                        >
                            <IconCheck width={16} color="#fff" />
                            <Text style={styles.textoBotaoFinal}>Criar notificação</Text>
                        </TouchableOpacity>


                    </View>



                </View>


            </TouchableWithoutFeedback >

            <ModalFrequencia
                visivel={mostrarModal}
                onFechar={() => setMostrarModal(false)}
                frequenciaSelecionada={frequencia}
                onSelecionar={(valor) => {
                    setFrequencia(valor);
                    setMostrarModal(false);
                }}
            />

            <DateTimePickerModal
                isVisible={mostrarPickerHora}
                mode="time"
                onConfirm={handleConfirmHora}
                onCancel={() => setMostrarPickerHora(false)}
                is24Hour={true}
                locale="pt-PT"
            />

        </View>
    );
};

export default CriarNotificacao;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    header: {
        backgroundColor: 'white',
        height: height * 0.09,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        elevation: 0,
    },
    textoPreenchido: {
        color: '#44596D', // cor quando preenchido
    },
    headerTitle: {
        color: '#2565A3',
        fontSize: scale(17),
        marginLeft: 10,
        fontWeight: 'bold',
        letterSpacing: 18 * 0.05,
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    inputGroup: {
        marginBottom: '7%',
    },
    inputLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: '3%',
    },
    labelText: {
        color: '#2565A3',
        fontWeight: 'bold',
        fontSize: scale(16)
    },
    input: {
        backgroundColor: '#fff',
        borderColor: '#D0DAE4',
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 14,
        color: '#44596D',
    },
    inputComSeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor: '#C8D3E1',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    textoSimulado: {
        color: '#D0DAE4',
        fontSize: 14,
    },

    footer: {
        marginTop: 5,
        padding: 15,
    },

    botaoFinal: {
        backgroundColor: '#2565A3',
        paddingVertical: 11,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        elevation: 2,
    },

    textoBotaoFinal: {

        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },


});
