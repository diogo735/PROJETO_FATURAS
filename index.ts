import { registerRootComponent } from 'expo';
import App from './App';

// Desativar warnings específicos do Reanimated
const originalWarn = console.warn;
console.warn = (message, ...optionalParams) => {
  if (
    //message.includes("Reading from `value` during component render") ||
    message.includes("R")
   // message.includes("If you don't want to see this message, you can disable the `strict` mode")
  ) {
    return; // Ignora esses warnings
  }
  originalWarn(message, ...optionalParams); // Mantém outros warnings normais
};

registerRootComponent(App);
