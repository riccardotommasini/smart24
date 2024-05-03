<script setup>

const props = defineProps([
    'comment'
]);

</script>

<template>
    <div class="comment-header">
        <h2 class="createdBy">{{ comment.createdBy }}</h2>
        <p class="date">{{ comment.date }}</p>
    </div>
    <div class="comment-content">
        <p class="std">{{ comment.title }}</p>
    </div>
    <div class="comment-footer">
        <div class="comment-footer-left">
            <button class="material-symbols-outlined button-post green">
                thumb_up
            </button>                   
            <button class="material-symbols-outlined button-post red">
                thumb_down
            </button>   
        </div>
    </div>
</template>

<style scoped>


.comment-header{
    display: flex;
    justify-content: flex-start;
}

.date{
    font-size: 0.8rem;
}

.comment-content {
    margin: 0 0 0 1em;
}
</style>