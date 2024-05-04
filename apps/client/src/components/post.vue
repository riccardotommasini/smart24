

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useUserInfoStore } from "../stores/userInfo";

const props = defineProps({
    posts: Array,
    info: {
        date: Date,
        createdBy: Object,
        metrics: Object,
        image: String,
        text: String,
    },
    username: String,
});

const store = useUserInfoStore();
const userIsFactChecker = store.getUserInfo.isFactChecker === "true" ? true : false;

const metric = ref('');
const likedBy = ref(false);
const unlikedBy = ref(false);
const trustedBy = ref(false);
const untrustedBy = ref(false);

const dateInstance = new Date(props.info.date);
const year = dateInstance.getFullYear();
const month = dateInstance.getMonth();
const day = dateInstance.getDate();
const hour = dateInstance.getHours();
const minute = dateInstance.getMinutes();

onMounted(async () => {
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
});

async function getMetrics() {
    const res = await axios.get(`/posts/${props.info._id}/metrics`);
    return res.data;
}

async function likePost() {
    await axios.post(`/posts/${props.info._id}/metrics/like`);
    
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

async function dislikePost() {
    await axios.post(`/posts/${props.info._id}/metrics/dislike`);
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

async function trustPost() {
    await axios.post(`/posts/${props.info._id}/metrics/trust`);
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

async function untrustPost() {
    await axios.post(`/posts/${props.info._id}/metrics/untrust`);
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

async function factCheckPost() {
    await axios.post("/factCheck/create")
    metric.value = await getMetrics();
}

function checkIfUserHasLiked(list) {
    // Récupérer les informations de l'utilisateur
    const userInfo = store.getUserInfo;
    const id = userInfo._id;
    // Initialiser les indicateurs de like à false
        
    likedBy.value=false;
    unlikedBy.value=false;
    trustedBy.value=false;
    untrustedBy.value=false;

    // Récupérer les informations de like pour le post actuel
    let likedBySet = new Set(list.likedBy);
    let dislikedBySet = new Set(list.dislikedBy);
    let trustedBySet = new Set(list.trustedBy);
    let untrustedBySet = new Set(list.untrustedBy);

    // Vérifier si l'utilisateur a aimé le post
    if (likedBySet.has(id)) {
        likedBy.value = true;
    }
    // Vérifier si l'utilisateur a désaimé le post
    if (dislikedBySet.has(id)) {
        unlikedBy.value = true;
    }
    // Vérifier si l'utilisateur a fait confiance au post
    if (trustedBySet.has(id)) {
        trustedBy.value = true;
    }
    // Vérifier si l'utilisateur n'a pas fait confiance au post
    if (untrustedBySet.has(id)) {
        untrustedBy.value = true;
    }
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
                    <div v-if="userIsFactChecker" class="comment-icon-container">          
                        <button  class="material-symbols-outlined button-post" @click="factCheckPost">
                            verified
                        </button> 
                        <div class="comment-count-bubble">{{metric.nbFactChecks}}</div>
                    </div>
                    <div class="comment-icon-container">
                        <button v-if="trustedBy" class="material-symbols-outlined button-post green" @click="trustPost">
                            verified_user
                        </button>
                        <button v-else class="material-symbols-outlined button-post " @click="trustPost">
                            verified_user
                        </button>
                        <div class="comment-count-bubble">{{metric.nbTrusts}}</div>
                    </div>
                    <div class="comment-icon-container">
                        <button v-if="untrustedBy" class="material-symbols-outlined button-post red" @click="untrustPost">
                            remove_moderator
                        </button> 
                        <button v-else class="material-symbols-outlined button-post" @click="untrustPost">
                            remove_moderator
                        </button>  
                        <div class="comment-count-bubble">{{metric.nbUntrusts}}</div>
                    </div> 
                    <div class="comment-icon-container">
                        <button v-if="likedBy" class="material-symbols-outlined button-post green" @click="likePost">
                            thumb_up
                        </button>
                        <button v-else class="material-symbols-outlined button-post" @click="likePost">
                            thumb_up
                        </button>
                        <div class="comment-count-bubble">{{metric.nbLikes}}</div>
                    </div>
                      
                    <div class="comment-icon-container">
                        <button v-if="unlikedBy" class="material-symbols-outlined button-post red" @click="dislikePost">
                            thumb_down
                        </button>  
                        <button v-else class="material-symbols-outlined button-post" @click="dislikePost">
                            thumb_down
                        </button> 
                        <div class="comment-count-bubble">{{metric.nbDislikes}}</div>
                    </div>

                    <div class="comment-icon-container">
                        <button class="material-symbols-outlined button-post">
                        comment
                        </button>  
                        <div class="comment-count-bubble">{{metric.nbComments}}</div>
                    </div>
                </div>
               
            </div>
        </div>
        
    </div>


</template>

<style scoped>
.comment-icon-container {
    position: relative;
    display: inline-block;
}

.comment-count-bubble {
    position: absolute;
    transform: translate(50%, -50%);
    top: 0.6vh;
    left: 1.8vh;
    background-color: #B9ABAB;
    color: white;
    border-radius: 50%;
    width: 1.5vh;
    height: 1.5vh;
    font-size: 1.3vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

p {
    font-family: 'inter', sans-serif;
    font-weight: normal;
    font-size: 1.5vh;
    margin: 0;
}

.container{
    height:20vh;
}


.post-header{
    display: flex;
    flex-direction: row;
    align-items: center;

}

.createdBy{
    font-family: 'inter', sans-serif;
    font-weight: bold;
    font-size: 1.8vh;
    margin-right: 2vh;
}

.date{
    font-family: 'inter', sans-serif;
    font-weight:normal;
    font-size: 1.8vh;
    margin-right: 2vh;
}

.green{
    color: #08a808;
}

.red{
    color: #d20505;
}

.post-footer{
    display:flex;
}

.button-post{
    background-color: transparent;
    margin-right: 2vh;
    border: none;
    outline: none;
}

.button-post:hover{
    color:#B9ABAB;
}

.button-post:focus{
    outline: none;
}
</style>