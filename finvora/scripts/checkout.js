// checkout.js - Complete Checkout System
document.addEventListener('DOMContentLoaded', function() {
  const checkout = new CheckoutSystem();
  checkout.init();
});

class CheckoutSystem {
  constructor() {
    this.currentStep = 1;
    this.orderData = {
      customer: {},
      shipping: {},
      payment: {},
      items: [],
      totals: {}
    };
  }

  async init() {
    this.loadCartItems();
    this.setupEventListeners();
    this.updateStepDisplay();
    this.setupFormValidations();
  }

  loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.orderData.items = cart;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.orderData.totals = {
      subtotal: subtotal,
      delivery: 0,
      total: subtotal
    };

    this.updateOrderSummary();
  }

  setupEventListeners() {
    // Step navigation
    document.querySelectorAll('[data-next-step]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextStep();
      });
    });

    document.querySelectorAll('[data-prev-step]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevStep();
      });
    });

    // Location type change
    document.getElementById('locationType')?.addEventListener('change', () => {
      this.updateDeliveryCharge();
    });

    // Payment method change
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.togglePaymentDetails(radio.value);
      });
    });

    // Form submissions
    document.getElementById('personalInfoForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.nextStep();
    });

    document.getElementById('addressForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.nextStep();
    });

    document.getElementById('paymentForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.nextStep();
    });

    document.getElementById('confirmOrderBtn')?.addEventListener('click', () => {
      this.submitOrder();
    });
  }

  setupFormValidations() {
    // Personal info validation
    document.getElementById('fullName').addEventListener('input', this.validatePersonalInfo.bind(this));
    document.getElementById('phone').addEventListener('input', this.validatePersonalInfo.bind(this));
    document.getElementById('email').addEventListener('input', this.validatePersonalInfo.bind(this));

    // Address validation
    document.getElementById('locationType').addEventListener('change', this.validateAddress.bind(this));
    document.getElementById('fullAddress').addEventListener('input', this.validateAddress.bind(this));
  }

  validatePersonalInfo() {
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    const isValid = name.length > 0 && 
                   /^01[3-9]\d{8}$/.test(phone) && 
                   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    document.querySelector('[data-next-step="1"]').disabled = !isValid;
    return isValid;
  }

  validateAddress() {
    const locationType = document.getElementById('locationType').value;
    const address = document.getElementById('fullAddress').value.trim();
    
    const isValid = locationType && address.length > 10;
    document.querySelector('[data-next-step="2"]').disabled = !isValid;
    return isValid;
  }

  validatePayment() {
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    
    if (method === 'bkash') {
      const number = document.getElementById('bkashNumber').value.trim();
      const trxId = document.getElementById('bkashTrxID').value.trim();
      return number.length === 11 && trxId.length > 5;
    }
    
    if (method === 'nagad') {
      const number = document.getElementById('nagadNumber').value.trim();
      const trxId = document.getElementById('nagadTrxID').value.trim();
      return number.length === 11 && trxId.length > 5;
    }
    
    return true; // COD is always valid
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    
    // Save form data before proceeding
    this.saveStepData(this.currentStep);
    
    this.currentStep++;
    this.updateStepDisplay();
    
    if (this.currentStep === 4) {
      this.updateOrderConfirmation();
    }
  }

  prevStep() {
    this.currentStep--;
    this.updateStepDisplay();
  }

  validateCurrentStep() {
    switch(this.currentStep) {
      case 1: return this.validatePersonalInfo();
      case 2: return this.validateAddress();
      case 3: return this.validatePayment();
      default: return true;
    }
  }

  saveStepData(step) {
    switch(step) {
      case 1:
        this.orderData.customer = {
          name: document.getElementById('fullName').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          email: document.getElementById('email').value.trim(),
          note: document.getElementById('orderNote').value.trim()
        };
        break;
        
      case 2:
        this.orderData.shipping = {
          locationType: document.getElementById('locationType').value,
          address: document.getElementById('fullAddress').value.trim()
        };
        break;
        
      case 3:
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        this.orderData.payment = { method: paymentMethod };
        
        if (paymentMethod === 'bkash') {
          this.orderData.payment.details = {
            number: document.getElementById('bkashNumber').value.trim(),
            trxId: document.getElementById('bkashTrxID').value.trim()
          };
        } else if (paymentMethod === 'nagad') {
          this.orderData.payment.details = {
            number: document.getElementById('nagadNumber').value.trim(),
            trxId: document.getElementById('nagadTrxID').value.trim()
          };
        }
        break;
    }
  }

  updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.checkout-step').forEach((step, index) => {
      step.classList.remove('active', 'completed');
      
      if (index + 1 === this.currentStep) {
        step.classList.add('active');
      } else if (index + 1 < this.currentStep) {
        step.classList.add('completed');
      }
    });

    // Show the correct tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`step${this.currentStep}`).classList.add('active');
  }

  updateDeliveryCharge() {
    const locationType = document.getElementById('locationType').value;
    let deliveryCharge = 0;
    
    if (locationType === 'other') {
      deliveryCharge = this.orderData.totals.subtotal >= 2000 ? 0 : 150;
    }
    
    this.orderData.totals.delivery = deliveryCharge;
    this.orderData.totals.total = this.orderData.totals.subtotal + deliveryCharge;
    
    this.updateOrderSummary();
  }

  updateOrderSummary() {
    // Update checkout page summary
    document.getElementById('checkoutSubtotal').textContent = `৳${this.orderData.totals.subtotal.toFixed(2)}`;
    document.getElementById('checkoutDelivery').textContent = `৳${this.orderData.totals.delivery.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `৳${this.orderData.totals.total.toFixed(2)}`;
    
    // Delivery info message
    const deliveryInfo = document.getElementById('deliveryInfo');
    if (this.orderData.totals.subtotal >= 2000) {
      deliveryInfo.innerHTML = '<i class="fas fa-info-circle mr-2 text-green-500"></i> ২০০০+ টাকার অর্ডারে ডেলিভারি ফ্রি';
    } else if (this.orderData.shipping?.locationType === 'rajshahi-city') {
      deliveryInfo.innerHTML = '<i class="fas fa-info-circle mr-2 text-accent"></i> রাজশাহী সিটিতে ডেলিভারি ফ্রি';
    } else {
      deliveryInfo.innerHTML = '<i class="fas fa-info-circle mr-2 text-accent"></i> অন্যান্য এলাকায় ডেলিভারি চার্জ ৳১৫০';
    }
  }

  togglePaymentDetails(method) {
    document.getElementById('bkashDetails').classList.toggle('hidden', method !== 'bkash');
    document.getElementById('nagadDetails').classList.toggle('hidden', method !== 'nagad');
    this.validatePayment();
  }

  updateOrderConfirmation() {
    // Order items
    const itemsContainer = document.getElementById('orderItems');
    itemsContainer.innerHTML = this.orderData.items.map(item => `
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

    // Delivery address
    const addressContainer = document.getElementById('deliveryAddress');
    addressContainer.innerHTML = `
      <p class="font-medium">${this.orderData.customer.name}</p>
      <p>${this.orderData.customer.phone}</p>
      <p class="mt-2">${this.orderData.shipping.locationType === 'rajshahi-city' ? 'রাজশাহী সিটি কর্পোরেশন' : 'অন্যান্য স্থান'}</p>
      <p>${this.orderData.shipping.address}</p>
    `;

    // Payment method
    const paymentContainer = document.getElementById('paymentMethod');
    let paymentHtml = '';
    
    if (this.orderData.payment.method === 'bkash') {
      paymentHtml = `
        <p class="font-medium">bKash পেমেন্ট</p>
        <p>নম্বর: ${this.orderData.payment.details.number}</p>
        <p>ট্রানজেকশন আইডি: ${this.orderData.payment.details.trxId}</p>
      `;
    } else if (this.orderData.payment.method === 'nagad') {
      paymentHtml = `
        <p class="font-medium">Nagad পেমেন্ট</p>
        <p>নম্বর: ${this.orderData.payment.details.number}</p>
        <p>ট্রানজেকশন আইডি: ${this.orderData.payment.details.trxId}</p>
      `;
    } else {
      paymentHtml = `
        <p class="font-medium">ক্যাশ অন ডেলিভারি</p>
        <p>পণ্য ডেলিভারির সময় পেমেন্ট করুন</p>
      `;
    }
    
    paymentContainer.innerHTML = paymentHtml;

    // Order totals
    document.getElementById('confirmSubtotal').textContent = `৳${this.orderData.totals.subtotal.toFixed(2)}`;
    document.getElementById('confirmDelivery').textContent = `৳${this.orderData.totals.delivery.toFixed(2)}`;
    document.getElementById('confirmTotal').textContent = `৳${this.orderData.totals.total.toFixed(2)}`;
  }

  async submitOrder() {
    try {
      // Generate order ID
      this.orderData.orderId = 'ORD-' + Date.now().toString().slice(-8);
      this.orderData.date = new Date().toISOString();
      this.orderData.status = 'প্রক্রিয়াধীন';

      // In a real app, you would send to your backend
      console.log('Submitting order:', this.orderData);
      
      // Simulate API call
      const response = await this.saveOrderToDatabase(this.orderData);
      
      if (response.success) {
        // Clear cart and redirect
        localStorage.removeItem('cart');
        window.location.href = `/order-confirmation.html?orderId=${this.orderData.orderId}`;
      } else {
        this.showError('অর্ডার সাবমিট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      this.showError('অর্ডার সাবমিট করতে সমস্যা হয়েছে');
    }
  }

  async saveOrderToDatabase(orderData) {
    // In a real app, replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        // Save to localStorage as fallback
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        resolve({ success: true, orderId: orderData.orderId });
      }, 1000);
    });
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    const container = document.querySelector('main') || document.body;
    container.prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

// Initialize checkout system
window.checkoutSystem = new CheckoutSystem();