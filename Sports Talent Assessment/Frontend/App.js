// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F3FAF5" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}
