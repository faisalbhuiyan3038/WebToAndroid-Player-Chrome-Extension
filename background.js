// background.js
let detectedStreams = new Map();

// Clear streams when tab is updated or removed
browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    detectedStreams.delete(tabId);
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  detectedStreams.delete(tabId);
});

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    if (url.includes('.mp4') || url.includes('.m3u8') || url.includes('urlset')) {
      let streams = detectedStreams.get(details.tabId) || [];
      const fileName = url.split('/').pop().split('?')[0];
      if (!streams.some(s => s.url === url)) {
        streams.push({ url, name: fileName });
        detectedStreams.set(details.tabId, streams);
        browser.tabs.sendMessage(details.tabId, {
          type: "streamDetected",
          streams: streams
        }).catch(console.error);
      }
    }
  },
  { urls: ["<all_urls>"], types: ["media", "xmlhttprequest"] }
);