document.addEventListener('DOMContentLoaded', () => {
  new ProductDetail().init();
});

class ProductDetail {
  constructor() {
    this.productId = new URLSearchParams(window.location.search).get('id');
    this.product = null;
  }

  async init() {
    await this.loadProduct();
    this.renderProduct();
    this.setupEventListeners();
  }

  async loadProduct() {
    try {
      const response = await fetch('scripts/products.json');
      this.product = (await response.json()).products.find(p => p.id == this.productId);
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }

  renderProduct() {
    const container = document.getElementById('productDetails');
    container.innerHTML = `
      <div>
        <h1 class="text-3xl font-light text-primary mb-2">${this.product.name}</h1>
        <div class="mb-4">
          <span class="text-3xl font-bold text-primary">৳${this.product.price.toFixed(2)}</span>
        </div>
        <button onclick="addToCart(${this.product.id})" class="w-full bg-primary text-white py-4 rounded hover:bg-secondary transition font-medium">
          <i class="fas fa-shopping-cart mr-2"></i> কার্টে যোগ করুন
        </button>
        <div class="mt-8">
          <h3 class="text-lg font-medium text-primary mb-4">বিবরণ</h3>
          <p class="text-neutral">${this.product.description}</p>
        </div>
      </div>
    `;

    this.renderRelatedProducts();
  }

  renderRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    const relatedProducts = this.product.relatedProducts.map(id => 
      this.products.find(p => p.id === id));
    
    container.innerHTML = relatedProducts.map(product => `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <a href="product_info.html?id=${product.id}">
          <img src="${product.images[0]}" class="w-full h-48 object-cover">
        </a>
        <div class="p-4">
          <h3 class="font-medium text-lg mb-2 text-primary">${product.name}</h3>
          <span class="text-xl font-bold text-primary">৳${product.price.toFixed(2)}</span>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    document.querySelector('button[onclick^="addToCart"]').addEventListener('click', () => {
      this.addToCart();
    });
  }

  addToCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0],
      quantity: 1
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    
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
