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
  const autoSummarizeCheckbox = document.getElementById('autoSummarize');
  const extractEntitiesCheckbox = document.getElementById('extractEntities');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const showApiKeyBtn = document.getElementById('showApiKey');
  const saveToCategories = document.getElementsByName('saveToCategories');
  
  // Error logs elements
  const toggleErrorLogsBtn = document.getElementById('toggleErrorLogsBtn');
  const errorLogsContainer = document.getElementById('errorLogsContainer');
  const errorLogs = document.getElementById('errorLogs');
  const clearErrorLogsBtn = document.getElementById('clearErrorLogsBtn');
  
  // Load user data and settings
  loadUserData();
  loadSettings();
  
  // Add event listeners
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  saveSettingsBtn.addEventListener('click', saveSettings);
  clearDataBtn.addEventListener('click', clearData);
  
  // Toggle API key visibility
  if (showApiKeyBtn) {
    showApiKeyBtn.addEventListener('click', () => {
      if (openaiApiKeyInput.type === 'password') {
        openaiApiKeyInput.type = 'text';
        showApiKeyBtn.textContent = 'Hide';
      } else {
        openaiApiKeyInput.type = 'password';
        showApiKeyBtn.textContent = 'Show';
      }
    });
  }
  
  // Toggle error logs visibility
  if (toggleErrorLogsBtn && errorLogsContainer) {
    toggleErrorLogsBtn.addEventListener('click', () => {
      if (errorLogsContainer.classList.contains('hidden')) {
        errorLogsContainer.classList.remove('hidden');
        toggleErrorLogsBtn.textContent = 'Hide Error Logs';
        loadErrorLogs();
      } else {
        errorLogsContainer.classList.add('hidden');
        toggleErrorLogsBtn.textContent = 'Show Error Logs';
      }
    });
  }
  
  // Clear error logs
  if (clearErrorLogsBtn) {
    clearErrorLogsBtn.addEventListener('click', clearErrorLogs);
  }
  
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
    chrome.storage.local.get(['settings', 'openaiApiKey'], (result) => {
      const settings = result.settings || {};
      
      // Set default category
      if (settings.defaultCategory) {
        defaultCategorySelect.value = settings.defaultCategory;
      }
      
      // Set auto save YouTube option
      autoSaveYouTubeCheckbox.checked = !!settings.autoSaveYouTube;
      
      // Set summarize content option
      summarizeContentCheckbox.checked = settings.summarizeContent !== false; // default to true
      
      // Set auto summarize option
      if (autoSummarizeCheckbox) {
        autoSummarizeCheckbox.checked = !!settings.autoSummarize;
      }
      
      // Set extract entities option
      if (extractEntitiesCheckbox) {
        extractEntitiesCheckbox.checked = !!settings.extractEntities;
      }
      
      // Set OpenAI API key
      if (openaiApiKeyInput && result.openaiApiKey) {
        openaiApiKeyInput.value = result.openaiApiKey;
      }
      
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
  
  // Load error logs
  function loadErrorLogs() {
    if (!errorLogs) return;
    
    chrome.storage.local.get(['errorLogs'], (result) => {
      const logs = result.errorLogs || [];
      
      if (logs.length === 0) {
        errorLogs.innerHTML = '<p class="no-logs">No errors logged yet.</p>';
        return;
      }
      
      // Clear current logs
      errorLogs.innerHTML = '';
      
      // Add logs in reverse chronological order (newest first)
      logs.slice().reverse().forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.classList.add('error-log-entry');
        
        // Format timestamp
        const timestamp = new Date(log.timestamp);
        const formattedTime = timestamp.toLocaleString();
        
        // Create log entry HTML
        logEntry.innerHTML = `
          <div class="error-log-time">${formattedTime}</div>
          ${log.context ? `<div class="error-log-context">${log.context}</div>` : ''}
          <div class="error-log-message">${log.message}</div>
        `;
        
        errorLogs.appendChild(logEntry);
      });
    });
  }
  
  // Clear error logs
  function clearErrorLogs() {
    chrome.storage.local.remove(['errorLogs'], () => {
      showStatus('Error logs cleared', 'success');
      loadErrorLogs(); // Reload (empty) logs
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
    
    // Add AI settings if available
    if (autoSummarizeCheckbox) {
      settings.autoSummarize = autoSummarizeCheckbox.checked;
    }
    
    if (extractEntitiesCheckbox) {
      settings.extractEntities = extractEntitiesCheckbox.checked;
    }
    
    // Save settings to storage
    chrome.storage.local.set({ settings }, () => {
      showStatus('Settings saved successfully', 'success');
    });
    
    // Save OpenAI API key if provided
    if (openaiApiKeyInput && openaiApiKeyInput.value) {
      const apiKey = openaiApiKeyInput.value.trim();
      
      // Validate API key format (basic check)
      if (apiKey.startsWith('sk-') && apiKey.length > 20) {
        chrome.runtime.sendMessage({
          action: 'setOpenAIApiKey',
          apiKey: apiKey
        }, (response) => {
          if (response && response.success) {
            showStatus('API key saved successfully', 'success');
          } else {
            showStatus('Failed to save API key: ' + (response?.error || 'Unknown error'), 'error');
          }
        });
      } else if (apiKey) {
        showStatus('Invalid OpenAI API key format', 'error');
      }
    }
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