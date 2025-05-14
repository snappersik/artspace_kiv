import axios from 'axios';
import { makeAutoObservable } from 'mobx';

class ApiStore {
  user = null;
  isAuthenticated = false;
  loading = true; // Начальное состояние true, пока checkAuth не завершится
  error = null;

  constructor() {
    makeAutoObservable(this);
    this.apiClient = axios.create({
      baseURL: '', // Для Vite proxy baseURL должен быть пустой строкой
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });
    this.checkAuth();
  }

  setUser(user) {
    this.user = user;
    this.isAuthenticated = !!user;
    if (user) {
      this.error = null;
    }
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
    this.loading = false; // Сброс загрузки при ошибке
  }

  async login(login, password) {
    this.setLoading(true);
    this.setError(null);
    try {
      await this.apiClient.post('/auth/login', { login, password });
      await this.fetchUserProfile(); // Обновит user и isAuthenticated
      this.setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка авторизации';
      this.setError(errorMessage);
      this.setUser(null); // Сброс пользователя при ошибке
      // setLoading(false) уже будет вызвано в setError или finally, если добавить
      return false;
    }
  }

  async register(userData) {
    this.setLoading(true);
    this.setError(null);
    try {
      await this.apiClient.post('/auth/register', userData);
      this.setLoading(false);
      return true;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка регистрации');
      // setLoading(false) уже будет вызвано в setError
      return false;
    }
  }

  async checkAuth() {
    this.setLoading(true); // Устанавливаем loading в true в начале проверки
    try {
      await this.fetchUserProfile();
    } catch (err) {
      // setUser(null) вызовется в fetchUserProfile, если профиль не загружен
      // Оставляем this.isAuthenticated = false
    } finally {
      this.setLoading(false); // Устанавливаем loading в false после завершения проверки
    }
  }

  async fetchUserProfile() {
    // Этот метод не должен управлять глобальным this.loading сам по себе,
    // пусть это делают login() или checkAuth()
    try {
      const response = await this.apiClient.get('/users/profile');
      this.setUser(response.data);
      return response.data;
    } catch (err) {
      this.setUser(null); // Важно для обновления isAuthenticated на false
      throw err; // Перебрасываем ошибку, чтобы checkAuth/login могли ее обработать
    }
  }

  async updateProfile(userData) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.put('/users/profile', userData);
      this.setUser(response.data);
      this.setLoading(false);
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка обновления профиля');
      this.setLoading(false); // Убедимся, что loading сбрасывается
      throw err;
    }
  }

  async logout() {
    this.setLoading(true);
    try {
      await this.apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Ошибка при выходе из системы:', err.response?.data?.message || err.message);
    } finally {
      this.setUser(null);
      this.setLoading(false);
      // Перенаправление на /login лучше делать в компоненте (например, Navbar)
    }
  }

  // Методы для админ-панели (CRUD для users)
  async fetchUsers(page = 0, size = 10) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.get(`/users?page=${page}&size=${size}`);
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка получения пользователей');
      return { content: [], totalElements: 0, totalPages: 0 }; // Добавил totalPages для консистентности
    } finally {
      this.setLoading(false);
    }
  }

  async fetchArtworks(page = 0, size = 9) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.get(`/artworks?page=${page}&size=${size}`);
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка получения произведений искусства');
      return { content: [], totalElements: 0, totalPages: 0 };
    } finally {
      this.setLoading(false);
    }
  }

  async fetchArtists(page = 0, size = 9) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.get(`/artists?page=${page}&size=${size}`);
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка получения художников');
      return { content: [], totalElements: 0, totalPages: 0 };
    } finally {
      this.setLoading(false);
    }
  }

  async fetchExhibitions(page = 0, size = 9) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.get(`/exhibitions?page=${page}&size=${size}`);
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка получения выставок');
      return { content: [], totalElements: 0, totalPages: 0 };
    } finally {
      this.setLoading(false);
    }
  }

  async fetchCurrentExhibitions() {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.get('/exhibitions/current');
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка получения текущих выставок');
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  async createUser(userData) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.post('/users/add', userData);
      this.setLoading(false);
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка создания пользователя');
      this.setLoading(false);
      throw err;
    }
  }

  async updateUser(userId, userData) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.put(`/users/update?id=${userId}`, userData);
      this.setLoading(false);
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка обновления пользователя');
      this.setLoading(false);
      throw err;
    }
  }

  async deleteUser(userId) {
    this.setLoading(true);
    this.setError(null);
    try {
      await this.apiClient.delete(`/users/delete/${userId}`);
      this.setLoading(false);
      return true;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка удаления пользователя');
      this.setLoading(false);
      throw err;
    }
  }
}

const apiStore = new ApiStore();
export default apiStore;