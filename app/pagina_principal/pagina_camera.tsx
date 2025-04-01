

import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import FaturaVerde from '../../assets/icons/pagina_camera/detetou_fatura.svg';
import FaturaLaranja from '../../assets/icons/pagina_camera/nao_detetou_fatura.svg';
import IconEditar from '../../assets/icons/pagina_camera/editar.svg';
import FlshIcon from '../../assets/icons/pagina_camera/flash.svg';
import Flashoff from '../../assets/icons/pagina_camera/flash-off.svg';

export default function PaginaCamera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const [qrDetectado, setQrDetectado] = useState(false);
  const qrTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [flashLigado, setFlashLigado] = useState(false);




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

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Sem permissão para usar a câmara</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Permitir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleQrDetectado = ({ data }: { data: string }) => {
    // Ativa o estado visual verde
    setQrDetectado(true);

    // Limpa o timeout anterior (evita desativar logo a seguir)
    if (qrTimeoutRef.current) clearTimeout(qrTimeoutRef.current);

    // Programa para voltar a laranja após 500ms se não detectar novamente
    qrTimeoutRef.current = setTimeout(() => {
      setQrDetectado(false);
    }, 200);
  };



  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      <View style={styles.container}>
        <CameraView

          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleQrDetectado}
          enableTorch={flashLigado}


        >

          <View style={styles.overlayWrapper} pointerEvents="none">
            {qrDetectado ? (
              <FaturaVerde width="100%" height="100%" />
            ) : (
              <FaturaLaranja width="100%" height="100%" />
            )}
          </View>



          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.centralizeBox}>
            <Text style={styles.centralizeText}>Centralize a sua fatura</Text>
          </View>

          <View style={styles.bottomControls}>

            <TouchableOpacity style={styles.sideButton} onPress={() => console.log('Editar')}>
              <IconEditar width={26} height={26} />
            </TouchableOpacity>


            <TouchableOpacity style={styles.captureOuter} onPress={() => console.log('Capturar')}>
              <View style={styles.captureInner} />
            </TouchableOpacity>



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



});

