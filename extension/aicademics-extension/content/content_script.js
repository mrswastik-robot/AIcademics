// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle different message actions
  switch (request.action) {
    case 'getPageContent':
      sendResponse(extractPageContent());
      break;
    case 'getSelectedText':
      sendResponse({ selectedText: window.getSelection().toString() });
      break;
    case 'getYouTubeInfo':
      if (isYouTubeVideo()) {
        sendResponse(extractYouTubeInfo());
      } else {
        sendResponse({ error: 'Not a YouTube video page' });
      }
      break;
  }
  // Required for async response
  return true;
});

// Main function to extract content from the current page
function extractPageContent() {
  // Get basic page metadata
  const metadata = extractMetadata();
  
  // Get main content based on page type
  let content = '';
  let contentType = 'article';
  
  if (isYouTubeVideo()) {
    content = extractYouTubeInfo();
    contentType = 'video';
  } else if (isArticle()) {
    content = extractArticleContent();
    contentType = 'article';
  } else {
    content = extractGenericContent();
    contentType = 'generic';
  }
  
  // Return the full page data
  return {
    metadata,
    content,
    contentType,
    extractedAt: new Date().toISOString()
  };
}

// Extract metadata from the page
function extractMetadata() {
  // Get OpenGraph and meta tags
  const metadata = {
    title: document.title,
    url: window.location.href,
    siteName: getSiteName(),
    description: getDescription(),
    image: getImage(),
    author: getAuthor(),
    publishDate: getPublishDate()
  };
  
  return metadata;
}

// Check if current page is a YouTube video
function isYouTubeVideo() {
  return window.location.hostname.includes('youtube.com') && 
         window.location.pathname.includes('/watch');
}

// Extract YouTube video information
function extractYouTubeInfo() {
  const videoId = new URLSearchParams(window.location.search).get('v');
  
  return {
    videoId,
    title: document.title.replace(' - YouTube', ''),
    channel: document.querySelector('#owner-name a')?.textContent.trim() || '',
    description: document.querySelector('#description-inline-expander')?.textContent.trim() || '',
    url: window.location.href
  };
}

// Check if the page is likely an article
function isArticle() {
  // Check for common article indicators
  return !!document.querySelector('article') || 
         !!document.querySelector('[itemtype*="Article"]') ||
         !!document.querySelector('meta[property="og:type"][content="article"]');
}

// Extract content from article pages
function extractArticleContent() {
  // Try to find the main article content
  const articleSelectors = [
    'article',
    '[itemtype*="Article"]',
    '.post-content',
    '.article-content',
    '.entry-content',
    '#content',
    '.content',
    'main'
  ];
  
  let articleElement = null;
  
  for (const selector of articleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      articleElement = element;
      break;
    }
  }
  
  if (!articleElement) {
    return extractGenericContent();
  }
  
  // Get the text content
  return {
    html: articleElement.innerHTML,
    text: articleElement.textContent.trim(),
    headings: extractHeadings(articleElement)
  };
}

// Extract content from generic (non-article) pages
function extractGenericContent() {
  // Try to get the main content area
  const mainElement = document.querySelector('main') || document.body;
  
  return {
    html: mainElement.innerHTML,
    text: mainElement.textContent.trim(),
    headings: extractHeadings(mainElement)
  };
}

// Extract headings from an element
function extractHeadings(element) {
  const headings = [];
  const headingElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headingElements.forEach(heading => {
    headings.push({
      level: parseInt(heading.tagName.substring(1)),
      text: heading.textContent.trim()
    });
  });
  
  return headings;
}

// Helper functions to extract metadata
function getSiteName() {
  return document.querySelector('meta[property="og:site_name"]')?.content ||
         document.querySelector('meta[name="application-name"]')?.content ||
         new URL(window.location.href).hostname;
}

function getDescription() {
  return document.querySelector('meta[property="og:description"]')?.content ||
         document.querySelector('meta[name="description"]')?.content || '';
}

function getImage() {
  return document.querySelector('meta[property="og:image"]')?.content ||
         document.querySelector('meta[name="twitter:image"]')?.content || '';
}

function getAuthor() {
  return document.querySelector('meta[name="author"]')?.content ||
         document.querySelector('meta[property="article:author"]')?.content ||
         document.querySelector('[rel="author"]')?.textContent || '';
}

function getPublishDate() {
  return document.querySelector('meta[property="article:published_time"]')?.content ||
         document.querySelector('time')?.getAttribute('datetime') || '';
} 