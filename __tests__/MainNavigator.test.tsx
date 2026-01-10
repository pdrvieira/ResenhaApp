
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MainNavigator } from '../src/navigation/MainNavigator';

// Mock contexts
jest.mock('../src/contexts/NotificationContext', () => ({
    useNotifications: () => ({ badges: { myEvents: 0 } }),
}));

// Mock screens to isolate navigation logic
jest.mock('../src/screens/Main', () => ({
    MapScreen: () => null,
    EventDetailsScreen: () => null,
    CreateEventScreen: () => null,
    MessagesScreen: () => null,
    ChatScreen: () => null,
    AccountScreen: () => null,
    SettingsScreen: () => null,
    ManageEventScreen: () => null,
    EditEventScreen: () => null,
    MyEventsScreen: () => null,
    InviteScreen: () => null,
}));

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('MainNavigator', () => {
    it('renders correctly', () => {
        const component = render(
            <NavigationContainer>
                <MainNavigator />
            </NavigationContainer>
        );
        expect(component).toBeTruthy();
    });
});
