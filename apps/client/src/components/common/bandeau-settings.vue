<!-- eslint-disable vue/multi-word-component-names -->
<script setup>

import AppLogo from '../logo/app-logo.vue';

const props = defineProps([
    'username',
    'firstname',
    'lastname',
])

const redirectHomePage = () => {
    window.location.href = "/homepage";
}

</script>

<template>
    <nav class="bandeau-main">
        <AppLogo/>
        <p class="info-user std title3">{{ props.username }}</p>
        <div class="right-box">
            <button class="btn btn-primary b" @click="redirectHomePage">Back</button>
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
    margin: 0;
}

.right-box button {
    height : 40px;
    width: 100px;
    font-size: 0.8rem;
}

</style>