<!-- eslint-disable vue/multi-word-component-names -->
<script setup>

import axios from "axios";
import { computed, onMounted, ref } from "vue";

 const props=defineProps({
    info: {
        date: Date,
        createdBy: Object,
        metrics: Object,
        image: String,
        text: String,
    },
    likedBy: Boolean,
    unlikedBy: Boolean,
    trustedBy: Boolean,
    untrustedBy: Boolean,
    username: String,
});

const dateInstance = new Date(props.info.date);

const year=dateInstance.getFullYear();
const month=dateInstance.getMonth();
const day=dateInstance.getDate();
const hour=dateInstance.getHours();
const minute=dateInstance.getMinutes();
const metrics=ref('');
console.log("likedBy", props.likedBy);

onMounted(async () => {

metrics.value=await getMetrics();


});

async function getMetrics(){
    const res = await axios.get(`/posts/${props.info._id}/metrics`);
    return res.data;
}


async function likePost(){
    const res = await axios.post(`/posts/${props.info._id}/metrics/like`);
    metrics.value=await getMetrics();
    console.log(res.data);
}

async function dislikePost(){
    const res = await axios.post(`/posts/${props.info._id}/metrics/dislike`);
    metrics.value=await getMetrics();
    console.log(res.data);
}

async function trustPost(){
    const res = await axios.post(`/posts/${props.info._id}/metrics/trust`);
    metrics.value=await getMetrics();
    console.log(res.data);
}

async function untrustPost(){
    const res = await axios.post(`/posts/${props.info._id}/metrics/untrust`);
    metrics.value=await getMetrics();
    console.log(res.data);
}

async function factCheckPost(){
    const res = await axios.post("/factCheck/create")
    metrics.value=await getMetrics();
    console.log(res.data);
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
                <h2 class="createdBy">{{username}}</h2>
                <h3 class="date">{{ day }}-{{ month }}-{{ year }} {{hour}}:{{minute}}</h3>  

            </div>
            <div class="post-content">
                <p class="std"> {{info.text}}
                </p>
                <img v-if="info.image" :src="info.image" alt="post-image" class="post-image">
            </div>
            <div class="post-footer">
                <div class="post-footer-left"> 
                    <div class="comment-icon-container">          
                        <button  class="material-symbols-outlined button-post" @click="factCheckPost">
                            verified
                        </button> 
                        <div class="comment-count-bubble">{{metrics.nbFactChecks}}</div>
                    </div>
                    <div class="comment-icon-container">
                        <button v-if="trustedBy" class="material-symbols-outlined button-post green">
                            verified_user
                        </button> 
                        <button v-else class="material-symbols-outlined button-post " @click="trustPost">
                            verified_user
                        </button>  
                        <div class="comment-count-bubble">{{metrics.nbTrusts}}</div>
                    </div>
                    <div class="comment-icon-container">
                        <button v-if="untrustedBy" class="material-symbols-outlined button-post red">
                            remove_moderator
                        </button> 
                        <button v-else class="material-symbols-outlined button-post" @click="untrustPost">
                            remove_moderator
                        </button>  
                        <div class="comment-count-bubble">{{metrics.nbUntrusts}}</div>
                    </div> 
                    <div class="comment-icon-container">
                        <button v-if="likedBy" class="material-symbols-outlined button-post green">
                            thumb_up
                        </button>
                        <button v-else class="material-symbols-outlined button-post" @click="likePost">
                            thumb_up
                        </button>
                        <div class="comment-count-bubble">{{metrics.nbLikes}}</div>
                    </div>
                      
                    <div class="comment-icon-container">
                        <button v-if="unlikedBy" class="material-symbols-outlined button-post red">
                            thumb_down
                        </button>  
                        <button v-else class="material-symbols-outlined button-post" @click="dislikePost">
                            thumb_down
                        </button> 
                        <div class="comment-count-bubble">{{metrics.nbDislikes}}</div>
                    </div>

                    <div class="comment-icon-container">
                        <button class="material-symbols-outlined button-post">
                        comment
                        </button>  
                        <div class="comment-count-bubble">{{metrics.nbComments}}</div>
                    </div>

                  
                    <button class="material-symbols-outlined button-post">
                        send
                    </button>  
                </div>
               
            </div>
        </div>
        
    </div>


</template>


