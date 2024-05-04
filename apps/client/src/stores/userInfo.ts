import axios from 'axios'
import type { IUser } from '@/models/user';
import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore({
  id :'userInfoStore',
  state: () => ({
    _id : localStorage.getItem('_id'),
    username : localStorage.getItem('username'),
    isFactChecker: localStorage.getItem('isFactChecker')
  }),
  actions: {
    update(userInfo: IUser) {
        localStorage.setItem('_id', userInfo._id);
        localStorage.setItem('username', userInfo.username);
        localStorage.setItem('isFactChecker', userInfo.factChecker);
    },
    logout() {
        localStorage.removeItem('_id');
        localStorage.removeItem('username');
        localStorage.removeItem('isFactChecker');
    }
  },
  getters : {
    getUserInfo : (state) => {
        return {_id : state._id, username : state.username, isFactChecker : state.isFactChecker};
    }
  }
});