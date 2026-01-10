import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNotifications } from '../contexts/NotificationContext';
import { theme } from '../theme';
import {
  EventDetailsScreen,
  CreateEventScreen,
  MessagesScreen,
  ChatScreen,
  AccountScreen,
  SettingsScreen,
  ManageEventScreen,
  EditEventScreen,
  MapScreen,
  DiscoverScreen,
  MyEventsScreen,
  InviteScreen,
} from '../screens/Main';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack: Descobrir (Mapa + Explorar)
const DiscoverStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="DiscoverMap"
      component={DiscoverScreen}
      options={{ title: 'Descobrir', headerShown: false }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ManageEvent"
      component={ManageEventScreen}
      options={{ title: 'Gerenciar Evento' }}
    />
    <Stack.Screen
      name="EditEvent"
      component={EditEventScreen}
      options={{ title: 'Editar Evento' }}
    />
    <Stack.Screen
      name="Invite"
      component={InviteScreen}
      options={{ title: 'Convite' }}
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
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ManageEvent"
      component={ManageEventScreen}
      options={{ title: 'Gerenciar Evento' }}
    />
    <Stack.Screen
      name="EditEvent"
      component={EditEventScreen}
      options={{ title: 'Editar Evento' }}
    />
    <Stack.Screen
      name="Invite"
      component={InviteScreen}
      options={{ title: 'Convite' }}
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
  const { badges } = useNotifications();

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
        tabBarActiveTintColor: theme.custom.colors.primary,
        tabBarInactiveTintColor: theme.custom.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.custom.colors.surface,
          borderTopWidth: 0, // Remove borda padrão feia
          elevation: 20, // Sombra forte no Android
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 }, // Sombra subindo
          shadowOpacity: 0.1,
          shadowRadius: 8,
          position: 'absolute', // Flutuante sobre o mapa se necessário, mas aqui garante background full
          bottom: 0,
          left: 0,
          right: 0,
          height: 85, // Altura maior para acomodar Home Indicator sem cortar
          paddingTop: 12,
          paddingBottom: 25, // Espaço para a barra preta do iPhone
          borderTopLeftRadius: 24, // Arredondado moderno nas pontas superiores
          borderTopRightRadius: 24,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.labelMedium ? theme.fonts.labelMedium.fontFamily : 'System',
          fontSize: 11,
          marginTop: -4, // Aproxima o texto do ícone
          marginBottom: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{ title: 'Descobrir' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              // Se já focado, envia sinal de reset para a tela interna
              navigation.navigate('Discover', {
                screen: 'DiscoverMap',
                params: { resetAction: Date.now() }
              });
            }
          },
        })}
      />
      <Tab.Screen
        name="MyEvents"
        component={MyEventsStack}
        options={{
          title: 'Meus Eventos',
          tabBarBadge: badges.myEvents > 0 ? badges.myEvents : undefined,
          tabBarBadgeStyle: { backgroundColor: '#f44336', fontSize: 10 },
        }}
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
