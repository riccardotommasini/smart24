<template>
    <div>
        <div>
            <input v-model="grade" type="range" id="grade" name="grade" min="0" max="2" step="1" />
            <label for="grade">Grade</label>
        </div>
        <textarea v-model="message" placeholder="Write your fact check message here..."></textarea>
        <button @click="postMessage">Create Fact Check</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    parentPostId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      message: '',
      errorMessage: '',
      grade: 2
    }
  },
  methods: {
    async postMessage() {
      try {
        console.log(this.message);
        await axios.post('/factCheck/create', {comment: this.message, grade: this.grade, postId: parentPostId});
        this.message = '';
        this.errorMessage = '';
        this.$emit('postStatus', 'success');
      } catch (error) {
        this.errorMessage = 'An error occurred while creating your fact check.';
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