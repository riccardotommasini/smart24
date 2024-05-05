<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-v-for-key -->
<script setup>
import { onMounted } from 'vue';
import post from '../post.vue'

const props = defineProps({
    posts: Array,
    isFactChecker: Boolean
})

</script>

<template>
    <div class="feed">
        <div class="posts" v-for="(item) in  props.posts">
            <post :info="item" :userIsFactChecker="isFactChecker"></post>
        </div>
    </div>
</template>

<style scoped>

.feed{
    width: 50%;
    height: 97%;

    display:flex;
    flex-direction: column;
    align-items: center;

    margin-top:2em;
    margin-bottom: 2em;

    border-radius:30px;

    overflow-y:auto ;
    padding: 6vh;
    background-color:whitesmoke;
}

.posts{
    width: 100%;
    height: fit-content;

    margin: 1em 0 1em 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
}

</style>