# WindSurf Cascade Puppeteer Integration Guide

## Introduction

This guide provides comprehensive instructions for integrating and using Puppeteer with WindSurf's Cascade through the Model Context Protocol (MCP). Puppeteer is a powerful browser automation tool that allows Cascade to interact with web pages, capture screenshots, and execute JavaScript in a real browser environment.

## Table of Contents

1. [Understanding MCP in WindSurf](#understanding-mcp-in-windsurf)
2. [Setting Up Puppeteer MCP Server](#setting-up-puppeteer-mcp-server)
3. [Available Puppeteer Tools](#available-puppeteer-tools)
4. [Using Puppeteer in Cascade](#using-puppeteer-in-cascade)
5. [Practical Examples](#practical-examples)
6. [Jest-Puppeteer Integration](#jest-puppeteer-integration)
7. [Troubleshooting](#troubleshooting)
8. [References](#references)

## Understanding MCP in WindSurf

The Model Context Protocol (MCP) is an open protocol that allows Cascade in WindSurf to access external tools and services. It follows a client-server architecture:

- **MCP Clients**: Cascade acts as an MCP client that connects to servers
- **MCP Servers**: External services that provide specialized functionality (like Puppeteer for browser automation)

MCP enhances Cascade's capabilities by enabling it to:
- Access external data sources and APIs
- Perform specialized tasks that aren't built into the base model
- Interact with web interfaces through browser automation

## Setting Up Puppeteer MCP Server

### Prerequisites

- Node.js and npm installed
- WindSurf installed with Cascade enabled

### Installation Steps

1. Open WindSurf and navigate to Settings
2. Access the Cascade section and find the MCP configuration
3. Click "Add New Server" or edit the MCP configuration file directly

### Configuration for Puppeteer

Add the following to your MCP configuration file (located at `~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

After adding the server, click the refresh button to ensure Cascade recognizes the new tools.

## Available Puppeteer Tools

The Puppeteer MCP server provides the following tools:

### 1. puppeteer_navigate

Navigates to a specified URL in the browser.

**Parameters:**
- `url` (string): The URL to navigate to

**Example:**
```
Navigate to the Google homepage
```

### 2. puppeteer_screenshot

Captures screenshots of the entire page or specific elements.

**Parameters:**
- `name` (string, required): Name for the screenshot
- `selector` (string, optional): CSS selector for element to screenshot
- `width` (number, optional, default: 800): Screenshot width
- `height` (number, optional, default: 600): Screenshot height

**Example:**
```
Take a screenshot of the login form with selector "#login-form"
```

### 3. puppeteer_click

Clicks elements on the page.

**Parameters:**
- `selector` (string): CSS selector for element to click

**Example:**
```
Click the submit button with selector "#submit-btn"
```

### 4. puppeteer_hover

Hovers over elements on the page.

**Parameters:**
- `selector` (string): CSS selector for element to hover

**Example:**
```
Hover over the dropdown menu with selector ".dropdown"
```

### 5. puppeteer_fill

Fills out input fields on the page.

**Parameters:**
- `selector` (string): CSS selector for input field
- `value` (string): Value to fill

**Example:**
```
Fill the email field with selector "#email" with value "test@example.com"
```

### 6. puppeteer_select

Selects an option from a dropdown (SELECT tag).

**Parameters:**
- `selector` (string): CSS selector for element to select
- `value` (string): Value to select

**Example:**
```
Select "Option 2" from the dropdown with selector "#country-select"
```

### 7. puppeteer_evaluate

Executes JavaScript in the browser console.

**Parameters:**
- `script` (string): JavaScript code to execute

**Example:**
```
Execute JavaScript to get all links on the page
```

## Using Puppeteer in Cascade

When interacting with Cascade in WindSurf, you can leverage Puppeteer through natural language instructions:

1. **Implicit Usage**: Cascade will automatically use Puppeteer tools when relevant to your task
2. **Explicit Usage**: You can directly reference specific capabilities:
   - "Open the website and take a screenshot"
   - "Fill out the login form and click submit"
   - "Extract data from the table on the webpage"

### Workflow

1. Cascade suggests a Puppeteer tool operation
2. You approve the tool usage
3. The tool executes the operation
4. Results are displayed in the Cascade chat

## Practical Examples

### Example 1: Basic Web Scraping

```
Task: Extract the current price of Bitcoin from CoinMarketCap

Cascade will:
1. Use puppeteer_navigate to go to coinmarketcap.com
2. Use puppeteer_evaluate to extract the price element
3. Return the extracted information
```

### Example 2: Form Automation

```
Task: Fill out a contact form on a website

Cascade will:
1. Use puppeteer_navigate to open the form page
2. Use puppeteer_fill to populate form fields
3. Use puppeteer_click to submit the form
4. Use puppeteer_screenshot to capture the confirmation
```

### Example 3: Web Testing

```
Task: Test if a login form works correctly

Cascade will:
1. Use puppeteer_navigate to open the login page
2. Use puppeteer_fill to enter credentials
3. Use puppeteer_click to submit the form
4. Use puppeteer_evaluate to check for success/error elements
5. Report the results
```

## Jest-Puppeteer Integration

For automated testing with Puppeteer in your projects, you can leverage Jest-Puppeteer integration.

### Installation

```bash
npm install --save-dev jest puppeteer jest-puppeteer
```

### Configuration

Create a `jest.config.js` file:

```js
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/?(*.)+(spec|test).[t]s'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
```

Create a `jest.setup.js` file:

```js
jest.setTimeout(30000);
```

Create a `jest-puppeteer.config.js` file:

```js
module.exports = {
  launch: {
    headless: 'new', // Use 'new' for latest headless mode
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};
```

### Example Test

```js
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

### Running Tests with Cascade

Cascade can help you:
1. Generate test cases based on your application requirements
2. Debug failing tests
3. Extend test coverage
4. Interpret test results

## Troubleshooting

### Common Issues

1. **Puppeteer Server Not Starting**
   - Ensure Node.js and npm are properly installed
   - Check the MCP configuration for typos
   - Try running the server manually: `npx @modelcontextprotocol/server-puppeteer`

2. **Navigation Failures**
   - Verify the URL is accessible
   - Check for network issues or CORS restrictions
   - Try increasing navigation timeout

3. **Selector Issues**
   - Ensure selectors are correct and unique
   - Use puppeteer_evaluate to debug selectors:
     ```js
     document.querySelectorAll('[selector]').length
     ```

4. **Screenshot Problems**
   - Verify the element is visible in the viewport
   - Try using a different selector
   - Use fullPage option for entire page screenshots

### Debugging

When debugging Puppeteer operations through Cascade:

1. Use the console logs resource (`console://logs`)
2. Take screenshots at various stages
3. Use puppeteer_evaluate to run diagnostic JavaScript
4. Break complex operations into smaller steps

## References

- [Puppeteer MCP Server Documentation](https://www.npmjs.com/package/@modelcontextprotocol/server-puppeteer)
- [WindSurf MCP Configuration Guide](https://docs.codeium.com/windsurf/mcp)
- [Model Context Protocol Official Documentation](https://modelcontextprotocol.io)
- [Jest-Puppeteer Documentation](https://github.com/argos-ci/jest-puppeteer)
- [Puppeteer API Reference](https://pptr.dev/api)

---

## Advanced Topics

### Running Puppeteer in Non-Headless Mode

To see the browser in action during automation:

```json
{
  "mcpServers": {
    "puppeteer-visible": {
      "command": "node",
      "args": ["-e", "require('@modelcontextprotocol/server-puppeteer').start({ headless: false })"]
    }
  }
}
```

### Custom Browser Path

To use a specific Chrome/Chromium installation:

```json
{
  "mcpServers": {
    "puppeteer-custom": {
      "command": "node",
      "args": ["-e", "require('@modelcontextprotocol/server-puppeteer').start({ executablePath: '/path/to/chrome' })"]
    }
  }
}
```

### Using with Authentication

For sites requiring authentication:

1. Navigate to the login page
2. Fill and submit credentials
3. Store cookies or session data
4. Use stored session for subsequent requests

Cascade can maintain the browser session throughout your conversation.
