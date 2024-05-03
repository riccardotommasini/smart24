<script setup>
import { useUserInfoStore } from '@/stores/userInfo';
import '../assets/HomeView.css'
import { useTokenStore } from '../stores/auth.ts'
import { ref } from 'vue';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const username = ref('');
const password = ref('');

async function login() {
    const res = await tokenStore.login({username : username.value, password : password.value});
    userInfoStore.update(res.data.user);
    window.location.href = '/homepage';
}

function redirectToRegister() {
    window.location.href = '/register';
}
</script>

<template>

    <div class="container">
        <form class="login-form" @submit.prevent="login">
            <input type="username" class="input-field" placeholder="Username" v-model="username">
            <input type="password" class="input-field" placeholder="Password" v-model="password">
            <button type="submit" class="login-button">Login</button>
            <a class="forgot-password" href="">Forgot password ?</a>
            <div class="line-container">
                <div class="line"></div>
                <div class="or">OR</div>
                <div class="line"></div>
            </div>

            
            <button type="button" class="login-button" @click="redirectToRegister">Create an account</button>
        </form>
    </div>


</template>