<!-- eslint-disable vue/require-v-for-key -->
<script setup>
import post from '../post.vue'
import '../../assets/PageAccueil.css'


const props = defineProps({
    posts: Array // Déclarez le type de la prop 'posts' comme un tableau d'objets
})

console.log("posts", props.posts);


</script>

<template>
    <div class="center">
        <div v-for="(item) in  props.posts" key="index">
            <post :info="item"></post>
        </div>
    </div>

</template>

<style scoped>


</style>