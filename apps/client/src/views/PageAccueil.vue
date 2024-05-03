<script setup lang="ts">

import feed from "../components/common/feed.vue"
import '../assets/PageAccueil.css'
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { onMounted, ref } from "vue";
import BandeauHomepage from "../components/common/BandeauHomepage.vue";

const loadFeed = ref(false);

const store = useUserInfoStore();

const username = ref('');
const name = ref('');
const surname = ref('');
const posts=ref<any[]>([]);;

onMounted(async () => {
    let userInfo = store.getUserInfo;

    username.value = userInfo.username;
    name.value = userInfo.name;
    surname.value = userInfo.surname;

    try {
        const array = await getPosts();
        posts.value = array;
        loadFeed.value = true;
    } catch (error) {
        console.error("Erreur lors de la récupération des posts :", error);
    }});

async function getPosts() {
    const idPost = "6634d7740d43d6840202139d";

    const res = await axios.get(`/posts/${idPost}`);
    const postsArray=[res.data];

    return postsArray;
}

</script>

<template>
    <div class="mainFeed">
        <header>        
            <bandeauHomepage :username="username" :fistname="name" :lastname="surname"/>
        </header>
        <div class="screen" v-if="loadFeed">
            <feed :posts="posts"></feed>
        </div>
    </div>
</template>

