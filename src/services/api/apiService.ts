import axios from 'axios';
import { API_URL } from '../../config/apiConfig.private';

// Использовать URL из конфигурационного файла
// const API_URL = 'http://localhost:8080';

// Хранилище токена
let token: string | null = null;
let Myuid: string | null = null;
let MyName: string | null = null;

// Приватная функция для получения заголовков авторизации
const getAuthHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

export const apiService = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth`, { username, password });
    token = response.data.token;
    Myuid = username.trim();
    return response.data;
  },

  setToken: (newToken: string | null) => {
    token = newToken;
  },

  getToken: () => token,

  getMyUid: () => Myuid,

  setMyName: (name: string) => (MyName = name),

  getMyName: () => MyName,


  //Универсальный get запрос
  get: async (endpoint: string) => {
    return axios.get(`${API_URL}${endpoint}`, { headers: getAuthHeaders() });
  },

  //Универсальный post запрос
  post: async (endpoint: string, data: any) => {
    return axios.post(`${API_URL}${endpoint}`, data, { headers: getAuthHeaders() });
  },
  
  logout: () => {
    token = null;
  },

  getUserKeys: async () => {
    return axios.get(`${API_URL}/user/keys`, { headers: getAuthHeaders() });
  }
};
