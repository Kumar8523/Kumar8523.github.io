// faq.js - Direct loading version
document.addEventListener('DOMContentLoaded', () => {
  const faqManager = new FAQManager();
  faqManager.init();
});

class FAQManager {
  constructor() {
    this.faqs = [];
    this.activeCategory = 'all';
  }

  async init() {
    await this.loadFAQs();
    this.renderFAQs();
    this.setupEventListeners();
  }

  async loadFAQs() {
    try {
      const response = await fetch('scripts/faqs.json');
      this.faqs = await response.json();
    } catch (error) {
      console.error('Error loading FAQs:', error);
      this.showErrorState();
    }
  }

  renderFAQs() {
    const container = document.getElementById('faqContainer');
    if (!container) return;

    const filteredFAQs = this.activeCategory === 'all' 
      ? this.faqs 
      : this.faqs.filter(faq => faq.category === this.activeCategory);

    container.innerHTML = filteredFAQs.map(faq => `
      <div class="faq-item bg-white shadow-md" data-id="${faq.id}">
        <button class="faq-question w-full px-6 py-4 flex justify-between items-center text-left">
          <h3 class="text-lg font-medium text-primary">${faq.question}</h3>
          <svg class="h-6 w-6 transform transition-transform text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div class="faq-answer px-6 pb-4">
          <div class="text-neutral">${faq.answer}</div>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // FAQ toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.faq-question')) {
        this.toggleFAQ(e.target.closest('.faq-item'));
      }
    });

    // Category filter
    document.querySelectorAll('.faq-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterByCategory(btn.dataset.category);
      });
    });
  }

  toggleFAQ(faqItem) {
    const isActive = faqItem.classList.contains('active');
    const answer = faqItem.querySelector('.faq-answer');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
      if (item !== faqItem) {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
      }
    });

    // Toggle current FAQ
    if (isActive) {
      faqItem.classList.remove('active');
      answer.style.maxHeight = null;
    } else {
      faqItem.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  }

  filterByCategory(category) {
    this.activeCategory = category;
    
    // Update active button
    document.querySelectorAll('.faq-category-btn').forEach(btn => {
      btn.classList.toggle('bg-accent', btn.dataset.category === category);
      btn.classList.toggle('text-white', btn.dataset.category === category);
      btn.classList.toggle('bg-gray-200', btn.dataset.category !== category);
      btn.classList.toggle('text-neutral', btn.dataset.category !== category);
    });

    this.renderFAQs();
  }

  showErrorState() {
    const container = document.getElementById('faqContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>FAQ লোড করতে সমস্যা হয়েছে</p>
          <button onclick="location.reload()" class="mt-4 text-accent hover:underline">
            <i class="fas fa-sync-alt mr-1"></i> আবার চেষ্টা করুন
          </button>
        </div>
      `;
    }
  }
}
