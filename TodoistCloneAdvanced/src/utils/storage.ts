import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@todoist:auth_token',
  USER_SETTINGS: '@todoist:user_settings',
  THEME_MODE: '@todoist:theme_mode',
  NOTIFICATIONS_ENABLED: '@todoist:notifications_enabled',
  LAST_SYNC: '@todoist:last_sync',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

interface UserSettings {
  showCompletedTasks: boolean;
  defaultProjectId?: string;
  defaultPriority?: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  themeMode: 'light' | 'dark' | 'system';
}

const defaultSettings: UserSettings = {
  showCompletedTasks: false,
  notificationsEnabled: true,
  soundEnabled: true,
  themeMode: 'system',
};

class Storage {
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return defaultSettings;
    }
  }

  async setUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error setting user settings:', error);
    }
  }

  async getThemeMode(): Promise<'light' | 'dark' | 'system'> {
    try {
      const settings = await this.getUserSettings();
      return settings.themeMode;
    } catch (error) {
      console.error('Error getting theme mode:', error);
      return 'system';
    }
  }

  async setThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    try {
      await this.setUserSettings({ themeMode: mode });
    } catch (error) {
      console.error('Error setting theme mode:', error);
    }
  }

  async getNotificationsEnabled(): Promise<boolean> {
    try {
      const settings = await this.getUserSettings();
      return settings.notificationsEnabled;
    } catch (error) {
      console.error('Error getting notifications enabled:', error);
      return true;
    }
  }

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await this.setUserSettings({ notificationsEnabled: enabled });
    } catch (error) {
      console.error('Error setting notifications enabled:', error);
    }
  }

  async getLastSync(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  async setLastSync(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
    } catch (error) {
      console.error('Error setting last sync:', error);
    }
  }

  async clearUserData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export default new Storage();
