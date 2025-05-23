

import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import * as ImageManipulator from 'expo-image-manipulator';
import ModalOpcoesCamera from './modal_opcoes_camera';
import Modal_Info_Fatura_Preencher from './camara_componentes/modal_info_preencher_fatura';
import { Image } from 'react-native';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const screenRatio = height / width;

import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import FaturaVerde from '../../assets/icons/pagina_camera/detetou_fatura.svg';
import FaturaLaranja from '../../assets/icons/pagina_camera/nao_detetou_fatura.svg';
import IconEditar from '../../assets/icons/pagina_camera/escrever.svg';
import FlshIcon from '../../assets/icons/pagina_camera/flash.svg';
import Flashoff from '../../assets/icons/pagina_camera/flash-off.svg';
import Modal_Info_Fatura from './camara_componentes/modal_info_fatura';
import * as RNImagePicker from 'expo-image-picker';
import { BarCodeScanner } from 'expo-barcode-scanner';
export default function PaginaCamera() {
  const [facing, setFacing] = useState<CameraType>('back');
  
  const navigation = useNavigation();
  const [qrDetectado, setQrDetectado] = useState(false);
  const qrTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [flashLigado, setFlashLigado] = useState(false);
  const [conteudoQr, setConteudoQr] = useState<string | null>(null);
  const [dadosFatura, setDadosFatura] = useState<any | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [mostrarFotoModal, setMostrarFotoModal] = useState(false);
  const [bloquearLeitura, setBloquearLeitura] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [mostrarPermissaoOverlay, setMostrarPermissaoOverlay] = useState(!permission?.granted);



  const [cameraPronta, setCameraPronta] = useState(false);
  const [mostrarOpcoesCamera, setMostrarOpcoesCamera] = useState(false);
  const [mostrarModalPreencher, setMostrarModalPreencher] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(true);




  useEffect(() => {
    // Quando ENTRA na câmara
    NavigationBar.setBackgroundColorAsync('black');
    NavigationBar.setButtonStyleAsync('light');

    return () => {
      // Quando SAI da câmara
      NavigationBar.setBackgroundColorAsync('white');
      NavigationBar.setButtonStyleAsync('dark');
    };
  }, []);
  const handleQrDetectado = ({ data }: { data: string }) => {
    if (!data.includes('H:')) {
      console.log('QR ignorado (sem ATCUD)');
      return;
    }
    setConteudoQr(data);
    setQrDetectado(true);


    if (qrTimeoutRef.current) {
      clearTimeout(qrTimeoutRef.current);
    }


    qrTimeoutRef.current = setTimeout(() => {
      setQrDetectado(false);
    }, 300);
  };
  const tirarFoto = async () => {
    if (!cameraPronta || !cameraRef.current) {
      console.warn('⚠️ A câmara ainda não está pronta.');
      return;
    }

    try {
      // 📸 Captura da foto
      const foto = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 0.6,
      });

      if (foto?.uri) {
        // 🧼 Desativa o flash (caso estivesse ligado)
        setFlashLigado(false);

        // 🖼️ Define a URI da foto capturada
        setFotoCapturada(foto.uri);

        // ⏳ Dá um pequeno delay antes de mostrar o modal
        setTimeout(() => {
          setMostrarFotoModal(true);
        }, 100);
      } else {
        console.warn('⚠️ Nenhuma foto foi capturada.');
        setMostrarFotoModal(false);
      }
    } catch (error) {
      console.error('❌ Erro ao tirar foto:', error);
      setMostrarFotoModal(false);
    }
  };

 useEffect(() => {
  if (permission == null) {
    return;
  }

  if (permission.granted) {
    setMostrarPermissaoOverlay(false);
  } else if (permission.canAskAgain) {
    setMostrarPermissaoOverlay(true);
  } else {
    setMostrarPermissaoOverlay(true);
  }
}, [permission]);



  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCameraPronta(false);
      requestPermission(); // ✅ usa diretamente aqui
    });

    return unsubscribe;
  }, [navigation, requestPermission]);


  useEffect(() => {
    if (permission?.granted && mostrarPermissaoOverlay) {
      setMostrarPermissaoOverlay(false);
    }
  }, [permission, mostrarPermissaoOverlay]);

  const pausarCamera = () => {
    setCameraAtiva(false);
  };


  const decode = async () => {
    try {
      const { status } = await RNImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Você precisa permitir o acesso à galeria.');
        return;
      }

      const result = await RNImagePicker.launchImageLibraryAsync({
        mediaTypes: RNImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        const qrResults = await BarCodeScanner.scanFromURLAsync(imageUri);
        setFotoCapturada(imageUri);

        // ✅ Se encontrou QR code, envia o conteúdo
        if (qrResults.length > 0) {
          setConteudoQr(qrResults[0].data);
        } else {
          setConteudoQr(null); // Para forçar o modal a mostrar que não encontrou
        }

        // ✅ Abre o modal
        setMostrarFotoModal(true);
      } else {
        console.log('Seleção cancelada.');
      }
    } catch (error) {
      console.error('Erro ao ler QR code:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar ler o QR code.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      <View style={styles.container}>
      {cameraAtiva && (
          <CameraView
            ref={cameraRef}
            style={[styles.camera]}
            mode="picture"
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleQrDetectado}
            enableTorch={flashLigado}
            onCameraReady={() => setCameraPronta(true)}
          
          >

            <View style={styles.overlayWrapper} pointerEvents="none">
              {qrDetectado ? (
                <FaturaVerde width="100%" height="100%" />
              ) : (
                <FaturaLaranja width="100%" height="100%" />
              )}
            </View>


            {permission && !permission.granted &&(
              <View style={styles.overlayMensagem}>
                <Image
                  source={require('../../assets/icons/pagina_camera/sempermissao.png')}
                  style={styles.permissaoImagem}
                  resizeMode="contain"
                />
                <Text style={styles.permissaoTexto}>Permissão da câmara negada</Text>
                <TouchableOpacity
                  style={styles.permissaoBotao}
                  onPress={() => {
                    if (permission?.canAskAgain) {
                      requestPermission();
                    } else {
                      Alert.alert(
                        'Permissão bloqueada!',
                        'Ative manualmente a câmara nas definições do seu dispositivo.',
                        [
                          { text: 'Abrir definições', onPress: () => Linking.openSettings() },
                          { text: 'Cancelar', style: 'cancel' },
                        ]
                      );
                    }
                  }}
                >
                  <Text style={styles.permissaoBotaoTexto}>Permitir acesso</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            <View style={styles.centralizeBox}>
              {qrDetectado ? (
                <Text style={[styles.centralizeText, { color: '#4AAF53' }]}>
                  Fatura Detetada !
                </Text>
              ) : (
                <Text style={styles.centralizeText}>
                  Centralize a sua fatura até ficar <Text style={{ color: '#4AAF53', fontWeight: 'bold' }}>Verde</Text>
                </Text>
              )}
            </View>


            <View style={styles.bottomControls}>

              <TouchableOpacity
                style={styles.sideButton}
                onPress={() => setMostrarOpcoesCamera(true)}
                disabled={mostrarPermissaoOverlay}
              >
                <IconEditar width={25} height={25} />
              </TouchableOpacity>




              <TouchableOpacity style={styles.captureOuter} onPress={tirarFoto} disabled={mostrarPermissaoOverlay}>
                <View style={styles.captureInner} />
              </TouchableOpacity>



              <TouchableOpacity onPress={() => setFlashLigado(!flashLigado)} style={styles.sideButton} disabled={mostrarPermissaoOverlay}>
                {flashLigado ? (
                  <Flashoff width={26} height={26} />
                ) : (
                  <FlshIcon width={26} height={26} />
                )}
              </TouchableOpacity>



            </View>

          </CameraView>
       )}


        <Modal_Info_Fatura
          visivel={mostrarFotoModal}
          uri={fotoCapturada}
          conteudoQr={conteudoQr}
          aoFechar={() => {
            setMostrarFotoModal(false);
            setConteudoQr(null);
          }}
          aoEliminar={() => {
            setMostrarFotoModal(false);
            setFotoCapturada(null);
            setConteudoQr(null);
            setFlashLigado(false);
          }}
        />

        <ModalOpcoesCamera
          visivel={mostrarOpcoesCamera}
          aoFechar={() => setMostrarOpcoesCamera(false)}
          onAbrirGaleria={() => {
            setMostrarOpcoesCamera(false);
            decode(); // abre a galeria
          }}
          onInserirManual={() => {
            setMostrarOpcoesCamera(false);
            setCameraAtiva(false); // 👈 Desativa a câmara
            setMostrarModalPreencher(true);
          }}

        />
        <Modal_Info_Fatura_Preencher
          visivel={mostrarModalPreencher}
          aoFechar={() => {
            setMostrarModalPreencher(false);
            setCameraAtiva(true); // reativa a câmara quando fecha
          }}
          aoEliminar={() => {
            setMostrarModalPreencher(false);
            setFotoCapturada(null);
            setCameraAtiva(true); // também reativa no eliminar
          }}
          onAbrirCameraManual={() => setCameraAtiva(false)}
          uri={null}
        />







      </View>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    // fundo da view principal
  },
  overlayWrapper: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    bottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0, // 👈 muda de 1 para 0 ou remove totalmente
    pointerEvents: 'none', // 👈 importante pra não bloquear cliques
  },


  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    borderRadius: 40
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 150,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 9,
    borderRadius: 99,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between', // ← espaça entre os extremos
    alignItems: 'center',
    paddingHorizontal: 14, // ← margem lateral de 5
    zIndex: 10,
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
    backgroundColor: 'transparent',
    zIndex: 10,
  },

  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 99,
    backgroundColor: 'white',
  },
  centralizeBox: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 99,
    zIndex: 10,
  },

  centralizeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  faturaOverlayBase: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
    width: '65%',
    bottom: 15,
    borderRadius: 10,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.2)',
    pointerEvents: 'none',
  },

  estiloComQr: {
    borderWidth: 2,
    borderColor: 'limegreen',
    borderStyle: 'solid',
    backgroundColor: 'rgba(74, 175, 83, 0.15)',


  },

  estiloSemQr: {
    borderWidth: 2,
    borderColor: 'orange',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 167, 35, 0.15)',

  },
  permissaoContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  permissaoImagem: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },

  permissaoTexto: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',

    fontWeight: 'bold',
  },

  permissaoBotao: {
    backgroundColor: '#2C72B4',
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 99,
  },

  permissaoBotaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  overlayMensagem: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: height * 0.45,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    zIndex: 100,
  },

  textoOverlay: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },


});

