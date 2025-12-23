import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  EventDetailsScreen,
  CreateEventScreen,
  MessagesScreen,
  ChatScreen,
  AccountScreen,
  SettingsScreen,
  ManageRequestsScreen,
  MapScreen,
  MyEventsScreen,
} from '../screens/Main';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack: Descobrir (Mapa + Explorar)
const DiscoverStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="DiscoverMap"
      component={MapScreen}
      options={{ title: 'Descobrir', headerShown: false }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ title: 'Detalhes do Evento' }}
    />
    <Stack.Screen
      name="ManageRequests"
      component={ManageRequestsScreen}
      options={{ title: 'Solicitações' }}
    />
  </Stack.Navigator>
);

// Stack: Meus Eventos
const MyEventsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MyEventsList"
      component={MyEventsScreen}
      options={{ title: 'Meus Eventos' }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ title: 'Detalhes do Evento' }}
    />
    <Stack.Screen
      name="ManageRequests"
      component={ManageRequestsScreen}
      options={{ title: 'Solicitações' }}
    />
  </Stack.Navigator>
);

// Stack: Criar Evento
const CreateEventStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="CreateEventForm"
      component={CreateEventScreen}
      options={{ title: 'Criar Evento' }}
    />
  </Stack.Navigator>
);

// Stack: Mensagens
const MessagesStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MessagesList"
      component={MessagesScreen}
      options={{ title: 'Conversas' }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }: any) => ({
        title: route.params?.otherUser?.name || 'Chat',
      })}
    />
  </Stack.Navigator>
);

// Stack: Perfil
const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AccountProfile"
      component={AccountScreen}
      options={{ title: 'Perfil' }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Configurações' }}
    />
  </Stack.Navigator>
);

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          switch (route.name) {
            case 'Discover':
              iconName = focused ? 'map-marker-radius' : 'map-marker-radius-outline';
              break;
            case 'MyEvents':
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
              break;
            case 'CreateEvent':
              iconName = focused ? 'plus-circle' : 'plus-circle-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chat' : 'chat-outline';
              break;
            case 'Account':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{ title: 'Descobrir' }}
      />
      <Tab.Screen
        name="MyEvents"
        component={MyEventsStack}
        options={{ title: 'Meus Eventos' }}
      />
      <Tab.Screen
        name="CreateEvent"
        component={CreateEventStack}
        options={{ title: 'Criar' }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};
