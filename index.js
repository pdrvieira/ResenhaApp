/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import notifee, { EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Background handler para notificações
// Executado quando app está fechado ou em background
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    // Se usuário tocou na notificação
    if (type === EventType.PRESS) {
        console.log('🔔 Background notification pressed:', notification?.data);
        // A navegação será tratada quando o app abrir
    }

    // Se usuário dispensou a notificação
    if (type === EventType.DISMISSED) {
        console.log('🔔 Notification dismissed');
    }
});

AppRegistry.registerComponent(appName, () => App);
