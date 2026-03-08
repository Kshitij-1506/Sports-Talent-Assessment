// src/screens/TestDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL, apiRoutes } from '../config/api';

export default function TestDetailScreen({ route }) {
  const { testId } = route.params;
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(BASE_URL + apiRoutes.testById(testId));
        setTest(res.data);
      } catch (e) {
        console.log(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!test) {
    return (
      <View style={styles.center}>
        <Text>Test not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>
      <Text style={styles.header}>Test Details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Test Type</Text>
        <Text style={styles.value}>{test.testType.toUpperCase()}</Text>

        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{test.score}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, { color: test.passed ? '#1FB57F' : '#D64545' }]}>
          {test.passed ? 'PASS' : 'FAIL'}
        </Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>
          {new Date(test.createdAt).toLocaleString()}
        </Text>

        <Text style={styles.label}>AI Data (raw)</Text>
        <Text style={styles.aiText}>{JSON.stringify(test.aiData, null, 2)}</Text>

        <Text style={styles.label}>Video Path</Text>
        <Text style={styles.videoPath}>{test.videoPath}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#F3FAF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#007B55',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  label: { marginTop: 12, fontSize: 13, color: '#666' },
  value: { fontSize: 18, fontWeight: '700', color: '#222' },
  aiText: { marginTop: 6, fontSize: 12, color: '#444' },
  videoPath: { fontSize: 12, marginTop: 4, color: '#777' },
});
