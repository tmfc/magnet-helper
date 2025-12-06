// Find all magnet links and add a download button next to them.
const magnetLinks = document.querySelectorAll('a[href^="magnet:"]');

magnetLinks.forEach(link => {
  const button = document.createElement('button');
  button.textContent = 'Download with qBittorrent';
  button.style.marginLeft = '5px';
  link.parentNode.insertBefore(button, link.nextSibling);

  button.addEventListener('click', () => {
    const magnetUrl = link.href;
    chrome.runtime.sendMessage({ type: 'download', url: magnetUrl });
  });
});
