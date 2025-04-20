// product_info.js

// Cache product data to avoid multiple fetches
let _productData = null;
async function fetchProductData() {
  if (_productData) return _productData;
  const res = await fetch('scripts/products.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  _productData = await res.json();
  return _productData;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Get product ID from URL and convert to number
  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number(urlParams.get('id'));
  if (!productId) return;

  try {
    const { products } = await fetchProductData();
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    // Populate product details
    document.getElementById('productTitle').textContent = product.name;
    const discountedPriceEl = document.getElementById('discountedPrice');
    const originalPriceEl = document.getElementById('originalPrice');

    if (product.discount) {
      const discountPrice = (product.price * (1 - product.discount / 100)).toFixed(2);
      discountedPriceEl.textContent = `৳${discountPrice}`;
      originalPriceEl.textContent = `৳${product.price.toFixed(2)}`;
      originalPriceEl.classList.remove('hidden');
    } else {
      discountedPriceEl.textContent = `৳${product.price.toFixed(2)}`;
      originalPriceEl.classList.add('hidden');
    }

    // Description and stock
    document.getElementById('productDescription').textContent = product.description || '';
    document.getElementById('stockStatus').textContent = product.stock
      ? `In Stock • ${product.stock} available`
      : 'Out of Stock';

    // Render rating stars
    const ratingStars = document.querySelector('.review-star');
    const roundedRating = Math.round(product.rating || 0);
    ratingStars.innerHTML = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
    document.getElementById('reviewCount').textContent = `(${product.reviews.length || 0} reviews)`;

    // Images and thumbnails
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    if (product.images && product.images.length) {
      mainImage.src = product.images[0];
      thumbnailContainer.innerHTML = product.images.map((img, idx) => `
        <div class="image-gallery-thumbnail aspect-square bg-gray-100 rounded cursor-pointer">
          <img src="${img}" class="w-full h-full object-cover" alt="Thumbnail ${idx + 1}" onclick="changeMainImage('${img}')" />
        </div>
      `).join('');
    }

    // Render reviews
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (product.reviews && product.reviews.length) {
      reviewsContainer.innerHTML = product.reviews.map(r => `
        <div class="border-b pb-6">
          <div class="flex items-center space-x-2">
            <div class="review-star">${'★'.repeat(Math.round(r.rating))}</div>
            <span class="font-medium">${r.user}</span>
            ${r.verified ? '<span class="text-blue-600 text-sm">✓ Verified Purchase</span>' : ''}
          </div>
          <p class="mt-2 text-gray-600">${r.comment}</p>
          ${r.date ? `<div class="text-sm text-gray-400 mt-2">${r.date}</div>` : ''}
        </div>
      `).join('');
    } else {
      reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
    }

    // Attach Add to Cart button
    const addToCartBtn = document.querySelector('button[onclick^="addToCart"]');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => addToCart(productId));
    }

  } catch (err) {
    console.error('Error loading product info:', err);
  }
});

// Change main image on thumbnail click
function changeMainImage(src) {
  document.getElementById('mainImage').src = src;
}

// Share current page URL
function shareProduct() {
  const link = window.location.href;
  navigator.clipboard.writeText(link)
    .then(() => alert('Link copied to clipboard: ' + link))
    .catch(() => alert('Failed to copy the link.'));
}

// Add product to cart
async function addToCart(productId) {
  try {
    const { products } = await fetchProductData();
    const product = products.find(p => p.id === productId);
    if (!product) {
      return alert('Product not found!');
    }
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId, name: product.name, price: product.price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Product added to cart!');
  } catch (err) {
    console.error('Error adding to cart:', err);
  }
}

// Update cart count badge across pages
function updateCartCount() {
  const count = (JSON.parse(localStorage.getItem('cart')) || [])
    .reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

// Initialize cart count on script load
updateCartCount();
