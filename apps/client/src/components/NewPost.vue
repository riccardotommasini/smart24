<template>
    <div>
      <textarea v-model="message" placeholder="Write your post here..."></textarea>
      <button @click="postMessage">Post</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>
  
<script>
import axios from 'axios';

export default {
  data() {
    return {
      message: '',
      errorMessage: ''
    }
  },
  methods: {
    async postMessage() {
      try {
        // Handle the post message action here
        console.log(this.message);
        await axios.post('/posts', {text: this.message});
        this.message = '';
        this.errorMessage = '';
        this.$emit('postStatus', 'success');
      } catch (error) {
        this.errorMessage = 'An error occurred while posting.';
      }
    }
  }
}
</script>
  
<style scoped>
div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
textarea {
  width: 100%;
  height: 200px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
}

.error {
  color: red;
}
</style>