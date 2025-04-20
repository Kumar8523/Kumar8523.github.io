// products.js - Updated with new theme and features

class ProductManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.renderProducts();
    this.setupEventListeners();
  }

  async loadProducts() {
    try {
      const response = await fetch('scripts/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      this.products = data.products;
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading products:', error);
      this.showErrorState();
    }
  }

  renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (this.filteredProducts.length === 0) {
      this.showEmptyState(true);
      return;
    }

    grid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
    this.showEmptyState(false);
  }

  createProductCard(product) {
    const hasDiscount = product.discount > 0;
    const discountedPrice = hasDiscount 
      ? (product.price * (1 - product.discount / 100)).toFixed(2)
      : product.price.toFixed(2);

    return `
      <div class="product-card bg-white rounded-lg shadow overflow-hidden" 
           data-product-id="${product.id}" 
           data-category="${product.category}"
           data-price="${product.price}"
           data-rating="${product.rating || 0}">
        <div class="relative">
          <a href="product_info.html?id=${product.id}">
            <img src="${product.images[0]}" alt="${product.name}"
                 class="w-full h-48 object-cover">
          </a>
          ${hasDiscount ? `
            <span class="price-badge absolute bg-accent text-white px-2 py-1 rounded text-sm font-bold">
              ${product.discount}% OFF
            </span>` : ''}
        </div>
        <div class="p-4">
          <a href="product_info.html?id=${product.id}" class="block">
            <h3 class="font-medium text-lg mb-2 text-primary hover:text-accent">${product.name}</h3>
          </a>
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="text-xl font-bold text-primary">৳${discountedPrice}</span>
              ${hasDiscount ? `
                <span class="text-sm text-neutral line-through ml-2">৳${product.price.toFixed(2)}</span>
              ` : ''}
            </div>
            <div class="flex items-center">
              <div class="text-yellow-400 mr-1">
                ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
              </div>
              <span class="text-xs text-neutral">(${product.reviews?.length || 0})</span>
            </div>
          </div>
          <button onclick="addToCart(${product.id})" 
                  class="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition">
            <i class="fas fa-shopping-cart mr-2"></i> কার্টে যোগ করুন
          </button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Search
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.filterProducts();
      });
    }

    // Category Filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.filterProducts();
      });
    }

    // Sort Options
    const sortOptions = document.getElementById('sortOptions');
    if (sortOptions) {
      sortOptions.addEventListener('change', () => {
        this.sortProducts();
        this.renderProducts();
      });
    }
  }

  filterProducts() {
    const searchTerm = document.getElementById('mainSearch')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';

    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                          product.description.toLowerCase().includes(searchTerm);
      const matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    this.sortProducts();
    this.renderProducts();
  }

  sortProducts() {
    const sortOption = document.getElementById('sortOptions')?.value || 'default';

    switch (sortOption) {
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
        // Default sorting (by ID or as they come)
        break;
    }
  }

  showEmptyState(show) {
    const grid = document.getElementById('productGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (show) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }
  }

  showErrorState() {
    const grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle"></i> পণ্য লোড করতে সমস্যা হয়েছে
        </div>`;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProductManager();
});

// Global function for adding to cart
window.addToCart = async (productId) => {
  try {
    // Implementation from previous version
    console.log(`Product ${productId} added to cart`);
    // Show toast notification
    showToast('পণ্য কার্টে যোগ করা হয়েছে', 'success');
  } catch (error) {
    console.error('Error adding to cart:', error);
    showToast('পণ্য যোগ করতে সমস্যা হয়েছে', 'error');
  }
};

function showToast(message, type = 'success') {
  // Toast implementation from previous version
}
