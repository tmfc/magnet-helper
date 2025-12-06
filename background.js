// background.js

// Function to handle the download message from the content script
function handleDownload(magnetUrl) {
  chrome.storage.sync.get(['qbittorrentUrl', 'qbittorrentUser', 'qbittorrentPassword'], (settings) => {
    if (settings.qbittorrentUrl) {
      const apiUrl = `${settings.qbittorrentUrl}/api/v2/torrents/add`;
      const formData = new FormData();
      formData.append('urls', magnetUrl);

      // First, try to log in
      fetch(`${settings.qbittorrentUrl}/api/v2/auth/login`, {
        method: 'POST',
        body: new URLSearchParams({
          username: settings.qbittorrentUser,
          password: settings.qbittorrentPassword
        })
      })
      .then(response => {
        if (response.ok) {
          // If login is successful, add the torrent
          return fetch(apiUrl, {
            method: 'POST',
            body: formData,
          });
        } else {
          throw new Error('Login failed');
        }
      })
      .then(response => {
        if (response.ok) {
          console.log('Torrent added successfully');
        } else {
          console.error('Failed to add torrent');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    } else {
      console.error('qBittorrent URL not configured');
    }
  });
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'download') {
    handleDownload(request.url);
  }
});
