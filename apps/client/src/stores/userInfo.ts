import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore({
  id :'userInfoStore',
  state: () => ({
    username : localStorage.getItem('username'),
    name : localStorage.getItem('name'),
    surname : localStorage.getItem('surname')
  }),
  actions: {
    update(userInfo) {
        this.username = userInfo.username;
        localStorage.setItem('username', userInfo.username);
        this.surname = userInfo.surname;
        localStorage.setItem('surname', userInfo.surname);
        this.name = userInfo.name;
        localStorage.setItem('name', userInfo.name);
    }
  },
  getters : {
    userInfo() {
        return {username : this.username, name : this.name, surname : this.surname};
    }
  }
});