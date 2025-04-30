// Configuration Loader
document.addEventListener('DOMContentLoaded', function() {
    // Load all JSON configurations
    Promise.all([
        fetch('config/site-config.json').then(res => res.json()),
        fetch('config/navbar.json').then(res => res.json()),
        fetch('config/hero.json').then(res => res.json()),
        fetch('config/about.json').then(res => res.json()),
        fetch('config/courses.json').then(res => res.json()),
        fetch('config/events.json').then(res => res.json()),
        fetch('config/teachers.json').then(res => res.json()),
        fetch('config/gallery.json').then(res => res.json()),
        fetch('config/contact.json').then(res => res.json())
    ]).then(([siteConfig, navbar, hero, about, courses, events, teachers, gallery, contact]) => {
        // Set site title and meta description
        document.title = siteConfig.siteTitle + " - " + siteConfig.siteDescription;
        document.querySelector('meta[name="description"]').setAttribute('content', siteConfig.siteDescription);

        // Load navbar
        loadNavbar(navbar);
        
        // Load hero section
        loadHero(hero);
        
        // Load about section
        loadAbout(about);
        
        // Load courses section
        loadCourses(courses);
        
        // Load events section
        loadEvents(events);
        
        // Load teachers section
        loadTeachers(teachers);
        
        // Load gallery section
        loadGallery(gallery);
        
        // Load contact section
        loadContact(contact, siteConfig);
        
        // Initialize smooth scrolling for anchor links
        initSmoothScrolling();
        
        // Initialize contact form
        initContactForm();
    }).catch(error => {
        console.error('Error loading configuration:', error);
    });
});

// Function to load navbar
function loadNavbar(config) {
    const navbar = document.getElementById('navbar');
    
    navbar.innerHTML = `
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <img src="${config.logo}" alt="${config.altText}" class="h-12">
                    <span class="ml-3 text-xl font-semibold text-gray-800">ত্রিসপ্তক</span>
                </div>
                
                <div class="hidden md:flex items-center space-x-8">
                    ${config.menuItems.map(item => `
                        <a href="${item.url}" class="text-gray-700 hover:text-yellow-600 transition flex items-center">
                            <i class="${item.icon} mr-2"></i>
                            ${item.name}
                        </a>
                    `).join('')}
                    
                    <a href="${config.ctaButton.url}" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition flex items-center">
                        <i class="${config.ctaButton.icon} mr-2"></i>
                        ${config.ctaButton.text}
                    </a>
                </div>
                
                <!-- Mobile menu button -->
                <div class="md:hidden">
                    <button id="mobile-menu-button" class="text-gray-700 focus:outline-none">
                        <i class="fas fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <!-- Mobile menu -->
            <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4">
                ${config.menuItems.map(item => `
                    <a href="${item.url}" class="block py-2 text-gray-700 hover:text-yellow-600 transition flex items-center">
                        <i class="${item.icon} mr-2"></i>
                        ${item.name}
                    </a>
                `).join('')}
                
                <a href="${config.ctaButton.url}" class="block mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition flex items-center">
                    <i class="${config.ctaButton.icon} mr-2"></i>
                    ${config.ctaButton.text}
                </a>
            </div>
        </div>
    `;
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
}

// Function to load hero section
function loadHero(config) {
    const hero = document.getElementById('hero');
    
    hero.style.backgroundImage = `url('${config.backgroundImage}')`;
    hero.innerHTML = `
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="relative z-10 text-center px-6 text-white max-w-4xl mx-auto">
            <h1 class="text-4xl md:text-6xl font-bold mb-4">${config.title}</h1>
            <h2 class="text-2xl md:text-3xl font-semibold mb-6 text-yellow-300">${config.subtitle}</h2>
            <p class="text-lg md:text-xl mb-8">${config.description}</p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
                ${config.buttons.map(button => `
                    <a href="${button.url}" class="${button.isPrimary ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-transparent hover:bg-white hover:text-gray-800 border-2 border-white'} text-white font-semibold py-3 px-6 rounded-md transition duration-300">
                        ${button.text}
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}

// Function to load about section
function loadAbout(config) {
    const about = document.getElementById('about');
    
    about.innerHTML = `
        <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-8 md:mb-0 md:pr-10">
                <h2 class="text-3xl font-bold text-gray-800 mb-6">${config.title}</h2>
                <p class="text-gray-600 mb-8 leading-relaxed">${config.description}</p>
                
                <div class="space-y-6">
                    ${config.features.map(feature => `
                        <div class="flex">
                            <div class="mr-4 text-yellow-500 text-2xl">
                                <i class="${feature.icon}"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-semibold text-gray-800">${feature.title}</h3>
                                <p class="text-gray-600">${feature.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="md:w-1/2">
                <img src="${config.image}" alt="ত্রিসপ্তক সম্পর্কে" class="rounded-lg shadow-xl w-full">
            </div>
        </div>
    `;
}

// Function to load courses section
function loadCourses(config) {
    const courses = document.getElementById('courses');
    
    courses.innerHTML = `
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-4">${config.title}</h2>
        <p class="text-xl text-center text-gray-600 mb-12">${config.subtitle}</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            ${config.courses.map(course => `
                <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <div class="text-yellow-500 text-3xl mb-4">
                        <i class="${course.icon}"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">${course.title}</h3>
                    <p class="text-gray-600 mb-4">${course.description}</p>
                    <div class="text-gray-700">
                        <p><strong>সময়কাল:</strong> ${course.duration}</p>
                        <p><strong>ফি:</strong> ${course.fee}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Function to load events section
function loadEvents(config) {
    const events = document.getElementById('events');
    
    events.innerHTML = `
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-4">${config.title}</h2>
        <p class="text-xl text-center text-gray-600 mb-12">${config.subtitle}</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${config.events.map(event => `
                <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                    <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">${event.title}</h3>
                        <div class="flex items-center text-gray-600 mb-2">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${event.date}</span>
                        </div>
                        <div class="flex items-center text-gray-600 mb-2">
                            <i class="far fa-clock mr-2"></i>
                            <span>${event.time}</span>
                        </div>
                        <div class="flex items-center text-gray-600 mb-4">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            <span>${event.location}</span>
                        </div>
                        <p class="text-gray-700 mb-4">${event.description}</p>
                        <a href="#contact" class="text-yellow-600 hover:text-yellow-700 font-medium">রেজিস্ট্রেশন করুন</a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Function to load teachers section
function loadTeachers(config) {
    const teachers = document.getElementById('teachers');
    
    teachers.innerHTML = `
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-4">${config.title}</h2>
        <p class="text-xl text-center text-gray-600 mb-12">${config.subtitle}</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            ${config.teachers.map(teacher => `
                <div class="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
                    <img src="${teacher.image}" alt="${teacher.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                    <h3 class="text-xl font-semibold mb-1">${teacher.name}</h3>
                    <p class="text-yellow-600 mb-3">${teacher.specialization}</p>
                    <p class="text-gray-600 mb-4">${teacher.bio}</p>
                    <div class="flex justify-center space-x-4">
                        <a href="${teacher.social.facebook}" class="text-gray-600 hover:text-blue-600"><i class="fab fa-facebook-f"></i></a>
                        <a href="${teacher.social.youtube}" class="text-gray-600 hover:text-red-600"><i class="fab fa-youtube"></i></a>
                        <a href="${teacher.social.instagram}" class="text-gray-600 hover:text-pink-600"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Function to load gallery section
function loadGallery(config) {
    const gallery = document.getElementById('gallery');
    
    gallery.innerHTML = `
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-4">${config.title}</h2>
        <p class="text-xl text-center text-gray-600 mb-12">${config.subtitle}</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            ${config.images.map(image => `
                <div class="relative group overflow-hidden rounded-lg shadow-md">
                    <img src="${image.src}" alt="${image.alt}" class="w-full h-64 object-cover transition duration-300 group-hover:scale-105">
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <p class="text-white text-lg font-medium">${image.caption}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Function to load contact section
function loadContact(config, siteConfig) {
    const contact = document.getElementById('contact');
    
    contact.innerHTML = `
        <h2 class="text-3xl font-bold text-center text-white mb-4">${config.title}</h2>
        <p class="text-xl text-center text-gray-300 mb-12">${config.subtitle}</p>
        
        <div class="flex flex-col lg:flex-row gap-12">
            <div class="lg:w-1/2">
                <form id="contact-form" class="space-y-6">
                    <div>
                        <label for="name" class="block text-white mb-2">${config.form.name.label}</label>
                        <input type="text" id="name" name="name" placeholder="${config.form.name.placeholder}" class="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    
                    <div>
                        <label for="email" class="block text-white mb-2">${config.form.email.label}</label>
                        <input type="email" id="email" name="email" placeholder="${config.form.email.placeholder}" class="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    
                    <div>
                        <label for="phone" class="block text-white mb-2">${config.form.phone.label}</label>
                        <input type="tel" id="phone" name="phone" placeholder="${config.form.phone.placeholder}" class="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    
                    <div>
                        <label for="message" class="block text-white mb-2">${config.form.message.label}</label>
                        <textarea id="message" name="message" rows="5" placeholder="${config.form.message.placeholder}" class="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
                    </div>
                    
                    <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-md transition duration-300">
                        ${config.form.submit.text}
                    </button>
                    
                    <div id="form-message" class="hidden mt-4 p-4 rounded-md"></div>
                </form>
            </div>
            
            <div class="lg:w-1/2">
                <div class="bg-gray-900 p-8 rounded-lg h-full">
                    <h3 class="text-2xl font-semibold text-yellow-400 mb-6">যোগাযোগের তথ্য</h3>
                    
                    <div class="space-y-6">
                        <div class="flex items-start">
                            <div class="text-yellow-500 text-xl mr-4 mt-1">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div>
                                <h4 class="text-lg font-medium text-white mb-1">ঠিকানা</h4>
                                <p class="text-gray-300">${siteConfig.address}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <div class="text-yellow-500 text-xl mr-4 mt-1">
                                <i class="fas fa-phone-alt"></i>
                            </div>
                            <div>
                                <h4 class="text-lg font-medium text-white mb-1">ফোন</h4>
                                <p class="text-gray-300">${siteConfig.phoneNumber}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <div class="text-yellow-500 text-xl mr-4 mt-1">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div>
                                <h4 class="text-lg font-medium text-white mb-1">ইমেইল</h4>
                                <p class="text-gray-300">${siteConfig.contactEmail}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <div class="text-yellow-500 text-xl mr-4 mt-1">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div>
                                <h4 class="text-lg font-medium text-white mb-1">খোলার সময়</h4>
                                <p class="text-gray-300">${config.contactInfo.hours}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-8">
                        <h4 class="text-lg font-medium text-white mb-4">সামাজিক যোগাযোগ মাধ্যমে অনুসরণ করুন</h4>
                        <div class="flex space-x-4">
                            <a href="#" class="text-gray-300 hover:text-blue-400 text-2xl"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="text-gray-300 hover:text-red-500 text-2xl"><i class="fab fa-youtube"></i></a>
                            <a href="#" class="text-gray-300 hover:text-pink-500 text-2xl"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to initialize smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
}

// Function to initialize contact form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    const formMessage = document.getElementById('form-message');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Here you would typically send the data to a server
        // For this example, we'll just simulate a successful submission
        simulateFormSubmission(data)
            .then(response => {
                formMessage.textContent = response.message;
                formMessage.className = 'bg-green-500 text-white mt-4 p-4 rounded-md';
                formMessage.classList.remove('hidden');
                
                // Reset form
                contactForm.reset();
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.classList.add('hidden');
                }, 5000);
            })
            .catch(error => {
                formMessage.textContent = error.message;
                formMessage.className = 'bg-red-500 text-white mt-4 p-4 rounded-md';
                formMessage.classList.remove('hidden');
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.classList.add('hidden');
                }, 5000);
            });
    });
}

// Simulate form submission (replace with actual AJAX call in production)
function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Randomly succeed or fail for demonstration
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                resolve({
                    success: true,
                    message: "ধন্যবাদ! আপনার বার্তা পৌঁছেছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।"
                });
            } else {
                reject({
                    success: false,
                    message: "দুঃখিত! বার্তা পাঠানো যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
                });
            }
        }, 1000);
    });
}