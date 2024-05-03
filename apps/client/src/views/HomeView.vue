
<!-- App.vue -->
<template>
    <div id="HomeView">
      <div id="post">
        <h3>here there is a beautiful post to be join</h3>
        <button @click="showComments = true">comment</button>
        <!-- Otras partes de tu aplicación -->
        <modal v-if="showComments" @close="showComments = false">
          <comments parentPostId="jsdnandonaodnd" ></comments>
        </modal>
      </div>
      <button @click="showModal = true">Mostrar modal</button>
      <!-- Otras partes de tu aplicación -->
      <modal v-if="showModal" @close="showModal = false">
        <h2>Contenido del modal</h2>
        <!-- Aquí puedes poner cualquier contenido que desees dentro del modal -->
      </modal>
    </div>
  </template>
  
  <script>
  import comments from "../components/comments.vue"
  import modal from "../components/common/modal.vue"
  
  export default {
    name: 'HomeView',
    components: {
      modal,
      comments
    },
    data() {
      return {
        showModal: true,
        showComments: false
      };
    }
  }
  </script>
  
  <style>
  #HomeView {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }
  #post {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 40vw;
  }

  </style>
  