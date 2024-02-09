import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const AddReminderScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState('');
  const [interval, setInterval] = useState('');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  const saveReminder = async () => {
    try {
      const reminder = {
        name,
        description,
        date: date.toISOString(),
        notificationsCount: parseInt(notificationsCount, 10),
        interval: parseInt(interval, 10),
      };
      
      await AsyncStorage.setItem('reminder', JSON.stringify(reminder));
      scheduleNotifications(reminder);
      Alert.alert("Recordatorio guardado con éxito");
    } catch (error) {
      console.log(error);
      Alert.alert("Error al guardar el recordatorio");
    }
  };

  const scheduleNotifications = async (reminder) => {
    for (let i = 0; i < reminder.notificationsCount; i++) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Recordatorio: ${reminder.name}`,
          body: reminder.description,
        },
        trigger: {
          date: new Date(Date.now() + i * reminder.interval * 60000), // Configura el intervalo en minutos
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
      <Button title="Seleccionar Fecha y Hora" onPress={() => setShow(true)} />
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
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
    padding: 20,
  },
  input: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
  },
});

export default AddReminderScreen;
