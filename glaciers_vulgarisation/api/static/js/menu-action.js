
//-------- Faire afficher le bon graphe selon le scénario choisi ----------
const temperatureOptions = document.querySelectorAll(".temperature-option input[type='radio']");
const glaciers = ["mdg", "lasneous", "perito_moreno", "ross", "sturgel"];
const temperatures = ["1_5", "2", "3", "4"];


// Fonction pour afficher l'animation correspondante à l'option sélectionnée
function afficherAnimation() {
    const temperature = (parseFloat(this.value)!=1.5)?this.value:"1_5";
    glaciers.forEach(glacier => {
        temperatures.forEach(temp => {
            const containerId = `evolution_container_${glacier}_${temp}`;
            const container = document.getElementById(containerId);
            container.style.display = (temperature === temp) ? "block" : "none";
        });
    });
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


