# AIcademics Knowledge Saver Extension

This Chrome extension allows users to save web content, articles, and videos to their AIcademics knowledge base for later retrieval and learning.

## Authentication

The extension uses the same authentication system as the main AIcademics application, based on NextAuth. This ensures a seamless experience for users:

1. When a user clicks "Sign in with Google" in the extension, they are redirected to the AIcademics web application sign-in page.
2. After signing in through the web interface, the session is stored as cookies that are shared between the extension and the web application.
3. The extension verifies the authentication status by checking these session cookies with the main application's API.

## Features

- Save entire web pages to your AIcademics knowledge base
- Save selected text from web pages
- Tag saved content for better organization
- Add personal notes to saved content
- Automatically categorize saved content (optional)
- Generate summaries of saved content (optional)

## Technical Implementation

### Authentication Flow

1. The extension checks authentication status by sending a request to the AIcademics API endpoint `/api/auth/session`.
2. If the user is not authenticated, they can click the "Sign in with Google" button to open the AIcademics login page.
3. After successful authentication, the session is stored in cookies that are shared between the extension and the web application.
4. The extension then uses these cookies for all subsequent API requests to save content.

### Content Saving

When a user saves content:

1. The extension first verifies authentication.
2. It then extracts the content (either the entire page or the selected text).
3. The content is sent to the AIcademics API endpoint `/api/content/save`.
4. The content is also stored locally as a backup.

## Privacy

- All authentication is handled through the official AIcademics servers.
- The extension only accesses the pages you explicitly choose to save.
- Your saved content is securely stored in your AIcademics account.

## Development

To set up the development environment:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Load the `dist` directory as an unpacked extension in Chrome

## Configuration

The following environment variables need to be configured:

- `AICADEMICS_API_URL`: The base URL of the AIcademics API

## Available Scripts

In the project directory, you can run the following scripts:

### npm dev

**Development Mode**: This command runs your extension in development mode. It will launch a new browser instance with your extension loaded. The page will automatically reload whenever you make changes to your code, allowing for a smooth development experience.

```bash
npm dev
```

### npm start

**Production Preview**: This command runs your extension in production mode. It will launch a new browser instance with your extension loaded, simulating the environment and behavior of your extension as it will appear once published.

```bash
npm start
```

### npm build

**Build for Production**: This command builds your extension for production. It optimizes and bundles your extension, preparing it for deployment to the target browser's store.

```bash
npm build
```

## Learn More

To learn more about creating cross-browser extensions with Extension.js, visit the [official documentation](https://extension.js.org).
