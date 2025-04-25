// user_data.js - Comprehensive User Data Collection

class UserDataCollector {
  constructor() {
    this.userData = {};
    this.cookieConsent = localStorage.getItem('cookieConsent') === 'true';
    this.init();
  }

  async init() {
    if (!this.cookieConsent) return;
    
    await this.collectBasicData();
    await this.collectDeviceData();
    await this.collectLocationData();
    await this.collectBehavioralData();
    await this.sendDataToServer();
    
    this.setupAdminDataAccess();
  }

  async collectBasicData() {
    this.userData = {
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      pageUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes'
    };
  }

  async collectDeviceData() {
    this.userData.device = {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };

    // Try to get more detailed device info
    if (navigator.userAgentData) {
      try {
        const uaData = await navigator.userAgentData.getHighEntropyValues([
          'architecture',
          'model',
          'platformVersion',
          'uaFullVersion'
        ]);
        this.userData.device.details = uaData;
      } catch (error) {
        console.log('Could not get high entropy UA data:', error);
      }
    }
  }

  async collectLocationData() {
    try {
      // Get IP and approximate location
      const ipResponse = await fetch('https://ipapi.co/json/');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        this.userData.location = {
          ip: ipData.ip,
          city: ipData.city,
          region: ipData.region,
          country: ipData.country_name,
          countryCode: ipData.country_code,
          postalCode: ipData.postal,
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          timezone: ipData.timezone,
          isp: ipData.org,
          asn: ipData.asn
        };
      }

      // Try to get more precise geolocation (if user permits)
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000
          });
        });
        
        if (position) {
          this.userData.location.precise = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
        }
      }
    } catch (error) {
      console.log('Location data collection error:', error);
    }
  }

  async collectBehavioralData() {
    // Get browsing history (only our domain)
    this.userData.behavior = {
      pageLoadTime: this.getPageLoadTime(),
      timeOnPage: 0, // Will be updated when user leaves
      scrollDepth: 0, // Will be updated by event listeners
      clicks: [], // Will collect click events
      formInteractions: [] // Will collect form interactions
    };

    // Set up event listeners to track behavior
    this.setupBehaviorTracking();
  }

  getPageLoadTime() {
    const timing = window.performance.timing;
    return timing.loadEventEnd - timing.navigationStart;
  }

  setupBehaviorTracking() {
    // Track time on page
    window.addEventListener('beforeunload', () => {
      this.userData.behavior.timeOnPage = Math.floor(
        (new Date() - new Date(this.userData.timestamp)) / 1000
      );
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.floor(
        (window.scrollY + window.innerHeight) / 
        document.body.scrollHeight * 100
      );
      maxScroll = Math.max(maxScroll, scrollDepth);
      this.userData.behavior.scrollDepth = maxScroll;
    }, { passive: true });

    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [data-track]');
      if (target) {
        this.userData.behavior.clicks.push({
          timestamp: new Date().toISOString(),
          element: target.tagName,
          id: target.id || null,
          class: target.className || null,
          text: target.textContent.trim().slice(0, 50),
          href: target.href || null,
          x: e.clientX,
          y: e.clientY
        });
      }
    });

    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        this.userData.behavior.formInteractions.push({
          timestamp: new Date().toISOString(),
          formId: form.id || null,
          action: form.action || null,
          method: form.method || 'GET',
          inputs: Array.from(form.elements)
            .filter(el => el.name)
            .map(el => ({
              name: el.name,
              type: el.type,
              value: el.value ? el.value.slice(0, 100) : null
            }))
        });
      });
    });
  }

  generateSessionId() {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) return sessionId;
    
    const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', newSessionId);
    return newSessionId;
  }

  async sendDataToServer() {
    try {
      // In production, you would send this to your actual backend
      console.log('Collected user data:', this.userData);
      
      // Example API call (mock)
      const response = await fetch('https://api.finvora.com/user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Data-Source': 'client-side'
        },
        body: JSON.stringify(this.userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send user data');
      }
      
      console.log('User data successfully sent to server');
    } catch (error) {
      console.error('Error sending user data:', error);
      // Implement retry logic or offline storage in production
    }
  }

  setupAdminDataAccess() {
    // This would normally be part of your admin dashboard
    // Here we're simulating the admin interface functionality
    
    // Add admin data viewer button (only for demo purposes)
    if (window.location.href.includes('admin.html')) {
      this.createAdminInterface();
    }
  }

  createAdminInterface() {
    const adminPanel = document.createElement('div');
    adminPanel.id = 'userDataAdminPanel';
    adminPanel.className = 'fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 w-96 max-h-[80vh] overflow-auto';
    adminPanel.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">User Data Dashboard</h3>
        <button id="closeAdminPanel" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="space-y-4">
        <div class="p-3 bg-gray-50 rounded">
          <h4 class="font-medium mb-2">Basic Info</h4>
          <pre class="text-xs overflow-auto max-h-40" id="basicDataView"></pre>
        </div>
        <div class="p-3 bg-gray-50 rounded">
          <h4 class="font-medium mb-2">Device Info</h4>
          <pre class="text-xs overflow-auto max-h-40" id="deviceDataView"></pre>
        </div>
        <div class="p-3 bg-gray-50 rounded">
          <h4 class="font-medium mb-2">Location Info</h4>
          <pre class="text-xs overflow-auto max-h-40" id="locationDataView"></pre>
        </div>
        <div class="p-3 bg-gray-50 rounded">
          <h4 class="font-medium mb-2">Behavioral Data</h4>
          <pre class="text-xs overflow-auto max-h-40" id="behaviorDataView"></pre>
        </div>
        <button id="refreshUserData" class="w-full bg-primary text-white py-2 rounded hover:bg-secondary">
          Refresh Data
        </button>
        <button id="exportUserData" class="w-full border border-primary text-primary py-2 rounded hover:bg-gray-50">
          Export as JSON
        </button>
      </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    // Display current data
    this.updateAdminDataView();
    
    // Add event listeners
    document.getElementById('closeAdminPanel').addEventListener('click', () => {
      adminPanel.remove();
    });
    
    document.getElementById('refreshUserData').addEventListener('click', async () => {
      await this.init();
      this.updateAdminDataView();
    });
    
    document.getElementById('exportUserData').addEventListener('click', () => {
      this.exportUserData();
    });
  }

  updateAdminDataView() {
    if (!document.getElementById('basicDataView')) return;
    
    document.getElementById('basicDataView').textContent = 
      JSON.stringify(this.filterSensitiveData(this.userData, ['location.ip', 'device.details']), null, 2);
    
    document.getElementById('deviceDataView').textContent = 
      JSON.stringify(this.userData.device, null, 2);
    
    document.getElementById('locationDataView').textContent = 
      JSON.stringify(this.userData.location, null, 2);
    
    document.getElementById('behaviorDataView').textContent = 
      JSON.stringify(this.userData.behavior, null, 2);
  }

  filterSensitiveData(obj, sensitivePaths) {
    const filtered = JSON.parse(JSON.stringify(obj));
    
    sensitivePaths.forEach(path => {
      const parts = path.split('.');
      let current = filtered;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined) break;
        current = current[parts[i]];
      }
      
      const lastKey = parts[parts.length - 1];
      if (current[lastKey] !== undefined) {
        current[lastKey] = '***REDACTED***';
      }
    });
    
    return filtered;
  }

  exportUserData() {
    const dataStr = JSON.stringify(this.userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `user_data_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

// Initialize if cookie consent was given
document.addEventListener('DOMContentLoaded', () => {
  const cookieConsent = localStorage.getItem('cookieConsent') === 'true';
  if (cookieConsent) {
    new UserDataCollector();
  }
});
