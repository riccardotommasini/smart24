<script setup lang="ts">

import bandeau from "../components/common/bandeau.vue"
import feed from "../components/common/feed.vue"
import '../assets/main.css'

</script>

<template>

    <div class="content">
        <bandeau username="mlecluse" fistname="martin" lastname="lecluse"/>
        <feed></feed>
    </div>

</template>

<style scoped>

.content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    width: 100%;
    height: 100%;
}

</style>