//-------- Caroussel d'image -----------------
var slideIndex = 0;
showSlides();

function showSlides() {
  var i;
  var slides = document.querySelectorAll('.carousel img');
  for (i = 0; i < slides.length; i++) {
    slides[i].style.opacity = 0;
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}
  slides[slideIndex-1].style.opacity = 0.5;
  setTimeout(showSlides, 5000); // Change l'image toutes les 2 secondes (2000ms)
}

function plusSlides(n) {
  showSlides(slideIndex += n);
}
//-------- Faire afficher le bon graphe selon le scénario choisi ----------

// Récupérer les éléments de l'animation container
const evolutionContainer1 = document.getElementById("evolution_container_1");
const evolutionContainer2 = document.getElementById("evolution_container_2");
const evolutionContainer3 = document.getElementById("evolution_container_3");
const evolutionContainer4 = document.getElementById("evolution_container_4");

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


// ------------------ Fait tourner les graphes -----------------
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll('.slide-container');
    const totalSlides = slides.length;
    let currentSlide = 0;
  
    // Fonction pour détecter si l'utilisateur a atteint une diapositive
    function scrollHandler() {
        const windowHeight  = window.innerHeight;
        const windowcenter = window.innerHeight/2;
        const slideBottom = slides[currentSlide].getBoundingClientRect().bottom;
        const slideTop = slides[currentSlide].getBoundingClientRect().top;
        const slideCenter = slideTop + slides[currentSlide].getBoundingClientRect().height / 2;
        
        // Augmente l'opacité quand on arrive dessus
        if(slideCenter >= windowHeight/2){
            var opacity = 1 - (slideTop / windowHeight);
        // Réduit l'opacité quand on repart
        }else if(slideCenter < windowHeight/2){
            var opacity = 0 + ((slideTop+slideBottom) / windowHeight);
        }
        opacity = Math.min(1, Math.max(0, opacity));
        slides[currentSlide].style.opacity = opacity; 

        // Passe à la slide suivante
        if (slideCenter < 0 ){
            if(currentSlide < totalSlides-1) {currentSlide ++;}
        // Revient à la slide précédente
        } else if (slideCenter > 0 ){
            if(currentSlide > 0) {currentSlide --;}
        }
    }
  
    // Écoute l'événement de défilement
    window.addEventListener('scroll', scrollHandler);
  });
  