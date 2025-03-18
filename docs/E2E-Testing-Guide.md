# End-to-End Testing Guide for Tankd Planner

This guide provides detailed information on how to create, run, and maintain end-to-end tests for the Tankd Planner application using Puppeteer.

## Table of Contents

1. [Introduction](#introduction)
2. [Setup](#setup)
3. [Writing Tests](#writing-tests)
4. [Best Practices](#best-practices)
5. [Common Challenges](#common-challenges)
6. [Advanced Techniques](#advanced-techniques)
7. [Reference Examples](#reference-examples)

## Introduction

End-to-end (E2E) testing ensures that our application works correctly from a user's perspective by simulating user interactions and verifying expected outcomes. For Tankd Planner, E2E tests are critical for validating:

- Navigation flows
- Tank component selection
- Fish and plant addition to tanks
- Compatibility checks
- Visual rendering of tank components

Our E2E testing stack uses:
- **Puppeteer**: For browser automation
- **Jest**: As the test runner (when using the Jest integration)
- **Node.js**: As the runtime environment

## Setup

### Prerequisites

- Node.js v14+
- Tankd Planner codebase
- npm packages: puppeteer, jest, jest-puppeteer (if using Jest integration)

### Configuration Files

1. **jest-puppeteer.config.js** - Configure Puppeteer launch options:

```javascript
module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    devtools: process.env.DEVTOOLS === 'true',
    product: 'chrome',
    dumpio: process.env.DUMPIO === 'true'
  },
  server: {
    command: 'npm run build && npm run preview',
    port: 4321,
    launchTimeout: 60000,
    debug: true
  },
  browserContext: 'default'
}
```

2. **jest.config.js** - Configure Jest for Puppeteer integration:

```javascript
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['./jest.puppeteer.setup.js'],
  testTimeout: 60000
}
```

## Writing Tests

### Basic Structure

Each E2E test should follow this basic structure:

1. **Setup**: Launch browser, navigate to page
2. **Act**: Perform user interactions
3. **Assert**: Verify expected outcomes
4. **Cleanup**: Close browser

### Example: Basic Navigation Test

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  // Force light mode for consistent testing
  await page.emulateMediaFeatures([{
    name: 'prefers-color-scheme', value: 'light'
  }]);
  
  try {
    // Navigate to the planner page
    await page.goto('http://localhost:4321/planner', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Successfully navigated to planner page');
    
    // Take a screenshot
    await page.screenshot({ path: 'planner-page.png' });
    
    // Basic verification
    const title = await page.title();
    if (title.includes('Tank Planner')) {
      console.log('✅ Title verification passed');
    } else {
      throw new Error('Title verification failed');
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
```

### Testing Interactive Features

#### Finding Elements

Use selectors that are less likely to change with UI updates:

```javascript
// Prefer:
const addFishButton = await page.$('[aria-label="Add Fish"]');
const addFishButton = await page.$('[data-testid="add-fish-button"]');

// Avoid:
const addFishButton = await page.$('.btn-primary.add-fish-123');
```

#### Clicking Elements

```javascript
// Find and click the Add Fish button
const addFishButton = await page.$('button:contains("Add Fish")');
if (addFishButton) {
  await addFishButton.click();
  console.log('Clicked Add Fish button');
  await page.waitForTimeout(1000); // Wait for any animations
}
```

#### Handling Modals and Sheets

```javascript
// Wait for the fish selection sheet to open
await page.waitForSelector('[role="dialog"], .sheet, .modal', { visible: true });

// Find fish options within the sheet
const fishOptions = await page.$$('.fish-card, .fish-option, [data-fish-id]');
console.log(`Found ${fishOptions.length} fish options to choose from`);

// Click the Add button on the first fish card
const firstFishCard = fishOptions[0];
const addButton = await firstFishCard.$('button:contains("Add"), button:contains("+")');
await addButton.click();
```

#### Handling Confirmation Dialogs

```javascript
// Check for confirmation dialog
const confirmDialog = await page.$('dialog, [role="dialog"]');
if (confirmDialog) {
  const confirmButton = await confirmDialog.$('button:contains("Confirm"), button:contains("OK")');
  if (confirmButton) {
    await confirmButton.click();
    console.log('Confirmed fish addition');
  }
}
```

### Verifying Results

#### Visual Verification

```javascript
// Take a screenshot after adding fish
await page.screenshot({ path: 'main-planner-with-fish.png' });
```

#### Content Verification

```javascript
// Check if fish was added to the tank
const tankFishItems = await page.$$('.tank-fish, .fish-item, [data-fish-id]');
if (tankFishItems.length > 0) {
  console.log(`✅ Found ${tankFishItems.length} fish in the tank`);
} else {
  throw new Error('No fish found in tank after adding');
}
```

#### Advanced Verification with DOM Evaluation

```javascript
// Look for indicators that fish was added
const fishIndicators = await page.evaluate(() => {
  // Look for tank items or fish elements
  const tankItems = Array.from(document.querySelectorAll('[class*="tank-item"], [class*="fish-container"]'))
    .map(el => ({
      type: 'tank-item',
      text: el.textContent.trim(),
      className: el.className
    }));
  
  // Look for counters or totals
  const fishCounters = Array.from(document.querySelectorAll('[class*="fish-count"], [class*="counter"]'))
    .map(el => ({
      type: 'counter', 
      text: el.textContent.trim()
    }));
    
  return [...tankItems, ...fishCounters];
});

console.log(`Found ${fishIndicators.length} indicators that fish was added`);
```

## Best Practices

### 1. Reliable Selectors

Use selectors in this priority order:
1. `data-testid` attributes (best)
2. ARIA attributes (good)
3. Element roles (good)
4. CSS classes/IDs with semantic meaning (acceptable)
5. Element structure or index-based selection (avoid)

### 2. Waiting Strategies

- **Explicit waits** (preferred):
  ```javascript
  await page.waitForSelector('.fish-card', { visible: true });
  await page.waitForFunction(() => document.querySelectorAll('.tank-item').length > 0);
  ```

- **Timeout waits** (use sparingly):
  ```javascript
  await page.waitForTimeout(1000); // Wait 1 second
  ```

### 3. Error Handling

Wrap test blocks in try/catch and provide context in errors:

```javascript
try {
  // Test code
} catch (error) {
  console.error(`Failed during fish addition: ${error.message}`);
  await page.screenshot({ path: 'error-state.png' });
  throw error;
}
```

### 4. Visual Consistency

- Force light mode for consistent screenshots:
  ```javascript
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  ```

- Use consistent viewport size:
  ```javascript
  await page.setViewport({ width: 1920, height: 1080 });
  ```

### 5. Debug Helpers

- Save screenshots at key points
- Log page content for debugging
- Save detailed element information

```javascript
// Debug helper: Save current page HTML
await page.evaluate(() => {
  console.log(document.body.innerHTML);
});

// Save all possible selectors
const possibleSelectors = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('*'))
    .map(el => ({
      tag: el.tagName.toLowerCase(),
      id: el.id,
      classes: Array.from(el.classList),
      text: el.textContent.trim().substring(0, 50)
    }));
});

// Write to a file for analysis
require('fs').writeFileSync('possible-selectors.json', JSON.stringify(possibleSelectors, null, 2));
```

## Common Challenges

### 1. Element Not Found

**Problem**: Selector doesn't match any elements

**Solutions**:
- Verify the selector using `page.$(selector)` directly
- Use more generic selectors first, then refine
- Check timing - element might not be rendered yet
- Inspect the DOM structure at runtime with a screenshot

### 2. Click Not Working

**Problem**: Element is found but click has no effect

**Solutions**:
- Check if element is actually visible and clickable
- Try `page.click(selector)` instead of element.click()
- Use `page.evaluate((el) => el.click(), element)` for JavaScript click
- Check for overlays or modals blocking the element

### 3. Dynamic Content Issues

**Problem**: Content changes asynchronously after a user action

**Solutions**:
- Wait for network requests to complete
- Wait for specific DOM changes using `waitForFunction`
- Add appropriate delay if animation is involved
- Check for React/Astro hydration status

### 4. Test Flakiness

**Problem**: Tests pass sometimes but fail others

**Solutions**:
- Use more robust selectors
- Implement retry logic for fragile operations
- Add explicit waits for state changes
- Mock unpredictable components

## Advanced Techniques

### 1. Testing Responsive Layouts

```javascript
// Test across multiple device viewports
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1920, height: 1080, name: 'desktop' }
];

for (const viewport of viewports) {
  await page.setViewport(viewport);
  console.log(`Testing at ${viewport.name} size`);
  await page.screenshot({ path: `responsive-${viewport.name}.png` });
  
  // Test responsive behavior here
}
```

### 2. Accessibility Testing

```javascript
// Perform basic accessibility audit
const axeCore = require('axe-core');
const violations = await page.evaluate(() => {
  return new Promise(resolve => {
    const axe = axeCore;
    axe.run(document, {}, (err, results) => {
      if (err) throw err;
      resolve(results.violations);
    });
  });
});

console.log(`Found ${violations.length} accessibility violations`);
violations.forEach(v => console.log(`- ${v.id}: ${v.description}`));
```

### 3. Visual Regression Testing

Use screenshots to compare visual changes:

```javascript
const fs = require('fs');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

async function compareScreenshots(path1, path2) {
  const img1 = PNG.sync.read(fs.readFileSync(path1));
  const img2 = PNG.sync.read(fs.readFileSync(path2));
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  
  const numDiffPixels = pixelmatch(
    img1.data, img2.data, diff.data, width, height, { threshold: 0.1 }
  );
  
  fs.writeFileSync('diff.png', PNG.sync.write(diff));
  return numDiffPixels;
}

// Usage:
const diffPixels = await compareScreenshots('baseline.png', 'current.png');
console.log(`Images differ by ${diffPixels} pixels`);
```

## Reference Examples

### 1. Complete Fish Addition Test

```javascript
async function testAddFish(page) {
  console.log('Testing fish addition workflow');
  
  // 1. Navigate to planner page
  await page.goto('http://localhost:4321/planner', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'initial-page.png' });
  
  // 2. Find and click Add Fish button
  const addFishButton = await page.$('button:contains("Add Fish")');
  if (!addFishButton) throw new Error('Add Fish button not found');
  
  await addFishButton.click();
  console.log('Clicked Add Fish button');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'after-add-fish-click.png' });
  
  // 3. Wait for fish selection sheet to open
  await page.waitForSelector('[role="dialog"], .sheet, .modal', { visible: true });
  console.log('Fish selection sheet opened');
  
  // 4. Find available fish options
  const fishOptions = await page.$$('.fish-card, .fish-option, [data-fish-id]');
  console.log(`Found ${fishOptions.length} fish options`);
  await page.screenshot({ path: 'fish-selection-sheet.png' });
  
  // 5. Select the first fish option with an Add button
  let fishAdded = false;
  
  for (let i = 0; i < Math.min(fishOptions.length, 5); i++) {
    const option = fishOptions[i];
    const buttons = await option.$$('button, [role="button"]');
    
    if (buttons.length > 0) {
      // Get button text
      const buttonText = await buttons[0].evaluate(el => el.textContent.trim().toLowerCase());
      
      if (buttonText.includes('add') || buttonText.includes('+')) {
        console.log(`Found Add button on fish option ${i+1}`);
        await buttons[0].click();
        console.log('Clicked Add button');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'after-clicking-add-on-fish.png' });
        
        // 6. Handle any confirmation dialog
        const confirmButtons = await page.$$('dialog button, [role="dialog"] button');
        if (confirmButtons.length > 0) {
          await confirmButtons[0].click();
          console.log('Clicked confirm button');
          await page.waitForTimeout(1500);
        }
        
        fishAdded = true;
        break;
      }
    }
  }
  
  if (!fishAdded) throw new Error('Could not find a fish card with Add button');
  
  // 7. Verify fish was added to the tank
  await page.screenshot({ path: 'after-adding-fish.png' });
  
  // Look for fish indicators in the tank
  const tankFishElements = await page.$$('.tank-item, .fish-item, [data-fish-id], [class*="fish"]');
  console.log(`Found ${tankFishElements.length} potential fish elements in tank`);
  
  // Verify by checking for fish-related content
  const fishContentFound = await page.evaluate(() => {
    return document.body.innerText.toLowerCase().includes('fish added') ||
           document.querySelector('.tank-fish, .fish-container, .fish-item') !== null;
  });
  
  return fishContentFound;
}

// Execute the test
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    const fishAdded = await testAddFish(page);
    console.log(`Fish addition test ${fishAdded ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
  } finally {
    await browser.close();
  }
})();
```

### 2. Complete Plant Addition Test

```javascript
async function testAddPlant(page) {
  console.log('Testing plant addition workflow');
  
  // 1. Navigate to planner page
  await page.goto('http://localhost:4321/planner', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'initial-page.png' });
  
  // 2. Find and click Add Plants button
  const addPlantButton = await page.$('button:contains("Add Plant"), button:contains("Add Plants")');
  if (!addPlantButton) throw new Error('Add Plant button not found');
  
  await addPlantButton.click();
  console.log('Clicked Add Plant button');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'after-add-plant-click.png' });
  
  // 3. Wait for plant selection sheet to open
  await page.waitForSelector('[role="dialog"], .sheet, .modal', { visible: true });
  console.log('Plant selection sheet opened');
  
  // 4. Find available plant options
  const plantOptions = await page.$$('.plant-card, .plant-option, [data-plant-id]');
  console.log(`Found ${plantOptions.length} plant options`);
  await page.screenshot({ path: 'plant-selection-sheet.png' });
  
  // 5. Select the first plant option with an Add button
  let plantAdded = false;
  
  for (let i = 0; i < Math.min(plantOptions.length, 5); i++) {
    const option = plantOptions[i];
    const buttons = await option.$$('button, [role="button"]');
    
    if (buttons.length > 0) {
      // Verify this is a plant-related button (not a fish button)
      const isPlantContext = await option.evaluate(el => {
        const text = el.textContent.toLowerCase();
        return text.includes('plant') || 
               !text.includes('fish') ||
               el.matches('[data-plant-id], .plant-card');
      });
      
      if (isPlantContext) {
        // Get button text
        const buttonText = await buttons[0].evaluate(el => el.textContent.trim().toLowerCase());
        
        if (buttonText.includes('add') || buttonText.includes('+')) {
          console.log(`Found Add button on plant option ${i+1}`);
          await buttons[0].click();
          console.log('Clicked Add button');
          await page.waitForTimeout(1500);
          await page.screenshot({ path: 'after-clicking-add-on-plant.png' });
          
          // 6. Handle any confirmation dialog
          const confirmButtons = await page.$$('dialog button, [role="dialog"] button');
          if (confirmButtons.length > 0) {
            await confirmButtons[0].click();
            console.log('Clicked confirm button');
            await page.waitForTimeout(1500);
          }
          
          plantAdded = true;
          break;
        }
      }
    }
  }
  
  if (!plantAdded) throw new Error('Could not find a plant card with Add button');
  
  // 7. Verify plant was added to the tank
  await page.screenshot({ path: 'after-adding-plant.png' });
  
  // Look for plant indicators in the tank
  const tankPlantElements = await page.$$('.tank-item, .plant-item, [data-plant-id], [class*="plant"]');
  console.log(`Found ${tankPlantElements.length} potential plant elements in tank`);
  
  // Verify by checking for plant-related content
  const plantContentFound = await page.evaluate(() => {
    return document.body.innerText.toLowerCase().includes('plant added') ||
           document.querySelector('.tank-plant, .plant-container, .plant-item') !== null;
  });
  
  return plantContentFound;
}

// Execute the test
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    const plantAdded = await testAddPlant(page);
    console.log(`Plant addition test ${plantAdded ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
  } finally {
    await browser.close();
  }
})();
```

### 3. Debugging Selectors Helper

This utility helps identify the best selectors to use for any element on the page:

```javascript
// Save this as selector-helper.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:4321/planner');
    console.log('Page loaded');
    
    // Set up a click handler to capture element info
    await page.exposeFunction('saveElementInfo', (info) => {
      const filePath = path.join(__dirname, 'element-info.json');
      fs.writeFileSync(filePath, JSON.stringify(info, null, 2));
      console.log(`Element info saved to ${filePath}`);
    });
    
    // Inject helper script for element inspection
    await page.evaluate(() => {
      document.addEventListener('click', (event) => {
        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();
        
        const el = event.target;
        
        // Gather info about the element
        const info = {
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          classes: Array.from(el.classList),
          attributes: {},
          textContent: el.textContent.trim().substring(0, 100),
          innerHtml: el.innerHTML.substring(0, 200),
          xpath: getXPath(el),
          possibleSelectors: generateSelectors(el)
        };
        
        // Get all attributes
        for (const attr of el.attributes) {
          info.attributes[attr.name] = attr.value;
        }
        
        // Generate highest quality selectors first
        function generateSelectors(element) {
          const selectors = [];
          
          // 1. ID-based (best)
          if (element.id) {
            selectors.push({
              quality: 'excellent',
              selector: `#${element.id}`
            });
          }
          
          // 2. Data attributes (very good)
          if (element.hasAttribute('data-testid')) {
            selectors.push({
              quality: 'very good',
              selector: `[data-testid="${element.getAttribute('data-testid')}"]`
            });
          }
          
          // 3. ARIA attributes (good)
          for (const attr of ['aria-label', 'aria-labelledby', 'role']) {
            if (element.hasAttribute(attr)) {
              selectors.push({
                quality: 'good',
                selector: `[${attr}="${element.getAttribute(attr)}"]`
              });
            }
          }
          
          // 4. Class-based (decent)
          if (element.classList.length > 0) {
            selectors.push({
              quality: 'decent',
              selector: `.${Array.from(element.classList).join('.')}`
            });
          }
          
          // 5. Text-based (decent)
          if (element.textContent.trim()) {
            const text = element.textContent.trim();
            if (text.length < 50) {
              selectors.push({
                quality: 'decent',
                selector: `${element.tagName.toLowerCase()}:contains("${text}")`
              });
            }
          }
          
          // 6. Attribute-based (okay)
          for (const attr of ['type', 'name', 'value', 'placeholder', 'href', 'src']) {
            if (element.hasAttribute(attr)) {
              selectors.push({
                quality: 'okay',
                selector: `[${attr}="${element.getAttribute(attr)}"]`
              });
            }
          }
          
          // 7. Hierarchy-based (last resort)
          selectors.push({
            quality: 'last resort',
            selector: getCSSPath(element)
          });
          
          return selectors;
        }
        
        // Helper to generate full XPath
        function getXPath(element) {
          if (!element) return '';
          if (element.tagName === 'HTML') return '/HTML';
          
          let ix = 0;
          const siblings = element.parentNode.childNodes;
          
          for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
          }
        }
        
        // Helper to generate CSS path
        function getCSSPath(element) {
          if (!element) return '';
          if (element.tagName === 'HTML') return 'html';
          
          let current = element;
          let path = [];
          
          while (current && current.tagName !== 'HTML') {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
              selector += `#${current.id}`;
              path.unshift(selector);
              break;
            } else if (current.classList.length > 0) {
              selector += `.${Array.from(current.classList).join('.')}`;
            }
            
            // Add nth-child for more specificity
            let position = 1;
            let sibling = current.previousElementSibling;
            
            while (sibling) {
              if (sibling.tagName === current.tagName) position++;
              sibling = sibling.previousElementSibling;
            }
            
            if (position > 1) {
              selector += `:nth-child(${position})`;
            }
            
            path.unshift(selector);
            current = current.parentElement;
          }
          
          return path.join(' > ');
        }
        
        // Highlight the element temporarily
        const originalOutline = el.style.outline;
        const originalBackground = el.style.backgroundColor;
        el.style.outline = '3px solid red';
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        
        // Send the info back to Node.js
        window.saveElementInfo(info);
        
        // Reset styling after a short delay
        setTimeout(() => {
          el.style.outline = originalOutline;
          el.style.backgroundColor = originalBackground;
        }, 2000);
      }, true);
      
      console.log('Click on any element to get selector information...');
    });
    
    // Keep the browser open for manual inspection
    console.log('Click on elements to analyze them. Press Ctrl+C to exit.');
    await new Promise(r => setTimeout(r, 300000)); // Keep alive for 5 minutes
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
```

## Conclusion

End-to-end testing is crucial for ensuring that Tankd Planner works as expected from a user's perspective. By following the practices in this guide, you can create reliable, maintainable E2E tests that catch issues before they reach production.

Remember that E2E tests should be:
- Focused on user flows
- Resilient to minor UI changes
- Descriptive when they fail
- Maintainable and readable

For additional help, refer to:
- [Puppeteer Documentation](https://pptr.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Jest-Puppeteer Documentation](https://github.com/smooth-code/jest-puppeteer)
