import axios from 'axios';
import { makeAutoObservable } from 'mobx';

class ApiStore {
  user = null;
  isAuthenticated = false;
  loading = true; 
  error = null;

  constructor() {
    makeAutoObservable(this);
    this.apiClient = axios.create({
      baseURL: '', 
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
    if (user) this.error = null;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
    this.loading = false;
  }

  async login(login, password) {
    this.setLoading(true);
    this.setError(null);
    try {
      await this.apiClient.post('/auth/login', { login, password });
      await this.fetchUserProfile();
      this.setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка авторизации';
      this.setError(errorMessage);
      this.setUser(null);
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
      return false;
    }
  }

  async checkAuth() {
    this.setLoading(true);
    try {
      await this.fetchUserProfile();
    } catch (err) {
      // User is not authenticated
    } finally {
      this.setLoading(false);
    }
  }

  async fetchUserProfile() {
    try {
      const response = await this.apiClient.get('/users/profile');
      this.setUser(response.data);
      return response.data;
    } catch (err) {
      this.setUser(null);
      throw err;
    }
  }

  async updateProfile(userData) {
     this.setLoading(true);
     this.setError(null);
     try {
       const response = await this.apiClient.put('/users/profile', userData);
       this.setUser(response.data); // Обновляем пользователя в сторе
       this.setLoading(false);
       return response.data;
     } catch (err) {
       this.setError(err.response?.data?.message || 'Ошибка обновления профиля');
       this.setLoading(false);
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
    }
  }

  // --- Generic Fetch Method ---
  async _fetchPagedData(endpoint, page = 0, size = 10, searchParams = null) {
    this.setLoading(true);
    this.setError(null);
    try {
      const config = { params: { page, size } };
      let response;
      if (searchParams) {
        // Для POST search, page и size идут как query params
        response = await this.apiClient.post(`${endpoint}/search`, searchParams, { params: { page, size } });
      } else {
        response = await this.apiClient.get(endpoint, config);
      }
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || `Ошибка получения данных с ${endpoint}`);
      return { content: [], totalElements: 0, totalPages: 0 };
    } finally {
      this.setLoading(false);
    }
  }

  // --- Users ---
  async fetchUsers(page = 0, size = 10) {
    return this._fetchPagedData('/users', page, size);
  }
  async searchUsers(searchDTO, page = 0, size = 10) {
    return this._fetchPagedData('/users', page, size, searchDTO);
  }
  // createUser, updateUser, deleteUser остаются для прямого вызова, если нужно,
  // или можно их обернуть для управления loading/error глобально.
  // Для админки CRUD операции обычно используют apiClient.post/put/delete напрямую в компонентах,
  // т.к. там своя логика обработки ошибок и состояния загрузки формы.

  // --- Artworks ---
  async fetchArtworks(page = 0, size = 9) {
    return this._fetchPagedData('/artworks', page, size);
  }
  async searchArtworks(searchDTO, page = 0, size = 9) {
    return this._fetchPagedData('/artworks', page, size, searchDTO);
  }
   async fetchAllArtworks() { // Для выбора в выставках, без пагинации
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.get('/artworks/getAll');
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка получения всех произведений');
      return [];
    } finally {
      this.setLoading(false);
    }
  }


  // --- Artists ---
  async fetchArtists(page = 0, size = 9) {
    return this._fetchPagedData('/artists', page, size);
  }
  async searchArtists(searchDTO, page = 0, size = 9) {
    return this._fetchPagedData('/artists', page, size, searchDTO);
  }
  async fetchAllArtists() { 
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await this.apiClient.get('/artists/getAll');
      return response.data;
    } catch (err) {
      this.setError(err.response?.data?.message || 'Ошибка получения всех художников');
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  // --- Exhibitions ---
  async fetchExhibitions(page = 0, size = 9) {
    return this._fetchPagedData('/exhibitions', page, size);
  }
  async searchExhibitions(searchDTO, page = 0, size = 9) {
    return this._fetchPagedData('/exhibitions', page, size, searchDTO);
  }
  async fetchCurrentExhibitions(page = 0, size = 9) { // Используем общий метод
    return this._fetchPagedData('/exhibitions/current', page, size);
  }
}

const apiStore = new ApiStore();
export default apiStore;
