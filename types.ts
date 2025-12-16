export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
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
