// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, apiRoutes } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(BASE_URL + apiRoutes.login, { email, password });
      setLoading(false);

      const { user, token } = res.data;

      await AsyncStorage.setItem('userId', user._id);
      await AsyncStorage.setItem('userName', user.name || '');
      await AsyncStorage.setItem('authToken', token);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err) {
      setLoading(false);
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor="#9E9E9E"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { marginTop: 10 }]}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#9E9E9E"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3FAF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007B55',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: { fontSize: 14, color: '#333', marginBottom: 4 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4EFE8',
    color: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007B55',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: {
    marginTop: 18,
    textAlign: 'center',
    color: '#007B55',
    fontWeight: '500',
  },
});
