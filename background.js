/**
 * Background Script - Magnet Helper Extension
 * 
 * This script runs as a service worker and handles:
 * - Processing magnet link download requests from content scripts
 * - Communicating with qBittorrent Web API
 * - Managing download history
 * - Showing notifications to users
 */

// background.js

// Constants for better maintainability
const NOTIFICATION_TIMEOUT = 3000;
const REQUEST_TIMEOUT = 10000;
const MAX_HISTORY_ITEMS = 20;

// Error logging levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Enhanced error logging with context and timestamps
 * @param {string} level - Log level (error, warn, info, debug)
 * @param {string} message - Log message
 * @param {Object} context - Additional context information
 */
function log(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    context
  };
  
  console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, context);
  
  // Store error logs for debugging (optional)
  if (level === LOG_LEVELS.ERROR) {
    chrome.storage.local.get(['errorLogs'], (result) => {
      const logs = result.errorLogs || [];
      logs.unshift(logEntry);
      // Keep only last 50 error logs
      const trimmedLogs = logs.slice(0, 50);
      chrome.storage.local.set({ errorLogs: trimmedLogs });
    });
  }
}

/**
 * Shows a desktop notification to the user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {boolean} [isError=false] - Whether this is an error notification
 */
function showNotification(title, message, isError = false) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: title,
    message: message,
    priority: isError ? 2 : 0
  });
}

/**
 * Sanitizes sensitive data for logging to prevent exposing sensitive information
 * @param {string} data - The data to sanitize
 * @returns {string} - Sanitized data safe for logging
 */
function sanitizeForLogging(data) {
  if (typeof data === 'string' && data.length > 100) {
    return data.substring(0, 50) + '...[TRUNCATED]';
  }
  return data;
}

/**
 * Adds a successful download to the download history
 * Privacy: Only stores a hash of the magnet URL, not the full URL
 * @param {string} magnetUrl - The magnet URL that was downloaded
 * @param {boolean} success - Whether the download was successful
 */
function addToHistory(magnetUrl, success) {
  if (!success) return;
  
  chrome.storage.sync.get(['downloadHistory'], (result) => {
    let history = result.downloadHistory || [];
    
    // Extract name from magnet URL if possible
    let name = '未知文件';
    try {
      const url = new URL(magnetUrl);
      const params = new URLSearchParams(url.search);
      name = params.get('dn') || '未知文件';
      // Decode URI component and limit length
      name = decodeURIComponent(name);
      if (name.length > 30) {
        name = name.substring(0, 27) + '...';
      }
    } catch (e) {
      // Keep default name if parsing fails
    }
    
    // Add new item to history (without storing the full magnet URL for privacy)
    history.unshift({
      name: name,
      urlHash: btoa(magnetUrl).substring(0, 16) + '...', // Store only a hash identifier
      timestamp: Date.now()
    });
    
    // Keep only last 20 items
    history = history.slice(0, 20);
    
    chrome.storage.sync.set({ downloadHistory: history });
  });
}

/**
 * Validates the URL and checks for HTTPS usage
 * @param {string} url - The URL to validate
 * @returns {Promise<Object>} - Validation result with validity status and warnings/errors
 */
async function validateCertificate(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:') {
      return { valid: true, warning: '使用 HTTP 连接，建议启用 HTTPS' };
    }
    
    // For HTTPS URLs, we can do basic validation
    // Note: Browser handles certificate validation automatically
    // This is more for logging and user awareness
    return { valid: true, warning: null };
  } catch (e) {
    return { valid: false, error: 'URL 格式无效' };
  }
}

// Client configuration
const clientConfigs = {
  qbittorrent: {
    name: 'qBittorrent',
    apiPath: '/api/v2',
    addPath: '/torrents/add',
    loginPath: '/auth/login',
    versionPath: '/app/version'
  },
  transmission: {
    name: 'Transmission',
    apiPath: '/transmission/rpc',
    addPath: '',
    loginPath: '',
    versionPath: ''
  },
  utorrent: {
    name: 'uTorrent',
    apiPath: '/gui',
    addPath: '/',
    loginPath: '/token.html',
    versionPath: '/version.js'
  }
};

/**
 * Main handler for processing magnet link download requests
 * Flow: Validate config -> Login to client -> Add torrent -> Update history
 * @param {string} magnetUrl - The magnet URL to download
 */
async function handleDownload(magnetUrl) {
  const requestId = Date.now().toString();
  
  log(LOG_LEVELS.INFO, 'Processing magnet download request', {
    requestId,
    magnetUrl: sanitizeForLogging(magnetUrl)
  });
  
  chrome.storage.sync.get(['clientType', 'serverUrl', 'serverUser', 'serverPassword', 'extensionEnabled'], async (settings) => {
    try {
      // Check if extension is enabled
      if (settings.extensionEnabled === false) {
        log(LOG_LEVELS.WARN, 'Extension disabled, ignoring request', { requestId });
        showNotification('扩展已禁用', '请在弹出窗口中启用扩展', true);
        return;
      }
      
      if (!settings.clientType || !settings.serverUrl) {
        log(LOG_LEVELS.ERROR, 'Client not configured', { requestId });
        showNotification('配置错误', '请先在选项页面配置下载客户端信息', true);
        return;
      }

      const clientType = settings.clientType;
      const config = clientConfigs[clientType];

      // Validate certificate/URL
      const certValidation = await validateCertificate(settings.serverUrl);
      if (!certValidation.valid) {
        log(LOG_LEVELS.ERROR, 'URL validation failed', { 
          requestId, 
          url: settings.serverUrl,
          error: certValidation.error 
        });
        showNotification('URL 错误', certValidation.error, true);
        return;
      }

      if (certValidation.warning) {
        log(LOG_LEVELS.WARN, 'Certificate warning', { 
          requestId, 
          warning: certValidation.warning 
        });
      }

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        log(LOG_LEVELS.INFO, `Attempting to add torrent to ${config.name}`, { requestId });
        
        let addResponse;
        
        if (clientType === 'qbittorrent') {
          // qBittorrent flow: login then add
          const loginResponse = await fetch(`${settings.serverUrl}${config.apiPath}${config.loginPath}`, {
            method: 'POST',
            body: new URLSearchParams({
              username: settings.serverUser,
              password: settings.serverPassword
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          
          if (loginResponse.ok) {
            const formData = new FormData();
            formData.append('urls', magnetUrl);
            
            const addController = new AbortController();
            const addTimeoutId = setTimeout(() => addController.abort(), REQUEST_TIMEOUT);
            
            addResponse = await fetch(`${settings.serverUrl}${config.apiPath}${config.addPath}`, {
              method: 'POST',
              body: formData,
              signal: addController.signal
            });
            
            clearTimeout(addTimeoutId);
          } else {
            throw new Error(`Login failed with status ${loginResponse.status}`);
          }
        } else if (clientType === 'transmission') {
          // Transmission RPC
          clearTimeout(timeoutId);
          
          const rpcController = new AbortController();
          const rpcTimeoutId = setTimeout(() => rpcController.abort(), REQUEST_TIMEOUT);
          
          addResponse = await fetch(settings.serverUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              method: 'torrent-add',
              arguments: {
                filename: magnetUrl
              }
            }),
            signal: rpcController.signal
          });
          
          clearTimeout(rpcTimeoutId);
        } else if (clientType === 'utorrent') {
          // uTorrent flow: get token then add
          const tokenResponse = await fetch(`${settings.serverUrl}${config.loginPath}`, {
            headers: {
              'Authorization': 'Basic ' + btoa(`${settings.serverUser}:${settings.serverPassword}`)
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          
          if (tokenResponse.ok) {
            const tokenText = await tokenResponse.text();
            const tokenMatch = tokenText.match(/<div[^>]*>([^<]+)<\/div>/);
            const token = tokenMatch ? tokenMatch[1] : '';
            
            const addController = new AbortController();
            const addTimeoutId = setTimeout(() => addController.abort(), REQUEST_TIMEOUT);
            
            const params = new URLSearchParams();
            params.append('action', 'add-url');
            params.append('s', magnetUrl);
            params.append('token', token);
            
            addResponse = await fetch(`${settings.serverUrl}${config.apiPath}${config.addPath}`, {
              method: 'POST',
              body: params,
              signal: addController.signal
            });
            
            clearTimeout(addTimeoutId);
          } else {
            throw new Error(`Token request failed with status ${tokenResponse.status}`);
          }
        }
        
        if (addResponse && addResponse.ok) {
          log(LOG_LEVELS.INFO, 'Torrent added successfully', { requestId });
          showNotification('下载成功', `磁力链接已添加到 ${config.name}`);
          addToHistory(magnetUrl, true);
        } else {
          const errorMsg = getErrorMessage(addResponse?.status, clientType);
          log(LOG_LEVELS.ERROR, 'Failed to add torrent', { 
            requestId, 
            status: addResponse?.status,
            statusText: addResponse?.statusText,
            errorMsg 
          });
          showNotification('下载失败', errorMsg, true);
        }
      } catch (error) {
        log(LOG_LEVELS.ERROR, 'Request failed', { 
          requestId, 
          error: error.message,
          stack: error.stack 
        });
        
        const errorMessage = getNetworkErrorMessage(error);
        showNotification('连接错误', errorMessage, true);
      }
    } catch (error) {
      log(LOG_LEVELS.ERROR, 'Unexpected error in handleDownload', { 
        requestId, 
        error: error.message,
        stack: error.stack 
      });
      showNotification('系统错误', '发生未知错误，请重试', true);
    }
  });
}

/**
 * Gets appropriate error message based on HTTP status code and client type
 * @param {number} status - HTTP status code
 * @param {string} clientType - Type of torrent client
 * @returns {string} - User-friendly error message
 */
function getErrorMessage(status, clientType = 'qbittorrent') {
  const clientName = clientConfigs[clientType]?.name || '客户端';
  
  const errorMessages = {
    400: '请求错误：磁力链接格式无效',
    401: '认证失败：请检查用户名和密码',
    403: `权限不足：无法访问 ${clientName} API`,
    404: `API 不存在：请检查 ${clientName} 版本和配置`,
    409: '冲突：该磁力链接可能已存在',
    500: `服务器错误：${clientName} 内部错误`,
    405: '方法不允许：请检查客户端版本',
    406: '不可接受：请求格式不支持',
    408: '请求超时：服务器响应时间过长',
    415: '不支持的媒体类型',
    422: '无法处理的实体：请求参数错误'
  };
  
  return errorMessages[status] || `添加种子失败 (HTTP ${status})`;
}

/**
 * Gets appropriate error message for network errors
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
function getNetworkErrorMessage(error) {
  if (error.name === 'AbortError') {
    return '请求超时：请检查网络连接或服务器状态';
  }
  if (error.message.includes('Failed to fetch')) {
    return '网络错误：无法连接到服务器';
  }
  return error.message || '连接错误';
}

// Message listener for handling requests from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'download') {
    handleDownload(request.url);
  }
});
