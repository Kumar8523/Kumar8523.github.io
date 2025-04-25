class ProductSearch {
  constructor() {
    this.products = [];
    this.searchIndex = [];
    this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.buildSearchIndex();
    this.setupSearchHandlers();
    this.processURLParams();
    this.setupSearchHistory();
  }

  async loadProducts() {
    try {
      const response = await fetch('scripts/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      this.products = data.products;
      this.attachDOMReferences();
    } catch (error) {
      console.error('Search initialization failed:', error);
      this.showErrorState();
    }
  }

  attachDOMReferences() {
    this.products.forEach(product => {
      product.domElement = document.querySelector(`[data-product-id="${product.id}"]`);
    });
  }

  buildSearchIndex() {
    this.searchIndex = this.products.map(product => ({
      id: product.id,
      name: product.name.toLowerCase(),
      category: product.category.toLowerCase(),
      description: product.description?.toLowerCase() || '',
      tags: product.tags?.join(' ') || '',
      sku: product.sku?.toLowerCase() || ''
    }));
  }

  setupSearchHandlers() {
    // Global search forms
    document.querySelectorAll('form[data-role="search"]').forEach(form => {
      form.addEventListener('submit', e => this.handleSearchSubmit(e));
    });

    // Live search input
    const liveSearchInput = document.getElementById('liveSearch');
    if (liveSearchInput) {
      liveSearchInput.addEventListener('input', 
        this.debounce(() => this.handleLiveSearch(liveSearchInput.value), 300));
    }
  }

  handleSearchSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[name="search"]');
    const searchTerm = input.value.trim();
    
    if (searchTerm) {
      this.saveSearchHistory(searchTerm);
      
      const url = new URL(window.location.origin + '/products.html');
      url.searchParams.set('search', encodeURIComponent(searchTerm));
      
      const category = form.querySelector('select[name="category"]')?.value;
      if (category) url.searchParams.set('category', category);
      
      window.location.href = url.toString();
    }
  }

  handleLiveSearch(term) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;

    if (term.length < 2) {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.classList.add('hidden');
      return;
    }

    const suggestions = this.getSearchSuggestions(term);
    this.displaySuggestions(suggestions, term);
  }

  getSearchSuggestions(term) {
    const lowerTerm = term.toLowerCase();
    return this.searchIndex
      .filter(item => 
        item.name.includes(lowerTerm) || 
        item.tags.includes(lowerTerm) ||
        item.sku.includes(lowerTerm)
      )
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        text: this.products.find(p => p.id === item.id).name,
        category: item.category
      }));
  }

  displaySuggestions(suggestions, term) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;

    if (suggestions.length === 0) {
      container.innerHTML = '<div class="p-3 text-gray-500">No matching products found</div>';
      container.classList.remove('hidden');
      return;
    }

    container.innerHTML = suggestions.map(item => `
      <a href="product_info.html?id=${item.id}" class="block p-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
        <div class="font-medium">${this.highlightText(item.text, term)}</div>
        <div class="text-xs text-gray-500 capitalize">${item.category}</div>
      </a>
    `).join('');

    // Add search history
    if (this.searchHistory.length > 0) {
      const historyItems = this.searchHistory
        .filter(item => item.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 3);
      
      if (historyItems.length > 0) {
        container.innerHTML += `
          <div class="border-t border-gray-200 pt-2">
            <div class="px-3 py-1 text-xs text-gray-500">Recent searches</div>
            ${historyItems.map(item => `
              <a href="products.html?search=${encodeURIComponent(item)}" class="block p-3 hover:bg-gray-100">
                <div class="flex items-center">
                  <i class="fas fa-history mr-2 text-gray-400"></i>
                  <span>${item}</span>
                </div>
              </a>
            `).join('')}
          </div>
        `;
      }
    }

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

  saveSearchHistory(term) {
    if (!term) return;
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => 
      item.toLowerCase() !== term.toLowerCase()
    );
    
    // Add to beginning
    this.searchHistory.unshift(term);
    
    // Keep only last 10 items
    this.searchHistory = this.searchHistory.slice(0, 10);
    
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  setupSearchHistory() {
    const searchInputs = document.querySelectorAll('input[name="search"]');
    searchInputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (this.searchHistory.length === 0) return;
        
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = `
          <div class="px-3 py-1 text-xs text-gray-500">Recent searches</div>
          ${this.searchHistory.map(item => `
            <a href="products.html?search=${encodeURIComponent(item)}" class="block p-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
              <div class="flex items-center">
                <i class="fas fa-history mr-2 text-gray-400"></i>
                <span>${item}</span>
              </div>
            </a>
          `).join('')}
        `;
        container.classList.remove('hidden');
      });
    });
  }

  processURLParams() {
    if (!window.location.pathname.includes('products.html')) return;
    
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('search');
    const category = params.get('category');
    
    if (searchTerm || category) {
      this.filterProducts(searchTerm, category);
      this.updateSearchUI(searchTerm, category);
    }
  }

  filterProducts(searchTerm = '', category = 'all') {
    const term = searchTerm?.toLowerCase() || '';
    const cat = category.toLowerCase();
    
    this.products.forEach(product => {
      const indexEntry = this.searchIndex.find(item => item.id === product.id);
      const matchesSearch = !term || 
        indexEntry.name.includes(term) || 
        indexEntry.description.includes(term) ||
        indexEntry.tags.includes(term);
      
      const matchesCategory = cat === 'all' || 
        indexEntry.category === cat;
      
      if (product.domElement) {
        product.domElement.style.display = 
          (matchesSearch && matchesCategory) ? 'block' : 'none';
      }
    });
    
    this.updateResultsCount();
    this.toggleNoResultsMessage();
  }

  updateResultsCount() {
    const visibleCount = this.products.filter(p => 
      p.domElement?.style.display !== 'none').length;
    
    document.querySelectorAll('[data-role="results-count"]').forEach(el => {
      el.textContent = `${visibleCount} products found`;
    });
  }

  toggleNoResultsMessage() {
    const visibleCount = this.products.filter(p => 
      p.domElement?.style.display !== 'none').length;
    
    const messages = document.querySelectorAll('[data-role="no-results"]');
    messages.forEach(msg => {
      msg.style.display = visibleCount === 0 ? 'block' : 'none';
    });
  }

  showErrorState() {
    const containers = document.querySelectorAll('[data-role="search-results"]');
    containers.forEach(container => {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-red-500">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Failed to load search functionality. Please try again later.
        </div>
      `;
    });
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
  new ProductSearch();

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    const suggestions = document.getElementById('searchSuggestions');
    const searchInputs = document.querySelectorAll('input[name="search"]');
    
    if (suggestions && !suggestions.contains(e.target) {
      let isInput = false;
      searchInputs.forEach(input => {
        if (input.contains(e.target)) isInput = true;
      });
      
      if (!isInput) {
        suggestions.classList.add('hidden');
      }
    }
  });
});
