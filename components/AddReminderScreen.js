import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

const AddReminderScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notificationsCount, setNotificationsCount] = useState('');
  const [interval, setInterval] = useState('');
  const [timeUnit, setTimeUnit] = useState('minutes'); // 'minutes' o 'hours'
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

    let reminder = {
      id: uuidv4(),
      name,
      description,
      notificationsCount: parseInt(notificationsCount, 10) || 0,
      interval: parseInt(interval, 10) || 0,
    };

    const notificationIds = await scheduleNotifications(reminder);
    reminder = { ...reminder, notificationIds }; // Agregar los IDs de notificación al objeto reminder

    try {
      await AsyncStorage.setItem(`reminder_${reminder.id}`, JSON.stringify(reminder));
      Alert.alert("Éxito", "Recordatorio guardado con éxito.");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error al guardar el recordatorio.");
    }
  };
  const scheduleNotifications = async (reminder) => {
    let notificationIds = [];
    const timeMultiplier = timeUnit === 'minutes' ? 60 : 3600; // 3600 segundos en una hora
  
    for (let i = 1; i <= reminder.notificationsCount; i++) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Recordatorio: ${reminder.name}`,
          body: reminder.description || "Sin descripción",
        },
        trigger: {
          seconds: i * reminder.interval * timeMultiplier,
        },
      });
      notificationIds.push(notificationId);
    }
    return notificationIds;
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          onChangeText={setInterval}
          placeholder={timeUnit === 'minutes' ? "Intervalo en minutos" : "Intervalo en horas"}
          keyboardType="numeric"
          value={interval}
          accessible={true}
          accessibilityLabel="Intervalo de tiempo"
          accessibilityHint={`Escribe el intervalo en ${timeUnit}`}
        />
        <View style={{ flexDirection: 'row' }}>
          <Button
            title="Minutos"
            onPress={() => setTimeUnit('minutes')}
            color={timeUnit === 'minutes' ? 'blue' : 'grey'}
            accessible={true}
            accessibilityLabel="Seleccionar minutos"
            accessibilityHint="Establece el intervalo de tiempo en minutos"
          />
          <Button
            title="Horas"
            onPress={() => setTimeUnit('hours')}
            color={timeUnit === 'hours' ? 'blue' : 'grey'}
            accessible={true}
            accessibilityLabel="Seleccionar horas"
            accessibilityHint="Establece el intervalo de tiempo en horas"
          />
        </View>
      </View>
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
