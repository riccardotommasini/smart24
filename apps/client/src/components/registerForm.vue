<script setup lang="ts">
import { useTokenStore } from '../stores/auth';
import { ref } from 'vue'

const tokenstore = useTokenStore();

const name = ref('')
const surname = ref('')
const pseudo = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

async function register(){
  if (
    !name.value ||
    !surname.value ||
    !pseudo.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    alert('Please fill in all fields')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  console.log('Form submitted:', {
    name: name.value,
    surname: surname.value,
    pseudo: pseudo.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  })

  await tokenstore.register({username: pseudo.value, mail: email.value, password: password.value})
  window.location.href = '/login'
}
</script>

<template>
  <div class="container">
    <form class="login-form" @submit.prevent="register">
      <input type="text" class="input-field" placeholder="Name" v-model="name" />
      <input type="text" class="input-field" placeholder="Surname" v-model="surname" />
      <input type="text" class="input-field" placeholder="Pseudo" v-model="pseudo" />
      <input type="email" class="input-field" placeholder="Email" v-model="email" />
      <input type="password" class="input-field" placeholder="Password" v-model="password" />
      <input
        type="password"
        class="input-field"
        placeholder="Confirm password"
        v-model="confirmPassword"
      />
      <div class="line-container">
        <div class="line"></div>
        <div class="circle"></div>
        <div class="line"></div>
      </div>
      <button type="submit" class="login-button">Create an account</button>
    </form>
  </div>
</template>
