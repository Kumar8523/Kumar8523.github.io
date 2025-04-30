// সুরক্ষিত কনফিগ লোডার
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // লোডিং স্পিনার দেখান
        document.getElementById('loading-spinner').classList.remove('hidden');
        
        // CSP হেডার চেক
        if (!isCSPEnabled()) {
            throw new Error('Content Security Policy violation detected');
        }
        
        // কনফিগ ডেটা লোড করুন (সার্ভার থেকে)
        const response = await fetch('/api/config', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) throw new Error('Failed to load configuration');
        
        const config = await response.json();
        
        // ডেটা লোড হওয়ার পর UI বিল্ড করুন
        buildUI(config);
        
    } catch (error) {
        console.error('Configuration Error:', error);
        showErrorUI();
    } finally {
        // লোডিং স্পিনার লুকান
        document.getElementById('loading-spinner').classList.add('hidden');
    }
});

function isCSPEnabled() {
    return document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
}

async function buildUI(config) {
    // নেভিগেশন লোড করুন
    await loadNavbar(config.navbar);
    
    // হিরো সেকশন লোড করুন
    await loadHero(config.hero);
    
    // অন্যান্য সেকশন লোড করুন
    await Promise.all([
        loadAbout(config.about),
        loadCourses(config.courses),
        loadEvents(config.events),
        loadTeachers(config.teachers),
        loadGallery(config.gallery),
        loadContact(config.contact)
    ]);
    
    // ইন্টারঅ্যাক্টিভিটি ইনিশিয়ালাইজ করুন
    initInteractivity();
}

function showErrorUI() {
    document.body.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-sangeet-light p-6">
            <div class="text-center max-w-md">
                <div class="text-6xl mb-4">🎵</div>
                <h1 class="text-2xl font-bold text-sangeet-dark mb-2">ত্রিসপ্তক</h1>
                <p class="text-sangeet-primary mb-4">সঙ্গীত বিদ্যালয়</p>
                <p class="text-gray-700 mb-6">দুঃখিত, ওয়েবসাইট লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>
                <button onclick="window.location.reload()" class="btn-sangeet">
                    <i class="fas fa-sync-alt mr-2"></i> রিফ্রেশ করুন
                </button>
            </div>
        </div>
    `;
}

// অন্যান্য লোডিং ফাংশনগুলো পূর্বের মতোই থাকবে
