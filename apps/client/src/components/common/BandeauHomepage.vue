<!-- eslint-disable vue/multi-word-component-names -->
<script setup>

import AppLogo from '../logo/app-logo.vue';

const props = defineProps([
    'username'
])

const redirectSettings = () => {
    window.location.href = "/settings";
}

</script>

<template>
    <nav class="bandeau-main">
        <div class="left-box">
            <AppLogo/>
            <p class="info-user std title3">{{ props.username }}</p>
        </div>
        <div class="right-box">
            <button class="btn btn-primary b" @click="post">Post</button>
            <button class="btn btn-primary b" @click="redirectSettings">Settings</button>
        </div>
    </nav>
</template>

<style scoped>

.bandeau-main {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    background-color: white;

    padding: 1em;
}

.info-user {
    margin: 0 0 0 10em;
}

.left-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.right-box button {
    height : 40px;
    width: 100px;
    font-size: 0.8rem;
    margin: 0 0.5em 0 0.5em;
}

</style>