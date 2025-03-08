import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import storage from '../utils/storage';
import type { TabScreenProps } from '../types/navigation';
import theme from '../theme';

const SettingsScreen: React.FC<TabScreenProps<'SettingsTab'>> = () => {
  const { user, signOut, loading } = useAuth();
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  }, [signOut]);

  const handleClearData = useCallback(async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.clearUserData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.userInfo}>
          <Icon name="account-circle" size={50} color={theme.colors.primary} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show Completed Tasks</Text>
            <Text style={styles.settingDescription}>Display completed tasks in lists</Text>
          </View>
          <Switch
            value={showCompletedTasks}
            onValueChange={setShowCompletedTasks}
            trackColor={{ false: theme.colors.border.default, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Use dark theme</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: theme.colors.border.default, true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive task reminders</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: theme.colors.border.default, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Sound</Text>
            <Text style={styles.settingDescription}>Play sound for notifications</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: theme.colors.border.default, true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleClearData}>
          <Icon name="delete-outline" size={24} color={theme.colors.error} />
          <Text style={[styles.buttonText, { color: theme.colors.error }]}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Icon name="logout" size={24} color={theme.colors.error} />
          <Text style={[styles.buttonText, { color: theme.colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});

export default SettingsScreen;
