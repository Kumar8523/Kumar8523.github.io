// cart.js - Cart Page Functionality

class CartManager {
  constructor() {
    this.cart = [];
    this.init();
  }

  init() {
    this.loadCart();
    this.renderCartItems();
    this.setupEventListeners();
  }

  loadCart() {
    const cartData = localStorage.getItem('cart');
    this.cart = cartData ? JSON.parse(cartData) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
  }

  renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-shopping-cart text-4xl text-neutral mb-4"></i>
          <h3 class="text-xl font-medium text-primary mb-2">আপনার কার্ট খালি</h3>
          <p class="text-neutral mb-4">আপনার কার্টে কোনো পণ্য নেই</p>
          <a href="products.html" class="inline-block bg-primary text-white px-6 py-3 rounded hover:bg-secondary transition">
            পণ্য ব্রাউজ করুন
          </a>
        </div>
      `;
      checkoutBtn.disabled = true;
      this.updateOrderSummary();
      return;
    }

    cartItemsContainer.innerHTML = this.cart.map((item, index) => `
      <div class="cart-item flex flex-col sm:flex-row gap-4 border-b pb-6" data-id="${item.id}">
        <a href="product_info.html?id=${item.id}" class="flex-shrink-0">
          <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded">
        </a>
        <div class="flex-1">
          <div class="flex justify-between">
            <a href="product_info.html?id=${item.id}" class="font-medium text-primary hover:text-accent">${item.name}</a>
            <span class="font-bold">৳${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center border rounded-lg overflow-hidden">
              <button class="quantity-btn bg-gray-100 hover:bg-gray-200" onclick="updateQuantity(${index}, -1)">
                <i class="fas fa-minus"></i>
              </button>
              <input type="number" value="${item.quantity}" min="1" 
                     class="w-12 text-center border-t-0 border-b-0" 
                     onchange="updateQuantity(${index}, 0, this.value)">
              <button class="quantity-btn bg-gray-100 hover:bg-gray-200" onclick="updateQuantity(${index}, 1)">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button onclick="removeItem(${index})" class="text-red-500 hover:text-red-700">
              <i class="fas fa-trash"></i> মুছুন
            </button>
          </div>
        </div>
      </div>
    `).join('');

    checkoutBtn.disabled = false;
    this.updateOrderSummary();
  }

  updateOrderSummary() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = 150; // Default delivery charge
    const grandTotal = subtotal + deliveryCharge;

    document.getElementById('subtotal').textContent = `৳${subtotal.toFixed(2)}`;
    document.getElementById('deliveryCharge').textContent = `৳${deliveryCharge.toFixed(2)}`;
    document.getElementById('grandTotal').textContent = `৳${grandTotal.toFixed(2)}`;
  }

  setupEventListeners() {
    // Checkout button
    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      // Save cart data to session storage for checkout page
      sessionStorage.setItem('checkoutData', JSON.stringify({
        cart: this.cart,
        subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryCharge: 150,
        grandTotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 150
      }));
    });
  }

  updateCartCount() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
}

// Global functions
window.updateQuantity = function(index, change, newValue) {
  const cartManager = new CartManager();
  if (newValue) {
    cartManager.cart[index].quantity = parseInt(newValue) || 1;
  } else {
    cartManager.cart[index].quantity += change;
    if (cartManager.cart[index].quantity < 1) cartManager.cart[index].quantity = 1;
  }
  cartManager.saveCart();
  cartManager.renderCartItems();
};

window.removeItem = function(index) {
  const cartManager = new CartManager();
  cartManager.cart.splice(index, 1);
  cartManager.saveCart();
  cartManager.renderCartItems();
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CartManager();
});
