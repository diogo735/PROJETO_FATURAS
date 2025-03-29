import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
    visivel: boolean;
    aoFechar: () => void;
    aoConfirmar: (inicio: Date, fim: Date) => void;
}

const hoje = new Date();

function getIntervaloSemana() {
    const diaSemana = hoje.getDay(); // 0 (Domingo) a 6 (Sábado)
    const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana; // segunda
    const diffDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;  // domingo

    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diffSegunda);

    const domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() + diffDomingo);

    return [segunda, domingo];
}

function getIntervaloMes() {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0); // último dia do mês
    return [inicio, fim];
}

function getIntervaloSemestre() {
    const ano = hoje.getFullYear();
    const semestre = hoje.getMonth() < 6 ? 1 : 2;

    const inicio = semestre === 1
        ? new Date(ano, 0, 1)
        : new Date(ano, 6, 1);

    const fim = semestre === 1
        ? new Date(ano, 5, 30)
        : new Date(ano, 11, 31);

    return [inicio, fim];
}

function formatarDataCurta(data: Date) {
    return data.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

const ModalData: React.FC<Props> = ({ visivel, aoFechar, aoConfirmar }) => {
    const [opcaoSelecionada, setOpcaoSelecionada] = useState<string>('semana');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [mostrarPicker, setMostrarPicker] = useState<'inicio' | 'fim' | null>(null);

    const formatarDataHoje = () => {
        const hoje = new Date();
        return hoje.toISOString().substring(0, 10); // formato YYYY-MM-DD
    };

    return (
        <Modal
            isVisible={visivel}
            onBackdropPress={aoFechar}
            swipeDirection="down"
            onSwipeComplete={aoFechar}
            style={styles.modal}
        >
            <View style={styles.container}>
                <View style={styles.handle} />
                <Text style={styles.titulo}>Selecionar Duração</Text>

                {['semana', 'mes', 'semestre', 'personalizado'].map((opcao) => (
                    <TouchableOpacity
                        key={opcao}
                        style={styles.opcao}
                        onPress={() => {
                            if (opcaoSelecionada === opcao) {
                                setOpcaoSelecionada('');
                            } else {
                                setOpcaoSelecionada(opcao);
                                if (opcao !== 'personalizado') {
                                    setDataInicio('');
                                    setDataFim('');
                                }
                            }
                        }}
                    >
                        {opcaoSelecionada === opcao ? (
                            <View style={styles.radioSelecionado}>
                                <Ionicons name="checkmark" size={13} color="#fff" />
                            </View>
                        ) : (
                            <View style={styles.radio} />
                        )}

                        <View>
                            <Text style={styles.opcaoTexto}>
                                {opcao === 'semana' && 'Esta semana'}
                                {opcao === 'mes' && 'Este mês'}
                                {opcao === 'semestre' && 'Este semestre'}
                                {opcao === 'personalizado' && 'Personalizado'}
                            </Text>

                            {opcao !== 'personalizado' && (
                                <Text style={{ fontSize: 13, color: '#164878', marginLeft: 28, marginTop: 5 }}>
                                    {(() => {
                                        const [ini, fim] =
                                            opcao === 'semana'
                                                ? getIntervaloSemana()
                                                : opcao === 'mes'
                                                    ? getIntervaloMes()
                                                    : getIntervaloSemestre();
                                        return `${formatarDataCurta(ini)} → ${formatarDataCurta(fim)}`;
                                    })()}
                                </Text>
                            )}
                        </View>

                    </TouchableOpacity>
                ))}

                {opcaoSelecionada === 'personalizado' && (
                    <View style={styles.datasPersonalizadas}>
                        <View style={styles.dataInputWrapper}>
                            <Text style={styles.dataLabel}>De</Text>
                            <TouchableOpacity
                                style={styles.dataInput}
                                onPress={() => setMostrarPicker('inicio')}
                            >
                                <Text style={{ color: dataInicio ? '#000' : '#999' }}>
                                    {dataInicio || 'YYYY-MM-DD'}
                                </Text>

                            </TouchableOpacity>

                        </View>

                        <View style={styles.dataInputWrapper}>
                            <Text style={styles.dataLabel}>Até</Text>
                            <TouchableOpacity
                                style={styles.dataInput}
                                onPress={() => setMostrarPicker('fim')} // ✅ correto!
                            >

                                <Text style={{ color: dataFim ? '#000' : '#999' }}>
                                    {dataFim || 'YYYY-MM-DD'}
                                </Text>

                            </TouchableOpacity>

                        </View>
                    </View>
                )}
                {mostrarPicker && (
                    <DateTimePicker
                        value={new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setMostrarPicker(null);
                            if (selectedDate) {
                                const formatada = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
                                if (mostrarPicker === 'inicio') {
                                    setDataInicio(formatada);
                                } else {
                                    setDataFim(formatada);
                                }
                            }
                        }}
                    />
                )}


                {/* Botões */}
                <View style={styles.botoes}>
                    <TouchableOpacity style={styles.cancelar} onPress={aoFechar}>
                        <Text style={styles.textoCancelar}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.guardar}
                        onPress={() => {
                            const inicio = new Date(dataInicio || formatarDataHoje());
                            const fim = new Date(dataFim || formatarDataHoje());
                            aoConfirmar(inicio, fim);
                        }}
                    >
                        <Text style={styles.textoGuardar}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: { justifyContent: 'flex-end', margin: 0 },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 20,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 10,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#164878',
        marginBottom: 16,
    },
    opcao: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#607D8B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    radioSelecionado: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#164878',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    opcaoTexto: {
        fontSize: 15,
        color: '#164878',
        fontWeight: '500',
        marginTop: 5,
        marginLeft: 5
    },
    datasPersonalizadas: {
        marginVertical: 20,
        gap: 12,
    },
    dataInputWrapper: {
        flexDirection: 'column',
    },
    dataLabel: {
        fontSize: 14,
        marginBottom: 4,
        color: '#164878',
        fontWeight: '600',
    },
    dataInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#F8F8F8',
    },

    botoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 20,
    },
    cancelar: {
        flex: 1,
        backgroundColor: '#ACC8F7',
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
    },
    textoCancelar: {
        fontWeight: 'bold',
        color: '#164878',
    },
    guardar: {
        flex: 1,
        backgroundColor: '#164878',
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
    },
    textoGuardar: {
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default ModalData;
