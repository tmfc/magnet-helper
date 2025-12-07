/**
 * Popup Script - Magnet Helper Extension
 * 
 * This script handles the popup window functionality:
 * - Display connection status and server information
 * - Manage download history
 * - Handle extension enable/disable toggle
 * - Keyboard shortcuts and accessibility
 */

/**
 * Updates the connection status display based on current settings
 * Shows server URL and configuration status with appropriate styling
 */
function updateStatus() {
  chrome.storage.sync.get(['clientType', 'serverUrl', 'serverUser'], (settings) => {
    const statusElement = document.getElementById('connection-status');
    const serverUrlElement = document.getElementById('server-url');
    
    if (settings.serverUrl) {
      try {
        const url = new URL(settings.serverUrl);
        const clientName = getClientName(settings.clientType);
        serverUrlElement.textContent = `${clientName} - ${url.protocol}//${url.host}`;
        
        if (settings.serverUser) {
          statusElement.textContent = '已配置';
          statusElement.className = 'status-value status-connected';
        } else {
          statusElement.textContent = '配置不完整';
          statusElement.className = 'status-value status-disconnected';
        }
      } catch (e) {
        serverUrlElement.textContent = 'URL 格式错误';
        statusElement.textContent = '配置错误';
        statusElement.className = 'status-value status-disconnected';
      }
    } else {
      serverUrlElement.textContent = '-';
      statusElement.textContent = '未配置';
      statusElement.className = 'status-value status-disconnected';
    }
  });
}

/**
 * Gets the display name for a client type
 * @param {string} clientType - The client type identifier
 * @returns {string} - The display name of the client
 */
function getClientName(clientType) {
  const clientNames = {
    qbittorrent: 'qBittorrent',
    transmission: 'Transmission',
    utorrent: 'uTorrent'
  };
  
  return clientNames[clientType] || '未知客户端';
}

/**
 * Loads and displays the download history
 * Shows up to 5 most recent downloads with timestamps
 */
function loadHistory() {
  chrome.storage.sync.get(['downloadHistory'], (result) => {
    const historyList = document.getElementById('history-list');
    const history = result.downloadHistory || [];
    
    if (history.length === 0) {
      historyList.innerHTML = '<div class="no-history">暂无下载记录</div>';
    } else {
      historyList.innerHTML = '';
      history.slice(0, 5).forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const nameSpan = document.createElement('div');
        nameSpan.className = 'history-name';
        nameSpan.textContent = item.name || '未知文件';
        nameSpan.title = item.name || '未知文件';
        
        const timeSpan = document.createElement('div');
        timeSpan.className = 'history-time';
        timeSpan.textContent = formatTime(item.timestamp);
        
        historyItem.appendChild(nameSpan);
        historyItem.appendChild(timeSpan);
        historyList.appendChild(historyItem);
      });
    }
  });
}

/**
 * Formats a timestamp into a human-readable relative time
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Formatted time string
 */
function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

/**
 * Updates the extension toggle button state and appearance
 * Shows current enabled/disabled status with appropriate styling
 */
function updateToggleState() {
  chrome.storage.sync.get(['extensionEnabled'], (result) => {
    const toggleBtn = document.getElementById('toggle-extension');
    const isEnabled = result.extensionEnabled !== false; // Default to enabled
    
    if (isEnabled) {
      toggleBtn.textContent = '已启用';
      toggleBtn.className = 'button toggle-btn enabled';
      toggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      toggleBtn.textContent = '已禁用';
      toggleBtn.className = 'button toggle-btn';
      toggleBtn.setAttribute('aria-pressed', 'false');
    }
  });
}

// Options button click handler
document.getElementById('options-button').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Clear history button
document.getElementById('clear-history').addEventListener('click', () => {
  chrome.storage.sync.set({ downloadHistory: [] }, () => {
    loadHistory();
  });
});

// Toggle extension button
document.getElementById('toggle-extension').addEventListener('click', () => {
  chrome.storage.sync.get(['extensionEnabled'], (result) => {
    const currentState = result.extensionEnabled !== false; // Default to enabled
    const newState = !currentState;
    
    chrome.storage.sync.set({ extensionEnabled: newState }, () => {
      updateToggleState();
    });
  });
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  // Alt+O: Open options
  if (e.altKey && e.key === 'o') {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  }
  
  // Alt+T: Toggle extension
  if (e.altKey && e.key === 't') {
    e.preventDefault();
    document.getElementById('toggle-extension').click();
  }
  
  // Alt+C: Clear history
  if (e.altKey && e.key === 'c') {
    e.preventDefault();
    document.getElementById('clear-history').click();
  }
  
  // Escape: Close popup
  if (e.key === 'Escape') {
    window.close();
  }
});

// Focus management for better keyboard navigation
function setFocusManagement() {
  const focusableElements = [
    document.getElementById('clear-history'),
    document.getElementById('options-button'),
    document.getElementById('toggle-extension')
  ].filter(element => element && !element.disabled);
  
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

// Initialize everything when popup opens
document.addEventListener('DOMContentLoaded', () => {
  updateStatus();
  loadHistory();
  updateToggleState();
  setFocusManagement();
});
