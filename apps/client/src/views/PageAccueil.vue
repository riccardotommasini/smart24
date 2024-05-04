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
    const idPost ="6634d7740d43d6840202139d";
    
    const res2 = await axios.get(`/posts/${idPost}`);

    const postsArray=[res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data];

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

<style scoped>
.mainFeed{
    width:100%;
    height:100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
background-image: linear-gradient(to bottom, #f7e1e1 50%, #B9ABAB 100%);
}


.screen{
    width: 100%;
    height: 100%;
    margin-top:7vh;
    display:flex;
    justify-content: center;
    padding: 1em 0 1em 0;
}
</style>