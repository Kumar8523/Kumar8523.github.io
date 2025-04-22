// faq.js - Loads FAQs from JSON and handles interactions

class FAQManager {
  constructor() {
    this.faqs = [];
    this.activeCategory = 'all';
    this.init();
  }

  async init() {
    await this.loadFAQs();
    this.renderFAQs();
    this.setupEventListeners();
  }

  async loadFAQs() {
    try {
      const response = await fetch('scripts/faqs.json');
      if (!response.ok) throw new Error('Failed to load FAQs');
      this.faqs = await response.json();
    } catch (error) {
      console.error('Error loading FAQs:', error);
      this.showErrorState();
    }
  }

  renderFAQs() {
    const container = document.getElementById('faqContainer');
    if (!container) return;

    if (!this.faqs || this.faqs.length === 0) {
      this.showErrorState();
      return;
    }

    const filteredFAQs = this.activeCategory === 'all' 
      ? this.faqs 
      : this.faqs.filter(faq => faq.category === this.activeCategory);

    if (filteredFAQs.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-neutral">
          <i class="fas fa-info-circle text-3xl mb-2"></i>
          <p>এই ক্যাটাগরিতে কোনো FAQ নেই</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredFAQs.map((faq, index) => `
      <div class="faq-item bg-white shadow-md" data-id="${faq.id}" data-category="${faq.category}">
        <button class="faq-question w-full px-6 py-4 flex justify-between items-center text-left">
          <h3 class="text-lg font-medium text-primary">${index + 1}. ${faq.question}</h3>
          <svg class="h-6 w-6 transform transition-transform text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div class="faq-answer px-6 pb-4">
          <div class="text-neutral">${faq.answer}</div>
          ${faq.relatedLink ? `
            <a href="${faq.relatedLink}" class="inline-block mt-3 text-accent hover:underline">
              <i class="fas fa-external-link-alt mr-1"></i> আরও জানুন
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // FAQ item toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.faq-question')) {
        const faqItem = e.target.closest('.faq-item');
        this.toggleFAQ(faqItem);
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
      if (btn.dataset.category === category) {
        btn.classList.add('bg-accent', 'text-white');
        btn.classList.remove('bg-gray-200', 'text-neutral');
      } else {
        btn.classList.remove('bg-accent', 'text-white');
        btn.classList.add('bg-gray-200', 'text-neutral');
      }
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FAQManager();
});
