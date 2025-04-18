// app.js

// (1) স্ট্যাটিক JSON ক্যাশিং করে রাখব, যাতে একাধিক fetch না করতে হয়
let _productData = null;
async function fetchProductData() {
  if (_productData) return _productData;
  const res = await fetch('scripts/products.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  _productData = await res.json();
  return _productData;
}

// (2) Homepage: ট্রেন্ডিং কালেকশন লোড
async function loadCollections() {
  const container = document.getElementById('collections-container');
  if (!container) return;
  try {
    const { products } = await fetchProductData();
    const trending = products.filter(p => p.trending);
    container.innerHTML = trending.map(p => `
      <a href="product_info.html?id=${p.id}" class="group relative overflow-hidden h-96 rounded-lg festival-card">
        <img src="${p.images[0]||'https://via.placeholder.com/300x400'}"
             alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h3 class="text-2xl text-white font-medium">${p.name}</h3>
        </div>
      </a>
    `).join('');
  } catch(err) {
    console.error('Error loading collections:', err);
  }
}

// (3) Products পেজ: গ্রিডে সব পণ্য দেখাবে
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  try {
    const { products } = await fetchProductData();
    grid.innerHTML = products.map(p => {
      const price = (p.discount
        ? (p.price * (1 - p.discount/100))
        : p.price
      ).toFixed(2);
      return `
        <div class="product-card bg-white rounded-lg shadow overflow-hidden"
             data-category="${p.category}">
          <img src="${p.images[0]}" alt="${p.name}"
               class="product-image w-full h-56 object-cover">
          <div class="p-4">
            <h3 class="font-medium text-lg mb-2">${p.name}</h3>
            <p class="text-primary text-xl font-bold mb-2">$${price}</p>
            <div class="flex items-center text-yellow-400 mb-4">
              ★★★★★<span class="ml-2 text-gray-600">(${p.rating||0})</span>
            </div>
            <button onclick="addToCart(${p.id})"
                    class="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
              Add to Cart
            </button>
          </div>
        </div>`;
    }).join('');
    attachFilterAndSearch();
  } catch(err) {
    console.error('Error loading products:', err);
  }
}

// (4) Filter & Live Search
function attachFilterAndSearch() {
  const cat = document.getElementById('categoryFilter');
  if (cat) {
    cat.addEventListener('change', e => {
      const val = e.target.value;
      document.querySelectorAll('.product-card').forEach(card =>
        card.style.display =
          (val === 'all' || card.dataset.category === val)
          ? 'block' : 'none'
      );
    });
  }
  const input = document.getElementById('mainSearch');
  if (input) {
    input.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = name.includes(q) ? 'block' : 'none';
      });
    });
  }
}

// (5) Cart Count Badge আপডেট
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart'))||[];
  const count = cart.reduce((sum,i)=>sum+i.quantity,0);
  document.querySelectorAll('.cart-count').forEach(el=>el.textContent=count);
}

// (6) Checkout পেজের কার্ট আইটেমস
async function initCheckout() {
  const container = document.getElementById('orderItems');
  if (!container) return;
  updateCartCount();
  loadCartItems();
  // যদি ফর্ম সাবমিশন এড়াতে চান, এখানে listener যোগ করুন
}

// (7) DOMContentLoaded এ only–on–demand ফাংশন কল
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  loadCollections();
  loadProducts();
  initCheckout();
});


// ==== (নোট) ====
// * applyGlobalCoupon(), calculateTotals(), addToCart(), loadCartItems(), updateQuantity(),
//   removeCartItem(), submitOrder() ইত্যাদি ফাংশনগুলোও page–specific এলিমেন্ট চেকের পরে ডিক্লেয়ার ও কল করতে হবে,
//   যেহেতু Checkout পেজ এ আগের inline স্ক্রিপ্টে একই লজিক আছে।
