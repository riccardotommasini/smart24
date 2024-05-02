import axios from 'axios'
import { defineStore } from 'pinia'

export const useTokenStore = defineStore({
  id :'tokenStore',
  state: () => ({
    token: localStorage.getItem('token') || null
  }),
  actions: {
    async login(credentials) {
        const response = await axios.post('/login', credentials);
            
        const token = response.data.token
        localStorage.setItem('token', token);

        return response;
    },
    logout() {
      this.token = null
      localStorage.removeItem('token')
    }
  },
  getters : {
    getToken: (state) => { return state.token }
  }
});