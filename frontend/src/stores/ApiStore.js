import axios from 'axios';
import { makeAutoObservable } from 'mobx';

class ApiStore {
  user = null;
  isAuthenticated = false;
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    this.apiClient = axios.create({
      baseURL: '',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true // Важно для передачи куки
    });

    // Раскомментируем для автоматической проверки авторизации
    this.checkAuth();
  }

  setUser(user) {
    this.user = user;
    this.isAuthenticated = !!user;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
  }

  // Авторизация
  async login(login, password) {
    this.setLoading(true);
    this.setError(null);
    try {
      await this.apiClient.post('/api/auth/login', { login, password });
      await this.fetchUserProfile();
      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError(error.response?.data?.message || 'Ошибка авторизации');
      this.setLoading(false);
      return false;
    }
  }


  // Регистрация
  async register(userData) {
    this.setLoading(true);
    this.setError(null);
    try {
      await this.apiClient.post('/auth/register', userData);
      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError(error.response?.data?.message || 'Ошибка регистрации');
      this.setLoading(false);
      return false;
    }
  }

  // Проверка авторизации
  async checkAuth() {
    try {
      await this.fetchUserProfile();
      return true;
    } catch (error) {
      console.log('Not authenticated');
      return false;
    }
  }

  // Получение данных профиля
  async fetchUserProfile() {
    try {
      const response = await this.apiClient.get('/users/profile');
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      this.setUser(null);
      throw error;
    }
  }

  // Выход
  async logout() {
    try {
      await this.apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    this.setUser(null);
    // После выхода перенаправляем на страницу входа
    window.location.href = '/login';
  }

  // Получение списка произведений искусства
  async fetchArtworks(page = 0, size = 10) {
    this.setLoading(true);
    try {
      const response = await this.apiClient.get(`/artworks?page=${page}&size=${size}`);
      this.setLoading(false);
      return response.data;
    } catch (error) {
      this.setError(error.response?.data?.message || 'Ошибка получения произведений');
      this.setLoading(false);
      return { content: [], totalElements: 0 };
    }
  }

  // Получение списка художников
  async fetchArtists(page = 0, size = 10) {
    this.setLoading(true);
    try {
      const response = await this.apiClient.get(`/artists?page=${page}&size=${size}`);
      this.setLoading(false);
      return response.data;
    } catch (error) {
      this.setError(error.response?.data?.message || 'Ошибка получения художников');
      this.setLoading(false);
      return { content: [], totalElements: 0 };
    }
  }

  // Получение списка выставок
  async fetchExhibitions(page = 0, size = 10) {
    this.setLoading(true);
    try {
      const response = await this.apiClient.get(`/exhibitions?page=${page}&size=${size}`);
      this.setLoading(false);
      return response.data;
    } catch (error) {
      this.setError(error.response?.data?.message || 'Ошибка получения выставок');
      this.setLoading(false);
      return { content: [], totalElements: 0 };
    }
  }

  // Получение текущих выставок
  async fetchCurrentExhibitions() {
    this.setLoading(true);
    try {
      const response = await this.apiClient.get('/exhibitions/current');
      this.setLoading(false);
      return response.data;
    } catch (error) {
      this.setError(error.response?.data?.message || 'Ошибка получения текущих выставок');
      this.setLoading(false);
      return [];
    }
  }
}

const apiStore = new ApiStore();
export default apiStore;
