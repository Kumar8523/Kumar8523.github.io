// user_data.js - Enhanced User Management

class UserManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    this.loadUserData();
    this.setupAuthUI();
    this.setupEventListeners();
  }

  loadUserData() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  setupAuthUI() {
    const authElements = document.querySelectorAll('[data-auth]');
    authElements.forEach(element => {
      const authState = element.getAttribute('data-auth');
      
      if ((authState === 'logged-in' && this.currentUser) || 
          (authState === 'logged-out' && !this.currentUser)) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    });

    if (this.currentUser) {
      document.querySelectorAll('[data-user-name]').forEach(element => {
        element.textContent = this.currentUser.name;
      });
      
      document.querySelectorAll('[data-user-avatar]').forEach(element => {
        if (this.currentUser.avatar) {
          element.src = this.currentUser.avatar;
          element.classList.remove('hidden');
        }
      });
    }
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Logout button
    document.querySelectorAll('.logout-btn').forEach(button => {
      button.addEventListener('click', () => this.handleLogout());
    });

    // Profile update form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      // Simulate API call
      const user = await this.mockLogin(email, password);
      
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      this.setupAuthUI();
      showToast('সফলভাবে লগইন করা হয়েছে', 'success');
      
      // Redirect or close modal
      const redirect = form.getAttribute('data-redirect');
      if (redirect) {
        window.location.href = redirect;
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('লগইন করতে সমস্যা হয়েছে', 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    
    if (form.password.value !== form.confirmPassword.value) {
      showToast('পাসওয়ার্ড মিলছে না', 'error');
      return;
    }

    const userData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      password: form.password.value
    };

    try {
      // Simulate API call
      const user = await this.mockRegister(userData);
      
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      this.setupAuthUI();
      showToast('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে', 'success');
      
      // Redirect after registration
      const redirect = form.getAttribute('data-redirect') || 'account.html';
      window.location.href = redirect;
    } catch (error) {
      console.error('Registration error:', error);
      showToast('রেজিস্ট্রেশন করতে সমস্যা হয়েছে', 'error');
    }
  }

  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem('user');
    this.setupAuthUI();
    showToast('সফলভাবে লগআউট করা হয়েছে', 'success');
    
    // Redirect to home if not already there
    if (!window.location.pathname.includes('index.html')) {
      window.location.href = 'index.html';
    }
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!this.currentUser) {
      showToast('অনুগ্রহ করে প্রথমে লগইন করুন', 'error');
      return;
    }

    const updatedData = {
      ...this.currentUser,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim()
    };

    // Handle password change if provided
    if (form.newPassword.value) {
      if (form.newPassword.value !== form.confirmPassword.value) {
        showToast('পাসওয়ার্ড মিলছে না', 'error');
        return;
      }
      updatedData.password = form.newPassword.value;
    }

    try {
      // Simulate API call
      const user = await this.mockUpdateProfile(updatedData);
      
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      this.setupAuthUI();
      showToast('প্রোফাইল সফলভাবে আপডেট করা হয়েছে', 'success');
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('প্রোফাইল আপডেট করতে সমস্যা হয়েছে', 'error');
    }
  }

  // Mock API functions (replace with real API calls)
  async mockLogin(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'user@example.com' && password === 'password') {
          resolve({
            id: 1,
            name: 'Demo User',
            email: 'user@example.com',
            phone: '01712345678',
            address: '123 Street, Dhaka',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            token: 'mock-token-123'
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  async mockRegister(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...userData,
          id: Math.floor(Math.random() * 1000),
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
          token: 'mock-token-' + Math.random().toString(36).substr(2)
        });
      }, 1500);
    });
  }

  async mockUpdateProfile(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(userData);
      }, 1000);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new UserManager();
});
