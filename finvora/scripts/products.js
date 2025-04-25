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

  // বাকি মেথডগুলো একই থাকবে
}

// কার্টে প্রোডাক্ট যোগ করার ফাংশন
function addToCart(productId) {
  const productManager = new ProductManager();
  const product = productManager.products.find(p => p.id == productId);
  
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.id === productId);
  
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
  
  // Show success message
  const popup = document.createElement('div');
  popup.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
  popup.innerHTML = `
    <i class="fas fa-check-circle mr-2"></i>
    পণ্যটি কার্টে যোগ করা হয়েছে
  `;
  document.body.appendChild(popup);
  
  setTimeout(() => popup.remove(), 3000);
}
