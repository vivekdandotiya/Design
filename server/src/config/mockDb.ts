import mongoose from 'mongoose';

export interface IMockUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  avatar?: string;
  savedProducts: any[];
  savedComparisons: any[];
  searchHistory: string[];
  createdAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

export const mockUsers: IMockUser[] = [
  {
    _id: 'mock-user-123',
    name: 'ProductLens Demo User',
    email: 'demo@productlens.com',
    password: 'password123',
    role: 'user',
    savedProducts: [],
    savedComparisons: [],
    searchHistory: [],
    createdAt: new Date(),
    comparePassword: async function(password: string) {
      return this.password === password;
    }
  }
];

export const isDbOffline = (): boolean => {
  return mongoose.connection.readyState !== 1;
};
