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
    const requestId = Date.now().toString() + '-' + Math.random().toString(36).slice(2);
    button.setAttribute('data-request-id', requestId);
    button.disabled = true;
    button.textContent = '发送中...';
    button.setAttribute('aria-label', '正在发送磁力链接到 qBittorrent...');
    chrome.runtime.sendMessage({ type: 'download', url: magnetUrl, requestId });
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

// Listen for download result messages from background to update button state
chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== 'downloadResult' || !message.requestId) return;
  const selector = `.magnet-helper-download-btn[data-request-id="${message.requestId}"]`;
  const button = document.querySelector(selector);
  if (!button) return;

  button.disabled = false;
  if (message.success) {
    button.textContent = '✅ qBittorrent';
    button.setAttribute('aria-label', '已发送到 qBittorrent');
  } else {
    button.textContent = '↓ qBittorrent';
    button.setAttribute('aria-label', '发送失败，点击重试');
  }
});

/**
 * Checks if the extension is currently enabled
 * @param {function(boolean): void} callback - Callback with enabled status
 */
// Cache extensionEnabled in-memory to avoid frequent storage reads
let _extensionEnabledCache = true;
function isExtensionEnabled(callback) {
  if (typeof callback !== 'function') return;

  // If extension context is invalidated (e.g. extension reloaded),
  // chrome.runtime or chrome.storage may be undefined.
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.storage || !chrome.storage.sync) {
    // Fallback to cached value and avoid throwing.
    callback(_extensionEnabledCache);
    return;
  }

  try {
    chrome.storage.sync.get(['extensionEnabled'], (result) => {
      // When context is being torn down, callback might not fire; guard defensively.
      if (!result) {
        callback(_extensionEnabledCache);
        return;
      }
      _extensionEnabledCache = result.extensionEnabled !== false;
      callback(_extensionEnabledCache);
    });
  } catch (e) {
    // Swallow errors caused by context invalidation and use cached value instead.
    callback(_extensionEnabledCache);
  }
}

// Update cache when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.extensionEnabled) {
    _extensionEnabledCache = changes.extensionEnabled.newValue !== false;
  }
});

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
    // In code blocks like .blockcode we rely on the plain-text handler
    // to avoid duplicate buttons next to the same visual magnet line.
    if (link.closest('.blockcode')) {
      return;
    }
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

// Helper: determine whether a text node should be skipped (code blocks, preformatted, etc.)
function shouldSkipTextNode(textNode) {
  if (!textNode || !textNode.parentNode) return false;
  const parentElement = textNode.parentElement;
  if (!parentElement) return false;

  // Skip common code / preformatted / quoted containers
  // NOTE: .blockcode is intentionally NOT skipped so that forum code blocks with magnet links can be processed.
  if (parentElement.closest('pre, code, kbd, samp, textarea, .code, .syntaxhighlighter, .highlight, .prettyprint')) {
    return true;
  }

  // Also skip if already inside our own button/span wrappers
  if (parentElement.closest('.magnet-helper-download-btn, .magnet-helper-text-wrapper')) {
    return true;
  }

  return false;
}

const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
let node;
const nodesToProcess = [];

// First, collect all text nodes to avoid issues with a live NodeList
while ((node = walker.nextNode())) {
  nodesToProcess.push(node);
}

isExtensionEnabled((enabled) => {
  if (!enabled) return;
  
  nodesToProcess.forEach(textNode => {
    if (!textNode.nodeValue || !textNode.nodeValue.match(magnetRegex)) {
      return;
    }

    const parent = textNode.parentNode;
    if (!parent) return;

    // Don't process nodes that are children of <a>, <script>, <style>, <input>, <textarea> tags
    if (['A', 'SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'NOSCRIPT'].includes(parent.nodeName)) {
      return;
    }

    // Skip code / preformatted containers (forums' code blocks, etc.)
    if (shouldSkipTextNode(textNode)) {
      return;
    }

    const fragments = textNode.nodeValue.split(magnetRegex);
    if (fragments.length > 1) {
      const newContent = document.createDocumentFragment();
      for (let i = 0; i < fragments.length; i++) {
        const textPart = fragments[i];
        // Because magnetRegex uses capturing groups, split() will include
        // undefined entries; only treat as magnet when index is odd AND
        // textPart is a non-empty string.
        if (i % 2 === 1 && textPart) { // This is a magnet link
          const span = document.createElement('span');
          span.className = 'magnet-helper-text-wrapper';
          span.textContent = textPart;
          span.style.backgroundColor = '#f0f0f0';
          span.style.padding = '1px 3px';
          span.style.borderRadius = '2px';
          newContent.appendChild(span);
          
          // Use the closest .blockcode as a container if present to avoid duplicates within a code block
          const container = parent.closest('.blockcode') || parent;
          // Check if button already exists for this magnet URL
          if (!buttonExists(textPart, container)) {
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
      if (!node.nodeValue || !node.nodeValue.match(magnetRegex)) {
        // Still need to walk children below
      } else {
        const parent = node.parentNode;
        if (!parent) return;

        // Don't process nodes that are children of certain tags
        if (['A', 'SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'NOSCRIPT'].includes(parent.nodeName)) {
          return;
        }

        // Skip code / preformatted containers (forums' code blocks, etc.)
        if (shouldSkipTextNode(node)) {
          return;
        }

        const fragments = node.nodeValue.split(magnetRegex);
        if (fragments.length > 1) {
          const newContent = document.createDocumentFragment();
          for (let i = 0; i < fragments.length; i++) {
            const textPart = fragments[i];
            // Because magnetRegex uses capturing groups, split() will include
            // undefined entries; only treat as magnet when index is odd AND
            // textPart is a non-empty string.
            if (i % 2 === 1 && textPart) { // This is a magnet link
              const span = document.createElement('span');
              span.className = 'magnet-helper-text-wrapper';
              span.textContent = textPart;
              span.style.backgroundColor = '#f0f0f0';
              span.style.padding = '1px 3px';
              span.style.borderRadius = '2px';
              newContent.appendChild(span);
              
              // Use the closest .blockcode as a container if present to avoid duplicates within a code block
              const container = parent.closest('.blockcode') || parent;
              // Check if button already exists for this magnet URL
              if (!buttonExists(textPart, container)) {
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
