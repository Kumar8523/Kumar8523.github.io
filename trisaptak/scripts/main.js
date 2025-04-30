// সঙ্গীত-থিমড মেইন জাভাস্ক্রিপ্ট
class TrisaptakApp {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initServiceWorker();
        this.initAnalytics();
    }
    
    setupEventListeners() {
        // স্মুথ স্ক্রোলিং
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll);
        });
        
        // মোবাইল মেনু টগল
        document.getElementById('mobile-menu-button')?.addEventListener('click', this.toggleMobileMenu);
        
        // কন্টাক্ট ফর্ম সাবমিশন
        document.getElementById('contact-form')?.addEventListener('submit', this.handleFormSubmit);
    }
    
    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // URL আপডেট করুন (without page reload)
            history.pushState(null, null, targetId);
        }
    }
    
    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('hidden');
        menu.classList.toggle('animate-slideDown');
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            // বাটন ডিজেবল করুন
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> প্রেরণ হচ্ছে...';
            
            // ডেটা ভ্যালিডেশন
            if (!this.validateForm(formData)) {
                throw new Error('অনুগ্রহ করে সমস্ত ফিল্ড সঠিকভাবে পূরণ করুন');
            }
            
            // সার্ভারে ডেটা পাঠান
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.getCSRFToken()
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (!response.ok) {
                throw new Error('বার্তা পাঠানো যায়নি');
            }
            
            // সাফল্য মেসেজ দেখান
            this.showAlert('success', 'ধন্যবাদ! আপনার বার্তা পৌঁছেছে। আমরা শীঘ্রই যোগাযোগ করব।');
            form.reset();
            
        } catch (error) {
            this.showAlert('error', error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
    
    validateForm(formData) {
        // বেসিক ফর্ম ভ্যালিডেশন
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        if (!name || name.length < 3) return false;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
        if (!message || message.length < 10) return false;
        
        return true;
    }
    
    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }
    
    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-fadeIn ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 5 সেকেন্ড পর অ্যালার্ট অটো হাইড
        setTimeout(() => {
            alertDiv.classList.replace('animate-fadeIn', 'animate-fadeOut');
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
    }
    
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    registration => {
                        console.log('ServiceWorker registration successful');
                    },
                    err => {
                        console.log('ServiceWorker registration failed: ', err);
                    }
                );
            });
        }
    }
    
    initAnalytics() {
        // গুগল অ্যানালিটিক্স বা অন্যান্য ট্র্যাকিং ইনিশিয়ালাইজ করুন
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'YOUR_GA_TRACKING_ID');
    }
}

// অ্যাপ্লিকেশন শুরু করুন
document.addEventListener('DOMContentLoaded', () => {
    new TrisaptakApp();
});
