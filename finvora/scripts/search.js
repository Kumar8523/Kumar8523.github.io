class ProductSearch {
  constructor() {
    this.products = [];
    this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  }

  async init() {
    await this.loadProducts();
    this.setupSearchHandlers();
  }

  async loadProducts() {
    try {
      const response = await fetch('scripts/products.json');
      const data = await response.json();
      this.products = data.products;
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  setupSearchHandlers() {
    // Navbar search form
    const navSearchForm = document.querySelector('nav form[action="products.html"]');
    if (navSearchForm) {
      const searchInput = navSearchForm.querySelector('input[name="search"]');
      
      // Live search suggestions
      searchInput.addEventListener('input', this.debounce(() => {
        this.showSuggestions(searchInput.value);
      }, 300));
      
      // Form submission
      navSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.searchProducts(searchInput.value);
      });
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      const suggestions = document.getElementById('searchSuggestions');
      if (suggestions && !e.target.closest('.search-container')) {
        suggestions.classList.add('hidden');
      }
    });
  }

  showSuggestions(searchTerm) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;

    if (searchTerm.length < 2) {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.classList.add('hidden');
      return;
    }

    const suggestions = this.getSuggestions(searchTerm);
    this.displaySuggestions(suggestions, searchTerm);
  }

  getSuggestions(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.products
      .filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term))
      )
      .slice(0, 5);
  }

  displaySuggestions(suggestions, searchTerm) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;

    if (suggestions.length === 0) {
      container.innerHTML = '<div class="p-3 text-gray-500">কোনো মিল পাওয়া যায়নি</div>';
      container.classList.remove('hidden');
      return;
    }

    container.innerHTML = suggestions.map(product => `
      <a href="product_info.html?id=${product.id}" class="block p-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
        <div class="font-medium">${this.highlightText(product.name, searchTerm)}</div>
        <div class="text-xs text-gray-500">${product.category}</div>
      </a>
    `).join('');

    container.classList.remove('hidden');
  }

  highlightText(text, term) {
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const startIdx = lowerText.indexOf(lowerTerm);
    
    if (startIdx === -1) return text;
    
    const endIdx = startIdx + term.length;
    return `
      ${text.substring(0, startIdx)}
      <span class="bg-yellow-100">${text.substring(startIdx, endIdx)}</span>
      ${text.substring(endIdx)}
    `;
  }

  searchProducts(searchTerm) {
    if (!searchTerm.trim()) return;

    // Save to search history
    this.saveSearchHistory(searchTerm);

    // Redirect to products page with search query
    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
  }

  saveSearchHistory(searchTerm) {
    if (!searchTerm.trim()) return;

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(
      item => item.toLowerCase() !== searchTerm.toLowerCase()
    );

    // Add to beginning
    this.searchHistory.unshift(searchTerm);

    // Keep only last 5 items
    this.searchHistory = this.searchHistory.slice(0, 5);

    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  debounce(func, delay) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProductSearch().init();
});
