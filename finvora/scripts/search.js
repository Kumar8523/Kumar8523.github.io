// search.js - Advanced Search Functionality

class SearchManager {
  constructor() {
    this.searchIndex = [];
    this.init();
  }

  async init() {
    await this.buildSearchIndex();
    this.setupSearchHandlers();
    this.processURLParams();
  }

  async buildSearchIndex() {
    try {
      const response = await fetch('scripts/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      const { products } = await response.json();
      
      this.searchIndex = products.map(product => ({
        id: product.id,
        name: product.name.toLowerCase(),
        category: product.category.toLowerCase(),
        description: product.description?.toLowerCase() || '',
        tags: product.tags?.join(' ') || ''
      }));
    } catch (error) {
      console.error('Search initialization failed:', error);
    }
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
        this.debounce(() => this.showSearchSuggestions(), 300));
    }

    // Click outside to close suggestions
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#searchContainer')) {
        this.hideSearchSuggestions();
      }
    });
  }

  handleSearchSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[name="search"]');
    const searchTerm = input.value.trim();
    
    if (searchTerm) {
      const url = new URL(window.location.origin + '/products.html');
      url.searchParams.set('search', encodeURIComponent(searchTerm));
      
      const category = form.querySelector('select[name="category"]')?.value;
      if (category) url.searchParams.set('category', category);
      
      window.location.href = url.toString();
    }
  }

  showSearchSuggestions() {
    const input = document.getElementById('liveSearch');
    if (!input || !input.value.trim()) {
      this.hideSearchSuggestions();
      return;
    }

    const term = input.value.toLowerCase();
    const suggestions = this.searchIndex
      .filter(item => 
        item.name.includes(term) || 
        item.tags.includes(term)
      )
      .slice(0, 5);

    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
      suggestionsContainer.innerHTML = suggestions.map(item => `
        <div class="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-0"
             onclick="window.location.href='product_info.html?id=${item.id}'">
          ${item.name}
        </div>
      `).join('');
      
      suggestionsContainer.classList.remove('hidden');
    }
  }

  hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
      suggestionsContainer.classList.add('hidden');
    }
  }

  processURLParams() {
    if (!window.location.pathname.includes('products.html')) return;
    
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('search');
    const category = params.get('category');
    
    if (searchTerm) {
      const searchInputs = document.querySelectorAll('input[name="search"]');
      searchInputs.forEach(input => input.value = decodeURIComponent(searchTerm));
    }
    
    if (category) {
      const categorySelects = document.querySelectorAll('select[name="category"]');
      categorySelects.forEach(select => select.value = category);
    }
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
  new SearchManager();
});
