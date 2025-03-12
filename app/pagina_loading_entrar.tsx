import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import IconeRotativo from '../assets/imagens/wallpaper.svg';

const { width, height } = Dimensions.get('window');

const PagLoadingEntrar = () => {
  const rotateValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];


  const initialRotations = [45, 120, 80, 20,160];

  useEffect(() => {
    rotateValues.forEach((rotateValue) => {
      const animateRotation = () => {
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          rotateValue.setValue(0);
          animateRotation();
        });
      };

      animateRotation();
    });
  }, []);

  // Criar a interpolação com rotação inicial diferente
  const rotateInterpolations = rotateValues.map((rotateValue, index) =>
    rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: [`${initialRotations[index]}deg`, `${initialRotations[index] + 360}deg`],
    })
  );

  return (
    <View style={styles.container}>

      <LinearGradient
        colors={['#022B4C', '#2985DE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ícone 1 */}
      <Animated.View style={[styles.iconContainer, {
        top: -height * 0.04, left: -width * 0.18,
        transform: [{ rotate: rotateInterpolations[0] }]
      }]}>
        <IconeRotativo width={width * 0.8} height={width * 0.8} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      {/* Ícone 2 */}
      <Animated.View style={[styles.iconContainer, {
        top: height * 0.31, left: width * 0.8,
        transform: [{ rotate: rotateInterpolations[1] }]
      }]}>
        <IconeRotativo width={width * 0.3} height={width * 0.3} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      {/* Ícone 3 */}
      <Animated.View style={[styles.iconContainer, {
        top: height * 0.56, left: -width * 0.19,
        transform: [{ rotate: rotateInterpolations[2] }]
      }]}>
        <IconeRotativo width={width * 0.5} height={width * 0.5} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      {/* Ícone 4 */}
      <Animated.View style={[styles.iconContainer, {
        top: height * 0.67, left: width * 0.7,
        transform: [{ rotate: rotateInterpolations[3] }]
      }]}>
        <IconeRotativo width={width * 0.6} height={width * 0.6} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      {/* Ícone 5 */}
      <Animated.View style={[styles.iconContainer, {
        top: height * 0.96, left: width * 0.06,
        transform: [{ rotate: rotateInterpolations[4] }]
      }]}>
        <IconeRotativo width={width * 0.75} height={width * 0.75} fill="rgba(255,255,255,0.08)" />
      </Animated.View>

      <View style={styles.content}>
        <Text style={styles.text}>Carregando...</Text>
        <ActivityIndicator size="large" color="white" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default PagLoadingEntrar;
