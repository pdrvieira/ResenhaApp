import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FeedScreen,
  EventDetailsScreen,
  CreateEventScreen,
  MessagesScreen,
  ChatScreen,
  AccountScreen,
  SettingsScreen,
  ManageRequestsScreen,
  MapScreen,
} from '../screens/Main';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack do Mapa (HOME)
const MapStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MapView"
      component={MapScreen}
      options={{ title: 'Mapa', headerShown: false }}
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

// Stack do Feed (lista)
const FeedStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="FeedList"
      component={FeedScreen}
      options={{ title: 'Lista de Eventos' }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ title: 'Detalhes do Evento' }}
    />
  </Stack.Navigator>
);

const CreateEventStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="CreateEventForm"
      component={CreateEventScreen}
      options={{ title: 'Criar Evento' }}
    />
  </Stack.Navigator>
);

const MessagesStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MessagesList"
      component={MessagesScreen}
      options={{ title: 'Mensagens' }}
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

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AccountProfile"
      component={AccountScreen}
      options={{ title: 'Minha Conta' }}
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

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
          } else if (route.name === 'CreateEvent') {
            iconName = focused ? 'plus-circle' : 'plus-circle-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chat' : 'chat-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Map"
        component={MapStack}
        options={{ title: 'Mapa' }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedStack}
        options={{ title: 'Lista' }}
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
