<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import axios from 'axios'

const serverMessage = ref('');

axios.get('/').then((response) => {
  serverMessage.value = response.data;
});

</script>

<template>
  <header>
    <header>
      <HelloWorld :msg="serverMessage" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>
  </header>

  <RouterView />
</template>

<style scoped>
  header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  a:not(.router-link-active) {
    color: white;
  }
</style>
