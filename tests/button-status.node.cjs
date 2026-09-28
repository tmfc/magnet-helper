const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('button shows a check only after a successful response', () => {
  let reply;
  const listeners = {};
  const button = { style: {}, setAttribute() {}, addEventListener(type, fn) { listeners[type] = fn; } };
  const context = {
    document: {
      createElement: () => button,
      querySelectorAll: () => [],
      createTreeWalker: () => ({ nextNode: () => null }),
      body: {}
    },
    chrome: {
      storage: { sync: { get: (_keys, cb) => cb({ extensionEnabled: true }) }, onChanged: { addListener() {} } },
      runtime: { sendMessage: (_message, cb) => { reply = cb; } }
    },
    NodeFilter: { SHOW_TEXT: 4 },
    MutationObserver: class { observe() {} }
  };
  vm.createContext(context);
  vm.runInContext(source('content.js'), context);
  vm.runInContext('createDownloadButton("magnet:?xt=urn:btih:123")', context);

  listeners.click();
  assert.equal(button.textContent, '发送中...');
  assert.equal(button.disabled, true);
  reply({ success: true });
  assert.equal(button.textContent, '✓ 成功');
  assert.equal(button.disabled, false);

  listeners.click();
  reply({ success: false });
  assert.equal(button.textContent, '发送失败');
});

test('background returns the actual add result', async () => {
  let onMessage;
  let addSucceeded = true;
  let loginSucceeded = true;
  const requests = [];
  const settings = { clientType: 'qbittorrent', serverUrl: 'http://localhost:8080', serverUser: 'user', serverPassword: 'password' };
  const context = {
    chrome: {
      runtime: { onMessage: { addListener: (fn) => { onMessage = fn; } } },
      storage: {
        sync: { get: (keys, cb) => cb(keys.includes('clientType') ? settings : { downloadHistory: [] }), set() {} },
        local: { get: (_keys, cb) => cb({}), set() {} }
      },
      notifications: { create() {} }
    },
    fetch: async (url, options) => {
      requests.push({ url, credentials: options.credentials });
      return url.endsWith('/auth/login')
        ? { ok: true, status: 200, text: async () => loginSucceeded ? 'Ok.' : 'Fails.' }
        : { ok: addSucceeded, status: addSucceeded ? 200 : 500 };
    },
    console: { info() {}, warn() {}, error() {} },
    URL, URLSearchParams, FormData, AbortController, TextEncoder, setTimeout, clearTimeout, Date
  };
  vm.createContext(context);
  vm.runInContext(source('background.js'), context);

  const download = () => new Promise((resolve) => {
    assert.equal(onMessage({ type: 'download', url: 'magnet:?xt=urn:btih:123' }, {}, resolve), true);
  });
  assert.equal((await download()).success, true);
  assert.deepEqual(requests.map(({ credentials }) => credentials), ['include', 'include']);
  addSucceeded = false;
  assert.equal((await download()).success, false);
  loginSucceeded = false;
  assert.equal((await download()).success, false);
  assert.equal(requests.length, 5);
});
