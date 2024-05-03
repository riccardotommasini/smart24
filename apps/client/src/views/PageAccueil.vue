<script setup lang="ts">

import feed from "../components/common/feed.vue"
import '../assets/PageAccueil.css'
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { onMounted, ref } from "vue";
import BandeauHomepage from "../components/common/BandeauHomepage.vue";
import modal from "../components/common/modal.vue";
import NewPost from "../components/NewPost.vue";

const loadFeed = ref(false);

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

    // return postsArray;
    return {}
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

