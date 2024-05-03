<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-v-for-key -->
<script setup>
import post from '../post.vue'
import '../../assets/PageAccueil.css'

const props = defineProps({
    posts: Array,
    username: String,
})



</script>

<template>
    <div class="feed">
        <div class="posts" v-for="(item,index) in  props.posts[0]" key="index">
            <post :posts="props.posts" :username="username":info="item"></post>
        </div>
    </div>
</template>

