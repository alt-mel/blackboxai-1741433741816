import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import storage from '../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Handle auth token storage
      if (user) {
        const token = await user.getIdToken();
        await storage.setAuthToken(token);
      } else {
        await storage.removeAuthToken();
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      await storage.clearUserData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send password reset email'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (displayName: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    try {
      setError(null);
      setLoading(true);
      await updateProfile(auth.currentUser, { displayName });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserEmail = useCallback(async (newEmail: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    try {
      setError(null);
      setLoading(true);
      await updateEmail(auth.currentUser, newEmail);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update email'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserPassword = useCallback(async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    try {
      setError(null);
      setLoading(true);
      await updatePassword(auth.currentUser, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update password'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
