<script setup lang="ts">

import feed from "../components/common/feed.vue"
import '../assets/PageAccueil.css'
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { useTokenStore } from "../stores/auth.ts";
import { onMounted, ref } from "vue";
import BandeauHomepage from "../components/common/BandeauHomepage.vue";
import modal from "../components/common/modal.vue";
import NewPost from "../components/NewPost.vue";

const store = useUserInfoStore();

const username = ref('');
const name = ref('');
const surname = ref('');
const posts=ref<any[]>([]);;
const showCreateNewPost = ref(false);

const switchShowCreateNewPost = () => {
    showCreateNewPost.value = !showCreateNewPost.value;
}

onMounted(async () => {
    let userInfo = store.getUserInfo;
    console.log("userinfo",userInfo);

    username.value = userInfo.username;
    name.value = userInfo.name;
    surname.value = userInfo.surname;

    try {
        const array = await getPosts() ;
        posts.value.push(...array);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts :", error);
    }});

    


async function getPosts() {
    const idPost = "66335387450595a99959e21d";
    const idPost2="66349d40b1f3fe6ff9a98cb7";
    const token = localStorage.getItem('token');
    
    // Vérifiez si le token est présent
    if (!token) {
        throw new Error('Token de connexion non trouvé.');
    }

    // Configuration de l'en-tête d'autorisation avec le token
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const res = await axios.get(`/posts/${idPost}`, { headers });
    const res2= await axios.get(`/posts/${idPost2}`, { headers });

    const postsArray=[res.data, res2.data];
    console.log("data"  , postsArray);

    return postsArray;
}


const handlePostStatus = (status: string) => {
    if (status === 'success') {
      switchShowCreateNewPost();
    } else {
        alert('An error occurred while posting your message');
    }
}
</script>

<template>
    <div class="mainFeed">
        <header>        
                <BandeauHomepage :username="username"/>
        </header>
        <div class="screen">
            <button class="btn btn-primary b" @click="switchShowCreateNewPost">Post</button>

            <feed :posts="posts"></feed>
            <modal v-if="showCreateNewPost" @close="switchShowCreateNewPost">
                <NewPost @postStatus="handlePostStatus"/>
            </modal>
        </div>
    </div>

   


</template>

