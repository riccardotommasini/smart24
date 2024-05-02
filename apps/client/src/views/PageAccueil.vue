<script setup lang="ts">

import BandeauHomepage from "../components/common/bandeau-homepage.vue"
import feed from "../components/common/feed.vue"
import '../assets/main.css'
import { useUserInfoStore } from "../stores/userInfo";
import { computed, onMounted, ref } from "vue";

const store = useUserInfoStore();

const id = ref('');
const username = ref('');
const name = ref('');
const surname = ref('');

onMounted( () => {
    //retrieve session information
    const userInfo = computed(()=>store.getUserInfo).value;
    id.value = userInfo._id!;
    username.value = userInfo.username!;
    name.value = userInfo.name!;
    surname.value = userInfo.surname!;
});

</script>

<template>
        <header>
            <BandeauHomepage :username="username" :fistname="name" :lastname="surname"/>
        </header>
        <div class="screen">
            <feed :posts="posts"></feed>
        </div>
</template>

<style scoped>
body {
    display : flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    width: 100%;
    height : 100%;
}

header {
    width: 100%;
}
</style>