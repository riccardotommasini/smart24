<!-- eslint-disable vue/multi-word-component-names -->
<script setup>

import { onMounted, ref } from 'vue';
import axios from 'axios';
import modal from './pop-ups/modal.vue';
import FeedComment from './FeedComment.vue';

const props = defineProps([
    'post'
]);

const postComments = ref();

const loadComments = ref();

async function displayComments() {
    loadComments.value = true;
}

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
/* Vos styles CSS ici */
</style>


<template>

    <div class="  ">
        <div class="post">
            <div class="post-header">
                <h2 class="createdBy">{{ props.post.createdBy }}</h2>
                <h3 class="date">{{ props.post.date }}</h3>
            </div>
            <div class="post-content">
                <p class="std">{{ post.text }}</p>
                <img v-if="post.image" :src="post.image" alt="post-image" class="post-image">
            </div>
            <div class="post-footer">
                <div class="post-footer-left">
                    <button id="verified_user" class="material-symbols-outlined button-post green">
                        verified_user
                    </button>     
                    <button class="material-symbols-outlined button-post red">
                        remove_moderator
                    </button>  
                    <button class="material-symbols-outlined button-post green">
                        thumb_up
                    </button>                   
                    <button class="material-symbols-outlined button-post red">
                        thumb_down
                    </button>  
                    <button class="material-symbols-outlined button-post" @click="displayComments()">
                        comment
                    </button>  
                    <button class="material-symbols-outlined button-post">
                        send
                    </button>
                </div>
               
            </div>
        </div>
    </div>
    <div v-if="loadComments">
        <modal><FeedComment :parentPostId="post._id"></FeedComment></modal>
    </div>


</template>