document.addEventListener('DOMContentLoaded', () => {
  new ProductManager().init();
});

class ProductManager {
  constructor() {
    this.products = [];
  }

  async init() {
    await this.loadProducts();
    this.renderProducts();
    this.setupEventListeners();
  }

  async loadProducts() {
    try {
      const response = await fetch('scripts/products.json');
      this.products = (await response.json()).products;
      this.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = this.products.map(product => `
      <div class="bg-white rounded-lg shadow overflow-hidden product-card">
        <a href="product_info.html?id=${product.id}" class="block">
          <img src="${product.images[0]}" alt="${product.name}" class="w-full h-48 object-cover">
        </a>
        <div class="p-4">
          <a href="product_info.html?id=${product.id}" class="block">
            <h3 class="font-medium text-lg mb-2 text-primary">${product.name}</h3>
          </a>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xl font-bold text-primary">৳${product.price.toFixed(2)}</span>
          </div>
          <button onclick="addToCart(${product.id})" class="add-to-cart w-full bg-primary text-white py-2 rounded hover:bg-secondary transition">
            <i class="fas fa-shopping-cart mr-2"></i> কার্টে যোগ করুন
          </button>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart')) {
        const productId = e.target.closest('.add-to-cart').getAttribute('onclick').match(/\d+/)[0];
        this.addToCart(productId);
      }
    });
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id == productId);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id == productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.showNotification();
  }

  showNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce';
    notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> পণ্যটি কার্টে যোগ করা হয়েছে`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
}

window.addToCart = function(productId) {
  new ProductManager().addToCart(productId);
};
