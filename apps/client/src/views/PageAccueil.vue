<script setup lang="ts">

import bandeau from "../components/common/bandeau.vue"
import feed from "../components/common/feed.vue"
import '../assets/main.css'
import { useUserInfoStore } from "../stores/userInfo";
import { onMounted, ref } from "vue";

const store = useUserInfoStore();

const username = ref('');
const name = ref('');
const surname = ref('');

onMounted( () => {
    let userInfo = store.userInfo;
    username.value = userInfo.username;
    name.value = userInfo.name;
    surname.value = userInfo.surname;

    console.log(username.value);
    console.log(name.value);
    console.log(surname.value);
});

</script>

<template>

    <div class="content">
        <bandeau :username="username" :fistname="name" :lastname="surname"/>
        <feed></feed>
    </div>

</template>

<style scoped>

.content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    width: 100%;
    height: 100%;
}

</style>