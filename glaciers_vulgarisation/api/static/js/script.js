function toggleMenu() {
    var menu = document.getElementById("menu");
    menu.classList.toggle("active");
}

// Récupérer les éléments de l'animation container
const evolutionContainer1 = document.getElementById("evolution-container-1");
const evolutionContainer2 = document.getElementById("evolution-container-2");
const evolutionContainer3 = document.getElementById("evolution-container-3");
const evolutionContainer4 = document.getElementById("evolution-container-4");

// Récupérer les éléments d'options de température
const temperatureOptions = document.querySelectorAll(".temperature-option input[type='radio']");

// Fonction pour afficher l'animation correspondante à l'option sélectionnée
function afficherAnimation() {
    if (this.value === "1.5") {
        evolutionContainer1.style.display = "block";
        evolutionContainer2.style.display = "none";
        evolutionContainer3.style.display = "none";
        evolutionContainer4.style.display = "none";
    } else if (this.value === "2") {
        evolutionContainer1.style.display = "none";
        evolutionContainer2.style.display = "block";
        evolutionContainer3.style.display = "none";
        evolutionContainer4.style.display = "none";
    } else if (this.value === "3") {
        evolutionContainer1.style.display = "none";
        evolutionContainer2.style.display = "none";
        evolutionContainer3.style.display = "block";
        evolutionContainer4.style.display = "none";
    }else if (this.value === "4") {
        evolutionContainer1.style.display = "none";
        evolutionContainer2.style.display = "none";
        evolutionContainer3.style.display = "none";
        evolutionContainer4.style.display = "block";
    }
}

// Ajouter des écouteurs d'événements sur les options de température
temperatureOptions.forEach(option => {
    option.addEventListener("change", afficherAnimation);
});

// Exécuter la fonction initiale pour afficher l'animation par défaut
afficherAnimation.call(document.querySelector('.temperature-option input:checked'));
