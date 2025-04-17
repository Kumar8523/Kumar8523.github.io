document.addEventListener('DOMContentLoaded', () => {
  // products.html-এ সকল সার্চ ফর্মের জন্য ইভেন্ট লিসেনার
  const searchForms = document.querySelectorAll('form[action="products.html"]');
  searchForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = form.querySelector('input[name="search"]');
      const searchTerm = encodeURIComponent(searchInput.value.trim());
      // সার্চ টার্মসহ products.html এ রিডাইরেক্ট
      window.location.href = `products.html?search=${searchTerm}`;
    });
  });

  // যদি আমরা products.html পেজে থাকি, URL থেকে সার্চ টার্ম লোড করুন
  if(window.location.pathname.includes('products.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    if(searchTerm) {
      const globalSearchInput = document.getElementById('globalSearch');
      if(globalSearchInput) {
        globalSearchInput.value = decodeURIComponent(searchTerm);
      }
      // ফিল্টার ফাংশন কল করুন
      filterProducts();
    }
  }
});

// ফিল্টার ফাংশন: সার্চ টার্ম ও ক্যাটাগরি অনুযায়ী প্রোডাক্টগুলো দেখাবে
function filterProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search') ? urlParams.get('search').toLowerCase() : '';
  const categoryFilter = urlParams.get('category') || 'all';

  // ধরা হয়েছে যে, products একটি গ্লোবাল array যা প্রতিটি প্রোডাক্টের সাথে সংশ্লিষ্ট DOM element (element property) আছে।
  if (typeof products !== 'undefined' && Array.isArray(products)) {
    products.forEach(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery);
      const matchesCategory = categoryFilter === 'all' || product.category.toLowerCase() === categoryFilter.toLowerCase();
      if(product.element) {
        product.element.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
      }
    });
  }
}
