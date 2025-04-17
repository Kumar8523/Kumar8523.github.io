let allProducts = [];
    async function loadProducts() {
      const resp = await fetch('scripts/products.json');
      const data = await resp.json();
      allProducts = data.products;
      renderProducts(allProducts);
      setupSearchSuggestions();
    }
    function renderProducts(products) {
      const grid = document.getElementById('productGrid');
      grid.innerHTML = products.map(p => {
        const price = (p.discount ? p.price*(1-p.discount/100) : p.price).toFixed(2);
        return `
          <div class="product-card bg-white rounded-lg shadow overflow-hidden" data-category="${p.category.toLowerCase()}" data-price="${price}">
            <img src="${p.images[0]}" alt="${p.name}" class="product-image w-full h-56 object-cover">
            <div class="p-4">
              <h3 class="font-medium text-lg mb-2">${p.name}</h3>
              <p class="text-primary text-xl font-bold mb-2">$${price}</p>
              <div class="flex items-center text-yellow-400 mb-4">★★★★★<span class="ml-2 text-gray-600">(${p.rating||0})</span></div>
              <button onclick="addToCart(${p.id})" class="w-full bg-black text-white py-2 rounded hover:bg-gray-800">Add to Cart</button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
      const cat = e.target.value;
      const filtered = cat==='all' ? allProducts : allProducts.filter(p=>p.category.toLowerCase()===cat);
      renderProducts(filtered);
    });
    // Sort
    document.getElementById('sortOptions').addEventListener('change', (e) => {
      const val = e.target.value;
      const sorted = [...allProducts];
      if(val==='asc') sorted.sort((a,b)=> (a.discount? a.price*(1-a.discount/100):a.price) - (b.discount? b.price*(1-b.discount/100):b.price));
      if(val==='desc') sorted.sort((a,b)=> (b.discount? b.price*(1-b.discount/100):b.price) - (a.discount? a.price*(1-a.discount/100):a.price));
      renderProducts(sorted);
    });

    // Search suggestions
    function setupSearchSuggestions() {
      const input = document.getElementById('mainSearch');
      const suggBox = document.getElementById('suggestions');
      input.addEventListener('input', ()=>{
        const q = input.value.toLowerCase();
        if(!q) { suggBox.innerHTML=''; suggBox.classList.add('hidden'); return; }
        const matches = allProducts.filter(p=>p.name.toLowerCase().includes(q)).slice(0,5);
        if(matches.length){
          suggBox.innerHTML = matches.map(m=>`<div onclick="selectSuggestion('${m.name}')">${m.name}</div>`).join('');
          suggBox.classList.remove('hidden');
        } else { suggBox.innerHTML=''; suggBox.classList.add('hidden'); }
      });
    }
    function selectSuggestion(text){ document.getElementById('mainSearch').value=text; document.getElementById('suggestions').classList.add('hidden'); renderProducts(allProducts.filter(p=>p.name===text)); }

    // Add to Cart
    function addToCart(id){
      const p = allProducts.find(x=>x.id===id);
      let cart = JSON.parse(localStorage.getItem('cart'))||[];
      const ex = cart.find(i=>i.productId===id);
      if(ex) ex.quantity++;
      else cart.push({productId:id,name:p.name,price:p.price,quantity:1});
      localStorage.setItem('cart', JSON.stringify(cart)); updateCartCount();
      alert('Added to cart');
    }

    document.addEventListener('DOMContentLoaded', loadProducts);