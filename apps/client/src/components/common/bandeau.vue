<script setup>

const props = defineProps([
    'username',
    'fistname',
    'lastname'
])

</script>

<template>
    <div class="bandeau">
        <div>
            <div class="logo-app">
                <image href="../assets/logo_app"></image>
            </div>
            <div class="info-user">
                <h2 class="std title2">{{ props.username }}</h2>
                <h3 class="std title3">{{ props.fistname }} {{ props.lastname }}</h3>
            </div>
        </div>
        <div class="params">
            <button class="btn btn-primary">Réglages</button>
        </div>
    </div>

</template>

<style scoped>

.bandeau {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    width: 100%;
    height : 120px;

    background-color: white;
}

.info-user{
    margin: 0 0 0 2em;
}

.params {
    display: flex;
    flex-direction: row;
}
.params button {
    height : 40px;
    width: 100px;
    font-size: 0.8rem;

    margin: auto;
}

</style>