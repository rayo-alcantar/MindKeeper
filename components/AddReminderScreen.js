import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

const AddReminderScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notificationsCount, setNotificationsCount] = useState('');
  const [interval, setInterval] = useState('');

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se requieren permisos de notificación para esta característica.');
      }
    };

    requestPermissions();
  }, []);

  const saveReminderAndScheduleNotifications = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del recordatorio es obligatorio.");
      return;
    }

    const reminder = {
      name,
      description,
      notificationsCount: parseInt(notificationsCount, 10) || 0,
      interval: parseInt(interval, 10) || 0,
    };

    try {
      const id = new Date().getTime().toString();
      await AsyncStorage.setItem(`reminder_${id}`, JSON.stringify(reminder));
      const notificationId = await scheduleNotifications(reminder);
      console.log(`Notification ID: ${notificationId}`);
      Alert.alert("Éxito", "Recordatorio guardado con éxito.");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error al guardar el recordatorio.");
    }
  };

  const scheduleNotifications = async (reminder) => {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Prueba",
        body: "Esto es una notificación de prueba enviada inmediatamente.",
      },
      trigger: null,
    });

    for (let i = 1; i <= reminder.notificationsCount; i++) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Recordatorio: ${reminder.name}`,
          body: reminder.description || "Sin descripción",
        },
        trigger: {
          seconds: i * reminder.interval * 60,
        },
      });
    }

    return notificationId;
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setName}
        placeholder="Nombre del Recordatorio"
        value={name}
      />
      <TextInput
        style={styles.input}
        onChangeText={setDescription}
        placeholder="Descripción (Opcional)"
        multiline
        numberOfLines={4}
        value={description}
      />
      <TextInput
        style={styles.input}
        onChangeText={setNotificationsCount}
        placeholder="Número de notificaciones"
        keyboardType="numeric"
        value={notificationsCount}
      />
      <TextInput
        style={styles.input}
        onChangeText={setInterval}
        placeholder="Intervalo entre notificaciones (minutos)"
        keyboardType="numeric"
        value={interval}
      />
      <Button title="Guardar Recordatorio" onPress={saveReminderAndScheduleNotifications} />
    </View>
  );
};

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

export default AddReminderScreen;
