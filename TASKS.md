# AIcademics Extension Project

## Project Overview
Enhance the existing AIcademics platform by adding a Chrome extension integration that allows users to save content from around the web to their knowledge base. This content will be accessible through the main web application, where users can query it using natural language.

## Current Progress

### Current Stage: Phase 3 - Dashboard Integration 🏗️
We have completed the initial setup of the extension project (Phase 1) and implemented the content processing capabilities (Phase 2). Now moving to the dashboard integration and backend setup.

#### Testing Results:
We attempted to run the extension in development mode, but encountered configuration issues with browser detection. Additional setup is needed for proper testing:
- Firefox requires secure certificates for localhost connections
- Need to generate certificates using mkcert for Firefox testing
- May need to test on Chrome with appropriate configuration

We have now successfully built the extension:
- Build successful with `npm run build`
- Load the extension from `dist/chrome` folder in Chrome
- Enhanced content extraction and AI features working

#### Completed Phases:
- ✅ Phase 1: Setup & Basic Extension
- ✅ Phase 2: Content Processing
- 🏗️ Phase 3: Dashboard Integration (In Progress)
- ⬜ Phase 4: RAG Implementation
- ⬜ Phase 5: Testing & Refinement

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
- ✅ Created extension icons
- ✅ Added error handling framework
- ✅ Implemented Readability.js for article extraction
- ✅ Added YouTube video content saving with transcript extraction
- ✅ Integrated OpenAI for content summarization
- ✅ Added automatic tag suggestion based on content

#### Pending Tasks:
- Add proper backend data modeling
- Implement backend database with Convex
- Create dashboard UI for viewing saved content
- Implement RAG with vector database

## Phase 2 Implementation Details

### Advanced Content Extraction
- **Implemented Readability.js**: Added Mozilla's Readability library for better article parsing and content extraction
- **Enhanced Metadata Extraction**: Improved extraction of key metadata (authors, publish dates, images)
- **Reading Time Calculation**: Added reading time estimates for saved content
- **Image Extraction**: Implemented intelligent image extraction from content with filtering for relevant images

### YouTube Integration
- **Transcript Extraction**: Added capability to extract YouTube video transcripts
- **Enhanced Video Metadata**: Capturing detailed video information (channel, views, likes, etc.)
- **UI Improvement**: Added dedicated YouTube video saving button that only appears on YouTube pages

### Content Summarization
- **OpenAI Integration**: Added summarization capabilities using OpenAI API
- **Background Processing**: Implemented non-blocking background processing for summaries
- **Entity Extraction**: Added feature to extract key entities (people, organizations, locations, concepts)
- **API Key Management**: Implemented secure OpenAI API key storage and management in options page

### Content Organization
- **Automatic Tagging**: Added rule-based auto-tagging system based on content and URL patterns
- **Tag Suggestions**: Implemented tag suggestions with visual highlighting
- **Custom Tags**: Enhanced custom tag creation and management

### Error Handling & Testing
- **Error Management**: Created a centralized error handling system
- **User-Friendly Messages**: Implemented user-friendly error messages
- **Debugging Tools**: Added error logging and an error log viewer in the options page
- **Icon Generation**: Created extension icons in multiple sizes for different contexts

## Components Created

### Popup Interface
The popup interface allows users to:
- Save the current page
- Save selected text from a page
- Save YouTube videos with transcripts
- Add category tags to saved content
- Add notes to saved content
- View their dashboard

### Content Script
The content script can:
- Extract metadata from web pages
- Detect and extract content from articles with Readability.js
- Identify YouTube videos and extract video information
- Extract YouTube transcripts
- Extract headings and content structure

### Background Service Worker
The background service worker:
- Manages authentication
- Handles communication between popup and content scripts
- Processes content extraction requests
- Saves data to local storage and (simulated) backend
- Integrates with OpenAI for content summarization and entity extraction

### Options Page
The options page allows users to:
- Log in and authenticate with the main application
- Configure default settings for content saving
- Set OpenAI API key for AI features
- View and clear error logs
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
- [x] Implement web scraping using Readability.js
- [x] Extract relevant content from web pages
- [x] Process YouTube video transcripts
- [x] Generate summaries of captured content

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
- Readability.js (Content Extraction)
- OpenAI API (Content Processing & Summarization)
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

### Phase 2: Content Processing ✅

#### 2.1. Advanced Content Extraction ✅
- [x] Implement Readability.js for better content extraction
- [x] Implement readability algorithms for cleaner article content
- [x] Implement image extraction and processing

#### 2.2. YouTube Integration ✅
- [x] Extract YouTube video metadata
- [x] Implement transcript extraction and processing
- [x] Add dedicated YouTube saving UI

#### 2.3. Content Summarization ✅
- [x] Integrate with OpenAI API for content summarization
- [x] Implement chunking for long-form content
- [x] Add entity extraction from content
- [x] Generate summaries of key content

#### 2.4. Content Organization ✅
- [x] Implement automatic categorization based on content
- [x] Extract entities and topics from content
- [x] Add keyword extraction for better searchability

### Phase 3: Dashboard Integration 🏗️
- Build knowledge base UI in the dashboard
- Implement content viewing functionality
- Create basic search features

### Phase 4: RAG Implementation ⬜
- Set up embedding system
- Develop retrieval mechanisms
- Create natural language query interface

### Phase 5: Testing & Refinement ⬜
- Test across different websites and content types
- Optimize performance and UX
- Deploy extension to Chrome Web Store

## Next Steps

1. **Implement Dashboard Integration**
   - Create knowledge base page in the existing Next.js application
   - Implement UI for viewing and searching saved content
   - Set up API endpoints for content retrieval

2. **Set up Backend for Content Storage**
   - Set up Convex backend for storing saved content
   - Create data models for articles, videos, and selections
   - Implement APIs for content saving and retrieval

3. **Implement RAG System**
   - Set up vector database
   - Create content embedding pipeline
   - Implement retrieval mechanism
   - Develop natural language query interface

4. **Testing and Refinement**
   - Test across different websites and content types
   - Optimize performance and UX
   - Prepare for deployment 