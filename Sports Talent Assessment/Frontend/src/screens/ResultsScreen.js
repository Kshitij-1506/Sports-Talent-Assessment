// src/screens/ResultsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ResultsScreen({ route, navigation }) {
  const { result: testResult } = route.params;
  const { score, testType, aiData, category } = testResult;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Test Results</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Test Type</Text>
        <Text style={styles.value}>{testType?.toUpperCase()}</Text>

        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{score}</Text>

        <Text style={styles.label}>Performance</Text>
        <Text style={[styles.value, { color: '#007BFF' }]}>{category}</Text>

        <Text style={styles.label}>Feedback</Text>
        <Text style={styles.feedback}>
          {aiData?.feedback ||
            (category === 'Elite'
              ? 'Outstanding performance!'
              : category === 'Good'
              ? 'Great job, keep pushing!'
              : category === 'Average'
              ? 'Decent, but there is room to improve.'
              : 'Needs improvement. Keep practicing!')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HomeMain')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3FAF5', padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#007B55', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  label: { marginTop: 12, fontSize: 13, color: '#666' },
  value: { fontSize: 19, fontWeight: '700', color: '#222' },
  feedback: { marginTop: 6, fontSize: 15, color: '#444' },
  button: {
    marginTop: 24,
    backgroundColor: '#007BFF',
    borderRadius: 16,
    paddingVertical: 14,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
