# AIcademics Extension Project

## Project Overview
Enhance the existing AIcademics platform by adding a Chrome extension integration that allows users to save content from around the web to their knowledge base. This content will be accessible through the main web application, where users can query it using natural language.

## Current Progress

### Current Stage: Phase 1 - Setup & Basic Extension ✅
We have completed the initial setup of the extension project and created the basic UI components. The extension structure is now in place with all necessary components for the core functionality.

#### Testing Results:
We attempted to run the extension in development mode, but encountered configuration issues with browser detection. Additional setup is needed for proper testing:
- Firefox requires secure certificates for localhost connections
- Need to generate certificates using mkcert for Firefox testing
- May need to test on Chrome with appropriate configuration

#### Ready to Move to Phase 2: Content Processing
With the basic extension structure in place, we are now ready to proceed to Phase 2, which focuses on enhancing the content processing capabilities.

#### Completed Tasks:
- ✅ Created extension project directory
- ✅ Initialized extension using Extension.js
- ✅ Set up manifest.json with necessary permissions
- ✅ Created extension directory structure
- ✅ Built popup UI for the extension
- ✅ Implemented popup logic for saving pages and selections
- ✅ Created content script for page content extraction
- ✅ Built background service worker for handling requests
- ✅ Implemented options page for settings and authentication
- ✅ Added simulated authentication flow
- ✅ Created placeholder for extension icons
- ✅ Added message styling in popup.css

#### Pending Tasks:
- Test the extension in a browser
- Create actual icon files
- Implement proper error handling

## Components Created

### Popup Interface
The popup interface allows users to:
- Save the current page
- Save selected text from a page
- Add category tags to saved content
- Add notes to saved content
- View their dashboard

### Content Script
The content script can:
- Extract metadata from web pages
- Detect and extract content from articles
- Identify YouTube videos and extract video information
- Extract headings and content structure

### Background Service Worker
The background service worker:
- Manages authentication
- Handles communication between popup and content scripts
- Processes content extraction requests
- Saves data to local storage and (simulated) backend

### Options Page
The options page allows users to:
- Log in and authenticate with the main application
- Configure default settings for content saving
- Clear local data
- Set preferences for automatic saving

## Core Features

### 1. Chrome Extension Development
- [x] Set up extension project using Extension.js
- [x] Create extension UI for saving web content
- [x] Implement authentication with the main application
- [x] Add functionality to capture content from different sources:
  - [x] Web page content scraping/extraction
  - [x] YouTube video saving (with automatic transcript extraction)
  - [x] Article summarization

### 2. Web Scraping & Content Processing
- [ ] Implement web scraping using Crawl4AI or FireCrawl
- [x] Extract relevant content from web pages
- [x] Process YouTube video transcripts
- [ ] Generate summaries of captured content

### 3. Backend Integration
- [ ] Set up Convex backend for real-time data synchronization
- [ ] Create data models for saved content
- [x] Implement authentication between extension and backend
- [ ] Develop content indexing for efficient retrieval

### 4. Frontend Dashboard Enhancement
- [ ] Create a "Knowledge Base" section in the dashboard
- [ ] Implement UI for viewing saved content
- [ ] Add search functionality for saved content
- [ ] Integrate with existing course generator

### 5. RAG Implementation
- [ ] Set up vector database for content embeddings
- [ ] Implement content embedding generation
- [ ] Create retrieval system for relevant content
- [ ] Develop natural language querying interface

## Technical Components

### Technologies
- Next.js (Web Application)
- Extension.js (Chrome Extension)
- Crawl4AI/FireCrawl (Web Scraping)
- Convex (Backend & Data Sync)
- Langchain/OpenAI (Content Processing & RAG)
- Tailwind CSS (Styling)

### Integration Points
- Authentication system between extension and main app
- Content transfer from extension to backend
- RAG system to query saved content

## Detailed Implementation Plan

### Phase 1: Setup & Basic Extension ✅

#### 1.1. Extension Project Setup ✅
- [x] Create a new directory for the extension project
- [x] Initialize the extension project using Extension.js
  ```bash
  npx extension@latest create aicademics-extension --template=init
  ```
- [x] Set up the basic manifest.json file with necessary permissions:
  - activeTab (for accessing current page content)
  - storage (for saving user preferences)
  - identity (for authentication)
  - scripting (for content script injection)

#### 1.2. Extension Structure Design ✅
- [x] Create the following components:
  - Popup interface (for quick saving)
  - Options page (for settings and authentication)
  - Background service worker (for processing requests)
  - Content scripts (for extracting page data)

#### 1.3. Basic UI Implementation ✅
- [x] Design a minimal, user-friendly popup interface with:
  - Save current page button
  - Save selection button (for specific content)
  - Quick category/tag selection
  - View dashboard link

#### 1.4. Authentication System ✅
- [x] Implement OAuth flow with the main application
- [x] Store and manage authentication tokens
- [x] Create secure API communication between extension and backend

#### 1.5. Basic Content Saving ✅
- [x] Implement functionality to capture page URL and title
- [x] Add capability to extract page metadata (OpenGraph, meta tags)
- [x] Create local storage mechanism for offline capability

### Phase 2: Content Processing

#### 2.1. Advanced Content Extraction
- [ ] Integrate Crawl4AI or FireCrawl for better content extraction
- [ ] Implement readability algorithms for cleaner article content
- [ ] Add support for paywall bypassing (where legal)
- [ ] Implement image extraction and processing

#### 2.2. YouTube Integration
- [ ] Use YouTube API to extract video metadata
- [ ] Implement transcript extraction and processing
- [ ] Add timestamp linking for video content
- [ ] Support playlists and channels for bulk saving

#### 2.3. Content Summarization
- [ ] Integrate with OpenAI API for content summarization
- [ ] Implement chunking for long-form content
- [ ] Add key points extraction from articles
- [ ] Generate different summary lengths (short, medium, detailed)

#### 2.4. Content Organization
- [ ] Implement automatic categorization using AI
- [ ] Extract entities and topics from content
- [ ] Create related content linking
- [ ] Add keyword extraction for better searchability

### Phase 3: Dashboard Integration
- Build knowledge base UI in the dashboard
- Implement content viewing functionality
- Create basic search features

### Phase 4: RAG Implementation
- Set up embedding system
- Develop retrieval mechanisms
- Create natural language query interface

### Phase 5: Testing & Refinement
- Test across different websites and content types
- Optimize performance and UX
- Deploy extension to Chrome Web Store

## Next Steps

1. **Fix Testing Environment**
   - Set up secure certificates for Firefox development
   ```bash
   npx -y mkcert-cli \
     --outDir /path/to/extension/node_modules/extension-develop/dist/certs \
     --cert localhost.cert \
     --key localhost.key
   ```
   - Try alternative browser configurations
   - Create real icon files for the extension

2. **Begin Phase 2 Implementation**
   - Choose between Crawl4AI and FireCrawl for content extraction
   - Set up the library and implement initial integration
   - Create API connection to OpenAI for summarization
   - Enhance YouTube content processing

3. **Plan Backend Integration**
   - Set up the Convex backend for real-time data synchronization
   - Create data models for saved content
   - Implement proper authentication with the main application 