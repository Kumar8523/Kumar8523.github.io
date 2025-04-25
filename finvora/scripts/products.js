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
      <div class="bg-white rounded-lg shadow overflow-hidden" data-category="${product.category}">
        <a href="product_info.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.name}" class="w-full h-48 object-cover">
        </a>
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
          <button onclick="addToCart(${product.id})" 
                  class="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition">
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
  }

  sortProducts(sortBy) {
    switch(sortBy) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        this.filteredProducts = [...this.products];
    }
  }

  showError() {
    const grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>পণ্য লোড করতে সমস্যা হয়েছে</p>
          <button onclick="location.reload()" class="mt-4 text-accent hover:underline">
            <i class="fas fa-sync-alt mr-1"></i> আবার চেষ্টা করুন
          </button>
        </div>
      `;
    }
  }
}

// Global function for add to cart
function addToCart(productId) {
  const productManager = new ProductManager();
  productManager.addToCart(productId);
}