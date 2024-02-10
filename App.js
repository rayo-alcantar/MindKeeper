import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';


import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import MainScreen from './components/MainScreen';
import AddReminderScreen from './components/AddReminderScreen';
import ManageRemindersScreen from './components/ManageRemindersScreen';

const Stack = createStackNavigator();

function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
    //AsyncStorage.clear(); //borramos a la verga lo que tenga.
  }, []);

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Aquí puedes, opcionalmente, obtener el token de expo push si planeas usar notificaciones push.
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={MainScreen} options={{ title: 'Inicio' }} />
        <Stack.Screen name="CrearRecordatorio" component={AddReminderScreen} options={{ title: 'Crear Recordatorio' }} />
        
        <Stack.Screen name="GestionarRecordatorios" component={ManageRemindersScreen} options={{ title: 'Gestionar Recordatorios' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;