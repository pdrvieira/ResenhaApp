import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalkthroughScreen } from '../screens/Walkthrough';

const Stack = createNativeStackNavigator();

export const WalkthroughNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="WalkthroughSlides" component={WalkthroughScreen} />
        </Stack.Navigator>
    );
};
