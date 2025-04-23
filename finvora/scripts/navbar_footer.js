// Navbar and Footer functionality with Cookie Consent
class NavbarFooter {
  constructor() {
    this.cookieConsentGiven = localStorage.getItem('cookieConsent') === 'true';
    this.userData = {};
    this.init();
  }

  init() {
    this.setupNavbar();
    this.setupFooter();
    this.setupMobileMenu();
    this.updateCartCount();
    
    if (!this.cookieConsentGiven) {
      this.showCookieConsent();
    } else {
      this.initializeUserTracking();
    }
  }

  setupNavbar() {
    // Active link styling
    const currentPath = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPath = link.getAttribute('href');
      if (linkPath === currentPath) {
        link.classList.add('text-accent', 'font-medium');
        link.classList.remove('hover:text-primary');
      }
    });

    // Search functionality
    const searchForms = document.querySelectorAll('form[data-role="navbar-search"]');
    searchForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[name="search"]');
        if (input.value.trim()) {
          window.location.href = `products.html?search=${encodeURIComponent(input.value.trim())}`;
        }
      });
    });
  }

  setupFooter() {
    // Footer year update
    const yearElements = document.querySelectorAll('[data-role="current-year"]');
    yearElements.forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 
          mobileMenu.classList.contains('hidden') ? 'false' : 'true');
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
          mobileMenu.classList.add('hidden');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
    });
  }

  showCookieConsent() {
    const consentHTML = `
      <div id="cookieConsent" class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div class="mb-4 md:mb-0 md:mr-6">
            <p class="text-sm">আমরা আপনার অভিজ্ঞতা উন্নত করতে কুকি ব্যবহার করি। এই ওয়েবসাইট ব্যবহার করে আপনি আমাদের <a href="/privacy" class="text-accent underline">গোপনীয়তা নীতি</a> এবং <a href="/cookies" class="text-accent underline">কুকি নীতি</a>তে সম্মত হন।</p>
          </div>
          <div class="flex space-x-3">
            <button id="cookieAccept" class="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded">
              গ্রহণ করুন
            </button>
            <button id="cookieReject" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
              প্রত্যাখ্যান করুন
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', consentHTML);
    
    document.getElementById('cookieAccept').addEventListener('click', () => {
      this.handleCookieConsent(true);
    });
    
    document.getElementById('cookieReject').addEventListener('click', () => {
      this.handleCookieConsent(false);
    });
  }

  handleCookieConsent(accepted) {
    localStorage.setItem('cookieConsent', accepted.toString());
    document.getElementById('cookieConsent').remove();
    
    if (accepted) {
      this.initializeUserTracking();
      this.showThankYouMessage();
    }
  }

  showThankYouMessage() {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-check-circle mr-2"></i>
        <span>কুকি সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  async initializeUserTracking() {
    try {
      // Collect basic user data
      this.userData = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
        localStorageAvailable: typeof localStorage !== 'undefined'
      };

      // Get IP and location data
      await this.fetchIPData();
      
      // Send data to server
      await this.sendUserData();
      
      // Initialize analytics
      this.initializeAnalytics();
    } catch (error) {
      console.error('User tracking initialization failed:', error);
    }
  }

  async fetchIPData() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        this.userData.ipData = {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          isp: data.org,
          postal: data.postal,
          latitude: data.latitude,
          longitude: data.longitude
        };
      }
    } catch (error) {
      console.error('Failed to fetch IP data:', error);
    }
  }

  async sendUserData() {
    try {
      // In a real implementation, you would send this to your backend
      console.log('Collected user data:', this.userData);
      
      // Example: Send to a mock API endpoint
      await fetch('https://api.finvora.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.userData)
      });
    } catch (error) {
      console.error('Failed to send user data:', error);
    }
  }

  initializeAnalytics() {
    // Track page views
    this.trackPageView();
    
    // Track interactions
    this.setupInteractionTracking();
  }

  trackPageView() {
    const pageData = {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      timestamp: new Date().toISOString()
    };
    
    console.log('Page view:', pageData);
    // In real implementation, send to analytics service
  }

  setupInteractionTracking() {
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [data-track]');
      if (target) {
        const eventData = {
          type: 'click',
          element: target.tagName,
          id: target.id || null,
          class: target.className || null,
          text: target.textContent.trim().slice(0, 50),
          href: target.href || null,
          timestamp: new Date().toISOString()
        };
        console.log('User interaction:', eventData);
        // Send to analytics service
      }
    });

    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        const formData = {
          type: 'form_submit',
          formId: form.id || null,
          formClass: form.className || null,
          inputs: Array.from(form.elements).filter(el => el.name).map(el => ({
            name: el.name,
            type: el.type,
            value: el.value ? el.value.slice(0, 100) : null
          })),
          timestamp: new Date().toISOString()
        };
        console.log('Form submission:', formData);
        // Send to analytics service
      });
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NavbarFooter();
});
