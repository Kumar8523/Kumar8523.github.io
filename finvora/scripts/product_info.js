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
          this.productData.relatedProducts.includes(p.id) && p.id !== this.productId
        ).slice(0, 4);
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      this.showErrorState('পণ্য লোড করতে সমস্যা হয়েছে');
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
        স্টকে আছে ${this.productData.stock > 1 ? `(${this.productData.stock} পিস)` : ''}
      `;
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

  addToCart() {
    if (!this.productData) return;

    if (this.productData.stock <= 0) {
      this.showToast('এই পণ্যটি স্টকে নেই', 'error');
      return;
    }

    const existingItem = this.cart.find(item => item.productId === this.productId);
    
    if (existingItem) {
      if (existingItem.quantity >= this.productData.stock) {
        this.showToast(`সর্বোচ্চ ${this.productData.stock} টি অর্ডার করা যাবে`, 'error');
        return;
      }
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        productId: this.productId,
        name: this.productData.name,
        price: this.productData.price,
        image: this.productData.images[0],
        maxStock: this.productData.stock,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.showToast('পণ্যটি কার্টে যোগ করা হয়েছে', 'success');
    this.updateCartCount();
  }

  shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: this.productData.name,
        text: `${this.productData.name} - ${this.productData.description.substring(0, 100)}...`,
        url: window.location.href
      }).catch(err => {
        this.showToast('শেয়ার করতে সমস্যা হয়েছে', 'error');
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareUrl = `whatsapp://send?text=${encodeURIComponent(
        `${this.productData.name} - ${window.location.href}`
      )}`;
      window.open(shareUrl, '_blank');
    }
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
const productDetail = new ProductDetail();

// Add to cart and share functions for inline onclick handlers
function addToCart() {
  productDetail.addToCart();
}

function shareProduct() {
  productDetail.shareProduct();
}
