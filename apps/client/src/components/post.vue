<script>
import '../assets/PageAccueil.css'

export default {
  props: {
    info: {
        date: Date,
        createdBy: Object,
        metrics: Object
    }
  }
}
</script>

<template>

    <div class="panel">
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


