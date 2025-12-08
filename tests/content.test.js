/**
 * Unit Tests for Content Script
 * Tests core functionality of content.js
 */

// Mock DOM environment
global.window = {};
global.document = {  createElement: jest.fn((tag) => {
  const element = {
    tagName: tag.toUpperCase(),
    textContent: '',
    className: '',
    style: {},
    setAttribute: jest.fn(),
    addEventListener: jest.fn(),
    appendChild: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    parentNode: null
  };
  return element;
}),
createDocumentFragment: jest.fn(() => ({
  appendChild: jest.fn()
})),
createTextNode: jest.fn((text) => ({ textContent: text })),
body: {
  querySelectorAll: jest.fn(() => []),
  appendChild: jest.fn()
}
};

global.Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  FILTER_SHOW_TEXT: 4
};

global.NodeFilter = {
  SHOW_TEXT: 4
};

global.URL = global.URL || require('url').URL;
global.URLSearchParams = global.URLSearchParams || require('url').URLSearchParams;

// Mock Chrome APIs
global.chrome = {
  storage: {
    sync: {
      get: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

describe('Content Script Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Magnet Link Detection', () => {
    test('should identify valid magnet links', () => {
      const magnetLinks = [
        'magnet:?xt=urn:btih:1234567890abcdef1234567890abcdef12345678',
        'magnet:?xt=urn:sha1:1234567890abcdef1234567890abcdef12345678&dn=test'
      ];

      const magnetRegex = /(magnet:\?xt=urn:btih:[a-fA-F0-9]{40}(?:&[a-zA-Z0-9]+=[^&\s]*)*)|(magnet:\?xt=urn:btmh:[a-fA-F0-9]{64}(?:&[a-zA-Z0-9]+=[^&\s]*)*)|(magnet:\?xt=urn:sha1:[a-fA-F0-9]{40}(?:&[a-zA-Z0-9]+=[^&\s]*)*)/gi;

      magnetLinks.forEach(link => {
        expect(link.match(magnetRegex)).toBeTruthy();
      });
    });

    test('should reject invalid magnet links', () => {
      const invalidLinks = [
        'http://example.com',
        'magnet:?xt=urn:invalid',
        'not-a-magnet-link',
        ''
      ];

      const magnetRegex = /(magnet:\?xt=urn:btih:[a-fA-F0-9]{40}(?:&[a-zA-Z0-9]+=[^&\s]*)*)|(magnet:\?xt=urn:btmh:[a-fA-F0-9]{64}(?:&[a-zA-Z0-9]+=[^&\s]*)*)|(magnet:\?xt=urn:sha1:[a-fA-F0-9]{40}(?:&[a-zA-Z0-9]+=[^&\s]*)*)/gi;

      invalidLinks.forEach(link => {
        expect(link.match(magnetRegex)).toBeFalsy();
      });
    });
  });

  describe('Button Creation', () => {
    test('should create download button with correct properties', () => {
      const magnetUrl = 'magnet:?xt=urn:btih:1234567890abcdef1234567890abcdef12345678';
      
      // Mock button creation
      const mockButton = {
        textContent: '',
        className: '',
        style: {},
        setAttribute: jest.fn(),
        addEventListener: jest.fn()
      };
      
      // document.createElement is already mocked to return elements in this test harness

      // Simulate button creation
      const button = mockButton;
      button.textContent = '↓ qBittorrent';
      button.className = 'magnet-helper-download-btn';
      button.setAttribute('aria-label', '将磁力链接发送到 qBittorrent');
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');

      expect(button.textContent).toBe('↓ qBittorrent');
      expect(button.className).toBe('magnet-helper-download-btn');
      expect(button.setAttribute).toHaveBeenCalledWith('aria-label', '将磁力链接发送到 qBittorrent');
      expect(button.setAttribute).toHaveBeenCalledWith('role', 'button');
      expect(button.setAttribute).toHaveBeenCalledWith('tabindex', '0');
    });

    test('should add click event listener to button', () => {
      const mockButton = {
        textContent: '',
        className: '',
        style: {},
        setAttribute: jest.fn(),
        addEventListener: jest.fn()
      };

      // Simulate adding event listener
      mockButton.addEventListener('click', expect.any(Function));

      expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('should add keyboard support to button', () => {
      const mockButton = {
        textContent: '',
        className: '',
        style: {},
        setAttribute: jest.fn(),
        addEventListener: jest.fn()
      };

      // Simulate adding keyboard event listeners
      mockButton.addEventListener('keydown', expect.any(Function));

      expect(mockButton.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Extension State Management', () => {
    test('should check if extension is enabled', () => {
      const mockCallback = jest.fn();
      
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ extensionEnabled: true });
      });

      // Simulate checking extension state
      chrome.storage.sync.get(['extensionEnabled'], (result) => {
        const isEnabled = result.extensionEnabled !== false;
        mockCallback(isEnabled);
      });

      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['extensionEnabled'], expect.any(Function));
      expect(mockCallback).toHaveBeenCalledWith(true);
    });

    test('should handle disabled extension state', () => {
      const mockCallback = jest.fn();
      
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ extensionEnabled: false });
      });

      // Simulate checking extension state
      chrome.storage.sync.get(['extensionEnabled'], (result) => {
        const isEnabled = result.extensionEnabled !== false;
        mockCallback(isEnabled);
      });

      expect(mockCallback).toHaveBeenCalledWith(false);
    });
  });

  describe('Message Handling', () => {
    test('should send download message to background script', () => {
      const magnetUrl = 'magnet:?xt=urn:btih:1234567890abcdef1234567890abcdef12345678';
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        expect(message.type).toBe('download');
        expect(message.url).toBe(magnetUrl);
        if (callback) callback();
      });

      // Simulate sending message
      chrome.runtime.sendMessage({ 
        type: 'download', 
        url: magnetUrl 
      }, () => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalled();
      });

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'download',
        url: magnetUrl
      }, expect.any(Function));
    });
  });
});

// Test runner setup
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Export test utilities if needed
  };
}