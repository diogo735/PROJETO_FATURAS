import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
interface Props {
  children: ReactNode;
}

const Primeiro_Container: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '95%',
    height: height*0.56,
    backgroundColor: '#ADD8E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default Primeiro_Container;
