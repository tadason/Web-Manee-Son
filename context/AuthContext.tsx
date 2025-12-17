import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdTokenResult,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebaseClient';
import { AuthState, User, UserRole } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const adminEmailSet = useMemo(() => {
    const raw = import.meta.env.VITE_ADMIN_EMAILS || '';
    return new Set(
      raw
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    );
  }, []);

  const resolveRole = async (firebaseUser: FirebaseUser): Promise<UserRole> => {
    try {
      const token = await getIdTokenResult(firebaseUser, true);
      if (token?.claims?.role === 'ADMIN' || token?.claims?.admin === true) {
        return UserRole.ADMIN;
      }
    } catch (error) {
      console.warn('Failed to read Firebase custom claims.', error);
    }

    const email = firebaseUser?.email?.toLowerCase();
    if (email && adminEmailSet.has(email)) {
      return UserRole.ADMIN;
    }

    return UserRole.EMPLOYEE;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setAuthLoading(false);
          return;
        }

        const hydrateUser = async () => {
          try {
            const role = await resolveRole(firebaseUser);
            const displayName =
              firebaseUser.displayName ||
              firebaseUser.email?.split('@')[0] ||
              'User';
            const avatar =
              firebaseUser.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;

            setUser({
              id: firebaseUser.uid,
              name: displayName,
              role,
              avatar,
              email: firebaseUser.email || undefined,
            });
            setAuthError(null);
          } catch (error: any) {
            setAuthError(error?.message || 'Authentication failed.');
            setUser(null);
          } finally {
            setAuthLoading(false);
          }
        };

        hydrateUser();
      },
      (error) => {
        setAuthError(error?.message || 'Authentication failed.');
        setUser(null);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [adminEmailSet]);

  const loginWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError(error?.message || 'Unable to sign in.');
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        authError,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
