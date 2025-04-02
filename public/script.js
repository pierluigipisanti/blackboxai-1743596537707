// DOM Elements
const authSection = document.getElementById('auth-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginSection = document.getElementById('login-section');
const bookingSection = document.getElementById('booking-section');
const adminSection = document.getElementById('admin-section');
const calendar = document.getElementById('calendar');
const emailLoginForm = document.getElementById('email-login');
const googleLoginBtn = document.getElementById('google-login');
const microsoftLoginBtn = document.getElementById('microsoft-login');
const createSlotsForm = document.getElementById('create-slots');

// Global state
let currentUser = null;
let token = localStorage.getItem('token');

// Initialize the app
async function init() {
  checkAuth();
  setupEventListeners();
}

// Check authentication status
async function checkAuth() {
  if (token) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        currentUser = await response.json();
        updateUI();
        fetchAvailableSlots();
      } else {
        localStorage.removeItem('token');
        token = null;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
  }
}

// Update UI based on auth state
function updateUI() {
  if (currentUser) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    loginSection.classList.add('hidden');
    bookingSection.classList.remove('hidden');
    
    if (currentUser.role === 'admin') {
      adminSection.classList.remove('hidden');
    } else {
      adminSection.classList.add('hidden');
    }
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    loginSection.classList.remove('hidden');
    bookingSection.classList.add('hidden');
    adminSection.classList.add('hidden');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        token = data.token;
        localStorage.setItem('token', token);
        await checkAuth();
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  });

  // Social logins
  googleLoginBtn.addEventListener('click', () => {
    window.location.href = '/api/auth/google';
  });

  microsoftLoginBtn.addEventListener('click', () => {
    window.location.href = '/api/auth/microsoft';
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    updateUI();
  });

  // Admin: Create slots
  if (createSlotsForm) {
    createSlotsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Implementation for slot creation
    });
  }
}

// Fetch available slots
async function fetchAvailableSlots() {
  try {
    const response = await fetch('/api/slots', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const slots = await response.json();
      renderSlots(slots);
    }
  } catch (err) {
    console.error('Failed to fetch slots:', err);
  }
}

// Render slots to the calendar
function renderSlots(slots) {
  calendar.innerHTML = '';
  
  slots.forEach(slot => {
    const slotElement = document.createElement('div');
    slotElement.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-200';
    
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    
    slotElement.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <p class="font-medium">${startTime.toLocaleDateString()}</p>
          <p class="text-sm text-gray-600">
            ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
            ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
        <button class="book-btn px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700" 
                data-slot-id="${slot._id}">
          Book
        </button>
      </div>
    `;
    
    calendar.appendChild(slotElement);
  });
}

// Initialize the app
init();