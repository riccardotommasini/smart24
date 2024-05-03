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

onMounted( () => {
    console.log(props.post);
})

// // Sélectionnez tous les boutons avec la classe 'myButton'
// const button_verified_user = document.getElementById('.red');
// const button_remove_moderator = document.getElementById('.red');
// const button_thumb_up = document.getElementById('.red');
// const button_thumb_down = document.getElementById('.red');
// const button_comment = document.getElementById('.red');
// const button_send = document.getElementById('.red');

// console.log(buttons);
// // Parcourir tous les boutons et ajouter un écouteur d'événements à chacun
//   button.addEventListener('click', function() {
//     // Ajoute la classe "button-clicked" au bouton cliqué
//     button.style.color="red";
//   });

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
                <p class="std"> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
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
                    <button>
                        See comments
                    </button>
                </div>
               
            </div>
        </div>
    </div>
    <div v-if="loadComments">
        <modal><FeedComment :parentPostId="post._id"></FeedComment></modal>
    </div>


</template>