// options.js

const form = document.getElementById('options-form');
const qbittorrentUrlInput = document.getElementById('qbittorrent-url');
const qbittorrentUserInput = document.getElementById('qbittorrent-user');
const qbittorrentPasswordInput = document.getElementById('qbittorrent-password');

// Load saved settings
chrome.storage.sync.get(['qbittorrentUrl', 'qbittorrentUser', 'qbittorrentPassword'], (settings) => {
  if (settings.qbittorrentUrl) {
    qbittorrentUrlInput.value = settings.qbittorrentUrl;
  }
  if (settings.qbittorrentUser) {
    qbittorrentUserInput.value = settings.qbittorrentUser;
  }
  if (settings.qbittorrentPassword) {
    qbittorrentPasswordInput.value = settings.qbittorrentPassword;
  }
});

// Save settings
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const qbittorrentUrl = qbittorrentUrlInput.value;
  const qbittorrentUser = qbittorrentUserInput.value;
  const qbittorrentPassword = qbittorrentPasswordInput.value;

  chrome.storage.sync.set({
    qbittorrentUrl,
    qbittorrentUser,
    qbittorrentPassword
  }, () => {
    console.log('Settings saved');
    window.close();
  });
});
