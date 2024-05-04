<script setup lang="ts">

import bandeau from "../components/common/bandeau-settings.vue"
import feed from "../components/common/feed.vue"
import '../assets/main.css'
import { useUserInfoStore } from "../stores/userInfo";
import { computed, onMounted, ref, defineProps } from "vue";
import axios from 'axios'

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
};

onMounted( () => {
    //retrieve session information
    const userInfo = computed(()=>store.getUserInfo).value;
    id.value = userInfo._id!;
    username.value = userInfo.username!;
    fetchPosts(props.profileId);
});

</script>

<template>

    <div class="content">
        <bandeau :username="username" :firstname="name" :lastname="surname"/>
        <feed :posts="posts"></feed>
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