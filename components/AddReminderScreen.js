import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

const AddReminderScreen = () => {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notificationsCount, setNotificationsCount] = useState('');
  const [interval, setInterval] = useState('');
  
  const navigation = useNavigation();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se requieren permisos de notificación para esta característica.');
      return;
    }

    token = await Notifications.getExpoPushTokenAsync();
  }

  const scheduleNotifications = async (reminder) => {

    const total = reminder.notificationsCount;
    const interval = reminder.interval * 60 * 1000;

    for (let i = 0; i < total; i++) {

      const trigger = new Date(Date.now() + interval * i);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.name,
          body: reminder.description,  
        },
        trigger,
      });
    }
  }

  const saveReminder = async (reminder) => {
    try {
      await AsyncStorage.setItem(`reminder_${reminder.id}`, JSON.stringify(reminder));
      return true;
    } catch (error) {
      return false;
    }
  }

  const saveReminderAndScheduleNotifications = async () => {

    if (!name.trim()) {
      Alert.alert("Error", "El nombre del recordatorio es obligatorio.");
      return;
    }
  
    const reminder = {
      id: uuidv4(),
      name,
      description,
      notificationsCount: parseInt(notificationsCount, 10) || 0,
      interval: parseInt(interval, 10) || 0,
    };

    const success = await saveReminder(reminder);

    if (success) {
      await scheduleNotifications(reminder);
      Alert.alert("Éxito", "Recordatorio guardado con éxito.");
      navigation.goBack();
    } else {
      Alert.alert("Error", "Error al guardar el recordatorio.");
    }

  };


}
export default AddReminderScreen;
const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#FFFFFF',
padding: 20,
},
input: {
width: '100%',
marginBottom: 20,
borderWidth: 1,
borderColor: 'gray',
padding: 10,
},
});