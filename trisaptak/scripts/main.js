// Main JavaScript file for additional functionality

// Animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll) if needed
    // This is just a placeholder - you would need to include AOS library
    // AOS.init();
    
    // Add any additional JavaScript functionality here
    
    // Example: Play audio on click
    document.querySelectorAll('.play-audio').forEach(button => {
        button.addEventListener('click', function() {
            const audioId = this.getAttribute('data-audio');
            const audio = document.getElementById(audioId);
            if (audio) {
                audio.play();
            }
        });
    });
    
    // Example: Lazy loading for images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img.lazy');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Sticky navbar on scroll
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('shadow-lg', 'bg-white/90', 'backdrop-blur-sm');
    } else {
        navbar.classList.remove('shadow-lg', 'bg-white/90', 'backdrop-blur-sm');
    }
});
