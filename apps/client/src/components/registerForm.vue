<script>
    import '../assets/RegisterView.css'
</script>

<template>

    <div class="container">
        <form class="login-form">
            <input type="text" class="input-field" placeholder="Name">
            <input type="text" class="input-field" placeholder="Surname">
            <input type="text" class="input-field" placeholder="Pseudo">
            <input type="email" class="input-field" placeholder="Email">
            <input type="password" class="input-field" placeholder="Password">
            <input type="password" class="input-field" placeholder="Confirm password">
            <div class="line-container">
                <div class="line"></div>
                <div class="circle"></div>
                <div class="line"></div>
            </div>
            <button type="submit" class="login-button">Create an account</button>
            

            
        </form>
    </div>


</template>