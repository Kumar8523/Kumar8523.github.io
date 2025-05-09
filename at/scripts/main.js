/**
 * Handles form submissions to Google Sheets
 * @param {string} formId - ID of the form element
 * @param {string} type - Type of form ('order', 'contact', 'review')
 * @param {function} callback - Callback function after successful submission
 */
function submitFormToGoogleSheets(formId, type, callback) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = { type: type };
    
    // Convert FormData to object
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    // For order forms, include cart items
    if (type === 'order') {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      data.items = cart;
    }
    
    // Replace with your Google Apps Script web app URL
    const scriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
    
    fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        if (type === 'order') {
          // Clear cart after successful order
          localStorage.setItem('cart', JSON.stringify([]));
          updateCartCount();
        }
        if (callback) callback(result);
      } else {
        alert('Error: ' + result.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    });
  });
}

/**
 * Displays a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', 'info')
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-md text-white ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-primary'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Toggles mobile menu
 */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Update cart count on page load
  updateCartCount();
  
  // Initialize mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.getElementById('mobileMenuBtn');
    
    if (mobileMenu && !mobileMenu.contains(e.target) && 
        menuBtn && !menuBtn.contains(e.target) && 
        !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }
  });
});

/**
 * Updates cart count in the navbar
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  document.querySelectorAll('.cart-count').forEach(element => {
    element.textContent = totalItems;
  });
}
