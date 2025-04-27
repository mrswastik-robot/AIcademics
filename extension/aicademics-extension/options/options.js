// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const loginForm = document.getElementById('loginForm');
  const userInfo = document.getElementById('userInfo');
  const userEmail = document.getElementById('userEmail');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const statusMessage = document.getElementById('statusMessage');
  const defaultCategorySelect = document.getElementById('defaultCategory');
  const autoSaveYouTubeCheckbox = document.getElementById('autoSaveYouTube');
  const summarizeContentCheckbox = document.getElementById('summarizeContent');
  const saveToCategories = document.getElementsByName('saveToCategories');
  
  // Load user data and settings
  loadUserData();
  loadSettings();
  
  // Add event listeners
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  saveSettingsBtn.addEventListener('click', saveSettings);
  clearDataBtn.addEventListener('click', clearData);
  
  // Handle login by redirecting to NextAuth sign-in page
  async function handleLogin() {
    chrome.runtime.sendMessage({
      action: 'login'
    }, (response) => {
      if (response && response.success) {
        showStatus(response.message || 'Redirecting to login page...', 'info');
      } else {
        showStatus('Failed to open login page', 'error');
      }
    });
  }
  
  // Handle logout
  function handleLogout() {
    chrome.runtime.sendMessage({
      action: 'logout'
    }, (response) => {
      if (response && response.success) {
        showStatus('Logged out successfully', 'success');
        loadUserData(); // Reload user data (which should now be empty)
      } else {
        showStatus('Logout failed', 'error');
      }
    });
  }
  
  // Load user data
  function loadUserData() {
    chrome.runtime.sendMessage({
      action: 'checkAuth'
    }, (response) => {
      if (response && response.isAuthenticated && response.user) {
        // User is logged in, show user info
        loginForm.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userEmail.textContent = response.user.email;
      } else {
        // User is not logged in, show login form
        loginForm.classList.remove('hidden');
        userInfo.classList.add('hidden');
      }
    });
  }
  
  // Load settings from storage
  function loadSettings() {
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {};
      
      // Set default category
      if (settings.defaultCategory) {
        defaultCategorySelect.value = settings.defaultCategory;
      }
      
      // Set auto save YouTube option
      autoSaveYouTubeCheckbox.checked = !!settings.autoSaveYouTube;
      
      // Set summarize content option
      summarizeContentCheckbox.checked = settings.summarizeContent !== false; // default to true
      
      // Set save to categories option
      const saveToCategory = settings.saveToCategories || 'prompt';
      for (let i = 0; i < saveToCategories.length; i++) {
        if (saveToCategories[i].value === saveToCategory) {
          saveToCategories[i].checked = true;
          break;
        }
      }
    });
  }
  
  // Save settings to storage
  function saveSettings() {
    // Get the selected save to categories value
    let selectedSaveToCategories = 'prompt';
    for (let i = 0; i < saveToCategories.length; i++) {
      if (saveToCategories[i].checked) {
        selectedSaveToCategories = saveToCategories[i].value;
        break;
      }
    }
    
    // Create settings object
    const settings = {
      defaultCategory: defaultCategorySelect.value,
      autoSaveYouTube: autoSaveYouTubeCheckbox.checked,
      summarizeContent: summarizeContentCheckbox.checked,
      saveToCategories: selectedSaveToCategories
    };
    
    // Save to storage
    chrome.storage.local.set({ settings }, () => {
      showStatus('Settings saved successfully', 'success');
    });
  }
  
  // Clear local data
  function clearData() {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      chrome.storage.local.remove(['savedContent'], () => {
        showStatus('Local data cleared successfully', 'success');
      });
    }
  }
  
  // Show status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    
    // Hide after 5 seconds
    setTimeout(() => {
      statusMessage.className = 'status-message';
    }, 5000);
  }
}); 