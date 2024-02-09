//ManageRemindersScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

const ManageRemindersScreen = () => {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      const loadedReminders = result.map(req => JSON.parse(req[1])).filter(Boolean);
      if (loadedReminders.length === 0) {
        Alert.alert('No hay recordatorios', 'No se encontraron recordatorios guardados.', [{
          text: 'OK', onPress: () => navigation.goBack()
        }]);
      } else {
        setReminders(loadedReminders);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectReminder = (reminder) => {
    setSelectedReminder(reminder);
    setName(reminder.name);
    setDescription(reminder.description);
    setEditMode(true);
  };

  const handleSaveChanges = async () => {
    const updatedReminder = { ...selectedReminder, name, description };
    await AsyncStorage.setItem(`reminder_${selectedReminder.id}`, JSON.stringify(updatedReminder));
    // Aquí deberías reprogramar las notificaciones para este recordatorio si es necesario
    Alert.alert('Éxito', 'Recordatorio actualizado con éxito.');
    setEditMode(false);
    loadReminders();
  };

  const handleDeleteReminder = async () => {
    await AsyncStorage.removeItem(`reminder_${selectedReminder.id}`);
    // Aquí deberías cancelar las notificaciones programadas para este recordatorio
    Alert.alert('Éxito', 'Recordatorio eliminado con éxito.');
    setEditMode(false);
    loadReminders();
  };

  return (
    <View style={styles.container}>
      {!editMode ? (
        <ScrollView>
          {reminders.map((reminder, index) => (
            <TouchableOpacity key={index} style={styles.button} onPress={() => handleSelectReminder(reminder)}>
              <Text style={styles.buttonText}>{reminder.name}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Regresar" onPress={() => navigation.goBack()} />
        </ScrollView>
      ) : (
        <View>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" />
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Descripción" multiline />
          <Button title="Guardar Cambios" onPress={handleSaveChanges} />
          <Button title="Eliminar Recordatorio" onPress={handleDeleteReminder} color="red" />
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
  button: {
    marginBottom: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
  },
});

export default ManageRemindersScreen;
