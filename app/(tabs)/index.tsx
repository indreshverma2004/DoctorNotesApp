import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'doctor' && password === '1234') {
      router.push('/patients'); // ✅ go to patient list page
    } else {
      Alert.alert('Invalid Credentials', 'Use doctor / 1234');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🩺 Doctor Login</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#0a3d62' },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
    color: '#222',
  },
  loginButton: {
    width: '90%',
    backgroundColor: '#0d6efd',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginText: { color: 'white', fontSize: 18, fontWeight: '600' },
});
