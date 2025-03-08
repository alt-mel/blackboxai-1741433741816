import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Stack
export type MainStackParamList = {
  MainTabs: undefined;
  AddTask: {
    projectId?: string;
  };
  TaskDetail: {
    taskId: string;
  };
  EditTask: {
    taskId: string;
  };
  AddProject: undefined;
  ProjectDetail: {
    projectId: string;
  };
  EditProject: {
    projectId: string;
  };
};

// Tab Navigator
export type TabParamList = {
  HomeTab: undefined;
  ProjectsTab: undefined;
  SettingsTab: undefined;
};

// Screen Props
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>;

// Navigation Props
export type MainStackNavigationProp = MainScreenProps<keyof MainStackParamList>['navigation'];
export type AuthStackNavigationProp = AuthScreenProps<keyof AuthStackParamList>['navigation'];
export type TabNavigationProp = TabScreenProps<keyof TabParamList>['navigation'];

// Route Props
export type MainStackRouteProp<T extends keyof MainStackParamList> = MainScreenProps<T>['route'];
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = AuthScreenProps<T>['route'];
export type TabRouteProp<T extends keyof TabParamList> = TabScreenProps<T>['route'];

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
