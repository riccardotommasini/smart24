
//-------- Faire afficher le bon graphe selon le scénario choisi ----------

// Récupérer les éléments de l'animation container
const evolutionContainer1 = document.getElementById("evolutionContainer1");
const evolutionContainer2 = document.getElementById("evolutionContainer2");
const evolutionContainer3 = document.getElementById("evolutionContainer3");
const evolutionContainer4 = document.getElementById("evolutionContainer4");

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


// ----------------- Met en évident la partie actuelle dans le menu -----------

let mainNavLinks = document.querySelectorAll("nav ul li a");
let mainSections = document.querySelectorAll("main section");

let lastId;
let cur = [];

window.addEventListener("scroll", event => {
  let fromTop = window.scrollY;

  mainNavLinks.forEach(link => {
    let section = document.querySelector(link.hash);

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      link.classList.add("current");
    } else {
      link.classList.remove("current");
    }
  });
});


