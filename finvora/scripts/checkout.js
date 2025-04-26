document.addEventListener('DOMContentLoaded', function() {
  const checkout = new CheckoutSystem();
  checkout.init();
});

class CheckoutSystem {
  constructor() {
    this.currentStep = 1;
    this.maxReachedStep = 1;
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
    this.disableFutureSteps();
  }

  disableFutureSteps() {
    document.querySelectorAll('.checkout-step').forEach((step, index) => {
      if (index + 1 > this.maxReachedStep) {
        step.classList.add('disabled');
        step.querySelector('i').style.opacity = '0.5';
      }
    });
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    
    this.saveStepData(this.currentStep);
    
    if (this.currentStep === this.maxReachedStep) {
      this.maxReachedStep++;
    }
    
    this.currentStep++;
    this.updateStepDisplay();
    this.disableFutureSteps();
    
    if (this.currentStep === 4) {
      this.updateOrderConfirmation();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
    }
  }

  validateCurrentStep() {
    let isValid = false;
    
    switch(this.currentStep) {
      case 1:
        isValid = this.validatePersonalInfo();
        break;
      case 2:
        isValid = this.validateAddress();
        break;
      case 3:
        isValid = this.validatePayment();
        break;
      default:
        isValid = true;
    }
    
    if (!isValid) {
      this.showError('অনুগ্রহ করে সমস্ত আবশ্যক তথ্য পূরণ করুন');
    }
    return isValid;
  }

  updateStepDisplay() {
    document.querySelectorAll('.checkout-step').forEach((step, index) => {
      step.classList.remove('active', 'completed');
      
      if (index + 1 === this.currentStep) {
        step.classList.add('active');
      } else if (index + 1 < this.currentStep) {
        step.classList.add('completed');
        step.querySelector('i').style.opacity = '1';
      }
      
      // Update icons based on state
      const icon = step.querySelector('i');
      if (index + 1 < this.currentStep) {
        icon.classList.remove('fa-user', 'fa-map-marker-alt', 'fa-credit-card');
        icon.classList.add('fa-check');
      } else {
        icon.className = this.getStepIcon(index + 1);
      }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`step${this.currentStep}`).classList.add('active');
  }

  getStepIcon(stepNumber) {
    switch(stepNumber) {
      case 1: return 'fas fa-user';
      case 2: return 'fas fa-map-marker-alt';
      case 3: return 'fas fa-credit-card';
      case 4: return 'fas fa-check-circle';
      default: return 'fas fa-circle';
    }
  }

  setupEventListeners() {
    // Prevent manual step clicking
    document.querySelectorAll('.checkout-step').forEach((step, index) => {
      step.addEventListener('click', (e) => {
        if (index + 1 > this.maxReachedStep) {
          this.showError('অনুগ্রহ করে ধাপ অনুযায়ী এগিয়ে চলুন');
        }
      });
    });

    // ... (rest of the event listeners remain same)
  }

  // ... (rest of the methods remain same with improved validation)

  validatePayment() {
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    let isValid = true;
    
    if (method === 'bkash') {
      const number = document.getElementById('bkashNumber').value.trim();
      const trxId = document.getElementById('bkashTrxID').value.trim();
      isValid = /^(?:\+88|01)?\d{11}$/.test(number) && trxId.length >= 6;
    }
    
    if (method === 'nagad') {
      const number = document.getElementById('nagadNumber').value.trim();
      const trxId = document.getElementById('nagadTrxID').value.trim();
      isValid = /^(?:\+88|01)?\d{11}$/.test(number) && trxId.length >= 6;
    }
    
    if (!isValid) {
      this.showError('অনুগ্রহ করে বৈধ পেমেন্ট তথ্য প্রদান করুন');
    }
    return isValid;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 animate-shake';
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
