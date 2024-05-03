<!-- eslint-disable vue/multi-word-component-names -->
<script setup>

const props = defineProps([
    'username',
    'fistname',
    'lastname'
])

</script>

<template>
    <nav class="bandeau-main">
        <li class="logo-app">
            <image href="../assets/logo.svg"></image>
        </li>
        <li>
            <a class="info-user">
              {{ props.username }}
            </a>
        </li>
        <li>
            <button class="btn btn-primary b">Réglages</button>
        </li>
    </nav>

</template>

<style scoped>

.bandeau-main {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background-color:white;
}

.info-user{
    margin: 0 0 0 2em;
}

.params {
    display: flex;
    flex-direction: row;
}
.params button {
    height : 40px;
    width: 100px;
    font-size: 0.8rem;

    margin: auto;
}

li{
    list-style-type:none;
}

li button{
    margin-right:2vh;
}

</style>