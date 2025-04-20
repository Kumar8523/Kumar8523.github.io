// contact.js - Contact Form Handling

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  // Form submission handler
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
      name: contactForm.fullName.value.trim(),
      email: contactForm.email.value.trim(),
      phone: contactForm.phone.value.trim(),
      subject: contactForm.subject.value.trim(),
      message: contactForm.message.value.trim()
    };

    // Simple validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showAlert('দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন', 'error');
      return;
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      showAlert('দয়া করে একটি বৈধ ইমেইল ঠিকানা প্রদান করুন', 'error');
      return;
    }

    try {
      // Show loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> প্রসেস হচ্ছে...';
      submitBtn.disabled = true;

      // Simulate form submission (replace with actual API call)
      await submitContactForm(formData);

      // Show success message
      showAlert('আপনার মেসেজ সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।', 'success');
      
      // Reset form
      contactForm.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      showAlert('মেসেজ পাঠাতে সমস্যা হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।', 'error');
    } finally {
      // Reset button state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });

  // Phone number formatting
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, '');
      e.target.value = formatPhoneNumber(value);
    });
  }
});

// Helper function to validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Helper function to format phone number
function formatPhoneNumber(value) {
  if (!value) return value;
  
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}

// Function to show alert messages
function showAlert(message, type) {
  // Remove existing alerts
  const existingAlert = document.getElementById('formAlert');
  if (existingAlert) existingAlert.remove();

  // Create alert element
  const alertDiv = document.createElement('div');
  alertDiv.id = 'formAlert';
  alertDiv.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white animate-fade-in`;
  
  alertDiv.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;

  // Add to DOM
  document.body.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.classList.add('animate-fade-out');
    setTimeout(() => alertDiv.remove(), 300);
  }, 5000);
}

// Simulate form submission (replace with actual API call)
async function submitContactForm(formData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Form submitted:', formData);
      resolve({ status: 'success' });
    }, 1500);
  });
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  .animate-fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);
