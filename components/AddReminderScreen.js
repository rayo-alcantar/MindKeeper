import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const AddReminderScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notificationsCount, setNotificationsCount] = useState('');
  const [interval, setInterval] = useState('');

  const saveReminder = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del recordatorio es obligatorio.");
      return;
    }

    const reminder = {
      name,
      description,
      date: new Date().toISOString(),
      notificationsCount: parseInt(notificationsCount, 10) || 0,
      interval: parseInt(interval, 10) || 0,
    };

    try {
      await AsyncStorage.setItem(`reminder_${new Date().getTime()}`, JSON.stringify(reminder));
      scheduleNotifications(reminder);
      Alert.alert("Éxito", "Recordatorio guardado con éxito.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error al guardar el recordatorio.");
    }
  };

  const scheduleNotifications = async (reminder) => {
    for (let i = 0; i < reminder.notificationsCount; i++) {
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
      <Button title="Guardar Recordatorio" onPress={saveReminder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fondo más claro
    padding: 20,
  },
  input: {
    width: '100%', // Asegura que los inputs ocupen todo el ancho disponible
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
  },
});

export default AddReminderScreen;
