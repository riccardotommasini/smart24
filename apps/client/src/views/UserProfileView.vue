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

const id = ref('');
const username = ref('');
const name = ref('');
const surname = ref('');

const posts = ref<any[]>([]);

const fetchPosts = async (userId: string) => {
  try {
    const response = await axios.get(`user/${userId}/profile`);
    posts.value.push(response.data);
  } catch (error) {
    console.error(error);
  }
  console.log(posts);
};

onMounted( () => {
    //retrieve session information
    const userInfo = computed(()=>store.getUserInfo).value;
    id.value = userInfo._id!;
    username.value = userInfo.username!;
    name.value = userInfo.name!;
    surname.value = userInfo.surname!;
    console.log(props.profileId)
    fetchPosts(props.profileId);
});

async function trustUser() {
  let trusted = document.getElementsByClassName('trust');
  if(trusted[0].hasAttribute('id')){
    trusted[0].removeAttribute('id');
  } else {
    trusted[0].setAttribute('id', 'trusted')
  }
  let unTrusted = document.getElementsByClassName('untrust');
  unTrusted[0].removeAttribute('id');
}

async function unTrustUser() {
  let unTrusted = document.getElementsByClassName('untrust');
  if(unTrusted[0].hasAttribute('id')){
    unTrusted[0].removeAttribute('id');
  } else {
    unTrusted[0].setAttribute('id', 'unTrusted')
  }
  let trusted = document.getElementsByClassName('trust');
  trusted[0].removeAttribute('id');
}

</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
</style>

<template>

    <div class="content">
        <bandeau :username="username" :firstname="name" :lastname="surname"/>
        <div class="user-profile-infos">
          <ul class ="info-list">
            <li id = "user-infos-id" class = "label">{{ id }}</li>
            <li id = "user-infos-username" class = "label">{{ username }}</li>
            <li id="user-infos-name" class = "label">{{ name }}</li>
            <li id="user-infos-surname" class = "label">{{ surname }}</li>
          </ul>
          <button class="material-symbols-outlined button-profile trust" @click="trustUser">
            verified_user
          </button>
          <br/>
          <button class="material-symbols-outlined button-profile untrust" @click="unTrustUser">
            remove_moderator
          </button>
        </div>
        <feed :posts="posts" class="posts"></feed>
    </div>

</template>

<style scoped>

.button-profile{
    background-color: transparent;
    margin-right: 2vh;
    border: none;
    outline: none;
}
.button-profile:hover{
    color:#B9ABAB;
}
.button-profile:focus{
    outline: none;
}

#trusted{
  color:rgb(39, 39, 195)
}

#unTrusted{
  color: rgb(228, 37, 37)
}

.info-list {
    -moz-column-count: 2;
    -moz-column-gap: 2vw;
    -webkit-column-count: 2;
    -webkit-column-gap: 2vw;
    column-count: 2;
    column-gap: 2vw;
}

/* .content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    width: 100%;
    height: 100%;
} */

</style>