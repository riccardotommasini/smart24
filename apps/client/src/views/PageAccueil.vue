<script setup lang="ts">

import bandeau from "../components/common/bandeau.vue"
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

    <div class="content">
        <bandeau :username="username" :firstname="name" :lastname="surname"/>
        <feed></feed>
    </div>

</template>


<!-- eslint-disable vue/require-v-for-key -->

