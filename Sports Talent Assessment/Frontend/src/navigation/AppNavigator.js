// src/navigation/AppNavigator.js
import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TestRunScreen from '../screens/TestRunScreen';
import ResultsScreen from '../screens/ResultsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TestDetailScreen from '../screens/TestDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="TestRun" component={TestRunScreen} />
      
      {/* ✅ FIXED — proper name */}
      <HomeStack.Screen name="ResultsScreen" component={ResultsScreen} />
      
      <HomeStack.Screen 
        name="TestDetailFromHome" 
        component={TestDetailScreen} 
      />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#9AA0B3',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>🏠</Text>
          ),
        }}
      />

      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>🕒</Text>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* In case ResultsScreen is opened outside tabs */}
      <Stack.Screen name="ResultsScreen" component={ResultsScreen} />

      <Stack.Screen name="TestDetail" component={TestDetailScreen} />
    </Stack.Navigator>
  );
}
