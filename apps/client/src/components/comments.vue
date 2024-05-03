<!-- eslint-disable vue/multi-word-component-names -->
<script>
import axios from "axios";

export default {
    name: "comments",
    props: {  
        parentPostId: String,
    },

    // methods: {
    //     async fetchPosts() {
    //     try {
    //         const response = await axios.get(`posts/comments`, { parent: this.parentPostId});
    //         this.posts.push(response.data);
    //     } catch (error) {
    //         console.error(error);
    //     }
    //     console.log(this.posts);
    //     },
    // },
    // data() {
    //     return {
    //         posts: [],
    //     };
    // },

    // fake data for the moment on comments[1]
    data() {
        return {
            comments: [
                {
                    createdBy: "John Doe",
                    date: "2021-09-01",
                    title: "This is a comment",
                },
                {
                    createdBy: "Jane Doe",
                    date: "2021-09-02",
                    title: "Suspendisse vel felis. Ut lorem lorem, interdum eu, tincidunt sit amet, laoreet vitae, arcu. Aenean faucibus pede eu ante. Praesent enim elit, rutrum at, molestie non, nonummy vel, nisl. Ut lectus eros, malesuada sit amet, fermentum eu, sodales cursus, magna. Donec eu purus. Quisque vehicula, urna sed ultricies auctor, pede lorem egestas dui, et convallis elit erat sed nulla. Donec luctus. Curabitur et nunc. Aliquam dolor odio, commodo pretium, ultricies non, pharetra in, velit. Integer arcu est, nonummy in, fermentum faucibus, egestas vel, odio.",
                },
                {
                    createdBy: "John Doe",
                    date: "2021-09-03",
                    title: "This is a comment 3",
                }
            ]

        };
    },

    

};

</script>

<template>
    <div class="comments">
        <div class="comments-content">
            <div v-for="comment in comments" :key="comment.title" class="comment">
            <div class="comment-header">
                <h2 class="createdBy">{{ comment.createdBy }}</h2>
                <p class="date">{{ comment.date }}</p>
            </div>
            <div class="comment-content">
                <p class="std">{{ comment.title }}</p>
            </div>
            <div class="comment-footer">
                <div class="comment-footer-left">
                    <button id="verified_user" class="material-symbols-outlined button-post green">
                        verified_user
                    </button>     
                    <button class="material-symbols-outlined button-post red">
                        remove_moderator
                    </button>  
                    <button class="material-symbols-outlined button-post green">
                        thumb_up
                    </button>                   
                    <button class="material-symbols-outlined button-post red">
                        thumb_down
                    </button>   
                </div>
            </div>
        </div>
        </div>
        <div class="comment-form">
            <textarea class="comment-input" placeholder="Write a comment"></textarea>
            <button class="comment-button">Send</button>
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
.comment-header{
    display: flex;
}
.date{
    display: flex;
    align-items: center;
    font-size: 0.5rem;
}
.comment-form{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
}
.comment-input{
    position: relative !important;
    z-index: auto !important;
    border: none;
    width: 100%;
    height: 10vh;
    background: #d9d9d9;
    border-radius: 15rem;
}
.comment-button{
    border: none;
    background: #242323;
    color: white;
    padding: 1rem;
    border-radius: 15rem;
    cursor: pointer;
    align-self: flex-end;
}



</style>
