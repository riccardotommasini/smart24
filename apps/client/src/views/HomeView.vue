
<!-- App.vue -->
<template>
    <div id="HomeView">
      <button @click="showModal = true">Mostrar modal</button>
      <!-- Otras partes de tu aplicación -->
      <modal v-if="showModal" @close="showModal = false">
        <h2>Contenido del modal</h2>
        <!-- Aquí puedes poner cualquier contenido que desees dentro del modal -->
      </modal>
    </div>
  </template>
  
  <script>
  import modal from "../components/common/modal.vue"
  
  export default {
    name: 'HomeView',
    components: {
      modal
    },
    data() {
      return {
        showModal: true
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
  </style>
  