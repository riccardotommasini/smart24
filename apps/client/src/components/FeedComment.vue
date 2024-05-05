<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { onMounted, ref } from 'vue';
import Comment from './Comment.vue'
import axios from 'axios';

const props = defineProps([
    "parentPostId"
]);

const comments = ref();
let commentText = defineModel('commentText');

const loadComments = ref(false);

async function sendComment() {
    const resp = (await axios.post('/posts/comment', { text : commentText.value, parentPostId : props.parentPostId}));
    console.log(resp);
}

onMounted( async () => {
    comments.value = (await axios.get(`/posts/${props.parentPostId}/comments`)).data;
    console.log(comments.value)
    loadComments.value = true;
})

</script>

<template>
    <div class="comments">
        <div v-if="loadComments" class="comments-content">
            <div v-for="comment in comments" :key="comment.title" class="comment">
                <Comment :comment="comment"></Comment>
            </div>
        </div>
        <div class="comment-form">
            <textarea v-model="commentText" class="comment-input" placeholder="Write a comment"></textarea>
            <button class="comment-button" @click="sendComment">Send</button>
        </div>
    </div>
</template>

<style scoped>
.comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 70%;
}
.comments-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.comment-form{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    width: 100%;
}
.comment-input{
    border: none;
    width: 100%;
    height: 10vh;

    padding : 1em;

    background: #d9d9d9;
    border-radius: 0.5rem;
}

.comment-button{
    background: #242323;
    color: white;

    width: 20%;
    height: 10%;
    padding: 1rem;
    border-radius: 1rem;
    cursor: pointer;
}
</style>
