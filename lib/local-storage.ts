// Simple hashing function (not cryptographically secure, for demo purposes)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar_url?: string;
  skills_to_teach?: string[];
  skills_to_learn?: string[];
  role?: 'student' | 'professional';
  isProfileComplete?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

const USERS_KEY = 'skillswap_users';
const SESSION_KEY = 'skillswap_session';

export const localStorageUtils = {
  // Initialize default users (optional)
  initializeDefaults: () => {
    if (!typeof window !== 'undefined' && !localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
  },

  // Save new user
  saveUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substring(7),
      createdAt: now,
      updatedAt: now,
    };

    const users = localStorageUtils.getAllUsers();
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  // Get user by username
  getUserByUsername: (username: string): User | null => {
    const users = localStorageUtils.getAllUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  // Get user by email
  getUserByEmail: (email: string): User | null => {
    const users = localStorageUtils.getAllUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Get all users
  getAllUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Verify password
  verifyPassword: (storedHash: string, password: string): boolean => {
    const hash = simpleHash(password);
    return hash === storedHash;
  },

  // Update user profile
  updateUserProfile: (userId: string, profileUpdates: Partial<UserProfile>): User | null => {
    const users = localStorageUtils.getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      profile: {
        ...users[userIndex].profile,
        ...profileUpdates,
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[userIndex];
  },

  // Save session
  saveSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  // Get session
  getSession: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Clear session
  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Check if username exists
  usernameExists: (username: string): boolean => {
    return localStorageUtils.getUserByUsername(username) !== null;
  },

  // Check if email exists
  emailExists: (email: string): boolean => {
    return localStorageUtils.getUserByEmail(email) !== null;
  },
};
