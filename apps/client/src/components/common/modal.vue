<!-- ModalComponent.vue -->
<template>
  <div class="modal">
    <div class="modal-content">
      <button @click="$emit('close')" class="modal-button">X</button>
      <slot></slot>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalComponent'
}
</script>

<style scoped>
.modal {
  position: absolute;
  border-radius: 15px;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content{
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  width: 70%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, .2);
  border-radius: 1.5rem;
  outline: 0;
}
.modal-button{
  border: none;
  background-color: transparent;
  display: flex;
  justify-content: flex-start;
  padding-left: 2vw;
}
</style>
