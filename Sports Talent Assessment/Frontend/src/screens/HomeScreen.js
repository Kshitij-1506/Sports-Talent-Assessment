// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL, apiRoutes } from '../config/api';

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('Athlete');
  const [userId, setUserId] = useState(null);
  const [latestTest, setLatestTest] = useState(null);

  useEffect(() => {
    const load = async () => {
      const uid = await AsyncStorage.getItem('userId');
      const uname = await AsyncStorage.getItem('userName');

      if (uid) setUserId(uid);
      if (uname) setUserName(uname);

      if (uid) {
        try {
          const res = await axios.get(BASE_URL + apiRoutes.history(uid));
          const list = res.data || [];
          setLatestTest(list[0] || null);
        } catch (e) {
          console.log(e.message);
        }
      }
    };
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const levelFromCategory = (cat) => {
    if (!cat) return 'Beginner';
    if (cat === 'Elite') return 'Elite Athlete';
    if (cat === 'Good') return 'Intermediate';
    if (cat === 'Average') return 'Beginner';
    return 'New Athlete';
  };

  const level = levelFromCategory(latestTest?.category);
  const progress = latestTest ? 70 : 30; // simple dummy % – you can refine later

  const goToTest = (type) => {
    if (!userId) {
      alert('User missing, please login again.');
      return;
    }
    navigation.navigate('TestRun', { testType: type, userId });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.subLabel}>Progress to next level</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% complete</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.recentCard}>
          <Text style={styles.recentLabel}>Most Recent Test</Text>
          <Text style={styles.recentTitle}>
            {latestTest ? latestTest.testType.toUpperCase() : 'No tests yet'}
          </Text>
          {latestTest && (
            <>
              <View style={styles.recentRow}>
                <Text style={styles.recentInfo}>Score: {latestTest.score}</Text>
                <Text style={[styles.recentStatus, { color: '#007BFF' }]}>
                  {latestTest.category}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(latestTest.createdAt).toLocaleString()}
              </Text>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Available Tests</Text>

        {/* Sprint */}
        <View style={styles.testCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⚡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.testTitle}>Sprint Test</Text>
            <Text style={styles.testDesc}>Measure your sprint speed</Text>
          </View>
          <TouchableOpacity style={styles.testBtn} onPress={() => goToTest('sprint')}>
            <Text style={styles.testBtnText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Squats */}
        <View style={styles.testCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>💪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.testTitle}>Sit-ups Test</Text>
            <Text style={styles.testDesc}>1-minute sit-ups</Text>
          </View>
          <TouchableOpacity style={styles.testBtn} onPress={() => goToTest('squats')}>
            <Text style={styles.testBtnText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Jump */}
        <View style={styles.testCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⬆️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.testTitle}>Vertical Jump Test</Text>
            <Text style={styles.testDesc}>Measure your jump height</Text>
          </View>
          <TouchableOpacity style={styles.testBtn} onPress={() => goToTest('jump')}>
            <Text style={styles.testBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5FA' },
  header: {
    backgroundColor: '#007BFF',
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcome: { color: '#E0F2FF', fontSize: 13 },
  levelBadge: {
    position: 'absolute',
    right: 18,
    top: 42,
    backgroundColor: '#0056B3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  levelText: { color: '#E0F2FF', fontSize: 11, fontWeight: '600' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  subLabel: { color: '#E0F2FF', fontSize: 12, marginTop: 8 },
  progressBarBg: {
    marginTop: 4,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94C6FF',
    overflow: 'hidden',
  },
  progressBarFill: { height: 8, borderRadius: 4, backgroundColor: '#29CC61' },
  progressText: { color: '#E0F2FF', fontSize: 11, marginTop: 4 },
  body: { flex: 1 },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },
  recentLabel: { fontSize: 12, color: '#666' },
  recentTitle: { fontSize: 18, fontWeight: '700', marginTop: 4, color: '#222' },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  recentInfo: { color: '#333', fontWeight: '500' },
  recentStatus: { fontWeight: '700' },
  dateText: { marginTop: 4, fontSize: 11, color: '#777' },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8, color: '#222' },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E3F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 22 },
  testTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  testDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  testBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#007BFF',
  },
  testBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
