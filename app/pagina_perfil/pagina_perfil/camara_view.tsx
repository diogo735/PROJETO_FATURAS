import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { CameraView, CameraType } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IconEditar from '../../../assets/icons/pagina_camera/galeria.svg';
import FlshIcon from '../../../assets/icons/pagina_camera/flash.svg';
import Flashoff from '../../../assets/icons/pagina_camera/flash-off.svg';
import * as ImagePicker from 'expo-image-picker';


interface Props {
    visivel: boolean;
    aoFechar: () => void;
    onFotoCapturada: (uri: string) => void; // callback para enviar a foto de volta
}

const ModalCameraCheia_editarperfil: React.FC<Props> = ({ visivel, aoFechar, onFotoCapturada }) => {
    const [facing, setFacing] = useState<CameraType>('back');
    const [cameraPronta, setCameraPronta] = useState(false);
    const [flashLigado, setFlashLigado] = useState(false);
    const cameraRef = useRef<CameraView>(null);



    const tirarFoto = async () => {
        if (!cameraPronta || !cameraRef.current) {
            console.warn('⚠️ A câmara ainda não está pronta.');
            return;
        }

        try {
            const foto = await cameraRef.current.takePictureAsync({
                base64: false,
                quality: 0.6,
            });

            if (foto?.uri) {
                console.log('✅ Foto capturada:', foto.uri);
                onFotoCapturada(foto.uri); // envia a foto para a página principal
                aoFechar(); // fecha o modal
            }
        } catch (error) {
            console.error('❌ Erro ao tirar foto:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao capturar a foto.');
        }
    };

    return (
        <Modal isVisible={visivel} style={{ margin: 0 }}>
            <View style={styles.container}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    mode="picture"
                    facing={facing}
                    enableTorch={flashLigado}
                    onCameraReady={() => setCameraPronta(true)}
                >
                    <TouchableOpacity style={styles.closeButton} onPress={aoFechar}>
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <View style={styles.bottomControls}>
                        {/* Botão de Opções */}
                        <TouchableOpacity
                            style={styles.sideButton}
                            onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
                        >
                            <Ionicons name="camera-reverse-outline" size={26} color="white" />
                        </TouchableOpacity>



                        {/* Botão de Capturar */}
                        <TouchableOpacity onPress={tirarFoto} style={styles.captureOuter}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>

                        {/* Botão de Flash */}
                        <TouchableOpacity onPress={() => setFlashLigado(!flashLigado)} style={styles.sideButton}>
                            {flashLigado ? (
                                <Flashoff width={26} height={26} />
                            ) : (
                                <FlshIcon width={26} height={26} />
                            )}
                        </TouchableOpacity>
                    </View>

                </CameraView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        borderRadius: 40,
        overflow: 'hidden',
    },

    camera: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 9,
        borderRadius: 99,
        zIndex: 1,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    sideButton: {
        width: 56,
        height: 56,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureOuter: {
        width: 90,
        height: 90,
        borderRadius: 99,
        borderWidth: 3,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 70,
        height: 70,
        borderRadius: 99,
        backgroundColor: 'white',
    },
});

export default ModalCameraCheia_editarperfil;
