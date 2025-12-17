export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface Project {
  id: number;
  name: string;
  status: 'In Progress' | 'Review' | 'Completed';
  progress: number;
}

export interface Stat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}
