import axios from 'axios'
import type { IUser } from '@/models/user';
import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore({
  id :'userInfoStore',
  state: () => ({
    _id : localStorage.getItem('_id'),
    username : localStorage.getItem('username'),
    name : localStorage.getItem('name'),
    surname : localStorage.getItem('surname')
  }),
  actions: {
    update(userInfo: IUser) {
        localStorage.setItem('_id', userInfo._id);
        localStorage.setItem('username', userInfo.username);
        localStorage.setItem('surname', userInfo.surname);
        localStorage.setItem('name', userInfo.name);
    },
    logout() {
        localStorage.removeItem('_id');
        localStorage.removeItem('username');
        localStorage.removeItem('surname');
        localStorage.removeItem('name');
    },
    async trustUser(infos: {user: string, otherUserId: string}){
      const response = await axios.post('/user/trustUser', infos);
      return response;
    },
    async unTrustUser(infos: {user: string, otherUserId: string}){
      const response = await axios.post('/user/unTrustUser', infos);
      return response;
    },
    async clearTrustUser(infos: {user: string, otherUserId: string}){
      //TODO: to do
    },
    async clearUntrustUser(infos: {user: string, otherUserId: string}){
      //TODO: to do
    },
  },
  getters : {
    getUserInfo : (state) => {
        return {_id : state._id, username : state.username, name : state.name, surname : state.surname};
    }
  }
});