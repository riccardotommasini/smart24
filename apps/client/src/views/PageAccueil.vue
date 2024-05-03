<script setup lang="ts">

import BandeauHomepage from "../components/common/bandeau-homepage.vue"
import feed from "../components/common/feed.vue"
import '../assets/PageAccueil.css'
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { useTokenStore } from "../stores/auth.ts";
import { computed, onMounted, ref } from "vue";

const store = useUserInfoStore();

const id = ref('');
const username = ref('');
const name = ref('');
const surname = ref('');
const posts=ref<any[]>([]);

onMounted(async () => {
    let userInfo = store.getUserInfo;

    username.value = userInfo.username;
    name.value = userInfo.name;
    surname.value = userInfo.surname;

    try {
        const array = await getPosts() 
        posts.value.push(array);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts :", error);
    }


});


//Function to get posts
async function getPosts() {
    const idPost ="66333d0f22fdb44ff5afc20b";
    const idPost2="66334a4522fdb44ff5afc248";
    
    
    const res = await axios.get(`/posts/${idPost}`);
    const res2= await axios.get(`/posts/${idPost2}`);

    const postsArray=[res.data, res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data];

    return postsArray;
}




</script>

<template>
    <div class="mainFeed">
        <header>        
            <BandeauHomepage :username="username" :fistname="name" :lastname="surname"/>
        </header>
        <div class="screen">
            <feed :posts="posts" :username="username"></feed>
        </div>
    </div>

   


</template>

