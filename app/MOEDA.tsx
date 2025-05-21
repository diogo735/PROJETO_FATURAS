// contexts/MoedaContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Moeda {
  codigo: string;
  simbolo: string;
}

interface MoedaContextData {
  moeda: Moeda;
  setMoeda: (moeda: Moeda) => void;
}

const MoedaContext = createContext<MoedaContextData>({
  moeda: { codigo: 'EUR', simbolo: '€' },
  setMoeda: () => {},
});

export const MoedaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moeda, setMoedaState] = useState<Moeda>({ codigo: 'EUR', simbolo: '€' });

  useEffect(() => {
    const carregarMoeda = async () => {
      try {
        const valor = await AsyncStorage.getItem('moedaSelecionada');
        if (valor) {
          const obj = JSON.parse(valor);
          if (obj.simbolo) setMoedaState(obj);
        }
      } catch (e) {
        console.error('Erro ao carregar moeda:', e);
      }
    };
    carregarMoeda();
  }, []);

  const setMoeda = (novaMoeda: Moeda) => {
    setMoedaState(novaMoeda);
    AsyncStorage.setItem('moedaSelecionada', JSON.stringify(novaMoeda));
  };

  return (
    <MoedaContext.Provider value={{ moeda, setMoeda }}>
      {children}
    </MoedaContext.Provider>
  );
};

export const useMoeda = () => useContext(MoedaContext);
