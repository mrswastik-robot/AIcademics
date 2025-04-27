// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const savePageBtn = document.getElementById('savePage');
  const saveSelectionBtn = document.getElementById('saveSelection');
  const saveVideoBtn = document.getElementById('saveVideo');
  const addTagBtn = document.getElementById('addTag');
  const viewDashboardBtn = document.getElementById('viewDashboard');
  const optionsBtn = document.getElementById('options');
  const tagContainer = document.querySelector('.tag-container');
  const notesTextarea = document.getElementById('notes');
  const existingTags = document.querySelectorAll('.tag:not(.add)');
  
  // Check authentication status
  checkAuthStatus();
  
  // Get current tab information to check page type
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = currentTab.url || '';
    
    // Check if this is a YouTube video
    const isYouTube = url.includes('youtube.com/watch') || url.includes('youtu.be/');
    
    // Show or hide the save video button based on the page type
    if (saveVideoBtn) {
      if (isYouTube) {
        saveVideoBtn.style.display = 'block';
        // Add a hint about transcript extraction
        showMessage('YouTube video detected. Transcript will be extracted if available.', 'info', 5000);
      } else {
        saveVideoBtn.style.display = 'none';
      }
    }
    
    // Suggest tags based on the current page
    suggestTagsForPage(url, currentTab.title);
  });
  
  // Save the current page
  savePageBtn.addEventListener('click', () => {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const selectedTags = getSelectedTags();
      const notes = notesTextarea.value;
      
      // Show loading indicator
      showMessage('Saving page...', 'info');
      
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
          showMessage('Failed to save page: ' + (response?.error || 'Unknown error'), 'error');
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
      
      // Show loading indicator
      showMessage('Getting selected text...', 'info');
      
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
        
        // Show saving indicator
        showMessage('Saving selection...', 'info');
        
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
            showMessage('Failed to save selection: ' + (response?.error || 'Unknown error'), 'error');
          }
        });
      });
    });
  });
  
  // Save YouTube video with transcript
  if (saveVideoBtn) {
    saveVideoBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const url = currentTab.url || '';
        const isYouTube = url.includes('youtube.com/watch') || url.includes('youtu.be/');
        
        if (!isYouTube) {
          showMessage('Not a YouTube video page', 'error');
          return;
        }
        
        const selectedTags = getSelectedTags();
        const notes = notesTextarea.value;
        
        // Show loading indicator
        showMessage('Saving YouTube video...', 'info');
        
        // Send message to background script
        chrome.runtime.sendMessage({
          action: 'saveYouTubeVideo',
          tags: selectedTags,
          notes: notes
        }, (response) => {
          if (response && response.success) {
            showMessage('YouTube video saved successfully!', 'success');
          } else {
            showMessage('Failed to save video: ' + (response?.error || 'Unknown error'), 'error');
          }
        });
      });
    });
  }
  
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
    chrome.tabs.create({ url: 'https://aicademics-six.vercel.app/dashboard' });
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
  
  return tag;
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

// Suggest tags based on the current page
function suggestTagsForPage(url, title) {
  // Simple rule-based tag suggestions
  let suggestedTags = [];
  
  // Check URL patterns
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    suggestedTags.push('Video');
  }
  
  if (url.includes('github.com')) {
    suggestedTags.push('Code');
    suggestedTags.push('Reference');
  }
  
  if (url.includes('wikipedia.org')) {
    suggestedTags.push('Reference');
  }
  
  if (url.includes('coursera.org') || 
      url.includes('udemy.com') || 
      url.includes('edx.org') || 
      url.includes('khanacademy.org')) {
    suggestedTags.push('Course Material');
  }
  
  if (url.includes('medium.com') || 
      url.includes('dev.to') || 
      url.includes('hashnode.com') || 
      url.includes('blog')) {
    suggestedTags.push('Article');
  }
  
  if (url.includes('arxiv.org') || 
      url.includes('researchgate.net') || 
      url.includes('scholar.google.com') || 
      url.includes('ieee.org')) {
    suggestedTags.push('Research');
    suggestedTags.push('Academic');
  }
  
  // Check title patterns
  const titleLower = title.toLowerCase();
  if (titleLower.includes('tutorial') || 
      titleLower.includes('guide') || 
      titleLower.includes('how to') || 
      titleLower.includes('learn')) {
    suggestedTags.push('Tutorial');
  }
  
  if (titleLower.includes('review') || 
      titleLower.includes('analysis') || 
      titleLower.includes('comparison')) {
    suggestedTags.push('Review');
  }
  
  // Highlight suggested tags
  if (suggestedTags.length > 0) {
    const allTags = document.querySelectorAll('.tag:not(.add)');
    suggestedTags = [...new Set(suggestedTags)]; // Remove duplicates
    
    allTags.forEach(tag => {
      if (suggestedTags.includes(tag.textContent)) {
        tag.classList.add('suggested');
        // Pre-select the first suggested tag
        if (tag.textContent === suggestedTags[0]) {
          tag.classList.add('selected');
        }
      }
    });
    
    // Add any suggested tags that don't exist yet
    suggestedTags.forEach(tagName => {
      const exists = Array.from(allTags).some(tag => tag.textContent === tagName);
      if (!exists) {
        const newTag = addTag(tagName);
        newTag.classList.add('suggested');
        newTag.classList.add('selected');
      }
    });
    
    // Save the updated tags
    saveCustomTags();
  }
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