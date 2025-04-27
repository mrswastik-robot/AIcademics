// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const savePageBtn = document.getElementById('savePage');
  const saveSelectionBtn = document.getElementById('saveSelection');
  const addTagBtn = document.getElementById('addTag');
  const viewDashboardBtn = document.getElementById('viewDashboard');
  const optionsBtn = document.getElementById('options');
  const tagContainer = document.querySelector('.tag-container');
  const notesTextarea = document.getElementById('notes');
  const existingTags = document.querySelectorAll('.tag:not(.add)');
  
  // Check authentication status
  checkAuthStatus();
  
  // Save the current page
  savePageBtn.addEventListener('click', () => {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const selectedTags = getSelectedTags();
      const notes = notesTextarea.value;
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'savePage',
        url: currentTab.url,
        title: currentTab.title,
        tags: selectedTags,
        notes: notes
      }, (response) => {
        if (response && response.success) {
          showMessage('Page saved successfully!', 'success');
        } else {
          showMessage('Failed to save page', 'error');
        }
      });
    });
  });
  
  // Save the selected text on the page
  saveSelectionBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const selectedTags = getSelectedTags();
      const notes = notesTextarea.value;
      
      // Execute script to get selected text
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: getSelectedText
      }, (results) => {
        const selectedText = results[0].result;
        
        if (!selectedText) {
          showMessage('No text selected', 'error');
          return;
        }
        
        // Send message to background script
        chrome.runtime.sendMessage({
          action: 'saveSelection',
          url: currentTab.url,
          title: currentTab.title,
          selection: selectedText,
          tags: selectedTags,
          notes: notes
        }, (response) => {
          if (response && response.success) {
            showMessage('Selection saved successfully!', 'success');
          } else {
            showMessage('Failed to save selection', 'error');
          }
        });
      });
    });
  });
  
  // Add a new custom tag
  addTagBtn.addEventListener('click', () => {
    const tagName = prompt('Enter a new tag name:');
    if (tagName && tagName.trim()) {
      addTag(tagName.trim());
      saveCustomTags();
    }
  });
  
  // Toggle tag selection when clicked
  tagContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag') && !e.target.classList.contains('add')) {
      e.target.classList.toggle('selected');
    }
  });
  
  // Navigate to the dashboard
  viewDashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://aicademics.yourdomain.com/dashboard' });
  });
  
  // Open options page
  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Load custom tags from storage
  loadCustomTags();
});

// Function to check if user is authenticated
function checkAuthStatus() {
  chrome.runtime.sendMessage({ action: 'checkAuth' }, (response) => {
    const isAuthenticated = response && response.isAuthenticated;
    
    if (!isAuthenticated) {
      // If not authenticated, show a message and disable buttons
      showMessage('Please sign in to use this extension', 'warning');
      document.querySelectorAll('.btn:not(#options)').forEach(btn => {
        btn.disabled = true;
      });
    } else {
      // Show user email
      if (response.user && response.user.email) {
        showMessage(`Signed in as ${response.user.email}`, 'info', 2000);
      }
    }
  });
}

// Get selected text from the content script
function getSelectedText() {
  return window.getSelection().toString();
}

// Get all selected tags
function getSelectedTags() {
  const selectedTags = document.querySelectorAll('.tag.selected');
  return Array.from(selectedTags).map(tag => tag.textContent);
}

// Add a new tag to the UI
function addTag(name) {
  const tag = document.createElement('span');
  tag.classList.add('tag');
  tag.textContent = name;
  
  const addTagBtn = document.getElementById('addTag');
  addTagBtn.parentNode.insertBefore(tag, addTagBtn);
}

// Save custom tags to storage
function saveCustomTags() {
  const tags = Array.from(document.querySelectorAll('.tag:not(.add)')).map(tag => tag.textContent);
  chrome.storage.local.set({ customTags: tags });
}

// Load custom tags from storage
function loadCustomTags() {
  chrome.storage.local.get(['customTags'], (result) => {
    const customTags = result.customTags || [];
    const defaultTags = ['Course Material', 'Research', 'Reference', 'Personal', 'Other'];
    
    // Clear existing tags
    const tagContainer = document.querySelector('.tag-container');
    const addTagBtn = document.getElementById('addTag');
    
    Array.from(tagContainer.querySelectorAll('.tag:not(.add)')).forEach(tag => {
      tag.remove();
    });
    
    // Add default tags
    defaultTags.forEach(tag => {
      addTag(tag);
    });
    
    // Add custom tags
    customTags.forEach(tag => {
      if (!defaultTags.includes(tag)) {
        addTag(tag);
      }
    });
  });
}

// Show status message
function showMessage(message, type, duration = 3000) {
  // Create message container if it doesn't exist
  let messageContainer = document.querySelector('.message-container');
  
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    document.querySelector('.container').prepend(messageContainer);
  }
  
  // Create and add message element
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);
  messageElement.textContent = message;
  
  messageContainer.appendChild(messageElement);
  
  // Remove message after duration
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    setTimeout(() => {
      messageElement.remove();
      
      // Remove container if empty
      if (messageContainer.children.length === 0) {
        messageContainer.remove();
      }
    }, 300);
  }, duration);
} 