<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-v-for-key -->
<script setup>
import post from '../post.vue'
import '../../assets/PageAccueil.css'

const props = defineProps({
    posts: Array,
    username: String,
})

console.log("posts", props.posts);


</script>

<template>
    <div class="feed">
        <div class="posts" v-for="(item,index) in  props.posts[0]" key="index">
            <post :username="username":info="item" :likedBy="props.posts[1][index]" :unlikedBy="props.posts[2][index]" :trustedBy="props.posts[3][index]" :untrustedBy="props.posts[4][index]"></post>
        </div>
    </div>
</template>

