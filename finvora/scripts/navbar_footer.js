// navbar_footer.js

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Active Link Styling
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('text-primary', 'font-medium');
    link.classList.remove('hover:text-primary');
  }
});

// Update Cart Count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
  });
}
updateCartCount();

// Mobile Menu Auto-Close on Outside Click
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    mobileMenu.classList.add('hidden');
  }
});