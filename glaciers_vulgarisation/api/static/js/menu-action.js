
//-------- Faire afficher le bon graphe selon le scénario choisi ----------

// Récupérer les éléments de l'animation container
const evolutionContainer11 = document.getElementById("evolution_container_11");
const evolutionContainer12 = document.getElementById("evolution_container_12");
const evolutionContainer13 = document.getElementById("evolution_container_13");
const evolutionContainer14 = document.getElementById("evolution_container_14");

const evolutionContainer21 = document.getElementById("evolution_container_21");
const evolutionContainer22 = document.getElementById("evolution_container_22");
const evolutionContainer23 = document.getElementById("evolution_container_23");
const evolutionContainer24 = document.getElementById("evolution_container_24");

const evolutionContainer31 = document.getElementById("evolution_container_31");
const evolutionContainer32 = document.getElementById("evolution_container_32");
const evolutionContainer33 = document.getElementById("evolution_container_33");
const evolutionContainer34 = document.getElementById("evolution_container_34");

// Récupérer les éléments d'options de température
const temperatureOptions = document.querySelectorAll(".temperature-option input[type='radio']");

// Fonction pour afficher l'animation correspondante à l'option sélectionnée
function afficherAnimation() {
    if (this.value === "1.5") {
        evolutionContainer11.style.display = "block";
        evolutionContainer21.style.display = "block";
        evolutionContainer31.style.display = "block";

        evolutionContainer12.style.display = "none";
        evolutionContainer22.style.display = "none";
        evolutionContainer32.style.display = "none";

        evolutionContainer13.style.display = "none";
        evolutionContainer23.style.display = "none";
        evolutionContainer33.style.display = "none";

        evolutionContainer14.style.display = "none";
        evolutionContainer24.style.display = "none";
        evolutionContainer34.style.display = "none";
    } else if (this.value === "2") {
        evolutionContainer11.style.display = "none";
        evolutionContainer21.style.display = "none";
        evolutionContainer31.style.display = "none";

        evolutionContainer12.style.display = "block";
        evolutionContainer22.style.display = "block";
        evolutionContainer32.style.display = "block";

        evolutionContainer13.style.display = "none";
        evolutionContainer23.style.display = "none";
        evolutionContainer33.style.display = "none";

        evolutionContainer14.style.display = "none";
        evolutionContainer24.style.display = "none";
        evolutionContainer34.style.display = "none";
    } else if (this.value === "3") {
      volutionContainer11.style.display = "none";
        evolutionContainer21.style.display = "none";
        evolutionContainer31.style.display = "none";

        evolutionContainer12.style.display = "none";
        evolutionContainer22.style.display = "none";
        evolutionContainer32.style.display = "none";

        evolutionContainer13.style.display = "block";
        evolutionContainer23.style.display = "block";
        evolutionContainer33.style.display = "block";

        evolutionContainer14.style.display = "none";
        evolutionContainer24.style.display = "none";
        evolutionContainer34.style.display = "none";
    }else if (this.value === "4") {
      volutionContainer11.style.display = "none";
        evolutionContainer21.style.display = "none";
        evolutionContainer31.style.display = "none";

        evolutionContainer12.style.display = "none";
        evolutionContainer22.style.display = "none";
        evolutionContainer32.style.display = "none";

        evolutionContainer13.style.display = "none";
        evolutionContainer23.style.display = "none";
        evolutionContainer33.style.display = "none";

        evolutionContainer14.style.display = "block";
        evolutionContainer24.style.display = "block";
        evolutionContainer34.style.display = "block";
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


