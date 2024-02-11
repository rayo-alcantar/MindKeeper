import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

const ManageRemindersScreen = () => {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notificationsCount, setNotificationsCount] = useState('');
  const [interval, setInterval] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      const loadedReminders = result.map(req => JSON.parse(req[1])).filter(Boolean);
      setReminders(loadedReminders);
      if (loadedReminders.length === 0) {
        Alert.alert('No hay recordatorios', 'No se encontraron recordatorios guardados.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectReminder = (reminder) => {
    setSelectedReminder(reminder);
    setName(reminder.name);
    setDescription(reminder.description);
    setNotificationsCount(reminder.notificationsCount.toString());
    setInterval(reminder.interval.toString());
    setEditMode(true);
  };

  
  const handleSaveChanges = async () => {
    // Cancelar notificaciones existentes
    if (selectedReminder.notificationIds) {
      for (const notificationId of selectedReminder.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }
  
    const updatedReminder = {
      ...selectedReminder,
      name,
      description,
      notificationsCount: parseInt(notificationsCount, 10),
      interval: parseInt(interval, 10),
      notificationIds: [] // Preparar para nuevos IDs de notificación
    };
    const newNotificationIds = await scheduleNotifications(updatedReminder);
    updatedReminder.notificationIds = newNotificationIds;
    await AsyncStorage.setItem(`reminder_${updatedReminder.id}`, JSON.stringify(updatedReminder));
    // Considera cancelar solo las notificaciones específicas relacionadas con este recordatorio aquí.
    Alert.alert('Éxito', 'Recordatorio actualizado con éxito.');
    setEditMode(false);
    loadReminders();
  };
  const handleDeleteReminder = async () => {
    // Cancelar notificaciones existentes
    if (selectedReminder.notificationIds) {
      for (const notificationId of selectedReminder.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }
  
    await AsyncStorage.removeItem(`reminder_${selectedReminder.id}`);
    Alert.alert('Éxito', 'Recordatorio eliminado con éxito.');
    setEditMode(false);
    loadReminders();
  };

  const scheduleNotifications = async (reminder) => {
    // Cancela y reprograma las notificaciones aquí.
    let notificationIds = [];
    for (let i = 1; i <= reminder.notificationsCount; i++) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Recordatorio: ${reminder.name}`,
          body: reminder.description || "Sin descripción",
        },
        trigger: {
          seconds: i * reminder.interval * 60,
        },
      });
      notificationIds.push(notificationId); // Almacena el ID de la notificación programada
    }
    return notificationIds; // Devuelve los nuevos IDs de notificación para almacenarlos con el recordatorio
  };

  return (
    <View style={styles.container}>
      {!editMode ? (
        <ScrollView>
          {reminders.map((reminder, index) => (
            <TouchableOpacity key={index} onPress={() => handleSelectReminder(reminder)}>
              <Text>{reminder.name}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Regresar" onPress={() => navigation.goBack()} />
        </ScrollView>
      ) : (
        <View>
          <TextInput value={name} onChangeText={setName} placeholder="Nombre" style={styles.input} />
          <TextInput value={description} onChangeText={setDescription} placeholder="Descripción" multiline style={styles.input} />
          <TextInput value={notificationsCount} onChangeText={setNotificationsCount} placeholder="Número de notificaciones" keyboardType="numeric" style={styles.input} />
          <TextInput value={interval} onChangeText={setInterval} placeholder="Intervalo entre notificaciones (minutos)" keyboardType="numeric" style={styles.input} />
          <Button title="Guardar Cambios" onPress={handleSaveChanges} />
          <Button title="Eliminar Recordatorio" color="red" onPress={handleDeleteReminder} />
          <Button title="Cancelar" onPress={() => setEditMode(false)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
  },
});

export default ManageRemindersScreen;
