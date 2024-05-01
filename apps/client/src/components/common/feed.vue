<script setup>

const props = defineProps([
    'postList'
])

</script>

<template>
    <div class="feed">
        <div v-for="item, key in  props.postList">
            <post :info="item"></post>
        </div>
    </div>

</template>

<style scoped>

.feed {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    width: 100%;
    height : 120px;

    background-color: rgb(208, 208, 208);
}

</style>