// scripts/products.js
let allProducts = [];

// Load products and initialize search & filter
async function loadProducts() {
  try {
    const resp = await fetch('scripts/products.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    allProducts = data.products;
    renderProducts(allProducts);
    setupFiltersAndSearch();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Render product cards as clickable links
function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => {
    const effectivePrice = p.discount
      ? (p.price * (1 - p.discount / 100)).toFixed(2)
      : p.price.toFixed(2);
    return `
      <a href="product_info.html?id=${p.id}" class="block">
        <div class="product-card bg-white rounded-lg shadow overflow-hidden" data-category="${p.category.toLowerCase()}">
          <img src="${p.images[0] || 'https://via.placeholder.com/300x400'}" alt="${p.name}" class="product-image w-full h-56 object-cover">
          <div class="p-4">
            <h3 class="font-medium text-lg mb-2">${p.name}</h3>
            <p class="text-primary text-xl font-bold mb-2">৳${effectivePrice}</p>
            <div class="flex items-center text-yellow-400 mb-4">${'★'.repeat(Math.round(p.rating || 0))}<span class="ml-2 text-gray-600">(${p.rating || 0})</span></div>
            <button type="button" onclick="addToCart(${p.id})" class="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
              Add to Cart
            </button>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// Setup category filter and live search
function setupFiltersAndSearch() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', e => {
      const cat = e.target.value;
      const filtered = cat === 'all'
        ? allProducts
        : allProducts.filter(p => p.category.toLowerCase() === cat);
      renderProducts(filtered);
    });
  }

  const mainSearch = document.getElementById('mainSearch');
  if (mainSearch) {
    mainSearch.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const filtered = allProducts.filter(p => p.name.toLowerCase().includes(q));
      renderProducts(filtered);
    });
  }
}

// Add product to cart, fixing ID type mismatch
function addToCart(id) {
  const productId = Number(id);
  const p = allProducts.find(x => x.id === productId);
  if (!p) {
    alert('Product not found!');
    return;
  }
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId,
      name: p.name,
      price: p.price,
      quantity: 1,
      image: p.images[0] || ''
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert('Added to cart!');
}

// Update cart count badge
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

document.addEventListener('DOMContentLoaded', loadProducts);
