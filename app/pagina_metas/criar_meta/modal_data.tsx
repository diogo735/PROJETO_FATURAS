import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
    visivel: boolean;
    opcaoSelecionada: '' | 'semana' | 'mes' | 'semestre' | 'personalizado';
    setOpcaoSelecionada: (value: '' | 'semana' | 'mes' | 'semestre' | 'personalizado') => void;
    aoFechar: () => void;
    aoConfirmar: (inicio: Date, fim: Date, rotulo: string) => void;
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

const ModalData: React.FC<Props> = ({
    visivel,
    aoFechar,
    aoConfirmar,
    opcaoSelecionada,
    setOpcaoSelecionada
}) => {

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [mostrarPicker, setMostrarPicker] = useState<'inicio' | 'fim' | null>(null);

    const formatarDataHoje = () => {
        const hoje = new Date();
        return hoje.toISOString().substring(0, 10); // formato YYYY-MM-DD
    };
    useEffect(() => {
        if (opcaoSelecionada === 'semana') {
          const [inicio, fim] = getIntervaloSemana();
          setDataInicio(inicio.toISOString().split('T')[0]);
          setDataFim(fim.toISOString().split('T')[0]);
        } else if (opcaoSelecionada === 'mes') {
          const [inicio, fim] = getIntervaloMes();
          setDataInicio(inicio.toISOString().split('T')[0]);
          setDataFim(fim.toISOString().split('T')[0]);
        } else if (opcaoSelecionada === 'semestre') {
          const [inicio, fim] = getIntervaloSemestre();
          setDataInicio(inicio.toISOString().split('T')[0]);
          setDataFim(fim.toISOString().split('T')[0]);
        } else if (opcaoSelecionada === 'personalizado') {
          setDataInicio('');
          setDataFim('');
        }
      }, [opcaoSelecionada]);
      
      
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

                {(['semana', 'mes', 'semestre', 'personalizado'] as const).map((opcao) => (

                    <TouchableOpacity
                        key={opcao}
                        style={styles.opcao}
                        onPress={() => {
                            // Se já está selecionado, desmarca
                            if (opcaoSelecionada === opcao) {
                                setOpcaoSelecionada('');
                                setDataInicio('');
                                setDataFim('');
                                return;
                            }

                            // Se for uma nova opção, seleciona
                            setOpcaoSelecionada(opcao);

                            // Se não for personalizado, limpa datas
                            if (opcao !== 'personalizado') {
                                setDataInicio('');
                                setDataFim('');
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
                    <View style={styles.datasPersonalizadasHorizontal}>
                        <TouchableOpacity
                            style={styles.dataBotao}
                            onPress={() => setMostrarPicker('inicio')}
                        >
                            <Text style={{ flexDirection: 'row' }}>
                                <Text style={{ color: '#BABABA' }}>De </Text>
                                <Text style={styles.dataTexto}>{dataInicio || 'AAAA-MM-DD'}</Text>
                            </Text>

                            <Ionicons name="chevron-down" size={16} color="#164878" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.dataBotao,
                                !dataInicio && { opacity: 0.5 } // visualmente desabilitado
                            ]}
                            onPress={() => {
                                if (dataInicio) {
                                    setMostrarPicker('fim');
                                }
                            }}
                            disabled={!dataInicio}
                        >
                            <Text style={{ flexDirection: 'row' }}>
                                <Text style={{ color: '#BABABA' }}>Até </Text>
                                <Text style={styles.dataTexto}>{dataFim || 'AAAA-MM-DD'}</Text>
                            </Text>

                            <Ionicons name="chevron-down" size={16} color="#164878" />
                        </TouchableOpacity>
                    </View>
                )}

                {mostrarPicker && (
                    <DateTimePicker
                        value={new Date()}
                        mode="date"
                        display="default"
                        minimumDate={
                            mostrarPicker === 'inicio'
                                ? new Date() // início: hoje no mínimo
                                : dataInicio
                                    ? new Date(new Date(dataInicio).getTime() + 24 * 60 * 60 * 1000) // fim: 1 dia depois do início
                                    : new Date()
                        }
                        onChange={(event, selectedDate) => {
                            setMostrarPicker(null);
                            if (selectedDate) {
                                const formatada = selectedDate.toISOString().split('T')[0];
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
                            
                            if (dataInicio && dataFim) {
                                const inicio = new Date(dataInicio);
                                const fim = new Date(dataFim);
                                const rotulo =
                                    opcaoSelecionada === 'semana' ? 'Esta semana' :
                                        opcaoSelecionada === 'mes' ? 'Este mês' :
                                            opcaoSelecionada === 'semestre' ? 'Este semestre' :
                                                'Personalizado';

                                            //  console.log('📤 Dados confirmados:', {
                                              //      inicio: inicio.toISOString().split('T')[0],
                                                //    fim: fim.toISOString().split('T')[0],
                                                    rotulo
                                                  //});
                                                  
                                aoConfirmar(inicio, fim, rotulo);


                            }
                            aoFechar();
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
    datasPersonalizadasHorizontal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        marginBottom: 15,
        gap: 15,
    },

    dataBotao: {
        flex: 1,
        flexDirection: 'row',
        //backgroundColor: '#F0F4F7',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    dataTexto: {
        fontSize: 14,
        color: '#164878',
        fontWeight: '600',
    },

});

export default ModalData;
