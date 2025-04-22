// checkout.js - Complete Checkout and Order Tracking System

document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout process
  initCheckout();
  
  // Setup event listeners for payment methods
  setupPaymentMethodToggle();
  
  // Load cart items and calculate totals
  updateOrderSummary();
  
  // If on track order page, initialize it
  if (document.getElementById('trackOrderForm')) {
    initTrackOrder();
  }
});

// Checkout Functions
function initCheckout() {
  // Load cart items from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Update cart count in navbar
  updateCartCount();
  
  // Setup step navigation
  document.querySelectorAll('[onclick^="nextStep"], [onclick^="prevStep"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const step = parseInt(this.getAttribute('onclick').match(/\d+/)[0]);
      if (this.getAttribute('onclick').startsWith('next')) {
        validateStep(step - 1);
      } else {
        goToStep(step);
      }
    });
  });
  
  // Location type change handler
  const locationType = document.getElementById('locationType');
  if (locationType) {
    locationType.addEventListener('change', function() {
      updateDeliveryCharge();
    });
  }
  
  // Payment method change handler
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
      togglePaymentDetails(this.value);
    });
  });
}

function updateOrderSummary() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update checkout page summary
  if (document.getElementById('checkoutSubtotal')) {
    document.getElementById('checkoutSubtotal').textContent = `৳${subtotal.toFixed(2)}`;
    updateDeliveryCharge();
  }
  
  // Update confirmation page summary
  if (document.getElementById('confirmSubtotal')) {
    document.getElementById('confirmSubtotal').textContent = `৳${subtotal.toFixed(2)}`;
    document.getElementById('confirmDelivery').textContent = 
      document.getElementById('checkoutDelivery').textContent;
    document.getElementById('confirmTotal').textContent = 
      document.getElementById('checkoutTotal').textContent;
    
    // Render order items
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = cart.map(item => `
      <div class="flex justify-between items-center border-b pb-4">
        <div class="flex items-center">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
          <div>
            <h4 class="font-medium">${item.name}</h4>
            <p class="text-sm text-neutral">${item.quantity} x ৳${item.price.toFixed(2)}</p>
          </div>
        </div>
        <span class="font-medium">৳${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
    
    // Render delivery address
    const deliveryAddress = document.getElementById('deliveryAddress');
    const locationType = document.getElementById('locationType').value;
    const fullAddress = document.getElementById('fullAddress').value;
    
    deliveryAddress.innerHTML = `
      <p class="font-medium">${document.getElementById('fullName').value}</p>
      <p>${document.getElementById('phone').value}</p>
      <p class="mt-2">${locationType === 'rajshahi-city' ? 'রাজশাহী সিটি কর্পোরেশন' : 'অন্যান্য স্থান'}</p>
      <p>${fullAddress}</p>
    `;
    
    // Render payment method
    const paymentMethod = document.getElementById('paymentMethod');
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    let paymentHtml = '';
    if (selectedPayment === 'bkash') {
      paymentHtml = `
        <p class="font-medium">bKash পেমেন্ট</p>
        <p>নম্বর: ${document.getElementById('bkashNumber').value}</p>
        <p>ট্রানজেকশন আইডি: ${document.getElementById('bkashTrxID').value}</p>
      `;
    } else if (selectedPayment === 'nagad') {
      paymentHtml = `
        <p class="font-medium">Nagad পেমেন্ট</p>
        <p>নম্বর: ${document.getElementById('nagadNumber').value}</p>
        <p>ট্রানজেকশন আইডি: ${document.getElementById('nagadTrxID').value}</p>
      `;
    } else {
      paymentHtml = `
        <p class="font-medium">ক্যাশ অন ডেলিভারি</p>
        <p>পণ্য ডেলিভারির সময় পেমেন্ট করুন</p>
      `;
    }
    
    paymentMethod.innerHTML = paymentHtml;
  }
}

function updateDeliveryCharge() {
  const locationType = document.getElementById('locationType').value;
  const subtotal = parseFloat(document.getElementById('checkoutSubtotal').textContent.replace('৳', ''));
  let deliveryCharge = 0;
  
  if (locationType === 'other') {
    deliveryCharge = 150;
    document.getElementById('deliveryInfo').innerHTML = `
      <p><i class="fas fa-info-circle mr-2 text-accent"></i> অন্যান্য স্থানের জন্য ডেলিভারি চার্জ ৳150</p>
    `;
  } else {
    document.getElementById('deliveryInfo').innerHTML = `
      <p><i class="fas fa-info-circle mr-2 text-accent"></i> রাজশাহী সিটি কর্পোরেশনের জন্য ডেলিভারি চার্জ ফ্রি</p>
    `;
  }
  
  document.getElementById('checkoutDelivery').textContent = `৳${deliveryCharge.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `৳${(subtotal + deliveryCharge).toFixed(2)}`;
}

function setupPaymentMethodToggle() {
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
      document.getElementById('bkashDetails').classList.add('hidden');
      document.getElementById('nagadDetails').classList.add('hidden');
      
      if (this.value === 'bkash') {
        document.getElementById('bkashDetails').classList.remove('hidden');
      } else if (this.value === 'nagad') {
        document.getElementById('nagadDetails').classList.remove('hidden');
      }
    });
  });
}

function validateStep(currentStep) {
  let isValid = true;
  
  switch(currentStep) {
    case 1:
      const personalForm = document.getElementById('personalInfoForm');
      if (!personalForm.checkValidity()) {
        personalForm.reportValidity();
        isValid = false;
      }
      break;
      
    case 2:
      const addressForm = document.getElementById('addressForm');
      if (!addressForm.checkValidity()) {
        addressForm.reportValidity();
        isValid = false;
      }
      break;
      
    case 3:
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      if ((paymentMethod === 'bkash' && (!document.getElementById('bkashTrxID').value || !document.getElementById('bkashNumber').value)) ||
          (paymentMethod === 'nagad' && (!document.getElementById('nagadTrxID').value || !document.getElementById('nagadNumber').value))) {
        alert('অনুগ্রহ করে পেমেন্টের প্রয়োজনীয় তথ্য প্রদান করুন');
        isValid = false;
      }
      break;
  }
  
  if (isValid) {
    goToStep(currentStep + 1);
  }
}

function goToStep(step) {
  // Update step indicators
  document.querySelectorAll('.checkout-step').forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index + 1 === step) {
      el.classList.add('active');
    } else if (index + 1 < step) {
      el.classList.add('completed');
    }
    
    // Update step colors
    if (el.classList.contains('active')) {
      el.classList.add('border-accent');
      el.classList.remove('border-gray-200');
      el.querySelector('span').classList.add('bg-accent', 'text-white');
      el.querySelector('span').classList.remove('bg-gray-200', 'text-neutral');
    } else if (el.classList.contains('completed')) {
      el.classList.add('border-green-500');
      el.classList.remove('border-gray-200');
      el.querySelector('span').classList.add('bg-green-500', 'text-white');
      el.querySelector('span').classList.remove('bg-gray-200', 'text-neutral');
    } else {
      el.classList.add('border-gray-200');
      el.querySelector('span').classList.add('bg-gray-200', 'text-neutral');
    }
  });
  
  // Show the correct tab content
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(`step${step}`).classList.add('active');
  
  // Update order summary for confirmation page
  if (step === 4) {
    updateOrderSummary();
  }
}

function submitOrder() {
  // Collect all order data
  const orderData = {
    customer: {
      name: document.getElementById('fullName').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      note: document.getElementById('orderNote').value
    },
    address: {
      type: document.getElementById('locationType').value,
      fullAddress: document.getElementById('fullAddress').value
    },
    payment: {
      method: document.querySelector('input[name="paymentMethod"]:checked').value,
      details: {}
    },
    items: JSON.parse(localStorage.getItem('cart')) || [],
    subtotal: parseFloat(document.getElementById('checkoutSubtotal').textContent.replace('৳', '')),
    delivery: parseFloat(document.getElementById('checkoutDelivery').textContent.replace('৳', '')),
    total: parseFloat(document.getElementById('checkoutTotal').textContent.replace('৳', '')),
    orderDate: new Date().toISOString(),
    status: 'প্রক্রিয়াধীন',
    estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days from now
  };
  
  // Add payment details
  if (orderData.payment.method === 'bkash') {
    orderData.payment.details = {
      number: document.getElementById('bkashNumber').value,
      trxId: document.getElementById('bkashTrxID').value
    };
  } else if (orderData.payment.method === 'nagad') {
    orderData.payment.details = {
      number: document.getElementById('nagadNumber').value,
      trxId: document.getElementById('nagadTrxID').value
    };
  }
  
  // Generate order ID
  orderData.orderId = 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  
  // In a real app, you would send this to your backend/Google Sheets
  console.log('Order submitted:', orderData);
  saveOrderToGoogleSheets(orderData);
  
  // Clear cart and redirect to confirmation
  localStorage.removeItem('cart');
  updateCartCount();
  
  // Show confirmation page
  window.location.href = `order-confirmation.html?orderId=${orderData.orderId}`;
}

function saveOrderToGoogleSheets(orderData) {
  // This is a placeholder for Google Sheets integration
  // In a real implementation, you would use Google Apps Script or a backend service
  console.log('Saving order to Google Sheets:', orderData);
  
  // Get existing orders or initialize empty array
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // Add new order
  orders.push(orderData);
  
  // Save back to localStorage (simulating database)
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Track Order Functions
function initTrackOrder() {
  const trackOrderForm = document.getElementById('trackOrderForm');
  if (trackOrderForm) {
    trackOrderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const orderId = document.getElementById('trackOrderId').value.trim();
      trackOrder(orderId);
    });
  }
}

function trackOrder(orderId) {
  // Get orders from localStorage (in real app, fetch from server)
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.orderId === orderId);
  
  const resultContainer = document.getElementById('trackOrderResult');
  
  if (!order) {
    resultContainer.innerHTML = `
      <div class="bg-red-50 border-l-4 border-red-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-circle text-red-500"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              এই আইডি দিয়ে কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার আইডি দিন।
            </p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  // Render order status
  const deliveryDate = new Date(order.estimatedDelivery);
  const formattedDate = deliveryDate.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create roadmap steps
  const statusSteps = [
    { id: 'processed', title: 'প্রক্রিয়াধীন', active: ['প্রক্রিয়াধীন'].includes(order.status) },
    { id: 'packed', title: 'প্যাকেজড', active: ['প্যাকেজড', 'শিপড', 'ডেলিভার্ড'].includes(order.status) },
    { id: 'shipped', title: 'শিপড', active: ['শিপড', 'ডেলিভার্ড'].includes(order.status) },
    { id: 'delivered', title: 'ডেলিভার্ড', active: ['ডেলিভার্ড'].includes(order.status) }
  ];
  
  resultContainer.innerHTML = `
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="p-6 border-b">
        <h3 class="text-lg font-bold text-primary">অর্ডার #${order.orderId}</h3>
        <p class="text-neutral">অর্ডার তারিখ: ${new Date(order.orderDate).toLocaleDateString('bn-BD')}</p>
      </div>
      
      <div class="p-6 border-b">
        <h4 class="font-bold text-primary mb-4">অর্ডার স্ট্যাটাস</h4>
        
        <div class="relative">
          <!-- Progress bar -->
          <div class="h-1 bg-gray-200 absolute top-1/2 left-0 right-0 transform -translate-y-1/2"></div>
          
          <div class="relative flex justify-between">
            ${statusSteps.map(step => `
              <div class="flex flex-col items-center z-10">
                <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2 
                  ${step.active ? 'bg-accent text-white' : 'bg-gray-200 text-neutral'}">
                  <i class="fas ${step.id === 'processed' ? 'fa-cog' : 
                                 step.id === 'packed' ? 'fa-box' : 
                                 step.id === 'shipped' ? 'fa-truck' : 
                                 'fa-check'}"></i>
                </div>
                <span class="text-sm ${step.active ? 'text-primary font-medium' : 'text-neutral'}">
                  ${step.title}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="p-6 border-b">
        <h4 class="font-bold text-primary mb-4">ডেলিভারি তথ্য</h4>
        <p class="text-neutral">অনুমানিক ডেলিভারি তারিখ: ${formattedDate}</p>
        <p class="text-neutral mt-2">${order.address.fullAddress}</p>
      </div>
      
      <div class="p-6">
        <h4 class="font-bold text-primary mb-4">অর্ডার আইটেম</h4>
        <div class="space-y-4">
          ${order.items.map(item => `
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded mr-3">
                <div>
                  <h5 class="font-medium">${item.name}</h5>
                  <p class="text-sm text-neutral">${item.quantity} x ৳${item.price.toFixed(2)}</p>
                </div>
              </div>
              <span class="font-medium">৳${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-6 pt-4 border-t">
          <div class="flex justify-between mb-2">
            <span class="text-neutral">সাবটোটাল:</span>
            <span class="font-medium">৳${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-neutral">ডেলিভারি চার্জ:</span>
            <span class="font-medium">৳${order.delivery.toFixed(2)}</span>
          </div>
          <div class="flex justify-between font-bold text-lg">
            <span class="text-primary">মোট:</span>
            <span class="text-primary">৳${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Helper Functions
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Global functions for HTML onclick handlers
window.nextStep = validateStep;
window.prevStep = goToStep;
window.submitOrder = submitOrder;
