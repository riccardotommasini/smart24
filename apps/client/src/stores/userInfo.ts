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
    update(userInfo) {
        localStorage.setItem('_id', userInfo._id);
        localStorage.setItem('username', userInfo.username);
        localStorage.setItem('surname', userInfo.surname);
        localStorage.setItem('name', userInfo.name);
    }
  },
  getters : {
    getUserInfo : (state) => {
        return {_id : state._id, username : state.username, name : state.name, surname : state.surname};
    }
  }
});