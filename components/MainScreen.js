// MainScreen.js
import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Linking, Alert } from 'react-native';

const MainScreen = ({ navigation }) => {
  return (
    <ScrollView accessibilityLabel="Pantalla Principal" contentContainerStyle={styles.container}>
      <Text style={styles.title}>MindKeeper</Text>
      <Pressable 
        style={styles.button} 
        onPress={() => navigation.navigate('CrearRecordatorio')}
        accessibilityLabel="Crear recordatorio"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Crear Recordatorio</Text>
      </Pressable>
      
      <Pressable 
        style={styles.button} 
        onPress={() => navigation.navigate('GestionarRecordatorios')}
        accessibilityLabel="Gestionar recordatorios"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Gestionar Recordatorios</Text>
      </Pressable>
      
      <Pressable 
        style={styles.button} 
        onPress={async () => {
          const url = 'https://paypal.me/rayoalcantar';
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            console.log("No se puede abrir la URL: " + url);
          }
        }}
        accessibilityLabel="Donar al desarrollador"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Donar al Desarrollador</Text>
      </Pressable>
      
      <Pressable 
        style={styles.button} 
        onPress={() => navigation.navigate('Ajustes')}
        accessibilityLabel="Ajustes"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Ajustes</Text>
      </Pressable>
      <Pressable 
        style={styles.button} 
        onPress={() => Alert.alert(
          'Acerca de',
          'Esta es una aplicación beta; por favor, ten paciencia. Cualquier duda, aclaración o error, reporta a Ángel Alcántar. rayoalcantar@gmail.com'
        )}
        accessibilityLabel="Acerca de"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Acerca de</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#1A1A1A', // Cambiado a un color oscuro
    padding: 15,
    borderRadius: 10,
    width: '50%', // Ajustado al 50% del contenedor padre
    marginBottom: 10,
    alignItems: 'center',
    alignSelf: 'center', // Asegura que el botón se centre en el contenedor
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MainScreen;
