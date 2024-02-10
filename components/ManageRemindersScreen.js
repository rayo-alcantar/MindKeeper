import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

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
    const updatedReminder = {
      ...selectedReminder,
      name,
      description,
      notificationsCount: parseInt(notificationsCount, 10),
      interval: parseInt(interval, 10),
    };

    await AsyncStorage.setItem(`reminder_${updatedReminder.id}`, JSON.stringify(updatedReminder));
    await scheduleNotifications(updatedReminder);
    Alert.alert('Éxito', 'Recordatorio actualizado con éxito.');
    setEditMode(false);
    loadReminders();
  };

  const handleDeleteReminder = async () => {
    await AsyncStorage.removeItem(`reminder_${selectedReminder.id}`);
    await Notifications.cancelAllScheduledNotificationsAsync(); // Asumiendo que deseas cancelar todas las notificaciones. Esto podría ajustarse para ser más específico.
    Alert.alert('Éxito', 'Recordatorio eliminado con éxito.');
    setEditMode(false);
    loadReminders();
  };

  const scheduleNotifications = async (reminder) => {
    await Notifications.cancelAllScheduledNotificationsAsync(); // Cancelamos todas para simplificar. En un caso real, se ajustaría a necesidades específicas.
    for (let i = 0; i < reminder.notificationsCount; i++) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.name,
          body: reminder.description,
        },
        trigger: {
          seconds: i * reminder.interval * 60,
        },
      });
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
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
          <TextInput value={name} onChangeText={setName} placeholder="Nombre" />
          <TextInput value={description} onChangeText={setDescription} placeholder="Descripción" multiline />
          <TextInput value={notificationsCount} onChangeText={setNotificationsCount} placeholder="Número de notificaciones" keyboardType="numeric" />
          <TextInput value={interval} onChangeText={setInterval} placeholder="Intervalo entre notificaciones (minutos)" keyboardType="numeric" />
          <Button title="Guardar Cambios" onPress={handleSaveChanges} />
          <Button title="Eliminar Recordatorio" color="red" onPress={handleDeleteReminder} />
          <Button title="Cancelar" onPress={() => setEditMode(false)} />
        </View>
      )}
    </View>
  );
};

export default ManageRemindersScreen;
