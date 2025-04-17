let appliedPromo = null;
    function loadCartItems() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const container = document.getElementById('orderItems');
      if (!cart.length) return container.innerHTML = '<p class="text-center text-gray-600">Your cart is empty.</p>';
      container.innerHTML = cart.map((item, idx) => `
        <div class="cart-item flex flex-col sm:flex-row items-start gap-4">
          <img src="${item.image||'https://via.placeholder.com/100'}" alt="${item.name}" class="w-24 h-24 object-cover rounded" />
          <div class="flex-1">
            <h3 class="font-bold text-lg">${item.name}</h3>
            <p class="text-gray-600">Quantity: <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${idx},0,this.value)" class="w-16 text-center border rounded"/></p>
            <p class="text-gray-600">Price: ৳${(item.price*item.quantity).toFixed(2)}</p>
            <button onclick="removeCartItem(${idx})" class="text-red-600 hover:underline">Remove</button>
            <div class="mt-2 flex flex-col md:flex-row gap-2">
              <input type="text" id="promo${idx}" placeholder="Promo Code" class="promo-input flex-1 p-2 border rounded" ${appliedPromo?'disabled':''} />
              <button onclick="applyPromo(${idx})" class="promo-btn bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition" ${appliedPromo?'disabled':''}>Apply</button>
            </div>
          </div>
        </div>`).join('');
      calculateTotals();
    }
    function applyPromo(idx) {
      const code = document.getElementById(`promo${idx}`).value.trim();
      if (!code) return;
      appliedPromo = code;
      document.querySelectorAll('.promo-input, .promo-btn').forEach(el=>el.disabled=true);
      calculateTotals();
    }
    function updateQuantity(i,change,newVal) {
      const cart=JSON.parse(localStorage.getItem('cart'))||[];
      cart[i].quantity=newVal?parseInt(newVal):cart[i].quantity+change;
      if(cart[i].quantity<1)cart[i].quantity=1;
      localStorage.setItem('cart',JSON.stringify(cart));loadCartItems();updateCartCount();
    }
    function removeCartItem(i){const cart=JSON.parse(localStorage.getItem('cart'))||[];cart.splice(i,1);localStorage.setItem('cart',JSON.stringify(cart));loadCartItems();updateCartCount();}
    function calculateTotals(){const cart=JSON.parse(localStorage.getItem('cart'))||[];let sub=0;cart.forEach(i=>sub+=i.price*i.quantity);let disc=appliedPromo?sub*0.1:0;const ship=sub?15:0;const total=sub+ship-disc;document.getElementById('subtotal').textContent=`৳${sub.toFixed(2)}`;document.getElementById('discount').textContent=`৳${disc.toFixed(2)}`;document.getElementById('grandTotal').textContent=`৳${total.toFixed(2)}`;}
    function updateCartCount(){const cart=JSON.parse(localStorage.getItem('cart'))||[];const c=cart.reduce((a,i)=>a+i.quantity,0);document.querySelectorAll('.cart-count').forEach(el=>el.textContent=c);}    
    // Payment logic
    document.querySelectorAll('input[name=payment]').forEach(radio=>radio.addEventListener('change',e=>{
      document.getElementById('transactionId').disabled=e.target.value==='cod';
      document.getElementById('bkashInfo').classList.toggle('hidden',e.target.value!=='bkash');
      document.getElementById('nagadInfo').classList.toggle('hidden',e.target.value!=='nagad');
    }));
    async function submitOrder(){/* ...existing submission logic... */}
    document.addEventListener('DOMContentLoaded',()=>{updateCartCount();loadCartItems();});