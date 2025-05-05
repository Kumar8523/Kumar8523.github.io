document.addEventListener('DOMContentLoaded', () => {
  new ProductDetail().init();
});

class ProductDetail {
  constructor() {
    this.productId = new URLSearchParams(window.location.search).get('id');
    this.product = null;
    this.products = []; // সমস্ত প্রোডাক্ট সংরক্ষণের জন্য
  }

  async init() {
    await this.loadProducts();
    this.renderProduct();
    this.setupEventListeners();
    this.setupTabs();
    this.renderReviews();
    this.renderRelatedProducts();
  }

  async loadProducts() {
    try {
      const response = await fetch('scripts/products.json');
      const data = await response.json();
      this.products = data.products;
      this.product = this.products.find(p => p.id == this.productId);
      if (!this.product) window.location.href = '/404.html';
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }

  renderProduct() {
    // মূল ছবি এবং থাম্বনেইল
    const mainImage = document.getElementById('mainImage');
    mainImage.src = this.product.images[0];
    
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    thumbnailContainer.innerHTML = this.product.images.map((img, index) => `
      <img src="${img}" class="w-full h-24 object-cover cursor-pointer border-2 
        ${index === 0 ? 'border-accent' : 'border-transparent'}" 
        onclick="document.getElementById('mainImage').src='${img}';
        this.parentElement.querySelectorAll('img').forEach(img => img.classList.replace('border-accent','border-transparent'));
        this.classList.replace('border-transparent','border-accent')">
    `).join('');

    // মূল তথ্য
    document.getElementById('productTitle').textContent = this.product.name;
    document.getElementById('productDescription').textContent = this.product.description;
    
    // মূল্য এবং ডিসকাউন্ট
    const discountedPrice = this.product.price * (1 - this.product.discount/100);
    document.getElementById('discountedPrice').textContent = `৳${discountedPrice.toFixed(2)}`;
    
    if(this.product.discount > 0) {
      document.getElementById('originalPrice').classList.remove('hidden');
      document.getElementById('originalPrice').textContent = `৳${this.product.price.toFixed(2)}`;
      document.getElementById('discountBadge').classList.remove('hidden');
      document.getElementById('discountBadge').textContent = `${this.product.discount}% ছাড়`;
    }

    // রেটিং
    document.querySelector('.review-star').innerHTML = 
      Array(5).fill().map((_,i) => `
        <i class="fas fa-star ${i < Math.round(this.product.rating) ? 'text-yellow-400' : 'text-gray-300'}"></i>
      `).join('');

    // স্পেসিফিকেশন
    if(this.product.specs) {
      document.getElementById('specsTab').innerHTML = `
        <div class="grid specs-grid gap-4">
          ${Object.entries(this.product.specs).map(([key, value]) => `
            <div class="bg-white p-4 rounded-lg shadow">
              <h4 class="font-medium text-primary">${key}</h4>
              <p class="text-neutral">${value}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  renderReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = this.product.reviews.map(review => `
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center mb-2">
          <div class="flex text-yellow-400">
            ${Array(5).fill().map((_,i) => `
              <i class="fas fa-star ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>
            `).join('')}
          </div>
          <span class="ml-2 text-sm text-neutral">${review.date}</span>
        </div>
        <p class="font-medium">${review.user}</p>
        <p class="text-neutral">${review.comment}</p>
      </div>
    `).join('');

    document.querySelector('button[data-tab="reviews"]').textContent = 
      `রিভিউ (${this.product.reviews.length})`;
  }

  renderRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    const relatedProducts = this.product.relatedProducts
      .map(id => this.products.find(p => p.id === id))
      .filter(p => p);

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

  setupTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(t => 
          t.classList.remove('active', 'border-accent', 'text-accent'));
        tab.classList.add('active', 'border-accent', 'text-accent');
        
        document.querySelectorAll('.tab-content').forEach(content => 
          content.classList.add('hidden'));
        document.getElementById(`${tab.textContent.trim().toLowerCase()}Tab`)
          .classList.remove('hidden');
      });
    });
  }

  setupEventListeners() {
    // শেয়ার বাটন
    document.querySelector('button[onclick="shareProduct()"]').addEventListener('click', () => {
      const shareData = {
        title: this.product.name,
        text: this.product.description,
        url: window.location.href
      };
      navigator.share(shareData).catch(console.error);
    });

    // রিভিউ ফর্ম
    document.getElementById('reviewForm').addEventListener('submit', e => {
      e.preventDefault();
      const rating = parseInt(document.getElementById('reviewRating').value);
      const comment = document.getElementById('reviewComment').value;
      
      this.product.reviews.push({
        user: "User",
        rating: rating,
        comment: comment,
        date: new Date().toISOString().split('T')[0]
      });
      
      this.renderReviews();
      e.target.reset();
      document.querySelectorAll('.rating-stars .fa-star').forEach(star => 
        star.classList.remove('text-yellow-400'));
    });

    // রেটিং স্টার
    document.querySelectorAll('.rating-stars .fa-star').forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        document.getElementById('reviewRating').value = rating;
        document.querySelectorAll('.rating-stars .fa-star').forEach((s, i) => 
          s.classList.toggle('text-yellow-400', i < rating));
      });
    });
  }

  addToCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === this.product.id);
    
    if(existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        id: this.product.id,
        name: this.product.name,
        price: this.product.price * (1 - this.product.discount/100),
        image: this.product.images[0],
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    this.showNotification('পণ্যটি কার্টে যোগ করা হয়েছে');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce';
    notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
}
