import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api/apiService';
import CryptoService from '../services/crypto/CryptoService';
import { v4 as uuidv4 } from 'uuid';

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

      //const get_keys_response = await apiService.get('/user/keys')
      //console.log('Нужно ли возобновлять ключи:', get_keys_response.data.requiresReplenishing);
      //console.log('Ключи:', get_keys_response.data.currentKeys);
      
      const get_keys_response2 = await apiService.getUserKeys()
      console.log('Нужно ли возобновлять ключи:', get_keys_response2.data.requiresReplenishing);
      console.log('Ключи:', get_keys_response2.data.currentKeys);

    } catch (error: any) {
      if(error.response.status === 404 && error.response.data.message === 'User not registered') {
        console.warn('Пользователь не зарегистрирован');

        const data = {
          identityPublicKey: CryptoService.generateBase64Key(),
          signedPublicKey: CryptoService.generateBase64Key(),
          oneTimeKeyList: Array.from({ length: 10 }, () => ({
            number: uuidv4(),
            oneTimeKey: CryptoService.generateBase64Key()
          })),
          userData: CryptoService.generateBase64Key(),
          protectedSymmetricKey: CryptoService.generateBase64Key()
        };

        console.log('Регистрация пользователя:', data);
        const register_user_response = await apiService.post('/user/register', data);
        console.log('Регистрация пользователя, ответ:', register_user_response.data);
      } else {
        console.error('Ошибка при получении ключей:', error);
      }
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
