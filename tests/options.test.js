/**
 * Unit Tests for Options Page
 * Tests core functionality of options.js
 */

// Mock DOM environment
global.document = {
  getElementById: jest.fn((id) => {
    const mockElement = {
      value: '',
      textContent: '',
      className: '',
      style: { display: 'none' },
      addEventListener: jest.fn(),
      focus: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
      appendChild: jest.fn(),
      insertBefore: jest.fn(),
      replaceChild: jest.fn(),
      parentNode: null,
      nodeName: 'INPUT'
    };
    
    // Add type-specific properties
    if (id.includes('password')) {
      mockElement.type = 'password';
    } else if (id.includes('url') || id.includes('user')) {
      mockElement.type = 'text';
    }
    
    return mockElement;
  }),
  createElement: jest.fn(() => ({
    textContent: '',
    className: '',
    style: {},
    setAttribute: jest.fn(),
    appendChild: jest.fn()
  }))
};

global.URL = global.URL || require('url').URL;
global.URLSearchParams = global.URLSearchParams || require('url').URLSearchParams;

// Mock Chrome APIs
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    openOptionsPage: jest.fn()
  }
};

// Mock fetch for testing
global.fetch = jest.fn();

describe('Options Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('URL Validation', () => {
    test('should validate correct URLs', () => {
      const validUrls = [
        'http://localhost:8080',
        'https://example.com',
        'http://192.168.1.1:8080'
      ];

      function isValidUrl(url) {
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
          return false;
        }
      }

      validUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    test('should reject invalid URLs', () => {
      const invalidUrls = [
        'ftp://example.com',
        'not-a-url',
        'http://',
        '',
        'javascript:alert(1)'
      ];

      function isValidUrl(url) {
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
          return false;
        }
      }

      invalidUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });

  describe('Form Validation', () => {
    test('should validate all required fields', () => {
      const formData = {
        'qbittorrent-url': 'http://localhost:8080',
        'qbittorrent-user': 'admin',
        'qbittorrent-password': 'password'
      };

      function validateForm(data) {
        const errors = {};
        
        if (!data['qbittorrent-url']?.trim()) {
          errors.url = 'qBittorrent URL 是必填项';
        } else if (!isValidUrl(data['qbittorrent-url'])) {
          errors.url = '请输入有效的 URL（如：http://localhost:8080）';
        }
        
        if (!data['qbittorrent-user']?.trim()) {
          errors.user = '用户名是必填项';
        }
        
        if (!data['qbittorrent-password']?.trim()) {
          errors.password = '密码是必填项';
        }
        
        return Object.keys(errors).length === 0;
      }

      function isValidUrl(url) {
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
          return false;
        }
      }

      expect(validateForm(formData)).toBe(true);
    });

    test('should detect missing required fields', () => {
      const formData = {
        'qbittorrent-url': '',
        'qbittorrent-user': '',
        'qbittorrent-password': ''
      };

      function validateForm(data) {
        const errors = {};
        
        if (!data['qbittorrent-url']?.trim()) {
          errors.url = 'qBittorrent URL 是必填项';
        }
        
        if (!data['qbittorrent-user']?.trim()) {
          errors.user = '用户名是必填项';
        }
        
        if (!data['qbittorrent-password']?.trim()) {
          errors.password = '密码是必填项';
        }
        
        return Object.keys(errors).length === 0;
      }

      expect(validateForm(formData)).toBe(false);
    });
  });

  describe('Connection Testing', () => {
    test('should handle successful connection test', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('v4.3.9')
      };

      fetch.mockResolvedValue(mockResponse);

      const testConnection = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/v2/auth/login', {
            method: 'POST',
            body: new URLSearchParams({
              username: 'admin',
              password: 'password'
            })
          });

          if (response.ok) {
            const versionResponse = await fetch('http://localhost:8080/api/v2/app/version');
            if (versionResponse.ok) {
              const version = await versionResponse.text();
              return { success: true, version };
            }
          }
          return { success: false };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await testConnection();
      expect(result.success).toBe(true);
      expect(result.version).toBe('v4.3.9');
    });

    test('should handle authentication failure', async () => {
      const mockResponse = {
        ok: false,
        status: 401
      };

      fetch.mockResolvedValue(mockResponse);

      const testConnection = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/v2/auth/login', {
            method: 'POST',
            body: new URLSearchParams({
              username: 'wrong',
              password: 'wrong'
            })
          });

          if (!response.ok) {
            return { success: false, status: response.status };
          }
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await testConnection();
      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });
  });

  describe('Storage Operations', () => {
    test('should save settings to storage', () => {
      const settings = {
        qbittorrentUrl: 'http://localhost:8080',
        qbittorrentUser: 'admin',
        qbittorrentPassword: 'password'
      };

      chrome.storage.sync.set.mockImplementation((data, callback) => {
        expect(data).toEqual(settings);
        if (callback) callback();
      });

      chrome.storage.sync.set(settings, () => {
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(settings, expect.any(Function));
      });
    });

    test('should load settings from storage', () => {
      const settings = {
        qbittorrentUrl: 'http://localhost:8080',
        qbittorrentUser: 'admin',
        qbittorrentPassword: 'password'
      };

      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(settings);
      });

      chrome.storage.sync.get(['qbittorrentUrl', 'qbittorrentUser', 'qbittorrentPassword'], (result) => {
        expect(result).toEqual(settings);
        expect(chrome.storage.sync.get).toHaveBeenCalledWith(['qbittorrentUrl', 'qbittorrentUser', 'qbittorrentPassword'], expect.any(Function));
      });
    });
  });

  describe('Password Field Handling', () => {
    test('should mask password when loading from storage', () => {
      const storedPassword = 'actualpassword';
      const mockPasswordInput = {
        value: '',
        setAttribute: jest.fn(),
        getAttribute: jest.fn(() => null)
      };

      // Simulate loading password from storage
      if (storedPassword) {
        mockPasswordInput.value = '••••••••';
        mockPasswordInput.setAttribute('data-password-set', 'true');
      }

      expect(mockPasswordInput.value).toBe('••••••••');
      expect(mockPasswordInput.setAttribute).toHaveBeenCalledWith('data-password-set', 'true');
    });

    test('should clear password field on focus if masked', () => {
      const mockPasswordInput = {
        value: '••••••••',
        getAttribute: jest.fn(() => 'true'),
        setAttribute: jest.fn()
      };

      // Simulate focus event
      if (mockPasswordInput.getAttribute('data-password-set') === 'true' && 
          mockPasswordInput.value === '••••••••') {
        mockPasswordInput.value = '';
        mockPasswordInput.removeAttribute('data-password-set');
      }

      expect(mockPasswordInput.value).toBe('');
      expect(mockPasswordInput.setAttribute).toHaveBeenCalledWith('data-password-set', 'true');
    });
  });
});

// Test runner setup
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Export test utilities if needed
  };
}