// src/screens/HistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, apiRoutes } from '../config/api';

export default function HistoryScreen({ navigation }) {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await axios.get(BASE_URL + apiRoutes.history(userId));
        setTests(res.data || []);
      } catch (e) {
        console.log(e.message);
      }
    };
    const unsub = navigation.addListener('focus', loadHistory);
    return unsub;
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Text style={styles.header}>History</Text>
      <ScrollView style={styles.list}>
        {tests.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            No test history yet.
          </Text>
        ) : (
          tests.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => navigation.navigate('TestDetail', { testId: item._id })}
            >
              <Text style={styles.title}>{item.testType.toUpperCase()}</Text>
              <View style={styles.row}>
                <Text>Score: {item.score}</Text>
                <Text style={{ color: '#007BFF', fontWeight: '700' }}>
                  {item.category}
                </Text>
              </View>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3FAF5', padding: 16 },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#007B55',
    marginBottom: 14,
    textAlign: 'center',
  },
  list: { flex: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#222' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  date: { marginTop: 6, fontSize: 12, color: '#777' },
});
