// navbar_footer.js - Fixed Mobile Menu

class NavbarFooter {
  constructor() {
    this.mobileMenuOpen = false;
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.updateActiveNavLink();
    this.updateCartCount();
    this.setupDropdowns();
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
      // Click handler for mobile menu button
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.mobileMenuOpen && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // Close menu when clicking on a link
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.closeMobileMenu());
      });
    }
  }

  toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
      this.mobileMenuOpen = !mobileMenu.classList.contains('hidden');
      
      // Update aria-expanded attribute
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', this.mobileMenuOpen);
      }
    }
  }

  closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.classList.add('hidden');
      this.mobileMenuOpen = false;
      
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  updateActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
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

  setupDropdowns() {
    // Setup any dropdown menus if needed
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = toggle.nextElementSibling;
        dropdown.classList.toggle('hidden');
      });
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NavbarFooter();
});

// Re-initialize when components are loaded dynamically
document.addEventListener('componentLoaded', () => {
  new NavbarFooter();
});
