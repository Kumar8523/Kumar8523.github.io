    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Active Link Styling
    document.querySelectorAll('.nav-link').forEach(link => {
      if(link.href === window.location.href) {
        link.classList.add('text-primary', 'font-medium');
        link.classList.remove('hover:text-primary');
      }
    });

    // Update Cart Count
    function updateCartCount() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
      });
    }
    updateCartCount();

    // Mobile Menu Auto-Close on Outside Click
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });



// ----------------- Trending Products Loader -----------------
async function loadTrendingProducts() {
  try {
    const response = await fetch('scripts/products.json');
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();
    console.log("Trending Products Data:", data); // Debugging message
    const trendingProducts = data.products.filter(product => product.trending);
    const container = document.getElementById('trending-products');
    if (!container) {
      console.error("Trending products container not found!");
      return;
    }
    trendingProducts.forEach(product => {
      const discountedPrice = product.discount
        ? (product.price - product.price * (product.discount / 100)).toFixed(2)
        : product.price.toFixed(2);
      const card = `
        <div class="product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <a href="product_info.html?id=${product.id}">
            <div class="relative">
              ${product.discount ? `<div class="absolute top-4 right-4 bg-accent text-white text-xs px-3 py-1 rounded-full">${product.discount}% OFF</div>` : ''}
              <img src="${product.images[0] || 'https://via.placeholder.com/300x400'}" class="product-image w-full h-80 object-cover" alt="${product.name}">
            </div>
            <div class="p-4">
              <h3 class="font-medium text-gray-900">${product.name}</h3>
              <div class="flex items-center justify-between mt-2">
                <p class="text-lg font-bold text-primary">$${discountedPrice}</p>
                <div class="flex items-center text-yellow-400">
                  <i class="fas fa-star"></i>
                  <span class="ml-1 text-gray-600">${product.rating || 'N/A'}</span>
                </div>
              </div>
            </div>
          </a>
          <div class="p-2">
            <button onclick="event.stopPropagation(); addToCart(product.id)" class="w-full border border-black py-2 rounded-full hover:bg-black hover:text-white">
              Add to Cart
            </button>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', card);
    });
  } catch (error) {
    console.error('Error loading trending products:', error);
  }
}

// ----------------- Products Grid Loader -----------------
async function loadProducts() {
  try {
    const response = await fetch('scripts/products.json');
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();
    console.log("Products Data:", data); // Debugging message
    const products = data.products;
    const grid = document.getElementById('productGrid');
    if (!grid) {
      console.error("Product grid element not found!");
      return;
    }
    grid.innerHTML = products.map(product => {
      const discountedPrice = product.discount
        ? (product.price - product.price * (product.discount / 100)).toFixed(2)
        : product.price.toFixed(2);
      return `
        <div class="product-card bg-white rounded-lg shadow-sm overflow-hidden" data-category="${product.category}">
          <div class="relative">
            <a href="product_info.html?id=${product.id}">
              <img src="${product.images[0] || 'https://via.placeholder.com/300x400'}" class="product-image w-full h-80 object-cover" alt="${product.name}" loading="lazy">
            </a>
            <div class="product-actions absolute bottom-0 left-0 right-0 bg-white/90 p-4 opacity-0 transition-all transform translate-y-4">
              <button onclick="event.stopPropagation(); addToCart(product.id)" class="w-full mb-2 border border-black py-2 rounded-full hover:bg-black hover:text-white">
                Add to Cart
              </button>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-medium">${product.name}</h3>
            <div class="flex justify-between items-center mt-2">
              <span class="text-lg text-primary">$${discountedPrice}</span>
              <div class="flex items-center text-yellow-400">
                ★ ${product.rating || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    attachFilterAndSearch();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// ----------------- Filter & Search -----------------
function attachFilterAndSearch() {
  // Filter by category using dropdown
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      const selected = categoryFilter.value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const cat = card.getAttribute('data-category').toLowerCase();
        card.style.display = (selected === 'all' || cat === selected) ? 'block' : 'none';
      });
    });
  }
  
  // Search functionality: Filter products based on search input
  const mainSearch = document.getElementById('mainSearch');
  if (mainSearch) {
    mainSearch.addEventListener('input', () => {
      const query = mainSearch.value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = name.includes(query) ? 'block' : 'none';
      });
    });
  }
}

// ----------------- Cart & Checkout Functions -----------------
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
  });
}

function loadCartItems() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('orderItems');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-600">Your cart is empty.</p>';
    return;
  }
  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item flex flex-col sm:flex-row items-center gap-4">
      <div class="w-24 h-24 bg-gray-100 rounded overflow-hidden">
        <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name}" class="w-full h-full object-cover">
      </div>
      <div class="flex-1">
        <h3 class="font-medium">${item.name}</h3>
        <p class="text-gray-600">Size: ${item.size ? item.size : 'N/A'}</p>
        <p class="text-gray-600">Price: $${item.price.toFixed(2)}</p>
        <div class="flex items-center mt-2">
          <button onclick="updateQuantity(${index}, -1)" class="px-2 border rounded-l">-</button>
          <input type="number" value="${item.quantity}" min="1" class="w-16 text-center border-t border-b" onchange="updateQuantity(${index}, 0, this.value)">
          <button onclick="updateQuantity(${index}, 1)" class="px-2 border rounded-r">+</button>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <p class="font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
        <button onclick="removeCartItem(${index})" class="mt-2 text-red-600 hover:underline">Remove</button>
      </div>
    </div>
  `).join('');
  calculateTotals();
}

function updateQuantity(index, change, newValue) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (newValue) {
    cart[index].quantity = parseInt(newValue);
  } else {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCartItems();
  updateCartCount();
}

function removeCartItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCartItems();
  updateCartCount();
}

let globalCoupon = null;

function applyGlobalCoupon() {
  const code = document.getElementById('globalCouponCode').value.trim();
  if (code === "GLOBAL10") {
    globalCoupon = { code, discount: 10 };
    document.getElementById('couponStatus').textContent = "Coupon applied successfully!";
    document.getElementById('couponStatus').classList.remove('text-red-600');
    document.getElementById('couponStatus').classList.add('text-green-600');
  } else {
    globalCoupon = null;
    document.getElementById('couponStatus').textContent = "Invalid coupon code.";
    document.getElementById('couponStatus').classList.remove('text-green-600');
    document.getElementById('couponStatus').classList.add('text-red-600');
  }
  calculateTotals();
}

function calculateTotals() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  let discount = globalCoupon ? subtotal * (globalCoupon.discount / 100) : 0;
  const shipping = subtotal > 0 ? 15.00 : 0;
  const grandTotal = subtotal + shipping - discount;
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
  document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

function addToCart(productId) {
  fetch('scripts/products.json')
    .then(response => response.json())
    .then(data => {
      const product = data.products.find(p => p.id == productId);
      if (!product) {
        alert('Product not found!');
        return;
      }
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existing = cart.find(item => item.productId == product.id && item.size === null);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: null,
          image: product.images[0] || ''
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      alert("Product added to cart!");
    })
    .catch(error => console.error('Error adding to cart:', error));
}

function addToWishlist() {
  alert("Added to wishlist! (Functionality to be implemented.)");
}

async function submitOrder() {
  const customer = {
    name: document.getElementById('fullName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim()
  };
  const order = JSON.parse(localStorage.getItem('cart')) || [];
  const total = document.getElementById('grandTotal').textContent;
  const formData = {
    customer,
    order,
    total,
    coupon: globalCoupon,
    timestamp: new Date().toISOString()
  };
  const scriptURL = 'YOUR_GOOGLE_SCRIPT_URL';
  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (response.ok) {
      alert('Order placed successfully! We will contact you for payment.');
      localStorage.removeItem('cart');
      window.location.href = '/order-confirmation.html';
    } else {
      alert('Order submission failed. Please try again later.');
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    alert('Order submission failed. Please try again later.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  if (document.getElementById('orderItems')) {
    loadCartItems();
  }
});
