import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api/apiService';

interface AuthContextType {
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getMyUid: () => string | null;
}

interface AuthProviderProps {
    children: React.ReactNode;
  }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      apiService.setToken(response.token);
      setUser(username);
      console.log('Вход\nИмя:', username);
      console.log('Токен:', apiService.getToken());

      const get_keys_response = await apiService.get('/user/keys')
      console.log('Нужно ли возобновлять ключи:', get_keys_response.data.requiresReplenishing);
      console.log('Ключи:', get_keys_response.data.currentKeys);
      
      const get_keys_response2 = await apiService.getUserKeys()
      console.log('Нужно ли возобновлять ключи:', get_keys_response2.data.requiresReplenishing);
      console.log('Ключи:', get_keys_response2.data.currentKeys);

    } catch (error) {
      console.error('Ошибка входа', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const getMyUid = () => {
    return apiService.getMyUid()
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getMyUid}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
