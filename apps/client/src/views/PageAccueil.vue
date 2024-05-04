<script setup lang="ts">

import feed from "../components/common/feed.vue"
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { onMounted, ref } from "vue";
import BandeauHomepage from "../components/common/BandeauHomepage.vue";
import modal from "../components/pop-ups/modal.vue";
import NewPost from "../components/NewPost.vue";

const loadFeed = ref(false);

const store = useUserInfoStore();

const userId = ref('')
const username = ref('');
const posts=ref<any[]>([]);;
const showCreateNewPost = ref(false);

const switchShowCreateNewPost = () => {
    showCreateNewPost.value = !showCreateNewPost.value;
}

onMounted(async () => {
    let userInfo = store.getUserInfo;

    userId.value = userInfo._id!;
    username.value = userInfo.username!;

    try {
        const array = await getPosts();
        posts.value = array;
        loadFeed.value = true;
    } catch (error) {
        console.error("Erreur lors de la récupération des posts :", error);
    }


});


//Function to get posts
async function getPosts() {
    posts.value = (await axios.get('/posts/getSuggestions')).data.suggestions;
    return posts.value;
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