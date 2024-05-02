<!-- eslint-disable vue/multi-word-component-names -->
<script>
export default {
  props: {
    // Définition de la propriété info
    // info: {
    //     text: string,
    //     date: DateTime,
    //     image: string,
    //     createdBy: mongoose.Types.ObjectId,
    //     metrics: mongoose.Types.ObjectId
    // }
  }
}
</script>

<template>

    <div class="container">
        <div class="post">
            <div class="post-header">
                <h2 class="std title2">{{ info.createdBy }}</h2>
                <h3 class="std title3">{{ info.date }}</h3>                
            </div>
            <div class="post-content">
                <p class="std">{{ info.text }}</p>
                <img v-if="info.image" :src="info.image" alt="post-image" class="post-image">
            </div>
            <div class="post-footer">
                <div class="post-footer-left">
                    <button class="btn btn-primary">Like</button>
                    <button class="btn btn-primary">Comment</button>
                </div>
                <div class="post-footer-right">
                    <button class="btn btn-primary">Share</button>
                </div>
            </div>
        </div>
        
    </div>


</template>