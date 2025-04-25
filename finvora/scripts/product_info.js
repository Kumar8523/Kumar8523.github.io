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
      this.setupTabs();
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

    // Specifications
    this.renderSpecs();

    // Reviews
    this.renderReviews();

    // Related products
    this.renderRelatedProducts();
  }

  renderSpecs() {
    const specsContainer = document.querySelector('#specsTab .specs-grid');
    if (!specsContainer || !this.productData.specs) return;

    specsContainer.innerHTML = Object.entries(this.productData.specs).map(([key, value]) => `
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium text-neutral mb-1">${key}</h4>
        <p class="text-primary">${value}</p>
      </div>
    `).join('');
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

  renderRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    if (!container || !this.productData.relatedProducts) return;

    const relatedProducts = this.productData.relatedProducts.map(id => 
      this.getProductById(id)
    ).filter(Boolean);

    if (relatedProducts.length === 0) return;

    container.innerHTML = relatedProducts.map(product => `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <a href="product_info.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.name}" class="w-full h-48 object-cover">
        </a>
        <div class="p-4">
          <a href="product_info.html?id=${product.id}" class="block">
            <h3 class="font-medium text-lg mb-2 text-primary hover:text-accent">${product.name}</h3>
          </a>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-primary">৳${product.price.toFixed(2)}</span>
            <div class="text-yellow-400">
              ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  getProductById(id) {
    // এই মেথডটি JSON ডাটা থেকে প্রোডাক্ট খুঁজে দেবে
    // বাস্তব应用中可能需要访问全局 products 数据或再次从服务器获取
    return this.productData.relatedProducts ? 
      this.products?.find(p => p.id === id) : null;
  }

  setupEventListeners() {
    // Review form submission
    document.getElementById('reviewForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitReview();
    });

    // Rating stars
    document.querySelectorAll('.rating-stars .fa-star').forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.setRating(rating);
      });
    });
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active', 'border-accent', 'text-accent'));
        tabContents.forEach(content => content.classList.add('hidden'));

        // Add active class to clicked button
        button.classList.add('active', 'border-accent', 'text-accent');

        // Show corresponding content
        const tabName = button.textContent.trim();
        if (tabName === 'বিবরণ') {
          document.getElementById('descriptionTab').classList.remove('hidden');
        } else if (tabName === 'স্পেসিফিকেশন') {
          document.getElementById('specsTab').classList.remove('hidden');
        } else if (tabName.includes('রিভিউ')) {
          document.getElementById('reviewsTab').classList.remove('hidden');
        }
      });
    });
  }

  setRating(rating) {
    document.getElementById('reviewRating').value = rating;
    const stars = document.querySelectorAll('.rating-stars .fa-star');
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
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();

    if (!rating || !comment) {
      alert('অনুগ্রহ করে রেটিং এবং মন্তব্য প্রদান করুন');
      return;
    }

    // In a real app, this would send to your backend
    alert('রিভিউ জমা দেওয়া হয়েছে!');
    document.getElementById('reviewForm').reset();
    this.setRating(0);
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

  const productDetail = new ProductDetail();
  const product = productDetail.productData;

  if (!product) return;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.id == productId);

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
  alert('পণ্য কার্টে যোগ করা হয়েছে!');
}
