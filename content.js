// Function to create a download button
function createDownloadButton(magnetUrl) {
  const button = document.createElement('button');
  button.textContent = 'Download with qBittorrent';
  button.style.marginLeft = '5px';
  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'download', url: magnetUrl });
  });
  return button;
}

// 1. Handle existing magnet links in <a> tags
const magnetLinks = document.querySelectorAll('a[href^="magnet:"]');
magnetLinks.forEach(link => {
  const button = createDownloadButton(link.href);
  link.parentNode.insertBefore(button, link.nextSibling);
});

// 2. Handle magnet links in plain text
const magnetRegex = /(magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}[^< \n\r]*)/gi;
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
let node;
const nodesToProcess = [];

// First, collect all text nodes to avoid issues with a live NodeList
while(node = walker.nextNode()) {
  nodesToProcess.push(node);
}

nodesToProcess.forEach(textNode => {
  if (textNode.nodeValue.match(magnetRegex)) {
    const parent = textNode.parentNode;
    // Don't process nodes that are children of <a> or <script> or <style> tags
    if (parent.nodeName === 'A' || parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') {
        return;
    }
    
    const fragments = textNode.nodeValue.split(magnetRegex);
    if (fragments.length > 1) {
      const newContent = document.createDocumentFragment();
      for (let i = 0; i < fragments.length; i++) {
        const textPart = fragments[i];
        if (i % 2 === 1) { // This is a magnet link
          const span = document.createElement('span');
          span.textContent = textPart;
          newContent.appendChild(span);
          newContent.appendChild(createDownloadButton(textPart));
        } else if (textPart) { // This is regular text
          newContent.appendChild(document.createTextNode(textPart));
        }
      }
      parent.replaceChild(newContent, textNode);
    }
  }
});
