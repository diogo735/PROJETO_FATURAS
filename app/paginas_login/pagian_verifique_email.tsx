import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Feather'; // Ícone do olho
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

const { width, height } = Dimensions.get('window');

const PaginaVerificarEmail: React.FC = () => {
    const [email, setEmail] = useState('');
   
    type NavigationProp = StackNavigationProp<RootStackParamList, 'Pagina_Esqueceu_Pass'>;
    const navigation = useNavigation<NavigationProp>();

    return (
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>


            <TouchableOpacity style={styles.btnFechar} onPress={() => navigation.pop(2)}>
                <Icon name="arrow-left" size={26} color="#000" />
            </TouchableOpacity>



            <View style={styles.logoArea}>
                <Image
                    source={require('../../assets/splash.png')} 
                    style={styles.logoBox}
                    resizeMode="contain"
                />
                <Text style={styles.bemVindo}>Verifica o teu email !</Text>
                <Text style={styles.subText}>Enviamos-te uma email com uma nova palavra passe e instruções para a redefenir!</Text>

            </View>


            <View style={styles.form}>

                 <TouchableOpacity style={styles.btnEntrar}>
                    <Text style={styles.btnEntrarText}>Não Recebeu ? Reenviar email</Text>
                </TouchableOpacity>
            </View>
        </View>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFF2FF',
        paddingTop: height * 0.022,
        paddingHorizontal: '5%',
    },
    btnFechar: {
        position: 'absolute',
        top: height * 0.02,
        left: '6%',
        zIndex: 2,
    },
    btnFecharText: {
        fontSize: 30,
        color: '#000',
    },
    logoArea: {
        alignItems: 'center',
        marginTop: height * 0.07,
        marginBottom: height * 0.04,
    },
    logoBox: {
        width: height * 0.1,
        height: height * 0.1,
        borderRadius: 12,
        marginBottom: 15,
    },
    bemVindo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2565A3',
    },
    form: {
        width: '100%',
    },
    label: {
        marginBottom: 10,
        color: '#6B6868',
        fontWeight: 'bold',

    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 30,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#DADADA',
    },

    inputSenhaContainer: {
        backgroundColor: '#fff',
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: 'space-between',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DADADA',
    },

    inputSenha: {
        flex: 1,

    },
    btnEntrar: {
        backgroundColor: '#2565A3',
        borderRadius: 50,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: '10%',
    },
    btnEntrarText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkSenha: {
        marginTop: '3%',
        color: '#2565A3',
        textAlign: 'center',
        fontWeight: '500',
    },
    
  

    inputInterno: {
        flex: 1,
        fontSize: 15,
        color: '#000',
    },
    subText: {
        marginTop: '4%',
        fontSize: 14,
        color: '#2565A3',
        textAlign: 'center',
      },
      

});

export default PaginaVerificarEmail;
