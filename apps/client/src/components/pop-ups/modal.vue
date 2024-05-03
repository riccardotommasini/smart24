<!-- ModalComponent.vue -->
<template>
  <div class="modal">
    <div class="modal-popup">
      <button @click="$emit('close')" class="modal-button">X</button>
      <div class="modal-content-passed">
        <slot></slot>
      </div>
      
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.modal {
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.2);

  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-popup{
  display: flex;
  flex-direction: column;

  width: 70%;
  padding: 1em;

  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  
  border-radius: 1rem;
}

.modal-content-passed {
  width: 98%;
  margin: 2em 0 0 2%;
}

.modal-button{
  border: none;
  background-color: transparent;
  display: flex;
  justify-content: flex-start;
  padding-left: 2vw;
}
</style>
