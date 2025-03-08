import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { ProjectProvider } from './src/contexts/ProjectContext';
import { TaskProvider } from './src/contexts/TaskContext';

// Theme
import theme from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <ProjectProvider>
            <TaskProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </TaskProvider>
          </ProjectProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
