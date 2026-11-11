import axiosClient from './axiosClient';

export const authApi = {
  async register(data) {
    const res = await axiosClient.post('/auth/register', data);
    return res.data;
  },

  async login(data) {
    const res = await axiosClient.post('/auth/login', data);
    return res.data;
  },

  async getMe() {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  }
};

