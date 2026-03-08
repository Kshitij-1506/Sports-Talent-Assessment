// src/screens/RegisterScreen.js
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
import { BASE_URL, apiRoutes } from '../config/api';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    gender: 'male', // default
  });
  const [loading, setLoading] = useState(false);

  const onChange = (field, value) => setForm({ ...form, [field]: value });

  const onRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.gender) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post(BASE_URL + apiRoutes.register, {
        name: form.name,
        age: Number(form.age) || null,
        email: form.email,
        password: form.password,
        gender: form.gender,
      });
      setLoading(false);
      alert('Account created, please login.');
      navigation.goBack();
    } catch (err) {
      setLoading(false);
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const GenderButton = ({ value, label }) => (
    <TouchableOpacity
      onPress={() => onChange('gender', value)}
      style={[
        styles.genderBtn,
        form.gender === value && styles.genderBtnActive,
      ]}
    >
      <Text
        style={[
          styles.genderBtnText,
          form.gender === value && styles.genderBtnTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9E9E9E"
          value={form.name}
          onChangeText={(t) => onChange('name', t)}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#9E9E9E"
          keyboardType="number-pad"
          value={form.age}
          onChangeText={(t) => onChange('age', t)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9E9E9E"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(t) => onChange('email', t)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9E9E9E"
          secureTextEntry
          value={form.password}
          onChangeText={(t) => onChange('password', t)}
        />

        <Text style={styles.genderLabel}>Gender</Text>
        <View style={styles.genderRow}>
          <GenderButton value="male" label="Male" />
          <GenderButton value="female" label="Female" />
        </View>

        <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3FAF5', justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
    elevation: 5,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#007B55', textAlign: 'center', marginBottom: 20 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4EFE8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    color: '#1A1A1A',
  },
  genderLabel: { marginTop: 4, marginBottom: 6, color: '#555', fontSize: 13 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E4EFE8',
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: '#007B55',
    borderColor: '#007B55',
  },
  genderBtnText: { color: '#555', fontSize: 13, fontWeight: '600' },
  genderBtnTextActive: { color: '#fff' },
  button: {
    marginTop: 10,
    backgroundColor: '#007B55',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#007B55',
    fontWeight: '500',
  },
});
