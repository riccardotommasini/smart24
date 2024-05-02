<script setup>

import axios from "axios";
import { onMounted } from 'vue';
import  { useUserInfoStore } from '../stores/userInfo'
import  { ref } from 'vue'
import { useTokenStore } from '../stores/auth'
import { authHeader } from "@/utils/auth";
import { computed } from "vue";
import Bandeau from "@/components/common/bandeau.vue";

const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();

const token = ref('');

const userId = ref('');
const userData = ref('');

onMounted(async () => {
    //recover user id
    const userInfo = userInfoStore.getUserInfo;
    userId.value = userInfo._id;
    token.value = computed(() => tokenStore.getToken).value;

    //get all info
    userData.value = (await axios.get('/user/' + userId.value, authHeader(token.value))).data;
    console.log(userData.value);
});

</script>

<template>
    <div class="content">
        <bandeau :username="userData.username" :firstname="userData.name" :lastname="userData.surname"></bandeau>
        <div class="profile">
            <h1 class="std title1">Profile</h1>
            <div class="user-info">
                <h2 class="std title2">Personal information</h2>
                <p class="std text">Name : {{ userData.name }} {{ userData.surname }}</p>
                <p class="std text">E-mail : {{ userData.email }}</p>
                <div v-if="userData.factChecker === true">
                    <h3 class="std title3">Recognized fact-checker</h3>
                    <p class="std text">Organization : {{ userData.organization }}</p>
                </div>
            </div>
            <div class="params">
                <h2 class="std title2">Settings</h2>
                <p class="std text">Here, you can choose the way you want the public feed to look like</p>
                <div class="select-param">
                    <p class="std text">Sets the rate of fact-checked posts in your feed</p>
                    <p class="std text">Fact-checking of the feed :</p>
                    <div class="boutons-filtre-categorie">
                        <div class="btn-group btn-group-toggle" role="group" data-toggle="buttons">
                            <button class="btn btn-primary" id="selected" @click="switchcateg(1, $event)">Catégorie juridique</button>
                            <button class="btn btn-primary" id="not-selected" @click="switchcateg(2, $event)">Classe effectif</button>
                            <button class="btn btn-primary" id="not-selected" @click="switchcateg(3, $event)">NAF</button>
                        </div>
                    </div>
                </div>
                <div class="select-param">
                    <p class="std text">Sets the rate of posts that will be out of your current interest centers (sounds exciting !)</p>
                    <p class="std text">Diversity of the feed :</p>
                    <div class="boutons-filtre-categorie">
                        <div class="btn-group btn-group-toggle" role="group" data-toggle="buttons">
                            <button class="btn btn-primary" id="selected" @click="switchcateg(1, $event)">Catégorie juridique</button>
                            <button class="btn btn-primary" id="not-selected" @click="switchcateg(2, $event)">Classe effectif</button>
                            <button class="btn btn-primary" id="not-selected" @click="switchcateg(3, $event)">NAF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>

<style scoped>

.content{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    background-color: white;

    width: 100%;
    height: 100%;
}

</style>