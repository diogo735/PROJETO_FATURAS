import React from 'react';
import { TouchableOpacity, Animated, View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
    value: boolean;
    onValueChange: (val: boolean) => void;
}

const SwitchCustomizado: React.FC<Props> = ({ value, onValueChange }) => {
    const translateX = React.useRef(new Animated.Value(value ? 26 : 0)).current;

    React.useEffect(() => {
        Animated.timing(translateX, {
            toValue: value ? 17 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [value]);

    return (
        <TouchableOpacity
            onPress={() => onValueChange(!value)}
            activeOpacity={0.8}
            style={[
                styles.container,
                {
                    backgroundColor: value ? '#2565A3' : '#E0DDE3',
                }
            ]}
        >
            <Animated.View
                style={[
                    styles.thumb,
                    {
                        backgroundColor: value ? '#fff' : '#A8A1AB',
                        transform: [{ translateX }],
                    }
                ]}
            >
                <Ionicons
                    name={value ? 'checkmark' : 'close'}
                    size={14}
                    color={value ? '#2565A3' : '#fff'}
                />

            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 46,
        height: 26,
        borderRadius: 32,
        padding: 4,
        justifyContent: 'center',
    },
    thumb: {
        width: 21,
        height: 21,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SwitchCustomizado;
