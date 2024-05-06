//-------- Carousel d'image -----------------
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