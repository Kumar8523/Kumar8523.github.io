// main.js - Shared functionality across all pages

class App {
  constructor() {
    this.init();
  }

  init() {
    this.loadComponents();
    this.setupMobileMenu();
    this.updateActiveNavLink();
    this.updateCartCount();
  }

  loadComponents() {
    // Load navbar and footer
    this.loadComponent('navbar', 'navbar.html');
    this.loadComponent('footer', 'footer.html');
  }

  async loadComponent(id, file) {
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      const html = await response.text();
      document.getElementById(id).innerHTML = html;
      
      // Re-initialize event listeners after component loads
      if (id === 'navbar') {
        this.setupMobileMenu();
        this.updateActiveNavLink();
        this.updateCartCount();
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
      document.getElementById(id).innerHTML = `
        <div class="error bg-red-50 text-red-500 p-4 text-center">
          Failed to load ${file.split('/').pop()}
        </div>
      `;
    }
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', !mobileMenu.classList.contains('hidden'));
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
          mobileMenu.classList.add('hidden');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  updateActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPath = link.getAttribute('href');
      if (linkPath === currentPath) {
        link.classList.add('text-accent', 'font-bold');
        link.classList.remove('text-neutral', 'hover:text-primary');
      }
    });
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// Global function to show toast notifications
window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white flex items-center animate-fade-in`;
  
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
};

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  .animate-fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);
