// src/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL, apiRoutes } from '../config/api';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      try {
        const res = await axios.get(BASE_URL + apiRoutes.profile(userId));
        setProfile(res.data);
      } catch (e) {
        console.log(e.message);
      }
    };
    load();
  }, []);

  if (!profile) return null;

  const { user, tests } = profile;

  return (
    <ScrollView style={styles.root}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Age</Text>
        <Text style={styles.value}>{user.age || '-'}</Text>

        <Text style={styles.label}>Gender</Text>
        <Text style={styles.value}>
          {user.gender === 'female' ? 'Female' : 'Male'}
        </Text>

        <Text style={styles.label}>Total Tests</Text>
        <Text style={styles.value}>{user.totalTests}</Text>
      </View>

      <Text style={styles.section}>Recent Tests</Text>
      {tests.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#777' }}>No tests yet.</Text>
      ) : (
        tests.slice(0, 5).map((t) => (
          <View key={t._id} style={styles.smallCard}>
            <Text style={styles.testTitle}>{t.testType.toUpperCase()}</Text>
            <Text style={{ color: '#007BFF', fontWeight: '700' }}>
              {t.category}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#F3FAF5' },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#007B55',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  label: { marginTop: 10, fontSize: 13, color: '#666' },
  value: { fontSize: 18, fontWeight: '700', color: '#222' },
  section: { marginTop: 26, fontSize: 18, fontWeight: '700', color: '#222' },
  smallCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    elevation: 2,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
});
