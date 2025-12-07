/**
 * Content Script - Magnet Helper Extension
 * 
 * This script is injected into web pages and:
 * - Detects magnet links in <a> tags and plain text
 * - Adds download buttons next to magnet links
 * - Handles dynamic content with MutationObserver
 * - Supports keyboard navigation and accessibility
 */

/**
 * Creates a download button for a magnet link
 * @param {string} magnetUrl - The magnet URL to create a button for
 * @returns {HTMLButtonElement} - The created button element
 */
function createDownloadButton(magnetUrl) {
  const button = document.createElement('button');
  button.textContent = '↓ qBittorrent';
  button.className = 'magnet-helper-download-btn';
  button.setAttribute('aria-label', '将磁力链接发送到 qBittorrent');
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  button.style.marginLeft = '5px';
  button.style.padding = '2px 6px';
  button.style.fontSize = '12px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '3px';
  button.style.cursor = 'pointer';
  button.style.verticalAlign = 'middle';
  
  // Click handler with loading state
  button.addEventListener('click', () => {
    button.disabled = true;
    button.textContent = '发送中...';
    button.setAttribute('aria-label', '正在发送磁力链接到 qBittorrent...');
    chrome.runtime.sendMessage({ type: 'download', url: magnetUrl }, (response) => {
      // Re-enable button after a delay to prevent double-clicks
      setTimeout(() => {
        button.disabled = false;
        button.textContent = '↓ qBittorrent';
        button.setAttribute('aria-label', '将磁力链接发送到 qBittorrent');
      }, 2000);
    });
  });
  
  // Keyboard support for accessibility
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });
  
  return button;
}

/**
 * Checks if the extension is currently enabled
 * @param {function(boolean): void} callback - Callback with enabled status
 */
function isExtensionEnabled(callback) {
  chrome.storage.sync.get(['extensionEnabled'], (result) => {
    callback(result.extensionEnabled !== false); // Default to enabled
  });
}

/**
 * Checks if a download button already exists for the given magnet URL
 * @param {string} magnetUrl - The magnet URL to check
 * @param {Node} parentNode - The parent node to search in
 * @returns {boolean} - Whether a button already exists
 */
function buttonExists(magnetUrl, parentNode) {
  const existingButtons = parentNode.querySelectorAll('.magnet-helper-download-btn');
  return Array.from(existingButtons).some(btn => {
    // Check if this button is for the same magnet URL
    return btn.getAttribute('data-magnet-url') === magnetUrl;
  });
}

// 1. Handle existing magnet links in <a> tags
isExtensionEnabled((enabled) => {
  if (!enabled) return;
  
  const magnetLinks = document.querySelectorAll('a[href^="magnet:"]');
  magnetLinks.forEach(link => {
    // Check if button already exists
    if (!buttonExists(link.href, link.parentNode)) {
      const button = createDownloadButton(link.href);
      button.setAttribute('data-magnet-url', link.href);
      link.parentNode.insertBefore(button, link.nextSibling);
    }
  });
});

// 2. Handle magnet links in plain text
// Improved magnet link regex that matches more accurately
const magnetRegex = /(magnet:\?xt=urn:btih:[a-fA-F0-9]{40}(?:&[a-zA-Z0-9]+=[^&\s]*)*)|(magnet:\?xt=urn:btmh:[a-fA-F0-9]{64}(?:&[a-zA-Z0-9]+=[^&\s]*)*)|(magnet:\?xt=urn:sha1:[a-fA-F0-9]{40}(?:&[a-zA-Z0-9]+=[^&\s]*)*)/gi;
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
let node;
const nodesToProcess = [];

// First, collect all text nodes to avoid issues with a live NodeList
while(node = walker.nextNode()) {
  nodesToProcess.push(node);
}

isExtensionEnabled((enabled) => {
  if (!enabled) return;
  
  nodesToProcess.forEach(textNode => {
    if (textNode.nodeValue.match(magnetRegex)) {
      const parent = textNode.parentNode;
      // Don't process nodes that are children of <a>, <script>, <style>, <input>, <textarea> tags
      if (['A', 'SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'NOSCRIPT'].includes(parent.nodeName)) {
          return;
      }
      
      const fragments = textNode.nodeValue.split(magnetRegex);
      if (fragments.length > 1) {
        const newContent = document.createDocumentFragment();
        for (let i = 0; i < fragments.length; i++) {
          const textPart = fragments[i];
          if (i % 2 === 1) { // This is a magnet link
            const span = document.createElement('span');
            span.textContent = textPart;
            span.style.backgroundColor = '#f0f0f0';
            span.style.padding = '1px 3px';
            span.style.borderRadius = '2px';
            newContent.appendChild(span);
            
            // Check if button already exists for this magnet URL
            if (!buttonExists(textPart, parent)) {
              const button = createDownloadButton(textPart);
              button.setAttribute('data-magnet-url', textPart);
              newContent.appendChild(button);
            }
          } else if (textPart) { // This is regular text
            newContent.appendChild(document.createTextNode(textPart));
          }
        }
        parent.replaceChild(newContent, textNode);
      }
    }
  });
});

// Function to process a specific node for magnet links
function processNode(node) {
  isExtensionEnabled((enabled) => {
    if (!enabled) return;
    
    // Process <a> tags with magnet links
    if (node.nodeName === 'A' && node.href && node.href.startsWith('magnet:')) {
      if (!buttonExists(node.href, node.parentNode)) {
        const button = createDownloadButton(node.href);
        button.setAttribute('data-magnet-url', node.href);
        node.parentNode.insertBefore(button, node.nextSibling);
      }
    }
    
    // Process text nodes for magnet links
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue.match(magnetRegex)) {
        const parent = node.parentNode;
        // Don't process nodes that are children of certain tags
        if (['A', 'SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'NOSCRIPT'].includes(parent.nodeName)) {
            return;
        }
        
        const fragments = node.nodeValue.split(magnetRegex);
        if (fragments.length > 1) {
          const newContent = document.createDocumentFragment();
          for (let i = 0; i < fragments.length; i++) {
            const textPart = fragments[i];
            if (i % 2 === 1) { // This is a magnet link
              const span = document.createElement('span');
              span.textContent = textPart;
              span.style.backgroundColor = '#f0f0f0';
              span.style.padding = '1px 3px';
              span.style.borderRadius = '2px';
              newContent.appendChild(span);
              
              // Check if button already exists for this magnet URL
              if (!buttonExists(textPart, parent)) {
                const button = createDownloadButton(textPart);
                button.setAttribute('data-magnet-url', textPart);
                newContent.appendChild(button);
              }
            } else if (textPart) { // This is regular text
              newContent.appendChild(document.createTextNode(textPart));
            }
          }
          parent.replaceChild(newContent, node);
        }
      }
    }
    
    // Process child nodes
    if (node.childNodes) {
      node.childNodes.forEach(child => processNode(child));
    }
  });
}

// Set up MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        // Only process element nodes and text nodes
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
          processNode(node);
        }
      });
    }
  });
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for extension enable/disable changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.extensionEnabled) {
    // If extension was toggled, update existing buttons
    const buttons = document.querySelectorAll('.magnet-helper-download-btn');
    buttons.forEach(button => {
      button.style.display = changes.extensionEnabled.newValue !== false ? 'inline-block' : 'none';
    });
  }
});
