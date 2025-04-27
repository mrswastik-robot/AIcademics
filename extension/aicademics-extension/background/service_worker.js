// Initialize the extension when installed
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      authToken: null,
      user: null,
      customTags: [],
      settings: {
        autoSaveYouTube: false,
        saveToCategories: 'prompt', // 'prompt', 'auto', or 'default'
        defaultCategory: 'Uncategorized',
        summarizeContent: true
      }
    });
    
    // Open the options page for initial setup
    chrome.runtime.openOptionsPage();
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle different actions
  switch (request.action) {
    case 'savePage':
      handleSavePage(request, sendResponse);
      break;
    case 'saveSelection':
      handleSaveSelection(request, sendResponse);
      break;
    case 'checkAuth':
      checkAuthentication(sendResponse);
      break;
    case 'login':
      handleLogin(request, sendResponse);
      break;
    case 'logout':
      handleLogout(sendResponse);
      break;
  }
  
  // Required for async response
  return true;
});

// Handle saving a whole page
async function handleSavePage(request, sendResponse) {
  try {
    // Check authentication
    const isAuthenticated = await isUserAuthenticated();
    if (!isAuthenticated) {
      sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }
    
    // Get the tab to access the content script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    // Execute content script to get page content
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: () => {
        // This function is executed in the context of the page
        // We'll use the content script to handle this
        return new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'getPageContent' }, response => {
            resolve(response);
          });
        });
      }
    });
    
    const pageContent = results[0].result;
    
    // Add user provided data
    const contentData = {
      ...pageContent,
      userTags: request.tags || [],
      userNotes: request.notes || '',
      savedAt: new Date().toISOString()
    };
    
    // Save to backend
    const saveResult = await saveToBackend(contentData);
    
    // Also save to local storage as backup
    await saveToLocalStorage(contentData);
    
    sendResponse({ success: true, savedContent: contentData });
  } catch (error) {
    console.error('Error saving page:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle saving selected text
async function handleSaveSelection(request, sendResponse) {
  try {
    // Check authentication
    const isAuthenticated = await isUserAuthenticated();
    if (!isAuthenticated) {
      sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }
    
    // Prepare content data
    const contentData = {
      metadata: {
        title: request.title,
        url: request.url,
        siteName: new URL(request.url).hostname
      },
      content: {
        text: request.selection,
        html: `<div>${request.selection}</div>`,
        headings: []
      },
      contentType: 'selection',
      userTags: request.tags || [],
      userNotes: request.notes || '',
      savedAt: new Date().toISOString()
    };
    
    // Save to backend
    const saveResult = await saveToBackend(contentData);
    
    // Also save to local storage as backup
    await saveToLocalStorage(contentData);
    
    sendResponse({ success: true, savedContent: contentData });
  } catch (error) {
    console.error('Error saving selection:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Check if user is authenticated by verifying the session with the main application
async function isUserAuthenticated() {
  try {
    const session = await fetchSession();
    return !!session && !!session.user;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

// Fetch and verify the session from the main application
async function fetchSession() {
  try {
    // Configure URL to your application's session endpoint
    const response = await fetch('https://aicademics-six.vercel.app/api/auth/session', {
      method: 'GET',
      credentials: 'include' // Important to include cookies
    });
    
    if (response.ok) {
      const sessionData = await response.json();
      
      // Store the session data in local storage for future reference
      if (sessionData && sessionData.user) {
        chrome.storage.local.set({
          user: sessionData.user,
          lastSessionCheck: Date.now()
        });
        return sessionData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

// Check authentication and send response
async function checkAuthentication(sendResponse) {
  try {
    const session = await fetchSession();
    sendResponse({
      isAuthenticated: !!session && !!session.user,
      user: session?.user || null
    });
  } catch (error) {
    console.error('Authentication check failed:', error);
    sendResponse({ isAuthenticated: false, user: null });
  }
}

// Handle login request by redirecting to the main application's sign-in page
async function handleLogin(request, sendResponse) {
  try {
    // Open a new tab with the sign-in page
    chrome.tabs.create({
      url: 'https://aicademics-six.vercel.app/api/auth/signin'
    }, (tab) => {
      // We'll wait for the user to sign in through the web interface
      // The session will be shared via cookies
      sendResponse({ 
        success: true, 
        message: 'Please sign in through the opened page. After signing in, return to the extension.'
      });
    });
  } catch (error) {
    console.error('Login redirection error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle logout by calling the main application's sign-out endpoint
async function handleLogout(sendResponse) {
  try {
    // Call the sign-out endpoint
    const response = await fetch('https://aicademics-six.vercel.app/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    });
    
    // Clear local storage data related to authentication
    chrome.storage.local.remove(['user', 'lastSessionCheck'], () => {
      sendResponse({ success: true });
    });
  } catch (error) {
    console.error('Logout error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Save content to backend
async function saveToBackend(contentData) {
  try {
    // Get the current user session
    const session = await fetchSession();
    if (!session || !session.user) {
      throw new Error('Not authenticated');
    }
    
    // Configure URL to your application's content saving endpoint
    const response = await fetch('https://aicademics-six.vercel.app/api/content/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important to include cookies for authentication
      body: JSON.stringify(contentData)
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving to backend:', error);
    // Fall back to local storage only
    return { success: false, error: error.message };
  }
}

// Save content to local storage
async function saveToLocalStorage(contentData) {
  return new Promise(resolve => {
    chrome.storage.local.get(['savedContent'], result => {
      const savedContent = result.savedContent || [];
      savedContent.push({
        id: 'local-' + Date.now(),
        ...contentData
      });
      
      // Only keep most recent 50 items in local storage
      const trimmedContent = savedContent.slice(-50);
      
      chrome.storage.local.set({ savedContent: trimmedContent }, () => {
        resolve(true);
      });
    });
  });
} 