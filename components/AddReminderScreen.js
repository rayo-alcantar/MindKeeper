
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';


const AddReminderScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notificationsCount, setNotificationsCount] = useState('');
  const [selectedInterval, setSelectedInterval] = useState('');

  const [interval, setInterval] = useState('');

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();

        
      if (status !== 'granted') {
        console.log('No se tienen permisos para enviar notificaciones');
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
    if (!selectedInterval && !interval.trim()) {
      Alert.alert("Error", "Por favor, elige un intervalo o introduce uno personalizado.");
      return;
    }
    const reminderInterval = selectedInterval ? parseInt(selectedInterval, 10) * 60 : parseInt(interval, 10) * 60;
    let reminder = {
      id: uuidv4(),
      name,
      description,
      notificationsCount: parseInt(notificationsCount, 10) || 0,
      interval: reminderInterval,
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
    for (let i = 1; i <= reminder.notificationsCount; i++) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Recordatorio: ${reminder.name}`,
          body: reminder.description || "Sin descripción",
        },
        trigger: {
  seconds: i * reminder.interval,
}

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
      <Picker
        selectedValue={selectedInterval}
        onValueChange={(itemValue, itemIndex) => setSelectedInterval(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Elige una opción de intervalo" value="" />
        <Picker.Item label="1 hora" value="60" />
        <Picker.Item label="2 horas" value="120" />
        <Picker.Item label="4 horas" value="240" />
        <Picker.Item label="8 horas" value="480" />
        <Picker.Item label="12 horas" value="720" />
        <Picker.Item label="24 horas" value="1440" />
        <Picker.Item label="48 horas" value="2880" />
      </Picker>
      <TextInput
        style={styles.input}
        onChangeText={setInterval}
        placeholder="Personalizado (en minutos)"
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
