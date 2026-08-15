import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'http://127.0.0.1:8000'; // FastAPI default port

export const api = axios.create({
  baseURL: API_URL,
});

// Polyfill for token storage across Web and Native
export const getToken = async () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  } else {
    return await SecureStore.getItemAsync('access_token');
  }
};

export const setToken = async (token: string) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  } else {
    await SecureStore.setItemAsync('access_token', token);
  }
};

export const removeToken = async () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  } else {
    await SecureStore.deleteItemAsync('access_token');
  }
};

// Add token to every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
