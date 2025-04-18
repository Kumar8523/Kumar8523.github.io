// navbar_footer.js


// Initialize when navbar elements are available
(function initNavbarFooter() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  // If elements not yet in DOM, retry shortly
  if (!mobileMenuBtn || !mobileMenu) {
    return setTimeout(initNavbarFooter, 100);
  }

  // Mobile Menu Toggle
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('hidden');
  });

  // Active Link Styling
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('text-primary', 'font-medium');
      link.classList.remove('hover:text-primary');
    }
  });

  // Update Cart Count Badge
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
    });
  }
  updateCartCount();

  // Mobile Menu Auto-Close on Outside Click
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mobileMenu.classList.add('hidden');
    }
  });
})();
