document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) return;
    try {
      const response = await fetch('scripts/products.json');
      const data = await response.json();
      const product = data.products.find(p => p.id == productId);
      if (product) {
        document.getElementById('productTitle').textContent = product.name;
        if (product.discount) {
          const discountPrice = (product.price - product.price * (product.discount / 100)).toFixed(2);
          document.getElementById('discountedPrice').textContent = `$${discountPrice}`;
          document.getElementById('originalPrice').textContent = `$${product.price.toFixed(2)}`;
          document.getElementById('originalPrice').classList.remove('hidden');
        } else {
          document.getElementById('discountedPrice').textContent = `$${product.price.toFixed(2)}`;
        }
        document.getElementById('productDescription').textContent = product.description || '';
        document.getElementById('stockStatus').textContent = product.stock > 0 ? `In Stock • ${product.stock} available` : "Out of Stock";

        const ratingStars = document.querySelector('.review-star');
        const roundedRating = product.rating ? Math.round(product.rating) : 0;
        ratingStars.innerHTML = '★'.repeat(roundedRating);
        document.getElementById('reviewCount').textContent = product.reviews ? `(${product.reviews.length} reviews)` : '(0 reviews)';

        if (product.images && product.images.length > 0) {
          document.getElementById('mainImage').src = product.images[0];
          const thumbnailContainer = document.getElementById('thumbnailContainer');
          thumbnailContainer.innerHTML = product.images.map(image => `
            <div class="image-gallery-thumbnail aspect-square bg-gray-100 rounded cursor-pointer" onclick="changeMainImage('${image}')">
              <img src="${image}" class="w-full h-full object-cover" alt="Thumbnail">
            </div>
          `).join('');
        }

        const reviewsContainer = document.getElementById('reviewsContainer');
        if (product.reviews && product.reviews.length > 0) {
          reviewsContainer.innerHTML = product.reviews.map(review => `
            <div class="border-b pb-6">
              <div class="flex items-center space-x-2">
                <div class="review-star">${'★'.repeat(Math.round(review.rating))}</div>
                <span class="font-medium">${review.user}</span>
                ${review.verified ? `<span class="text-blue-600 text-sm">✓ Verified Purchase</span>` : ''}
              </div>
              <p class="mt-2 text-gray-600">${review.comment}</p>
              ${review.date ? `<div class="text-sm text-gray-400 mt-2">${review.date}</div>` : ''}
            </div>
          `).join('');
        } else {
          reviewsContainer.innerHTML = `<p>No reviews yet.</p>`;
        }
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  });

  function changeMainImage(imageSrc) {
    document.getElementById('mainImage').src = imageSrc;
  }

  function shareProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const shortLink = `https://finvora.com/p/${productId}`;
    navigator.clipboard.writeText(shortLink).then(() => {
      alert('Product link copied to clipboard: ' + shortLink);
    }).catch(() => {
      alert('Failed to copy the link.');
    });
  }

  function addToCart() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    fetch('scripts/products.json')
      .then(response => response.json())
      .then(data => {
        const product = data.products.find(p => p.id == productId);
        if (!product) return alert("Product not found");
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.productId == product.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
          });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('Product added to cart!');
      })
      .catch(error => console.error('Error adding to cart:', error));
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
    });
  }

  updateCartCount();