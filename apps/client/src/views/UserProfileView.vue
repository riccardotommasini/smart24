<script setup lang="ts">

import bandeau from "../components/common/bandeau-settings.vue"
import feed from "../components/common/feed.vue"
import '../assets/main.css'
import { useUserInfoStore } from "../stores/userInfo";
import { computed, onMounted, ref, defineProps } from "vue";
import axios from 'axios'

//Route /profile/663243a7a3df229850bf97c5

const props = defineProps({
  profileId: {
    type: String,
    required: true
  }
});

const store = useUserInfoStore();

let currentUserId = ref('');
let currentUserUsername = ref('');
let currentUserName = ref('');
let currentUserSurname = ref('');


let userProfileId: string = props.profileId;
let userProfileUsername = ref('');
let userProfileName = ref('');
let userProfileSurname = ref('');

const posts = ref<any[]>([]);

const fetchInfos = async (userId: string) => {
  try {
    const response = await axios.get(`user/${userId}/profile`);
    userProfileUsername.value = JSON.stringify(response.data.userData.username).replace(/"/g, '');
    userProfileName.value = JSON.stringify(response.data.userData.name).replace(/"/g, '');
    userProfileSurname.value = JSON.stringify(response.data.userData.surname).replace(/"/g, '');
    posts.value.push(response.data);
  } catch (error) {
    console.error(error);
  }
  console.log(posts);
};

onMounted( () => {
    //retrieve session information
    const userInfo = computed(()=>store.getUserInfo).value;
    currentUserId.value = userInfo._id!;
    currentUserUsername.value = userInfo.username!;
    currentUserName.value = userInfo.name!;
    currentUserSurname.value = userInfo.surname!;
    fetchInfos(userProfileId);
});

async function buttonTrustUser() {
  let trusted = document.getElementsByClassName('trust');
  trustUser();
  if(trusted[0].hasAttribute('id')){
    trusted[0].removeAttribute('id');
  } else {
    trusted[0].setAttribute('id', 'trusted')
  }
  let unTrusted = document.getElementsByClassName('untrust');
  unTrusted[0].removeAttribute('id');
}

async function buttonUnTrustUser() {
  let unTrusted = document.getElementsByClassName('untrust');
  unTrustUser();
  if(unTrusted[0].hasAttribute('id')){
    unTrusted[0].removeAttribute('id');
  } else {
    unTrusted[0].setAttribute('id', 'unTrusted')
  }
  let trusted = document.getElementsByClassName('trust');
  trusted[0].removeAttribute('id');
}

async function trustUser(){
  await store.trustUser({user: currentUserId.value, otherUserId: props.profileId});
}

async function unTrustUser(){
  await store.unTrustUser({user: currentUserId.value, otherUserId: props.profileId});
}
// async function ClearTrustUser(){
//   await tokenstore.register({name: name.value, surname: surname.value, username: username.value, mail: email.value, password: password.value})
//   window.location.href = '/login'
// }
// async function ClearUntrustUser(){
//   await tokenstore.register({name: name.value, surname: surname.value, username: username.value, mail: email.value, password: password.value})
//   window.location.href = '/login'
// }

</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
</style>

<template>
  <div class="content">
    <bandeau :username="currentUserUsername" :firstname="currentUserName" :lastname="currentUserSurname" />
    <div class="user-profile-container">
      <div class="user-profile-infos">
        <ul class="info-list">
          <li id="user-infos-id" class="label">{{ userProfileId }}</li>
          <li id="user-infos-username" class="label">{{ userProfileUsername }}</li>
          <li id="user-infos-name" class="label">{{ userProfileName }}</li>
          <li id="user-infos-surname" class="label">{{ userProfileSurname }}</li>
        </ul>
      </div>
      <div class="user-profile-buttons">
        <button class="material-symbols-outlined button-profile trust" @click="buttonTrustUser">
          verified_user
        </button>
        <button class="material-symbols-outlined button-profile untrust" @click="buttonUnTrustUser">
          remove_moderator
        </button>
      </div>
    </div>
    <feed :posts="posts" class="posts"></feed>
  </div>
</template>

<style scoped>
  .user-profile-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background-image: linear-gradient(to bottom, #f7e1e1 50%, #B9ABAB 100%);
  }

  .user-profile-infos {
    flex: 1; 
  }

  .user-profile-buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .button-profile {
    background-color: transparent;
    margin-right: 2vh;
    border: none;
    outline: none;
  }

  .button-profile:hover {
    color: #b9abab;
  }

  .button-profile:focus {
    outline: none;
  }

  #trusted {
    color: rgb(39, 39, 195);
  }

  #unTrusted {
    color: rgb(228, 37, 37);
  }

  .info-list {
    -moz-column-count: 2;
    -moz-column-gap: 2vw;
    -webkit-column-count: 2;
    -webkit-column-gap: 2vw;
    column-count: 2;
    column-gap: 2vw;
    list-style-type: none;
  }
</style>
