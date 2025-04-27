// Import OpenAI
import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient = null;

// Load OpenAI API key from storage on initialization
chrome.storage.local.get(['openaiApiKey'], (result) => {
  if (result.openaiApiKey) {
    initializeOpenAI(result.openaiApiKey);
  }
});

// Initialize OpenAI client with API key
function initializeOpenAI(apiKey) {
  if (apiKey) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, proxy this through your backend
    });
  } else {
    openaiClient = null;
  }
}

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
    case 'saveYouTubeVideo':
      handleSaveYouTubeVideo(request, sendResponse);
      break;
    case 'summarizeContent':
      handleSummarizeContent(request, sendResponse);
      break;
    case 'extractKeyEntities':
      handleExtractKeyEntities(request, sendResponse);
      break;
    case 'setOpenAIApiKey':
      handleSetOpenAIApiKey(request, sendResponse);
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
    
    // Generate summaries if OpenAI API is available
    let summary = null;
    let keyEntities = null;
    
    if (openaiClient && pageContent.content && pageContent.content.text) {
      // Generate summary in the background
      generateSummary(pageContent.content.text)
        .then(result => {
          if (result) {
            updateSavedContentWithSummary(pageContent.metadata.url, result);
          }
        })
        .catch(error => console.error('Error generating summary:', error));
    }
    
    // Add user provided data
    const contentData = {
      ...pageContent,
      userTags: request.tags || [],
      userNotes: request.notes || '',
      savedAt: new Date().toISOString(),
      summary,
      keyEntities
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
    
    // Generate summary if OpenAI API is available and text is long enough
    if (openaiClient && request.selection && request.selection.length > 500) {
      try {
        const summary = await generateSummary(request.selection);
        if (summary) {
          contentData.summary = summary;
        }
      } catch (error) {
        console.error('Error generating summary for selection:', error);
      }
    }
    
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

// Handle saving a YouTube video
async function handleSaveYouTubeVideo(request, sendResponse) {
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
    
    // Execute content script to get video info
    const videoInfoResults = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: () => {
        return new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'getYouTubeInfo' }, response => {
            resolve(response);
          });
        });
      }
    });
    
    const videoInfo = videoInfoResults[0].result;
    
    // Get transcript if available
    let transcript = null;
    
    try {
      const transcriptResults = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: () => {
          return new Promise(resolve => {
            chrome.runtime.sendMessage({ action: 'getYouTubeTranscript' }, response => {
              resolve(response);
            });
          });
        }
      });
      
      transcript = transcriptResults[0].result.transcript;
    } catch (error) {
      console.error('Error getting transcript:', error);
    }
    
    // Prepare content data
    const contentData = {
      metadata: {
        title: videoInfo.title,
        url: videoInfo.url,
        siteName: 'YouTube',
        channel: videoInfo.channel,
        channelUrl: videoInfo.channelUrl,
        uploadDate: videoInfo.uploadDate,
        viewCount: videoInfo.viewCount,
        likes: videoInfo.likes,
        duration: videoInfo.duration
      },
      content: {
        videoId: videoInfo.videoId,
        description: videoInfo.description,
        transcript: transcript
      },
      contentType: 'youtube',
      userTags: request.tags || [],
      userNotes: request.notes || '',
      savedAt: new Date().toISOString()
    };
    
    // Generate summary if OpenAI API is available and transcript exists
    if (openaiClient && transcript && transcript.length > 0) {
      // Concatenate transcript text
      const transcriptText = transcript.map(segment => segment.text).join(' ');
      
      if (transcriptText.length > 0) {
        try {
          const summary = await generateSummary(transcriptText);
          if (summary) {
            contentData.summary = summary;
          }
        } catch (error) {
          console.error('Error generating summary for YouTube transcript:', error);
        }
      }
    }
    
    // Save to backend
    const saveResult = await saveToBackend(contentData);
    
    // Also save to local storage as backup
    await saveToLocalStorage(contentData);
    
    sendResponse({ success: true, savedContent: contentData });
  } catch (error) {
    console.error('Error saving YouTube video:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle content summarization request
async function handleSummarizeContent(request, sendResponse) {
  try {
    if (!openaiClient) {
      sendResponse({ success: false, error: 'OpenAI API key not configured' });
      return;
    }
    
    const text = request.text;
    
    if (!text || text.length === 0) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }
    
    const summary = await generateSummary(text);
    
    if (summary) {
      sendResponse({ success: true, summary });
    } else {
      sendResponse({ success: false, error: 'Failed to generate summary' });
    }
  } catch (error) {
    console.error('Error summarizing content:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle extraction of key entities
async function handleExtractKeyEntities(request, sendResponse) {
  try {
    if (!openaiClient) {
      sendResponse({ success: false, error: 'OpenAI API key not configured' });
      return;
    }
    
    const text = request.text;
    
    if (!text || text.length === 0) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }
    
    const entities = await extractKeyEntities(text);
    
    if (entities) {
      sendResponse({ success: true, entities });
    } else {
      sendResponse({ success: false, error: 'Failed to extract entities' });
    }
  } catch (error) {
    console.error('Error extracting entities:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle setting OpenAI API key
async function handleSetOpenAIApiKey(request, sendResponse) {
  try {
    const apiKey = request.apiKey;
    
    if (!apiKey) {
      sendResponse({ success: false, error: 'No API key provided' });
      return;
    }
    
    // Save API key to storage
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    
    // Initialize OpenAI client
    initializeOpenAI(apiKey);
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error setting OpenAI API key:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Generate summary using OpenAI
async function generateSummary(text) {
  if (!openaiClient || !text) {
    return null;
  }
  
  try {
    // Limit text length to avoid token limits
    const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '...' : text;
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes content. Provide a concise summary that captures the key points of the text. Include the main ideas, key arguments, and conclusions.'
        },
        {
          role: 'user',
          content: `Please summarize the following text in 3-5 sentences:\n\n${truncatedText}`
        }
      ],
      max_tokens: 250,
      temperature: 0.5
    });
    
    if (response && response.choices && response.choices.length > 0) {
      return response.choices[0].message.content.trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error using OpenAI API for summary:', error);
    return null;
  }
}

// Extract key entities using OpenAI
async function extractKeyEntities(text) {
  if (!openaiClient || !text) {
    return null;
  }
  
  try {
    // Limit text length to avoid token limits
    const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '...' : text;
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts key entities and concepts from text. Return entities in JSON format grouped by type (people, organizations, locations, concepts, terms, dates).'
        },
        {
          role: 'user',
          content: `Extract the key entities and concepts from the following text. Return the result as JSON with the following structure: { "people": [], "organizations": [], "locations": [], "concepts": [], "terms": [], "dates": [] }. \n\nText: ${truncatedText}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    if (response && response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content.trim();
      try {
        return JSON.parse(content);
      } catch (error) {
        console.error('Error parsing JSON from OpenAI response:', error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error using OpenAI API for entity extraction:', error);
    return null;
  }
}

// Update saved content with summary
async function updateSavedContentWithSummary(url, summary) {
  try {
    // Update in local storage
    chrome.storage.local.get(['savedContent'], result => {
      const savedContent = result.savedContent || [];
      const updatedContent = savedContent.map(item => {
        if (item.metadata && item.metadata.url === url) {
          return { ...item, summary };
        }
        return item;
      });
      
      chrome.storage.local.set({ savedContent: updatedContent });
    });
    
    // Update in backend
    try {
      const session = await fetchSession();
      if (!session || !session.user) {
        return;
      }
      
      // Configure URL to your application's update endpoint
      await fetch('https://aicademics-six.vercel.app/api/content/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          url,
          summary
        })
      });
    } catch (error) {
      console.error('Error updating summary in backend:', error);
    }
  } catch (error) {
    console.error('Error updating saved content with summary:', error);
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