// background.js
let detectedStreams = new Map();

// Clear streams when tab is updated or removed
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    detectedStreams.delete(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  detectedStreams.delete(tabId);
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    if (url.includes('.mp4') || url.includes('.m3u8') || url.includes('urlset')) {
      let streams = detectedStreams.get(details.tabId) || [];
      const fileName = url.split('/').pop().split('?')[0];
      if (!streams.some(s => s.url === url)) {
        streams.push({ url, name: fileName });
        detectedStreams.set(details.tabId, streams);
        chrome.tabs.sendMessage(details.tabId, {
          type: "streamDetected",
          streams: streams
        });
      }
    }
  },
  { urls: ["<all_urls>"], types: ["media", "xmlhttprequest"] }
);