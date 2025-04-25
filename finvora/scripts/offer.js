document.addEventListener('DOMContentLoaded', () => {
  const offerManager = new OfferManager();
  offerManager.init();
});

class OfferManager {
  constructor() {
    this.offers = [];
    this.countdownIntervals = {};
  }

  async init() {
    await this.loadOffers();
    this.renderOffers();
    this.setupCountdownTimers();
  }

  async loadOffers() {
    try {
      const response = await fetch('scripts/offer.json');
      if (!response.ok) throw new Error('Failed to load offers');
      const data = await response.json();
      this.offers = data.offers;
    } catch (error) {
      console.error('Error loading offers:', error);
      this.showErrorState();
    }
  }

  renderOffers() {
    const activeContainer = document.getElementById('activeOffers');
    const expiredContainer = document.getElementById('expiredOffers');
    
    if (!activeContainer || !expiredContainer) return;

    // Clear previous content
    activeContainer.innerHTML = '';
    expiredContainer.innerHTML = '';

    // Get current time
    const now = new Date();

    // Separate active and expired offers
    const activeOffers = [];
    const expiredOffers = [];

    this.offers.forEach(offer => {
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);

      if (now >= startDate && now <= endDate) {
        activeOffers.push(offer);
      } else {
        expiredOffers.push(offer);
      }
    });

    // Render active offers
    if (activeOffers.length > 0) {
      activeOffers.forEach(offer => {
        activeContainer.appendChild(this.createOfferCard(offer));
      });
    } else {
      activeContainer.innerHTML = `
        <div class="col-span-full text-center py-12 text-neutral">
          <i class="fas fa-calendar-times text-3xl mb-2"></i>
          <p>বর্তমানে কোনো চলমান অফার নেই</p>
        </div>
      `;
    }

    // Render expired offers
    if (expiredOffers.length > 0) {
      expiredOffers.forEach(offer => {
        expiredContainer.appendChild(this.createOfferCard(offer, true));
      });
    } else {
      expiredContainer.innerHTML = `
        <div class="col-span-full text-center py-12 text-neutral">
          <i class="fas fa-calendar-check text-3xl mb-2"></i>
          <p>কোনো মেয়াদোত্তীর্ণ অফার নেই</p>
        </div>
      `;
    }
  }

  createOfferCard(offer, isExpired = false) {
    const card = document.createElement('div');
    card.className = 'offer-card bg-white rounded-lg shadow-md overflow-hidden';

    const endDate = new Date(offer.endDate);
    const timeLeft = this.getTimeLeft(endDate);

    card.innerHTML = `
      <div class="relative">
        <img src="${offer.image}" alt="${offer.title}" class="w-full h-48 object-cover">
        <span class="absolute top-2 right-2 bg-offer text-white px-3 py-1 rounded-full text-sm font-bold">
          ${offer.discount}% ছাড়
        </span>
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold text-primary mb-2">${offer.title}</h3>
        <p class="text-neutral mb-4">${offer.description}</p>
        
        ${!isExpired ? `
          <div class="mb-4">
            <p class="text-sm text-neutral mb-1">অফার শেষ হতে বাকি:</p>
            <div class="countdown text-offer font-bold" data-end="${offer.endDate}">
              ${timeLeft.days} দিন ${timeLeft.hours} ঘণ্টা ${timeLeft.minutes} মিনিট
            </div>
          </div>
          <a href="products.html" class="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition">
            <i class="fas fa-shopping-cart mr-2"></i> এখনই কিনুন
          </a>
        ` : `
          <div class="text-sm text-neutral">
            <i class="fas fa-clock-rotate-left mr-1"></i> অফার শেষ হয়েছে: ${endDate.toLocaleDateString('bn-BD')}
          </div>
        `}
      </div>
    `;

    return card;
  }

  getTimeLeft(endDate) {
    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }

  setupCountdownTimers() {
    // Clear existing intervals
    Object.values(this.countdownIntervals).forEach(interval => {
      clearInterval(interval);
    });
    this.countdownIntervals = {};

    // Setup new countdown timers
    document.querySelectorAll('.countdown').forEach(element => {
      const endDate = new Date(element.dataset.end);
      const offerId = element.closest('.offer-card').dataset.id;

      // Update immediately
      this.updateCountdown(element, endDate);

      // Set interval to update every minute
      this.countdownIntervals[offerId] = setInterval(() => {
        this.updateCountdown(element, endDate);
      }, 60000); // Update every minute
    });
  }

  updateCountdown(element, endDate) {
    const timeLeft = this.getTimeLeft(endDate);
    element.textContent = `${timeLeft.days} দিন ${timeLeft.hours} ঘণ্টা ${timeLeft.minutes} মিনিট`;

    // If offer has expired, reload offers to move it to expired section
    if (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0) {
      this.renderOffers();
    }
  }

  showErrorState() {
    const container = document.querySelector('main');
    if (container) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>অফার লোড করতে সমস্যা হয়েছে</p>
          <button onclick="location.reload()" class="mt-4 text-accent hover:underline">
            <i class="fas fa-sync-alt mr-1"></i> আবার চেষ্টা করুন
          </button>
        </div>
      `;
    }
  }
}
