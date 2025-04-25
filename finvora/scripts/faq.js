// faq.js - HTML embedded version
document.addEventListener('DOMContentLoaded', () => {
  const faqManager = new FAQManager();
  faqManager.init();
});

class FAQManager {
  constructor() {
    this.faqs = [
      {
        id: 1,
        category: "order",
        question: "আমি কিভাবে অর্ডার করতে পারি?",
        answer: "আপনি আমাদের ওয়েবসাইট বা মোবাইল অ্যাপ থেকে পণ্য নির্বাচন করে কার্টে যোগ করতে পারেন এবং চেকআউট প্রক্রিয়া সম্পন্ন করে অর্ডার করতে পারেন।"
      },
      {
        id: 2,
        category: "delivery",
        question: "ডেলিভারি কতদিনে পাবো?",
        answer: "সাধারণত ঢাকার ভিতরে ১-৩ কার্যদিবস এবং ঢাকার বাইরে ৩-৭ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।"
      },
      {
        id: 3,
        category: "payment",
        question: "পেমেন্টের পদ্ধতি গুলো কি কি?",
        answer: "আপনি বিকাশ, নগদ, রকেট, কার্ড পেমেন্ট এবং ক্যাশ অন ডেলিভারি (COD) পদ্ধতিতে পেমেন্ট করতে পারেন।"
      },
      {
        id: 4,
        category: "return",
        question: "পণ্য রিটার্ন করতে চাইলে কি করব?",
        answer: "আপনি অর্ডার করার ৭ দিনের মধ্যে পণ্য রিটার্ন করতে পারেন। আমাদের কাস্টমার সার্ভিসে যোগাযোগ করে রিটার্ন প্রক্রিয়া শুরু করুন।"
      },
      {
        id: 5,
        category: "order",
        question: "অর্ডার ক্যানসেল করতে চাইলে কি করব?",
        answer: "অর্ডার শিপ হওয়ার আগে আপনি আপনার অ্যাকাউন্ট থেকে অর্ডার ক্যানসেল করতে পারবেন অথবা আমাদের কাস্টমার কেয়ারে ফোন করে ক্যানসেল করতে পারবেন।"
      }
    ];
    this.activeCategory = 'all';
  }

  init() {
    this.renderFAQs();
    this.setupEventListeners();
  }

  renderFAQs() {
    const container = document.getElementById('faqContainer');
    if (!container) return;

    const filteredFAQs = this.activeCategory === 'all' 
      ? this.faqs 
      : this.faqs.filter(faq => faq.category === this.activeCategory);

    if (filteredFAQs.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-neutral">
          <i class="fas fa-info-circle text-3xl mb-2"></i>
          <p>এই ক্যাটাগরিতে কোনো FAQ পাওয়া যায়নি</p>
        </div>
      `;
      return;
    }

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
}
