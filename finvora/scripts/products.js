// products.js - Enhanced version
document.addEventListener('DOMContentLoaded', () => {
  const productManager = new ProductManager();
  productManager.init();
});

class ProductManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
  }

  async init() {
    await this.loadProducts();
    this.renderProducts();
    this.setupEventListeners();
    this.updateCartCount();
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

    grid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
  }

  createProductCard(product) {
    const hasDiscount = product.discount > 0;
    const discountedPrice = hasDiscount 
      ? (product.price * (1 - product.discount / 100)).toFixed(2)
      : product.price.toFixed(2);

    const stockStatus = this.getStockStatus(product.stock);

    return `
      <div class="product-card bg-white rounded-lg shadow overflow-hidden" 
           data-product-id="${product.id}" 
           data-category="${product.category}">
        <div class="relative">
          <a href="product_info.html?id=${product.id}">
            <img src="${product.images[0]}" alt="${product.name}"
                 class="w-full h-48 object-cover">
          </a>
          ${hasDiscount ? `
            <span class="price-badge absolute bg-accent text-white px-2 py-1 rounded text-sm font-bold">
              ${product.discount}% OFF
            </span>` : ''}
          ${stockStatus.badge ? `
            <span class="stock-badge absolute ${stockStatus.class} text-white px-2 py-1 rounded text-xs font-bold bottom-2 left-2">
              ${stockStatus.text}
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
              ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
              <span class="text-xs text-neutral ml-1">(${product.reviews?.length || 0})</span>
            </div>
          </div>
          <button onclick="productManager.addToCart(${product.id}, event)" 
                  class="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                  ${product.stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart mr-2"></i> ${product.stock > 0 ? 'কার্টে যোগ করুন' : 'স্টকে নেই'}
          </button>
        </div>
      </div>
    `;
  }

  getStockStatus(stock) {
    if (stock <= 0) {
      return {
        text: 'স্টকে নেই',
        class: 'bg-red-500',
        badge: true
      };
    } else if (stock < 5) {
      return {
        text: `শেষ ${stock} টি`,
        class: 'bg-yellow-500',
        badge: true
      };
    }
    return {
      text: '',
      class: '',
      badge: false
    };
  }

  addToCart(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    const product = this.products.find(p => p.id === productId);
    if (!product) {
      this.showPopup('পণ্যটি পাওয়া যায়নি', 'error');
      return;
    }

    if (product.stock <= 0) {
      this.showPopup('এই পণ্যটি স্টকে নেই', 'error');
      return;
    }

    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        this.showPopup(`সর্বোচ্চ ${product.stock} টি অর্ডার করা যাবে`, 'error');
        return;
      }
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: productId,
        name: product.name,
        price: product.discount > 0 ? 
          (product.price * (1 - product.discount/100)) : 
          product.price,
        image: product.images[0],
        maxStock: product.stock,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
    this.showPopup('পণ্যটি কার্টে যোগ করা হয়েছে', 'success');
  }

  showPopup(message, type = 'success') {
    const popup = document.createElement('div');
    popup.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
      bg-white shadow-xl rounded-lg p-6 z-50 max-w-sm w-full text-center animate-fade-in`;
    
    popup.innerHTML = `
      <div class="mb-4">
        <i class="fas ${type === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500'} text-4xl"></i>
      </div>
      <h3 class="text-lg font-medium mb-2">${message}</h3>
      <button onclick="this.parentElement.remove()" 
              class="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition">
        ঠিক আছে
      </button>
    `;

    document.body.appendChild(popup);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      popup.classList.add('animate-fade-out');
      setTimeout(() => popup.remove(), 300);
    }, 3000);
  }

  updateCartCount() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  setupEventListeners() {
    // Search and filter functionality
    document.getElementById('mainSearch')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(query)
      );
      this.renderProducts();
    });

    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
      const category = e.target.value;
      this.filteredProducts = category === 'all' 
        ? [...this.products] 
        : this.products.filter(product => product.category === category);
      this.renderProducts();
    });

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
        // Default sorting (original order)
        this.filteredProducts = [...this.products];
    }
  }

  showErrorState() {
    const grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>পণ্য লোড করতে সমস্যা হয়েছে</p>
          <button onclick="location.reload()" class="mt-4 text-accent hover:underline">
            <i class="fas fa-sync-alt mr-1"></i> আবার চেষ্টা করুন
          </button>
        </div>
      `;
    }
  }
}

// Global variable
const productManager = new ProductManager();

// Add animation styles
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
