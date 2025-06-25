import { User } from '../types';

const USERS_KEY = 'scamguard_users';
const CURRENT_USER_KEY = 'scamguard_current_user';
const DESIGNATED_ADMIN_EMAIL = 'fardinbd@mail.com';

export interface UserCredentials {
  identifier: string; // Email or phone
  password?: string; // Optional for login if using other methods, required for signup
}

const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signupUser = async (credentials: UserCredentials): Promise<User | null> => {
  if (!credentials.password) {
    return null;
  }
  const users = getUsers();
  const lowerCaseIdentifier = credentials.identifier.toLowerCase();
  const existingUser = users.find(u => u.identifier === lowerCaseIdentifier); // Compare with lowercase
  if (existingUser) {
    return null;
  }

  const newUser: User = {
    id: Date.now().toString(),
    identifier: lowerCaseIdentifier, // Store as lowercase
    isAdmin: false,
    isBanned: false,
    isVerified: false, 
  };

  if (lowerCaseIdentifier === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
    newUser.isAdmin = true;
    newUser.isVerified = true; 
  } else if (users.length === 0) { 
    newUser.isAdmin = true; 
    newUser.isVerified = true;
  }

  users.push(newUser);
  saveUsers(users);
  return newUser; 
};

export const verifyUser = async (identifier: string, verificationCode: string): Promise<User | null> => {
  console.log(`Simulating verification for ${identifier} with code ${verificationCode}`);
  const users = getUsers();
  const lowerCaseIdentifier = identifier.toLowerCase();
  const userIndex = users.findIndex(u => u.identifier === lowerCaseIdentifier); // Compare with lowercase
  if (userIndex > -1) {
    users[userIndex].isVerified = true;
    if (users[userIndex].identifier === DESIGNATED_ADMIN_EMAIL.toLowerCase()) { // Already lowercase
        users[userIndex].isAdmin = true; 
    }
    saveUsers(users);
    return users[userIndex];
  }
  return null; 
};


export const loginUser = async (credentials: UserCredentials): Promise<User | null> => {
  const users = getUsers();
  const lowerCaseIdentifier = credentials.identifier.toLowerCase();
  const user = users.find(u => u.identifier === lowerCaseIdentifier); // Compare with lowercase
  
  if (user) {
    if (user.isBanned) {
      return null;
    }
    // Password check is omitted for this simulation.
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user; 
  }
  return null; 
};

export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// --- User Management Functions (for Admins) ---
export const getAllUsers = async (): Promise<User[]> => {
  return getUsers();
};

export const updateUserRole = async (userId: string, isAdmin: boolean): Promise<User | null> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    // Designated admin identifier is stored in lowercase
    if (users[userIndex].identifier === DESIGNATED_ADMIN_EMAIL.toLowerCase() && !isAdmin) {
      alert(`Cannot remove admin role from the designated admin (${DESIGNATED_ADMIN_EMAIL}).`);
      return users[userIndex]; 
    }
    users[userIndex].isAdmin = isAdmin;
    saveUsers(users);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }
    return users[userIndex];
  }
  return null;
};

export const updateUserBanStatus = async (userId: string, isBanned: boolean): Promise<User | null> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    // Designated admin identifier is stored in lowercase
    if (users[userIndex].identifier === DESIGNATED_ADMIN_EMAIL.toLowerCase() && isBanned) {
      alert(`Cannot ban the designated admin (${DESIGNATED_ADMIN_EMAIL}).`);
      return users[userIndex];
    }
    users[userIndex].isBanned = isBanned;
    saveUsers(users);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId && isBanned) {
        logoutUser(); 
    }
    return users[userIndex];
  }
  return null;
};