# Jest-Puppeteer Reference Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation and Setup](#installation-and-setup)
3. [Configuration Options](#configuration-options)
4. [Writing Tests](#writing-tests)
5. [Advanced Test Patterns](#advanced-test-patterns)
6. [Visual Regression Testing](#visual-regression-testing)
7. [Common Testing Patterns for Astro and React](#common-testing-patterns-for-astro-and-react)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [Resources](#resources)

## Introduction

Jest-Puppeteer integrates [Jest](https://jestjs.io/) (the JavaScript testing framework) with [Puppeteer](https://pptr.dev/) (Google's headless browser automation tool). This combination provides a powerful environment for end-to-end testing of web applications, including those built with Astro JS and React.

Key features:
- End-to-end browser testing
- Simplified browser automation
- Enhanced assertions with expect-puppeteer
- Automatic browser and server management
- Screenshot and visual testing capabilities
- TypeScript support

## Installation and Setup

### Prerequisites

Before getting started, ensure you have:
- Node.js (>=14)
- npm or yarn
- A project using Jest

### Basic Installation

```bash
npm install --save-dev jest puppeteer jest-puppeteer
```

### Jest Configuration

Create or update your `jest.config.js` file:

```javascript
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
```

### Setup File

Create a `jest.setup.js` file to configure global setup:

```javascript
// Enable extended Puppeteer assertions
import 'expect-puppeteer';

// Set longer timeout for browser tests
jest.setTimeout(30000);
```

### Puppeteer Configuration

Create a `jest-puppeteer.config.js` file in your project root:

```javascript
module.exports = {
  launch: {
    headless: 'new', // Use 'new' for latest headless mode
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  browserContext: 'default',
};
```

## Configuration Options

The `jest-puppeteer.config.js` file supports various options:

### Browser Launch Configuration

```javascript
module.exports = {
  launch: {
    // Whether to run browser in headless mode
    headless: process.env.HEADLESS !== 'false',
    
    // Browser to use ('chrome' or 'firefox')
    browser: 'chrome', 
    
    // Output browser console to node console
    dumpio: true, 
    
    // Browser viewport settings
    defaultViewport: { width: 1280, height: 720 },
    
    // Browser launch arguments
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
    
    // Path to a specific browser executable
    executablePath: '/path/to/chrome',
    
    // Slow down operations by specified ms
    slowMo: 50,
  },
  
  // Use 'default' or 'incognito' for session isolation
  browserContext: 'default',
}
```

### Server Configuration

Automatically start and stop a local server for testing:

```javascript
module.exports = {
  // ... launch config
  server: {
    // Command to start your server
    command: 'npm run start',
    
    // Server port number
    port: 3000,
    
    // Host address
    host: 'localhost',
    
    // Timeout waiting for server in ms
    launchTimeout: 30000,
    
    // Protocol (http/https)
    protocol: 'http',
    
    // Show server debug output
    debug: true,
  },
}
```

### Environment Variables

You can use environment variables to control configuration:

- `HEADLESS=false` - Run tests with a visible browser window
- `JEST_PUPPETEER_CONFIG=custom-path.js` - Specify a different config file

## Writing Tests

### Basic Test Structure

```javascript
describe('Homepage', () => {
  beforeAll(async () => {
    await page.goto('https://example.com');
  });

  it('should have the correct title', async () => {
    const title = await page.title();
    expect(title).toBe('Example Domain');
  });

  it('should have a heading', async () => {
    const heading = await page.$eval('h1', el => el.textContent);
    expect(heading).toBe('Example Domain');
  });
});
```

### Available Globals

Jest-Puppeteer provides several global objects:

- `browser` - Puppeteer's Browser instance
- `page` - Puppeteer's Page object
- `context` - Browser context for isolated tests
- `jestPuppeteer` - Helper methods (debug, resetPage, resetBrowser)

### expect-puppeteer Assertions

The `expect-puppeteer` library adds Puppeteer-specific assertions:

```javascript
// Check if text exists
await expect(page).toMatchTextContent('Expected text');

// Click a button with text
await expect(page).toClick('button', { text: 'Submit' });

// Fill form fields
await expect(page).toFillForm('form[name="login"]', {
  username: 'testuser',
  password: 'password',
});

// Check if element is visible
await expect(page).toMatchElement('.success-message', { visible: true });

// Wait for navigation to complete
await expect(page).toNavigate('https://example.com/success');

// Upload a file
await expect(page).toUploadFile('input[type="file"]', '/path/to/file.jpg');
```

### Core Puppeteer Methods

You can also use native Puppeteer methods:

```javascript
// Navigate to a URL
await page.goto('https://example.com', { waitUntil: 'networkidle0' });

// Click an element
await page.click('#submit-button');

// Type text
await page.type('#search-input', 'search query');

// Evaluate JavaScript
const pageTitle = await page.evaluate(() => document.title);

// Wait for specific conditions
await page.waitForSelector('.loaded-content');
await page.waitForFunction(() => window.isLoaded === true);
```

## Advanced Test Patterns

### Testing Multi-Page Flows

```javascript
describe('Multi-page flow', () => {
  it('should navigate through a workflow', async () => {
    await page.goto('https://example.com/login');
    
    // Login
    await page.type('#username', 'testuser');
    await page.type('#password', 'password123');
    await page.click('#login-button');
    
    // Wait for navigation to complete
    await page.waitForNavigation();
    
    // Verify redirected to dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Navigate to another section
    await page.click('a[href="/settings"]');
    await page.waitForSelector('.settings-page');
    
    // Verify settings page loaded
    const heading = await page.$eval('h1', el => el.textContent);
    expect(heading).toContain('Settings');
  });
});
```

### Testing Forms

```javascript
describe('Contact form', () => {
  beforeAll(async () => {
    await page.goto('https://example.com/contact');
  });

  it('should validate form fields', async () => {
    // Submit empty form
    await page.click('#submit-button');
    
    // Check for validation messages
    const errors = await page.$$eval('.error-message', elements => 
      elements.map(el => el.textContent)
    );
    expect(errors).toContain('Email is required');
  });

  it('should submit valid form data', async () => {
    // Fill form fields
    await page.type('#name', 'Test User');
    await page.type('#email', 'test@example.com');
    await page.type('#message', 'This is a test message');
    
    // Submit form
    await page.click('#submit-button');
    
    // Check for success message
    await page.waitForSelector('.success-message');
    const successText = await page.$eval('.success-message', el => el.textContent);
    expect(successText).toContain('Message sent successfully');
  });
});
```

### Testing with Multiple Browser Contexts

```javascript
describe('Multiple users', () => {
  let userPage, adminPage;

  beforeAll(async () => {
    // Create a user browser context
    const userContext = await browser.createIncognitoBrowserContext();
    userPage = await userContext.newPage();
    
    // Create an admin browser context
    const adminContext = await browser.createIncognitoBrowserContext();
    adminPage = await adminContext.newPage();
  });

  it('should show different content for different user roles', async () => {
    // User login
    await userPage.goto('https://example.com/login');
    await userPage.type('#username', 'normaluser');
    await userPage.type('#password', 'password');
    await userPage.click('#login-button');
    await userPage.waitForNavigation();
    
    // Admin login
    await adminPage.goto('https://example.com/login');
    await adminPage.type('#username', 'adminuser');
    await adminPage.type('#password', 'adminpass');
    await adminPage.click('#login-button');
    await adminPage.waitForNavigation();
    
    // Check user dashboard
    const userNavigation = await userPage.$$eval('nav a', elements => 
      elements.map(el => el.textContent)
    );
    expect(userNavigation).not.toContain('Admin Panel');
    
    // Check admin dashboard
    const adminNavigation = await adminPage.$$eval('nav a', elements => 
      elements.map(el => el.textContent)
    );
    expect(adminNavigation).toContain('Admin Panel');
  });

  afterAll(async () => {
    await userPage.close();
    await adminPage.close();
  });
});
```

### Debugging

For debugging tests, use the built-in debug function:

```javascript
it('should be debuggable', async () => {
  await page.goto('https://example.com');
  
  // This will pause test execution and open the browser
  await jestPuppeteer.debug();
  
  // Continue testing after manual inspection
  await page.click('#some-button');
});
```

## Visual Regression Testing

### Taking Screenshots

```javascript
describe('Visual testing', () => {
  it('should match visual snapshot', async () => {
    await page.goto('https://example.com');
    
    // Take a screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
    });
    
    // Compare with stored snapshot
    expect(screenshot).toMatchImageSnapshot();
  });
  
  it('should match component snapshot', async () => {
    await page.goto('https://example.com');
    
    // Screenshot a specific element
    const element = await page.$('.header');
    const screenshot = await element.screenshot();
    
    // Compare with stored snapshot
    expect(screenshot).toMatchImageSnapshot({
      // Custom comparison options
      failureThreshold: 0.01,
      failureThresholdType: 'percent',
    });
  });
});
```

> Note: You'll need the `jest-image-snapshot` package for visual comparison.

### Setting Up Visual Testing

Install the required package:

```bash
npm install --save-dev jest-image-snapshot
```

Configure it in your setup file:

```javascript
// jest.setup.js
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });
```

## Common Testing Patterns for Astro and React

### Testing Astro Components

```javascript
describe('Astro Component Tests', () => {
  beforeAll(async () => {
    // Navigate to the page with the component
    await page.goto('http://localhost:3000/component-test-page');
  });

  it('should render the component correctly', async () => {
    // Check if component is rendered
    await expect(page).toMatchElement('.astro-component');
    
    // Verify content
    const text = await page.$eval('.astro-component', el => el.textContent);
    expect(text).toContain('Expected content');
  });

  it('should handle interactivity via islands', async () => {
    // Interact with a React island within Astro
    await page.click('.interactive-button');
    
    // Wait for client-side JavaScript to execute
    await page.waitForSelector('.updated-content');
    
    // Verify the result
    const updatedText = await page.$eval('.updated-content', el => el.textContent);
    expect(updatedText).toContain('Updated after click');
  });
});
```

### Testing React Components

```javascript
describe('React Component Tests', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000/react-component-test');
  });

  it('should render React components', async () => {
    await expect(page).toMatchElement('.react-component');
  });

  it('should update state on interaction', async () => {
    // Initial state
    const initialCount = await page.$eval('.counter-value', el => el.textContent);
    expect(initialCount).toBe('0');
    
    // Click increment button
    await page.click('.increment-button');
    
    // Check updated state
    const updatedCount = await page.$eval('.counter-value', el => el.textContent);
    expect(updatedCount).toBe('1');
  });

  it('should handle form submission in React', async () => {
    // Fill form fields
    await page.type('.name-input', 'Test User');
    await page.type('.email-input', 'test@example.com');
    
    // Submit form
    await page.click('.submit-button');
    
    // Verify submission was processed
    await page.waitForSelector('.submission-success');
    const successMessage = await page.$eval('.submission-success', el => el.textContent);
    expect(successMessage).toContain('Form submitted successfully');
  });
});
```

### Testing ShadCn Components

```javascript
describe('ShadCn Component Tests', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000/shadcn-test-page');
  });

  it('should open and close a dialog', async () => {
    // Check dialog is closed initially
    let dialogVisible = await page.$eval('.dialog-content', el => 
      window.getComputedStyle(el).display !== 'none'
    ).catch(() => false);
    expect(dialogVisible).toBe(false);
    
    // Open dialog
    await page.click('[data-test-id="open-dialog-button"]');
    
    // Check dialog is open
    await page.waitForSelector('.dialog-content', { visible: true });
    
    // Close dialog
    await page.click('[data-test-id="close-dialog-button"]');
    
    // Check dialog is closed
    await page.waitForFunction(
      () => !document.querySelector('.dialog-content') || 
            window.getComputedStyle(document.querySelector('.dialog-content')).display === 'none'
    );
  });

  it('should select an option from dropdown', async () => {
    // Open dropdown
    await page.click('.combobox-trigger');
    
    // Select an option
    await page.waitForSelector('.combobox-option');
    await page.click('.combobox-option:nth-child(2)');
    
    // Verify selection
    const selectedValue = await page.$eval('.combobox-value', el => el.textContent);
    expect(selectedValue).toBeTruthy();
  });
});
```

## Troubleshooting

### Common Issues and Solutions

#### Timeout Errors

```
Error: Timeout - Async callback was not invoked within the 5000 ms timeout
```

Solution:
- Increase Jest timeout:
```javascript
jest.setTimeout(30000); // 30 seconds
```
- Check if selectors exist on the page
- Ensure navigation completes before assertions

#### Element Not Found

```
Error: failed to find element matching selector ".my-element"
```

Solution:
- Check if the selector is correct
- Wait for the element to appear:
```javascript
await page.waitForSelector('.my-element', { timeout: 5000 });
```
- Check if the element is in an iframe

#### Navigation Errors

```
Error: Navigation timeout of 30000 ms exceeded
```

Solution:
- Increase navigation timeout:
```javascript
await page.goto('https://example.com', { timeout: 60000 });
```
- Check network connectivity
- Consider using different wait conditions:
```javascript
await page.goto('https://example.com', { waitUntil: 'networkidle2' });
```

### CI Environment Issues

For CI environments, additional configuration may be needed:

```javascript
module.exports = {
  launch: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
};
```

## Best Practices

### Organization

1. **Structure tests logically**:
   ```
   /tests
     /unit
     /integration
     /e2e
       /pages
       /components
       /flows
   ```

2. **Group related tests**:
   ```javascript
   describe('User Authentication', () => {
     // Login tests
     describe('Login', () => {...});
     
     // Registration tests
     describe('Registration', () => {...});
     
     // Password reset tests
     describe('Password Reset', () => {...});
   });
   ```

3. **Use page objects pattern**:
   ```javascript
   // LoginPage.js
   class LoginPage {
     constructor(page) {
       this.page = page;
     }
     
     async navigate() {
       await this.page.goto('https://example.com/login');
     }
     
     async login(username, password) {
       await this.page.type('#username', username);
       await this.page.type('#password', password);
       await this.page.click('#login-button');
       await this.page.waitForNavigation();
     }
   }
   
   // In your test
   const loginPage = new LoginPage(page);
   await loginPage.navigate();
   await loginPage.login('user', 'pass');
   ```

### Performance

1. **Reuse browser contexts** when possible
2. **Limit screenshot size** for visual testing
3. **Use specific selectors** rather than complex CSS or XPath
4. **Minimize page navigations** between tests

### Reliability

1. **Add proper waiting mechanisms**:
   ```javascript
   // Wait for element
   await page.waitForSelector('.loaded-content');
   
   // Wait for network to be idle
   await page.goto(url, { waitUntil: 'networkidle0' });
   
   // Wait for function condition
   await page.waitForFunction(() => document.querySelector('.status').textContent === 'Ready');
   ```

2. **Handle alerts and dialogs**:
   ```javascript
   // Listen for dialog and handle it
   page.on('dialog', async dialog => {
     expect(dialog.message()).toContain('Are you sure?');
     await dialog.accept();
   });
   
   // Trigger action that causes dialog
   await page.click('#delete-button');
   ```

3. **Clean up resources**:
   ```javascript
   afterAll(async () => {
     await page.close();
     await browser.close();
   });
   ```

## Resources

- [Official jest-puppeteer documentation](https://github.com/argos-ci/jest-puppeteer)
- [Puppeteer API Reference](https://pptr.dev/api/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [expect-puppeteer API](https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md)
- [Puppeteer Recipes](https://pptr.dev/guides/troubleshooting)
- [Astro Testing Guide](https://docs.astro.build/en/guides/testing/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ShadCn Accessibility Testing](https://ui.shadcn.com/docs/components/accessibility)
