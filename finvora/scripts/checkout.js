// checkout.js - Enhanced version
document.addEventListener('DOMContentLoaded', function() {
  const checkout = new CheckoutManager();
  checkout.init();
});

class CheckoutManager {
  constructor() {
    this.currentStep = 1;
    this.formData = {};
  }

  init() {
    this.loadCartData();
    this.setupStepNavigation();
    this.setupEventListeners();
    this.updateStepDisplay();
  }

  loadCartData() {
    const checkoutData = sessionStorage.getItem('checkoutData');
    if (checkoutData) {
      const data = JSON.parse(checkoutData);
      document.getElementById('checkoutSubtotal').textContent = `৳${data.subtotal.toFixed(2)}`;
      document.getElementById('checkoutTotal').textContent = `৳${data.subtotal.toFixed(2)}`;
    }
  }

  setupStepNavigation() {
    document.querySelectorAll('[data-next-step]').forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });

    document.querySelectorAll('[data-prev-step]').forEach(btn => {
      btn.addEventListener('click', () => this.prevStep());
    });
  }

  setupEventListeners() {
    // Location type change handler
    document.getElementById('locationType')?.addEventListener('change', () => {
      this.updateDeliveryCharge();
    });

    // Payment method change handler
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.togglePaymentDetails(radio.value);
      });
    });
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    
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
    let isValid = true;
    
    switch(this.currentStep) {
      case 1:
        isValid = document.getElementById('personalInfoForm').checkValidity();
        if (!isValid) document.getElementById('personalInfoForm').reportValidity();
        break;
        
      case 2:
        isValid = document.getElementById('addressForm').checkValidity();
        if (!isValid) document.getElementById('addressForm').reportValidity();
        break;
        
      case 3:
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        if ((paymentMethod === 'bkash' && (!document.getElementById('bkashTrxID').value || !document.getElementById('bkashNumber').value)) {
          alert('অনুগ্রহ করে পেমেন্টের প্রয়োজনীয় তথ্য প্রদান করুন');
          isValid = false;
        }
        break;
    }
    
    return isValid;
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
    const subtotal = parseFloat(document.getElementById('checkoutSubtotal').textContent.replace('৳', ''));
    let deliveryCharge = locationType === 'rajshahi-city' ? 0 : 150;
    
    // Free delivery for orders above 2000
    if (subtotal >= 2000) {
      deliveryCharge = 0;
      document.getElementById('deliveryInfo').innerHTML = `
        <p><i class="fas fa-info-circle mr-2 text-green-500"></i> ২০০০ টাকার বেশি অর্ডারে ডেলিভারি ফ্রি</p>
      `;
    }

    document.getElementById('checkoutDelivery').textContent = `৳${deliveryCharge.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `৳${(subtotal + deliveryCharge).toFixed(2)}`;
  }

  togglePaymentDetails(method) {
    document.getElementById('bkashDetails').classList.add('hidden');
    document.getElementById('nagadDetails').classList.add('hidden');
    
    if (method === 'bkash') {
      document.getElementById('bkashDetails').classList.remove('hidden');
    } else if (method === 'nagad') {
      document.getElementById('nagadDetails').classList.remove('hidden');
    }
  }

  updateOrderConfirmation() {
    // Update order items, delivery address, and payment method in confirmation step
    // (Implementation similar to previous version)
  }

  submitOrder() {
    // Submit order implementation
    // (Implementation similar to previous version)
  }
}
