<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>
    <h1>Hello world!</h1>
    <p>Message: <i>{{ msg }}</i></p>
  </div>
</template>