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
        
        let opacity;
        
        // Calcule l'opacité en fonction de la position de la diapositive par rapport à la fenêtre
        if (slideTop > 0.80*windowHeight || slideBottom < 0.15*windowHeight) {
           opacity = 0;
        } else if (slideBottom < windowHeight && slideBottom > 0.90*windowHeight) {
            opacity = 1;
        } else {
            opacity = -7 * (slideCenter/windowHeight-0.1) * (slideCenter/windowHeight-0.9);
            opacity = Math.min(1, Math.max(0, opacity));
        }
        slides[currentSlide].style.opacity = opacity; 
        console.log("currentSlide", currentSlide, "windowHeight", windowHeight, "\nwindowcenter", windowcenter, "\nslideBottom", slideBottom, "\nslideCenter", slideCenter, "\nslideTop", slideTop)

        // Passe à la slide suivante
        if (opacity==0 && slideCenter<windowcenter ){
            if(currentSlide < totalSlides-1) {currentSlide ++;}
        // Revient à la slide précédente
        } else if (opacity==0 && slideCenter>windowcenter){
            if(currentSlide > 0) {currentSlide --;}
        }
    }
  
    // Écoute l'événement de défilement
    window.addEventListener('scroll', scrollHandler);
});
