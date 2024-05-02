<!-- eslint-disable vue/require-v-for-key -->
<script setup>

const props = defineProps([
    'postList'
])

</script>

<template>
    <div class="feed-main">
        // eslint-disable-next-line vue/require-v-for-key
        <div v-for="(item, index) in  props.postList" key="index">
            <post :info="item"></post>
        </div>
    </div>

</template>

<style scoped>

.feed-main {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    width: 100%;
    height : 120px;

    background-color: rgb(208, 208, 208);
}

</style>