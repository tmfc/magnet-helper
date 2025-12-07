/**
 * Options Page Script - Magnet Helper Extension
 * 
 * This script handles the options page functionality:
 * - Form validation and submission
 * - Connection testing with qBittorrent
 * - Password visibility toggle
 * - Real-time status indicators
 * - Keyboard shortcuts and accessibility
 */

// options.js

// DOM element references
const form = document.getElementById('options-form');
const clientTypeSelect = document.getElementById('client-type');
const serverUrlInput = document.getElementById('server-url');
const serverUserInput = document.getElementById('server-user');
const serverPasswordInput = document.getElementById('server-password');
const urlError = document.getElementById('url-error');
const userError = document.getElementById('user-error');
const passwordError = document.getElementById('password-error');
const clientError = document.getElementById('client-error');
const saveMessage = document.getElementById('save-message');
const testConnectionBtn = document.getElementById('test-connection');
const showPasswordCheckbox = document.getElementById('show-password');

// Status indicator elements
const urlStatus = document.getElementById('url-status');
const userStatus = document.getElementById('user-status');
const passwordStatus = document.getElementById('password-status');
const clientStatus = document.getElementById('client-status');

// Client-specific labels
const serverLabel = document.getElementById('server-label');
const serverLabel2 = document.getElementById('server-label-2');
const serverLabel3 = document.getElementById('server-label-3');
const serverLabel4 = document.getElementById('server-label-4');
const serverHelpText = document.getElementById('server-help-text');
const serverHelpText2 = document.getElementById('server-help-text-2');
const serverHelpText3 = document.getElementById('server-help-text-3');
const usernameField = document.getElementById('username-field');
const passwordField = document.getElementById('password-field');

// Client configuration
const clientConfigs = {
  qbittorrent: {
    name: 'qBittorrent',
    defaultPort: 8080,
    defaultUser: 'admin',
    needsAuth: true,
    apiPath: '/api/v2',
    addPath: '/torrents/add',
    loginPath: '/auth/login',
    versionPath: '/app/version',
    placeholder: 'http://localhost:8080'
  },
  transmission: {
    name: 'Transmission',
    defaultPort: 9091,
    defaultUser: 'transmission',
    needsAuth: true,
    apiPath: '/transmission/rpc',
    addPath: '',
    loginPath: '',
    versionPath: '',
    placeholder: 'http://localhost:9091/transmission/rpc'
  },
  utorrent: {
    name: 'uTorrent',
    defaultPort: 8080,
    defaultUser: 'admin',
    needsAuth: true,
    apiPath: '/gui',
    addPath: '/',
    loginPath: '/token.html',
    versionPath: '/version.js',
    placeholder: 'http://localhost:8080/gui'
  }
};

// Update status indicators
function updateStatusIndicators() {
  // Client type status
  if (clientTypeSelect.value) {
    clientStatus.className = 'status-indicator status-good';
  } else {
    clientStatus.className = 'status-indicator status-bad';
  }
  
  // URL status
  if (serverUrlInput.value.trim() && isValidUrl(serverUrlInput.value)) {
    urlStatus.className = 'status-indicator status-good';
  } else {
    urlStatus.className = 'status-indicator status-bad';
  }
  
  // User status
  if (serverUserInput.value.trim()) {
    userStatus.className = 'status-indicator status-good';
  } else {
    userStatus.className = 'status-indicator status-bad';
  }
  
  // Password status
  if (serverPasswordInput.value.trim()) {
    passwordStatus.className = 'status-indicator status-good';
  } else {
    passwordStatus.className = 'status-indicator status-bad';
  }
}

// Update UI based on selected client type
function updateClientUI(clientType) {
  const config = clientConfigs[clientType];
  
  // Update labels and help text
  serverLabel.textContent = config.name;
  serverLabel2.textContent = config.name;
  serverLabel3.textContent = config.name;
  serverLabel4.textContent = config.name;
  serverHelpText.textContent = config.name + ' Web UI';
  serverHelpText2.textContent = config.name;
  serverHelpText3.textContent = config.name;
  
  // Update placeholder
  serverUrlInput.placeholder = config.placeholder;
  
  // Show/hide auth fields based on client needs
  if (config.needsAuth) {
    usernameField.style.display = 'block';
    passwordField.style.display = 'block';
    serverUserInput.required = true;
    serverPasswordInput.required = true;
  } else {
    usernameField.style.display = 'none';
    passwordField.style.display = 'none';
    serverUserInput.required = false;
    serverPasswordInput.required = false;
  }
  
  // Update default username
  if (config.defaultUser && !serverUserInput.value) {
    serverUserInput.value = config.defaultUser;
  }
  
  // Update status indicators
  updateStatusIndicators();
}

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Validates all form fields and updates error messages
 * @returns {boolean} - Whether the form is valid
 */
function validateForm() {
  let isValid = true;
  const config = clientConfigs[clientTypeSelect.value];
  
  // Reset error messages
  urlError.textContent = '';
  userError.textContent = '';
  passwordError.textContent = '';
  clientError.textContent = '';
  
  // Validate client type
  if (!clientTypeSelect.value) {
    clientError.textContent = '请选择下载客户端类型';
    isValid = false;
  }
  
  // Validate URL
  if (!serverUrlInput.value.trim()) {
    urlError.textContent = `${config.name} URL 是必填项`;
    isValid = false;
  } else if (!isValidUrl(serverUrlInput.value)) {
    urlError.textContent = '请输入有效的 URL（如：http://localhost:8080）';
    isValid = false;
  }
  
  // Validate username only if client needs auth
  if (config.needsAuth) {
    if (!serverUserInput.value.trim()) {
      userError.textContent = '用户名是必填项';
      isValid = false;
    }
    
    // Validate password only if client needs auth
    if (!serverPasswordInput.value.trim()) {
      passwordError.textContent = '密码是必填项';
      isValid = false;
    }
  }
  
  return isValid;
}

/**
 * Shows a save message with appropriate styling
 * @param {string} message - The message to display
 * @param {boolean} isSuccess - Whether this is a success message
 */
function showSaveMessage(message, isSuccess) {
  saveMessage.textContent = message;
  saveMessage.className = 'save-message ' + (isSuccess ? 'success' : 'error');
  saveMessage.style.display = 'block';
  
  // Auto-hide message after 3 seconds
  setTimeout(() => {
    saveMessage.style.display = 'none';
  }, 3000);
}

/**
 * Tests connection to selected torrent client with current settings
 * Validates credentials and retrieves version information
 */
async function testConnection() {
  if (!validateForm()) {
    showSaveMessage('请先正确填写所有必填字段', false);
    return;
  }

  const clientType = clientTypeSelect.value;
  const config = clientConfigs[clientType];
  const serverUrl = serverUrlInput.value;
  const serverUser = serverUserInput.value;
  const serverPassword = serverPasswordInput.value;

  // Disable button during test to prevent multiple requests
  testConnectionBtn.disabled = true;
  testConnectionBtn.textContent = '测试中...';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    let version = '';

    if (clientType === 'qbittorrent') {
      // qBittorrent authentication
      response = await fetch(`${serverUrl}${config.apiPath}${config.loginPath}`, {
        method: 'POST',
        body: new URLSearchParams({
          username: serverUser,
          password: serverPassword
        }),
        signal: controller.signal
      });

      if (response.ok) {
        // Get version info
        const versionResponse = await fetch(`${serverUrl}${config.apiPath}${config.versionPath}`, {
          signal: controller.signal
        });
        
        if (versionResponse.ok) {
          version = await versionResponse.text();
        }
      }
    } else if (clientType === 'transmission') {
      // Transmission RPC
      response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'session-get',
          arguments: {}
        }),
        signal: controller.signal
      });

      if (response.ok) {
        const data = await response.json();
        version = data.result?.version || '';
      }
    } else if (clientType === 'utorrent') {
      // uTorrent authentication
      const tokenResponse = await fetch(`${serverUrl}${config.loginPath}`, {
        signal: controller.signal
      });

      if (tokenResponse.ok) {
        const tokenText = await tokenResponse.text();
        const tokenMatch = tokenText.match(/<div[^>]*>([^<]+)<\/div>/);
        const token = tokenMatch ? tokenMatch[1] : '';
        
        // Use token to get version
        const versionResponse = await fetch(`${serverUrl}${config.versionPath}`, {
          headers: {
            'Authorization': 'Basic ' + btoa(`${serverUser}:${serverPassword}`)
          },
          signal: controller.signal
        });
        
        if (versionResponse.ok) {
          const versionText = await versionResponse.text();
          const versionMatch = versionText.match(/version\s*=\s*['"]([^'"]+)['"]/);
          version = versionMatch ? versionMatch[1] : '';
        }
      }
    }

    clearTimeout(timeoutId);

    if (response && response.ok) {
      if (version) {
        showSaveMessage(`连接成功！${config.name} 版本: ${version}`, true);
      } else {
        showSaveMessage(`连接成功！${config.name} 服务器响应正常`, true);
      }
    } else {
      let errorMessage = '连接失败';
      switch(response?.status) {
        case 401:
          errorMessage = '认证失败：用户名或密码错误';
          break;
        case 403:
          errorMessage = '访问被拒绝：请检查权限设置';
          break;
        case 404:
          errorMessage = 'API 不存在：请检查客户端版本和 URL';
          break;
        case 409:
          errorMessage = '冲突：请检查客户端配置';
          break;
        default:
          errorMessage = `连接失败 (HTTP ${response?.status || '未知'})`;
      }
      showSaveMessage(errorMessage, false);
    }
  } catch (error) {
    let errorMessage = '连接失败';
    if (error.name === 'AbortError') {
      errorMessage = '连接超时：请检查网络连接和服务器状态';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = '网络错误：无法连接到服务器';
    } else {
      errorMessage = `连接失败：${error.message}`;
    }
    showSaveMessage(errorMessage, false);
  } finally {
    // Re-enable button
    testConnectionBtn.disabled = false;
    testConnectionBtn.textContent = '测试连接';
  }
}

// Load saved settings
chrome.storage.sync.get(['clientType', 'serverUrl', 'serverUser', 'serverPassword'], (settings) => {
  if (settings.clientType) {
    clientTypeSelect.value = settings.clientType;
    updateClientUI(settings.clientType);
  }
  
  if (settings.serverUrl) {
    serverUrlInput.value = settings.serverUrl;
  }
  if (settings.serverUser) {
    serverUserInput.value = settings.serverUser;
  }
  if (settings.serverPassword) {
    // For security, show placeholder instead of actual password
    serverPasswordInput.value = '••••••••';
    serverPasswordInput.setAttribute('data-password-set', 'true');
  }
  
  // Update status indicators after loading settings
  updateStatusIndicators();
  
  // Set focus management after loading settings
  setTimeout(setFocusManagement, 100);
});

// Client type change handler
clientTypeSelect.addEventListener('change', () => {
  updateClientUI(clientTypeSelect.value);
  updateStatusIndicators();
});

// Show/hide password functionality
showPasswordCheckbox.addEventListener('change', () => {
  if (showPasswordCheckbox.checked) {
    serverPasswordInput.type = 'text';
  } else {
    serverPasswordInput.type = 'password';
  }
});

// Real-time validation
clientTypeSelect.addEventListener('input', () => {
  if (!clientTypeSelect.value) {
    clientError.textContent = '请选择下载客户端类型';
  } else {
    clientError.textContent = '';
  }
  updateStatusIndicators();
});

serverUrlInput.addEventListener('input', () => {
  if (serverUrlInput.value.trim() && !isValidUrl(serverUrlInput.value)) {
    urlError.textContent = '请输入有效的 URL（如：http://localhost:8080）';
  } else {
    urlError.textContent = '';
  }
  updateStatusIndicators();
});

serverUserInput.addEventListener('input', () => {
  if (!serverUserInput.value.trim()) {
    userError.textContent = '用户名是必填项';
  } else {
    userError.textContent = '';
  }
  updateStatusIndicators();
});

serverPasswordInput.addEventListener('input', () => {
  if (!serverPasswordInput.value.trim()) {
    passwordError.textContent = '密码是必填项';
  } else {
    passwordError.textContent = '';
  }
  updateStatusIndicators();
});

// Test connection button event
testConnectionBtn.addEventListener('click', testConnection);

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter or Cmd+Enter: Save form
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
  
  // Alt+T: Test connection
  if (e.altKey && e.key === 't') {
    e.preventDefault();
    testConnection();
  }
  
  // Escape: Close options page
  if (e.key === 'Escape') {
    window.close();
  }
});

// Focus management for better keyboard navigation
function setFocusManagement() {
  // Set initial focus to first input field
  if (clientTypeSelect && !clientTypeSelect.value) {
    clientTypeSelect.focus();
  } else if (serverUrlInput && !serverUrlInput.value) {
    serverUrlInput.focus();
  } else if (serverUserInput && !serverUserInput.value) {
    serverUserInput.focus();
  } else if (serverPasswordInput) {
    serverPasswordInput.focus();
  }
}

// Password field focus handler to clear placeholder
serverPasswordInput.addEventListener('focus', () => {
  if (serverPasswordInput.getAttribute('data-password-set') === 'true' && 
      serverPasswordInput.value === '••••••••') {
    serverPasswordInput.value = '';
    serverPasswordInput.removeAttribute('data-password-set');
  }
});

// Password field blur handler to restore placeholder if empty
serverPasswordInput.addEventListener('blur', () => {
  if (serverPasswordInput.value === '') {
    chrome.storage.sync.get(['serverPassword'], (settings) => {
      if (settings.serverPassword) {
        serverPasswordInput.value = '••••••••';
        serverPasswordInput.setAttribute('data-password-set', 'true');
      }
    });
  }
});

// Save settings
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  const clientType = clientTypeSelect.value;
  const serverUrl = serverUrlInput.value;
  const serverUser = serverUserInput.value;
  let serverPassword = serverPasswordInput.value;
  
  // If password field shows placeholder, don't overwrite the stored password
  if (serverPasswordInput.getAttribute('data-password-set') === 'true' && 
      serverPassword === '••••••••') {
    chrome.storage.sync.get(['serverPassword'], (settings) => {
      serverPassword = settings.serverPassword || '';
      
      chrome.storage.sync.set({
        clientType,
        serverUrl,
        serverUser,
        serverPassword
      }, () => {
        showSaveMessage('设置已保存成功！', true);
      });
    });
  } else {
    chrome.storage.sync.set({
      clientType,
      serverUrl,
      serverUser,
      serverPassword
    }, () => {
      showSaveMessage('设置已保存成功！', true);
    });
  }
});
