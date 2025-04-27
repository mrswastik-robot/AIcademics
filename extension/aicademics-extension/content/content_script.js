// Import Readability
import { Readability } from '@mozilla/readability';

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
    case 'getYouTubeTranscript':
      if (isYouTubeVideo()) {
        extractYouTubeTranscript()
          .then(transcript => sendResponse({ transcript }))
          .catch(error => sendResponse({ error: error.message }));
        return true; // Required for async response
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
    publishDate: getPublishDate(),
    keywords: getKeywords(),
    language: document.documentElement.lang || 'en'
  };
  
  return metadata;
}

// Extract YouTube video information
function extractYouTubeInfo() {
  const videoId = new URLSearchParams(window.location.search).get('v');
  
  // Get more detailed video information
  const channelElement = document.querySelector('#owner-name a');
  const viewCountElement = document.querySelector('.view-count');
  const uploadDateElement = document.querySelector('#info-strings yt-formatted-string');
  const likesElement = document.querySelector('#top-level-buttons-computed button');
  
  return {
    videoId,
    title: document.title.replace(' - YouTube', ''),
    channel: channelElement?.textContent.trim() || '',
    channelUrl: channelElement?.href || '',
    description: document.querySelector('#description-inline-expander')?.textContent.trim() || '',
    url: window.location.href,
    viewCount: viewCountElement?.textContent.trim() || '',
    uploadDate: uploadDateElement?.textContent.trim() || '',
    likes: likesElement?.textContent.trim() || '',
    duration: getDuration()
  };
}

// Get video duration from YouTube player
function getDuration() {
  try {
    const durationElement = document.querySelector('.ytp-time-duration');
    return durationElement?.textContent || '';
  } catch (error) {
    console.error('Error getting video duration:', error);
    return '';
  }
}

// Extract YouTube transcript
async function extractYouTubeTranscript() {
  // This is a simple implementation - in production, you'd use YouTube's API
  // or a more sophisticated method to extract the transcript
  
  // Look for transcript button and click it if not already open
  const transcriptButton = Array.from(document.querySelectorAll('button'))
    .find(button => button.textContent.includes('Show transcript'));
  
  if (transcriptButton) {
    transcriptButton.click();
    // Wait for transcript to load
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Find transcript container
  const transcriptElements = document.querySelectorAll('yt-formatted-string.ytd-transcript-segment-renderer');
  
  if (!transcriptElements || transcriptElements.length === 0) {
    throw new Error('Transcript not available');
  }
  
  // Extract transcript text with timestamps
  const transcriptSegments = [];
  
  transcriptElements.forEach((element, index) => {
    if (index % 2 === 0) {
      // Timestamp
      const timestamp = element.textContent.trim();
      const text = transcriptElements[index + 1]?.textContent.trim() || '';
      
      transcriptSegments.push({
        timestamp,
        text
      });
    }
  });
  
  return transcriptSegments;
}

// Check if the page is likely an article
function isArticle() {
  // Check for common article indicators
  return !!document.querySelector('article') || 
         !!document.querySelector('[itemtype*="Article"]') ||
         !!document.querySelector('meta[property="og:type"][content="article"]') ||
         // Additional checks
         !!document.querySelector('.post') ||
         !!document.querySelector('.blog-post') ||
         !!document.querySelector('.article');
}

// Check if the current page is a YouTube video
function isYouTubeVideo() {
  return window.location.hostname.includes('youtube.com') && 
         window.location.pathname.includes('/watch') &&
         new URLSearchParams(window.location.search).has('v');
}

// Extract content from article pages using Readability.js
function extractArticleContent() {
  try {
    // Create a clone of the document to avoid modifying the original
    const documentClone = document.cloneNode(true);
    
    // Use Readability to parse the document
    const reader = new Readability(documentClone);
    const article = reader.parse();
    
    if (article) {
      return {
        title: article.title,
        byline: article.byline, // Author information
        siteName: article.siteName,
        excerpt: article.excerpt,
        html: article.content,
        text: article.textContent,
        length: article.textContent.length,
        readingTime: calculateReadingTime(article.textContent),
        headings: extractHeadings(document.body)
      };
    }
  } catch (error) {
    console.error('Error using Readability:', error);
  }
  
  // Fall back to basic content extraction if Readability fails
  return fallbackArticleExtraction();
}

// Fallback method to extract article content if Readability fails
function fallbackArticleExtraction() {
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
    headings: extractHeadings(articleElement),
    readingTime: calculateReadingTime(articleElement.textContent),
    images: extractImages(articleElement)
  };
}

// Calculate estimated reading time in minutes
function calculateReadingTime(text) {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Extract content from generic (non-article) pages
function extractGenericContent() {
  // Try to get the main content area
  const mainElement = document.querySelector('main') || document.body;
  
  // Remove navigation, headers, footers, and ads for cleaner content
  const contentElement = mainElement.cloneNode(true);
  const elementsToRemove = contentElement.querySelectorAll('nav, header, footer, aside, [class*="ads"], [id*="ads"], [class*="banner"], [id*="banner"]');
  elementsToRemove.forEach(el => el.remove());
  
  return {
    html: contentElement.innerHTML,
    text: contentElement.textContent.trim(),
    headings: extractHeadings(mainElement),
    images: extractImages(mainElement)
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

// Extract images from the content
function extractImages(element) {
  const images = [];
  const imageElements = element.querySelectorAll('img');
  
  imageElements.forEach(img => {
    if (img.src && isValidImageUrl(img.src) && !isTrackerImage(img)) {
      images.push({
        src: img.src,
        alt: img.alt || '',
        width: img.width || 0,
        height: img.height || 0
      });
    }
  });
  
  return images;
}

// Check if image URL is valid
function isValidImageUrl(url) {
  try {
    // Filter out data URLs, empty URLs, or very small icons
    return url && 
           !url.startsWith('data:') && 
           url.match(/\.(jpeg|jpg|gif|png|webp)/) !== null;
  } catch (error) {
    return false;
  }
}

// Check if image is likely a tracking pixel
function isTrackerImage(img) {
  // Tracking images are often 1x1 pixels
  return (img.width <= 1 && img.height <= 1) || 
         (img.style.width === '1px' && img.style.height === '1px');
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
         document.querySelector('meta[itemprop="image"]')?.content || '';
}

function getAuthor() {
  return document.querySelector('meta[name="author"]')?.content ||
         document.querySelector('meta[property="article:author"]')?.content ||
         document.querySelector('[rel="author"]')?.textContent || '';
}

function getPublishDate() {
  return document.querySelector('meta[property="article:published_time"]')?.content ||
         document.querySelector('time[datetime]')?.datetime ||
         document.querySelector('[itemprop="datePublished"]')?.content || '';
}

function getKeywords() {
  const keywordsContent = document.querySelector('meta[name="keywords"]')?.content || '';
  return keywordsContent ? keywordsContent.split(',').map(k => k.trim()) : [];
} 