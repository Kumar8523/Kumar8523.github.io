document.addEventListener('DOMContentLoaded', () => {
  const productManager = new ProductManager();
  productManager.init();
});

class ProductManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
  }

  async init() {
    await this.loadProducts();
    this.renderProducts();
    this.setupEventListeners();
  }

  async loadProducts() {
    try {
      const response = await fetch('scripts/products.json');
      const data = await response.json();
      this.products = data.products;
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError();
    }
  }

  renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (this.filteredProducts.length === 0) {
      document.getElementById('emptyState').classList.remove('hidden');
      return;
    }

    document.getElementById('emptyState').classList.add('hidden');
    
    grid.innerHTML = this.filteredProducts.map(product => `
      <div class="bg-white rounded-lg shadow overflow-hidden product-card" data-id="${product.id}">
        <div class="relative">
          <a href="product_info.html?id=${product.id}" class="block">
            <img src="${product.images[0]}" alt="${product.name}" class="w-full h-48 object-cover">
          </a>
        </div>
        <div class="p-4">
          <a href="product_info.html?id=${product.id}" class="block">
            <h3 class="font-medium text-lg mb-2 text-primary hover:text-accent">${product.name}</h3>
          </a>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xl font-bold text-primary">৳${product.price.toFixed(2)}</span>
            <div class="text-yellow-400">
              ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
            </div>
          </div>
          <button class="add-to-cart w-full bg-primary text-white py-2 rounded hover:bg-secondary transition" 
                  data-id="${product.id}">
            <i class="fas fa-shopping-cart mr-2"></i> কার্টে যোগ করুন
          </button>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Search functionality
    document.getElementById('mainSearch')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(query)
      );
      this.renderProducts();
    });

    // Category filter
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
      const category = e.target.value;
      this.filteredProducts = category === 'all' 
        ? [...this.products] 
        : this.products.filter(product => product.category === category);
      this.renderProducts();
    });

    // Sort options
    document.getElementById('sortOptions')?.addEventListener('change', (e) => {
      const sortBy = e.target.value;
      this.sortProducts(sortBy);
      this.renderProducts();
    });

    // Add to cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart')) {
        const productId = e.target.closest('.add-to-cart').dataset.id;
        this.addToCart(productId);
      }
    });
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id == productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
      existingItem.quantity += 1;
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
    this.showCartNotification();
    this.updateCartCount();
  }

  showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce';
    notification.innerHTML = `
      <i class="fas fa-check-circle mr-2"></i>
      পণ্যটি কার্টে যোগ করা হয়েছে
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove('animate-bounce');
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
  }

  // বাকি মেথডগুলো একই থাকবে
}
