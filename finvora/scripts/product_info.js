document.addEventListener('DOMContentLoaded', () => {
  const productDetail = new ProductDetail();
  productDetail.init();
});

class ProductDetail {
  constructor() {
    this.productId = null;
    this.productData = null;
  }

  async init() {
    this.productId = new URLSearchParams(window.location.search).get('id');
    if (!this.productId) {
      this.showError('পণ্য আইডি পাওয়া যায়নি');
      return;
    }

    await this.loadProduct();
    if (this.productData) {
      this.renderProduct();
      this.setupEventListeners();
    }
  }

  async loadProduct() {
    try {
      const response = await fetch('scripts/products.json');
      const data = await response.json();
      this.productData = data.products.find(p => p.id == this.productId);
      
      if (!this.productData) {
        this.showError('পণ্য পাওয়া যায়নি');
        return;
      }
    } catch (error) {
      console.error('Error loading product:', error);
      this.showError('পণ্য লোড করতে সমস্যা হয়েছে');
    }
  }

  renderProduct() {
    // Basic info
    document.getElementById('productTitle').textContent = this.productData.name;
    
    // Price
    document.getElementById('discountedPrice').textContent = `৳${this.productData.price.toFixed(2)}`;
    
    // Stock status
    const stockStatus = document.getElementById('stockStatus');
    stockStatus.innerHTML = this.productData.stock > 0 
      ? `<i class="fas fa-check-circle mr-1"></i> স্টকে আছে (${this.productData.stock} পিস)`
      : '<i class="fas fa-times-circle mr-1"></i> স্টকে নেই';
    stockStatus.className = this.productData.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';

    // Images
    document.getElementById('mainImage').src = this.productData.images[0];
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    thumbnailContainer.innerHTML = this.productData.images.map((img, idx) => `
      <div class="cursor-pointer ${idx === 0 ? 'border-2 border-accent' : ''}" 
           onclick="changeMainImage('${img}', this)">
        <img src="${img}" class="w-20 h-20 object-cover" alt="Thumbnail ${idx + 1}">
      </div>
    `).join('');

    // Description
    document.getElementById('productDescription').textContent = this.productData.description || 'কোনো বিবরণ নেই';

    // Reviews
    this.renderReviews();
  }

  renderReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    if (!this.productData.reviews || this.productData.reviews.length === 0) {
      container.innerHTML = '<p class="text-neutral">এই পণ্যের জন্য কোনো রিভিউ নেই</p>';
      return;
    }

    container.innerHTML = this.productData.reviews.map(review => `
      <div class="mb-4 border-b pb-4">
        <div class="flex items-center mb-2">
          <div class="text-yellow-400 mr-2">
            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
          </div>
          <span class="font-medium">${review.user}</span>
        </div>
        <p class="text-neutral">${review.comment}</p>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Review form submission
    document.getElementById('reviewForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitReview();
    });
  }

  submitReview() {
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();

    if (!rating || !comment) {
      alert('অনুগ্রহ করে রেটিং এবং মন্তব্য প্রদান করুন');
      return;
    }

    // In a real app, this would send to your backend
    alert('রিভিউ জমা দেওয়া হয়েছে!');
    document.getElementById('reviewForm').reset();
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

// Global functions
function changeMainImage(src, element) {
  document.getElementById('mainImage').src = src;
  document.querySelectorAll('#thumbnailContainer > div').forEach(div => {
    div.classList.remove('border-2', 'border-accent');
  });
  element.classList.add('border-2', 'border-accent');
}

function addToCart() {
  const productId = new URLSearchParams(window.location.search).get('id');
  if (!productId) return;

  // Simple cart add functionality
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.id == productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: document.getElementById('productTitle').textContent,
      price: parseFloat(document.getElementById('discountedPrice').textContent.replace('৳', '')),
      image: document.getElementById('mainImage').src,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert('পণ্য কার্টে যোগ করা হয়েছে!');
}