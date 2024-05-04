<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-v-for-key -->
<script setup>
import post from '../post.vue'
import '../../assets/PageAccueil.css'


const props = defineProps({
    posts: Array
})

</script>

<template>
    <div class="feed">
        <!-- eslint-disable-next-line vue/require-v-for-key -->
        <div class="posts" v-for="(item) in props.posts" key="index">
            <post :post="item"></post>
        </div>
    </div>
</template>

