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

    const stockStatus = this.getStockStatus(product.stock);

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
              <div class="text-yellow-400 mr-1">
                ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
              </div>
              <span class="text-xs text-neutral">(${product.reviews?.length || 0})</span>
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
        text: `মাত্র ${stock} টি`,
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
      this.showToast('পণ্যটি পাওয়া যায়নি', 'error');
      return;
    }

    if (product.stock <= 0) {
      this.showToast('এই পণ্যটি স্টকে নেই', 'error');
      return;
    }

    const existingItem = this.cart.find(item => item.productId === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        this.showToast(`সর্বোচ্চ ${product.stock} টি অর্ডার করা যাবে`, 'error');
        return;
      }
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        productId,
        name: product.name,
        price: product.price,
        image: product.images[0],
        maxStock: product.stock,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
    this.showToast('পণ্যটি কার্টে যোগ করা হয়েছে', 'success');
  }

  showToast(message, type = 'success') {
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
  }

  // ... (rest of the methods remain the same)
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
