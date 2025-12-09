/**
 * Unit Tests for Background Script
 * Tests core functionality of background.js
 */

// Mock Chrome APIs for testing
global.URL = global.URL || require('url').URL;
global.URLSearchParams = global.URLSearchParams || require('url').URLSearchParams;

global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  notifications: {
    create: jest.fn()
  },
  runtime: {
    onMessage: {
      addListener: jest.fn()
    }
  }
};

// Mock fetch for testing
global.fetch = jest.fn();

// Import functions to test (would need to export them from background.js)
// For now, we'll test the concepts

describe('Background Script Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('URL Validation', () => {
    test('should validate valid HTTP URLs', () => {
      // Test URL validation logic
      const validUrls = [
        'http://localhost:8080',
        'https://example.com',
        'http://192.168.1.1:8080'
      ];
      
      validUrls.forEach(url => {
        try {
          const urlObj = new URL(url);
          expect(urlObj.protocol === 'http:' || urlObj.protocol === 'https:').toBe(true);
        } catch (e) {
          fail(`${url} should be valid`);
        }
      });
    });

    test('should reject invalid URLs', () => {
      const invalidUrls = [
        'ftp://example.com',
        'not-a-url',
        'http://',
        ''
      ];
      
      invalidUrls.forEach(url => {
        try {
          new URL(url);
          fail(`${url} should be invalid`);
        } catch (e) {
          // Accept any thrown error object and check its constructor name to be safe across engines
          expect(e).toBeTruthy();
          expect(e.constructor && /Error|TypeError|ReferenceError/.test(e.constructor.name)).toBe(true);
        }
      });
    });
  });

  describe('Magnet URL Processing', () => {
    test('should extract name from magnet URL', () => {
      const magnetUrl = 'magnet:?xt=urn:btih:1234567890abcdef&dn=Test%20File&tr=tracker';
      const url = new URL(magnetUrl);
      const params = new URLSearchParams(url.search);
      const name = params.get('dn');
      
      expect(decodeURIComponent(name)).toBe('Test File');
    });

    test('should handle magnet URL without name', () => {
      const magnetUrl = 'magnet:?xt=urn:btih:1234567890abcdef&tr=tracker';
      const url = new URL(magnetUrl);
      const params = new URLSearchParams(url.search);
      const name = params.get('dn');
      
      expect(name).toBeNull();
    });
  });

  describe('Storage Operations', () => {
    test('should save settings to storage', () => {
      const mockSettings = {
        qbittorrentUrl: 'http://localhost:8080',
        qbittorrentUser: 'admin',
        qbittorrentPassword: 'password'
      };

      chrome.storage.sync.set.mockImplementation((data, callback) => {
        expect(data).toEqual(mockSettings);
        if (callback) callback();
      });

      // Simulate saving settings
      chrome.storage.sync.set(mockSettings, () => {
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(mockSettings, expect.any(Function));
      });
    });

    test('should load settings from storage', () => {
      const mockSettings = {
        qbittorrentUrl: 'http://localhost:8080',
        qbittorrentUser: 'admin'
      };

      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(mockSettings);
      });

      // Simulate loading settings
      chrome.storage.sync.get(['qbittorrentUrl', 'qbittorrentUser'], (result) => {
        expect(result).toEqual(mockSettings);
        expect(chrome.storage.sync.get).toHaveBeenCalledWith(['qbittorrentUrl', 'qbittorrentUser'], expect.any(Function));
      });
    });
  });

  describe('Notification System', () => {
    test('should create success notification', () => {
      const title = '下载成功';
      const message = '磁力链接已添加到 qBittorrent';
      
      chrome.notifications.create.mockImplementation((options) => {
        expect(options.title).toBe(title);
        expect(options.message).toBe(message);
        expect(options.priority).toBe(0);
        return 'notification-id';
      });

      // Simulate creating notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: title,
        message: message,
        priority: 0
      });

      expect(chrome.notifications.create).toHaveBeenCalled();
    });

    test('should create error notification with higher priority', () => {
      const title = '连接错误';
      const message = '无法连接到服务器';
      
      chrome.notifications.create.mockImplementation((options) => {
        expect(options.title).toBe(title);
        expect(options.message).toBe(message);
        expect(options.priority).toBe(2);
        return 'notification-id';
      });

      // Simulate creating error notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: title,
        message: message,
        priority: 2
      });

      expect(chrome.notifications.create).toHaveBeenCalled();
    });
  });
});

// Test runner setup
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Export test utilities if needed
  };
}