// product_info.js - Updated with new theme and features

class ProductDetail {
  constructor() {
    this.productId = null;
    this.productData = null;
    this.relatedProducts = [];
    this.currentTab = 'description';
    this.init();
  }

  async init() {
    this.getProductIdFromURL();
    await this.loadProductData();
    this.renderProductDetails();
    this.setupEventListeners();
  }

  getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.productId = parseInt(urlParams.get('id'));
    if (!this.productId) {
      this.showErrorState('অবৈধ পণ্য আইডি');
    }
  }

  async loadProductData() {
    try {
      const response = await fetch('scripts/products.json');
      if (!response.ok) throw new Error('Failed to load product data');
      const data = await response.json();
      
      this.productData = data.products.find(p => p.id === this.productId);
      if (!this.productData) {
        this.showErrorState('পণ্য পাওয়া যায়নি');
        return;
      }

      // Load related products
      if (this.productData.relatedProducts && this.productData.relatedProducts.length > 0) {
        this.relatedProducts = data.products.filter(p => 
          this.productData.relatedProducts.includes(p.id)
        );
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      this.showErrorState('পণ্য লোড করতে সমস্যা হয়েছে');
    }
  }

  renderProductDetails() {
    if (!this.productData) return;

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
      stockStatus.innerHTML = `<i class="fas fa-check-circle mr-1"></i> স্টকে আছে (${this.productData.stock} পিস)`;
      stockStatus.className = 'text-green-600 font-medium';
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
    
    if (this.productData.images && this.productData.images.length > 0) {
      mainImage.src = this.productData.images[0];
      thumbnailContainer.innerHTML = this.productData.images.map((img, idx) => `
        <div class="image-gallery-thumbnail ${idx === 0 ? 'active' : ''}" 
             onclick="changeMainImage('${img}')">
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
          <div class="flex text-yellow-400 mr-2">
            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
          </div>
          <span class="font-medium">${review.user.name}</span>
          ${review.user.verified ? `
            <span class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              <i class="fas fa-check-circle mr-1"></i> যাচাইকৃত ক্রেতা
            </span>` : ''}
        </div>
        <p class="text-neutral mt-2">${review.comment}</p>
        ${review.date ? `
          <div class="text-xs text-gray-400 mt-2">
            ${new Date(review.date).toLocaleDateString('bn-BD')}
          </div>` : ''}
      </div>
    `).join('');
  }

  renderRelatedProducts() {
    if (this.relatedProducts.length === 0) return;

    const container = document.getElementById('relatedProducts');
    container.innerHTML = this.relatedProducts.map(product => `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <a href="product_info.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.name}" 
               class="w-full h-48 object-cover">
        </a>
        <div class="p-4">
          <a href="product_info.html?id=${product.id}" class="block">
            <h3 class="font-medium text-lg mb-2 text-primary hover:text-accent">${product.name}</h3>
          </a>
          <div class="flex items-center justify-between">
            <span class="text-xl font-bold text-primary">৳${product.price.toFixed(2)}</span>
            <div class="flex items-center">
              <div class="text-yellow-400 mr-1">
                ${'★'.repeat(Math.round(product.rating || 0))}
              </div>
              <span class="text-xs text-neutral">(${product.reviews?.length || 0})</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Tab Switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        this.switchTab(button.textContent.trim());
      });
    });

    // Rating Stars
    document.querySelectorAll('.rating-stars i').forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.setRating(rating);
      });
    });

    // Review Form Submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitReview();
      });
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName.toLowerCase();
    
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(button => {
      if (button.textContent.trim().toLowerCase() === this.currentTab) {
        button.classList.add('border-accent', 'text-accent');
        button.classList.remove('border-transparent', 'text-neutral');
      } else {
        button.classList.remove('border-accent', 'text-accent');
        button.classList.add('border-transparent', 'text-neutral');
      }
    });

    // Show active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    document.getElementById(`${this.currentTab}Tab`).classList.remove('hidden');
  }

  setRating(rating) {
    document.getElementById('reviewRating').value = rating;
    const stars = document.querySelectorAll('.rating-stars i');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('text-yellow-400');
        star.classList.remove('text-gray-300');
      } else {
        star.classList.remove('text-yellow-400');
        star.classList.add('text-gray-300');
      }
    });
  }

  submitReview() {
    const rating = parseInt(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value.trim();

    if (rating === 0) {
      alert('দয়া করে রেটিং প্রদান করুন');
      return;
    }

    if (!comment) {
      alert('দয়া করে আপনার মন্তব্য লিখুন');
      return;
    }

    // In a real app, you would send this to your backend
    console.log('Review submitted:', { rating, comment });
    alert('আপনার রিভিউ জমা দেওয়া হয়েছে! ধন্যবাদ।');
    document.getElementById('reviewForm').reset();
    this.setRating(0);
  }

  showErrorState(message) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="col-span-full text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-4"></i>
          <h2 class="text-xl font-medium">${message}</h2>
          <p class="mt-2">দয়া করে <a href="products.html" class="text-accent hover:underline">পণ্য পেজ</a> এ ফিরে যান</p>
        </div>
      `;
    }
  }
}

// Global functions
window.changeMainImage = function(src) {
  document.getElementById('mainImage').src = src;
  document.querySelectorAll('.image-gallery-thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
};

window.addToCart = function() {
  // Implementation from products.js
  showToast('পণ্য কার্টে যোগ করা হয়েছে', 'success');
};

window.shareProduct = function() {
  if (navigator.share) {
    navigator.share({
      title: document.getElementById('productTitle').textContent,
      text: 'Finvora থেকে এই পণ্যটি দেখুন',
      url: window.location.href
    }).catch(err => {
      console.log('Error sharing:', err);
    });
  } else {
    // Fallback for browsers that don't support Web Share API
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('লিংক কপি করা হয়েছে!', 'success');
    }).catch(err => {
      showToast('শেয়ার করতে সমস্যা হয়েছে', 'error');
    });
  }
};

function showToast(message, type = 'success') {
  // Toast implementation from previous version
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProductDetail();
});
