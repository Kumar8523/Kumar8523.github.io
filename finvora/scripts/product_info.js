// product_info.js - Enhanced version
document.addEventListener('DOMContentLoaded', () => {
  const productDetail = new ProductDetail();
  productDetail.init();
});

class ProductDetail {
  constructor() {
    this.productId = null;
    this.productData = null;
    this.relatedProducts = [];
    this.currentTab = 'description';
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
  }

  async init() {
    this.getProductIdFromURL();
    await this.loadProductData();
    if (this.productData) {
      this.renderProductDetails();
      this.setupEventListeners();
      this.setupReviewForm();
    }
  }

  getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.productId = parseInt(urlParams.get('id'));
  }

  async loadProductData() {
    try {
      const response = await fetch('scripts/products.json');
      const data = await response.json();
      
      this.productData = data.products.find(p => p.id === this.productId);
      if (!this.productData) {
        this.showError('পণ্য পাওয়া যায়নি');
        return;
      }

      // Load related products
      if (this.productData.relatedProducts) {
        this.relatedProducts = data.products.filter(p => 
          this.productData.relatedProducts.includes(p.id) && p.id !== this.productId
        ).slice(0, 4);
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      this.showError('পণ্য লোড করতে সমস্যা হয়েছে');
    }
  }

  renderProductDetails() {
    // Basic Info
    document.getElementById('productTitle').textContent = this.productData.name;
    
    // Price
    const hasDiscount = this.productData.discount > 0;
    const discountedPrice = hasDiscount 
      ? (this.productData.price * (1 - this.productData.discount / 100)).toFixed(2)
      : this.productData.price.toFixed(2);
    
    document.getElementById('discountedPrice').textContent = `৳${discountedPrice}`;
    
    if (hasDiscount) {
      document.getElementById('originalPrice').textContent = `৳${this.productData.price.toFixed(2)}`;
      document.getElementById('originalPrice').classList.remove('hidden');
      document.getElementById('discountBadge').textContent = `${this.productData.discount}% ছাড়`;
      document.getElementById('discountBadge').classList.remove('hidden');
    }

    // Stock Status
    const stockStatus = document.getElementById('stockStatus');
    if (this.productData.stock > 0) {
      stockStatus.innerHTML = `
        <i class="fas fa-check-circle mr-1"></i> 
        ${this.productData.stock < 5 ? 
          `শেষ ${this.productData.stock} টি` : 
          'স্টকে আছে'}
      `;
      stockStatus.className = this.productData.stock < 5 ? 
        'text-yellow-600 font-medium' : 'text-green-600 font-medium';
    } else {
      stockStatus.innerHTML = '<i class="fas fa-times-circle mr-1"></i> স্টকে নেই';
      stockStatus.className = 'text-red-600 font-medium';
    }

    // Rating
    const rating = Math.round(this.productData.rating || 0);
    const ratingStars = document.querySelector('.review-star');
    if (ratingStars) {
      ratingStars.innerHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }
    document.getElementById('reviewCount').textContent = 
      `(${this.productData.reviews?.length || 0} রিভিউ)`;

    // Images
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    
    if (this.productData.images?.length > 0) {
      mainImage.src = this.productData.images[0];
      thumbnailContainer.innerHTML = this.productData.images.map((img, idx) => `
        <div class="image-gallery-thumbnail ${idx === 0 ? 'active' : ''}" 
             onclick="productDetail.changeMainImage('${img}', this)">
          <img src="${img}" class="w-full h-20 object-cover" alt="Thumbnail ${idx + 1}">
        </div>
      `).join('');
    }

    // Description
    document.getElementById('productDescription').textContent = 
      this.productData.description || 'কোনো বিবরণ পাওয়া যায়নি';

    // Specifications
    const specsContainer = document.getElementById('specsTab');
    if (this.productData.specs) {
      specsContainer.innerHTML = `
        <div class="grid specs-grid gap-4">
          ${Object.entries(this.productData.specs).map(([key, value]) => `
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-neutral">${key}</h4>
              <p class="text-primary">${value}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Reviews
    this.renderReviews();

    // Related Products
    this.renderRelatedProducts();
  }

  renderReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;

    if (!this.productData.reviews || this.productData.reviews.length === 0) {
      reviewsContainer.innerHTML = `
        <div class="text-center py-8 text-neutral">
          <i class="fas fa-comment-slash text-3xl mb-2"></i>
          <p>এই পণ্যের জন্য কোনো রিভিউ নেই</p>
        </div>
      `;
      return;
    }

    reviewsContainer.innerHTML = this.productData.reviews.map(review => `
      <div class="border-b pb-6">
        <div class="flex items-center mb-2">
          <div class="text-yellow-400 mr-2">
            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
          </div>
          <span class="font-medium">${review.user}</span>
          ${review.verified ? `
            <span class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              <i class="fas fa-check-circle mr-1"></i> যাচাইকৃত
            </span>
          ` : ''}
        </div>
        <p class="text-neutral mb-2">${review.comment}</p>
        <p class="text-sm text-gray-500">${review.date || ''}</p>
      </div>
    `).join('');
  }

  renderRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    if (!container || this.relatedProducts.length === 0) return;

    container.innerHTML = this.relatedProducts.map(product => `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <a href="product_info.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.name}"
               class="w-full h-40 object-cover">
        </a>
        <div class="p-4">
          <a href="product_info.html?id=${product.id}" class="block">
            <h3 class="font-medium text-primary hover:text-accent">${product.name}</h3>
          </a>
          <div class="flex justify-between items-center mt-2">
            <span class="font-bold text-primary">৳${product.price.toFixed(2)}</span>
            <div class="text-yellow-400">
              ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.textContent.trim().toLowerCase().replace(' ', '') + 'Tab';
        this.switchTab(tabId, btn);
      });
    });

    // Image thumbnail click
    document.querySelectorAll('.image-gallery-thumbnail').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        const imgSrc = thumb.querySelector('img').src;
        this.changeMainImage(imgSrc, thumb);
      });
    });
  }

  setupReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    // Star rating selection
    const stars = form.querySelectorAll('.rating-stars i');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.setRating(stars, rating);
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitReview();
    });
  }

  setRating(stars, rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('text-yellow-400');
        star.classList.remove('text-gray-300');
      } else {
        star.classList.add('text-gray-300');
        star.classList.remove('text-yellow-400');
      }
    });
    document.getElementById('reviewRating').value = rating;
  }

  async submitReview() {
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();

    if (!rating || rating < 1) {
      this.showPopup('অনুগ্রহ করে রেটিং দিন', 'error');
      return;
    }

    if (!comment) {
      this.showPopup('অনুগ্রহ করে মন্তব্য লিখুন', 'error');
      return;
    }

    try {
      // In a real app, this would submit to your backend/Google Sheets
      const newReview = {
        user: 'আপনি', // Would be actual user name in real app
        rating: parseInt(rating),
        comment,
        date: new Date().toLocaleDateString('bn-BD'),
        verified: false
      };

      // Simulate submission (in real app, use fetch to your backend)
      this.showPopup('রিভিউ জমা দেওয়া হয়েছে', 'success');
      
      // Add to local reviews (temporary, until page refresh)
      if (!this.productData.reviews) this.productData.reviews = [];
      this.productData.reviews.unshift(newReview);
      this.renderReviews();

      // Reset form
      document.getElementById('reviewForm').reset();
      this.setRating(document.querySelectorAll('.rating-stars i'), 0);
    } catch (error) {
      console.error('Error submitting review:', error);
      this.showPopup('রিভিউ জমা দিতে সমস্যা হয়েছে', 'error');
    }
  }

  changeMainImage(imgSrc, thumbnail) {
    document.getElementById('mainImage').src = imgSrc;
    document.querySelectorAll('.image-gallery-thumbnail').forEach(t => {
      t.classList.remove('active');
    });
    thumbnail.classList.add('active');
  }

  switchTab(tabId, button) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
      tab.classList.remove('active');
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active', 'text-accent', 'border-accent');
      btn.classList.add('text-neutral', 'border-transparent');
    });

    // Show selected tab
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById(tabId).classList.add('active');

    // Activate selected button
    button.classList.add('active', 'text-accent', 'border-accent');
    button.classList.remove('text-neutral', 'border-transparent');
  }

  addToCart() {
    if (!this.productData) return;

    if (this.productData.stock <= 0) {
      this.showPopup('এই পণ্যটি স্টকে নেই', 'error');
      return;
    }

    const existingItem = this.cart.find(item => item.id === this.productId);
    
    if (existingItem) {
      if (existingItem.quantity >= this.productData.stock) {
        this.showPopup(`সর্বোচ্চ ${this.productData.stock} টি অর্ডার করা যাবে`, 'error');
        return;
      }
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: this.productId,
        name: this.productData.name,
        price: this.productData.discount > 0 ? 
          (this.productData.price * (1 - this.productData.discount/100)) : 
          this.productData.price,
        image: this.productData.images[0],
        maxStock: this.productData.stock,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.showPopup('পণ্যটি কার্টে যোগ করা হয়েছে', 'success');
    this.updateCartCount();
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

  showError(message) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <h2 class="text-xl font-medium mb-2">${message}</h2>
          <a href="products.html" class="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition mt-4">
            পণ্য ব্রাউজ করুন
          </a>
        </div>
      `;
    }
  }
}

// Global variable
const productDetail = new ProductDetail();

// Functions for inline onclick handlers
function addToCart() {
  productDetail.addToCart();
}

function shareProduct() {
  if (navigator.share) {
    navigator.share({
      title: productDetail.productData.name,
      text: productDetail.productData.description.substring(0, 100),
      url: window.location.href
    }).catch(err => {
      productDetail.showPopup('শেয়ার করতে সমস্যা হয়েছে', 'error');
    });
  } else {
    // Fallback for browsers without Web Share API
    const shareUrl = `whatsapp://send?text=${encodeURIComponent(
      `${productDetail.productData.name} - ${window.location.href}`
    )}`;
    window.open(shareUrl, '_blank');
  }
}

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
