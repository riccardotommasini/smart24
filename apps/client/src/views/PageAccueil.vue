<script setup lang="ts">

import BandeauHomepage from "../components/common/bandeau-homepage.vue"
import feed from "../components/common/feed.vue"
import '../assets/PageAccueil.css'
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { useTokenStore } from "../stores/auth.ts";
import { computed, onMounted, ref } from "vue";

const store = useUserInfoStore();

const id = ref('');
const username = ref('');
const name = ref('');
const surname = ref('');
const posts=ref<any[][]>([]);
const likes=ref<any[][]>([]);

onMounted(async () => {
    let userInfo = store.getUserInfo;

    username.value = userInfo.username;
    name.value = userInfo.name;
    surname.value = userInfo.surname;

    try {
        const array = await getPosts() 
        posts.value.push(array);
        posts.value.push(new Array(array.length-1));
        posts.value.push(new Array(array.length-1));
        posts.value.push(new Array(array.length-1));
        posts.value.push(new Array(array.length-1));
        await checkIfUserHasLiked();
    } catch (error) {
        console.error("Erreur lors de la récupération des posts :", error);
    }


});


//Function to get posts
async function getPosts() {
    const idPost ="66333d0f22fdb44ff5afc20b";
    const idPost2="66334a4522fdb44ff5afc248";
    
    
    const res = await axios.get(`/posts/${idPost}`);
    const res2= await axios.get(`/posts/${idPost2}`);

    const postsArray=[res.data, res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data,res2.data];
    console.log("data"  , postsArray);

    return postsArray;
}


async function checkIfUserHasLiked() {
    // Récupérer les informations de l'utilisateur
    const userInfo = store.getUserInfo;
    const id = userInfo._id;

    console.log(posts);
    // Parcourir tous les posts
    for (let i = 0; i < posts.value[0].length; i++) {
        // Initialiser les indicateurs de like à false
        posts.value[1][i] = false;
        posts.value[2][i] = false;
        posts.value[3][i] = false;
        posts.value[4][i]= false;

        // Récupérer les informations de like pour le post actuel
        let likedBySet = new Set(posts.value[0][i].metrics.likedBy);
        let dislikedBySet = new Set(posts.value[0][i].metrics.dislikedBy);
        let trustedBySet = new Set(posts.value[0][i].metrics.trustedBy);
        let untrustedBySet = new Set(posts.value[0][i].metrics.untrustedBy);

         // Vérifier si l'utilisateur a aimé le post
         if (likedBySet.has(id)) {
            posts.value[1][i] = true;
        }
        // Vérifier si l'utilisateur a désaimé le post
        if (dislikedBySet.has(id)) {
            posts.value[2][i] = true;
        }
        // Vérifier si l'utilisateur a fait confiance au post
        if (trustedBySet.has(id)) {
            posts.value[3][i] = true;
        }
        // Vérifier si l'utilisateur n'a pas fait confiance au post
        if (untrustedBySet.has(id)) {
            posts.value[4][i] = true;
        }
    }
}

// Assurez-vous que votre store a une méthode getUserInfo() pour récupérer les informations de l'utilisateur.




</script>

<template>
    <div class="mainFeed">
        <header>        
                <BandeauHomepage :username="username" :fistname="name" :lastname="surname"/>
        </header>
        <div class="screen">
            <feed :posts="posts" :username="username"></feed>
        </div>
    </div>

   


</template>

