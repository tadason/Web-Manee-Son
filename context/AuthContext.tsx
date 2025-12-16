import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User, UserRole } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    // Simulate API call and login
    // "Manee" represents the Admin/Founder (Wisdom)
    // "Son" represents the Lead Dev (Innovation)
    const mockUser: User = {
      id: '1',
      name: role === UserRole.ADMIN ? 'Manee (CEO)' : 'Son (Lead Dev)',
      role: role,
      avatar: `https://picsum.photos/seed/${role}/200`,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
