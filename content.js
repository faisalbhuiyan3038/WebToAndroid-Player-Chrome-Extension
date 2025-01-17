let streams = [];

// Clear streams when page unloads
window.addEventListener('beforeunload', () => {
  streams = [];
  const menu = document.getElementById('video-handler-menu');
  const button = document.getElementById('video-handler-button');
  if (menu) menu.remove();
  if (button) button.remove();
});

function createStreamMenu() {
  const menu = document.createElement('div');
  menu.id = 'video-handler-menu';
  menu.style.display = 'none';
  document.body.appendChild(menu);
  return menu;
}

function shareUrl(url) {
  if (navigator.share) {
    navigator.share({
      url: url
    }).catch(console.error);
  }
}

function updateMenu() {
  const menu = document.getElementById('video-handler-menu') || createStreamMenu();
  menu.innerHTML = streams.map(stream => `
    <div class="stream-item" data-url="${stream.url}" title="${stream.name}">
      ${stream.name}
    </div>
  `).join('');

  menu.querySelectorAll('.stream-item').forEach(item => {
    item.onclick = () => {
      shareUrl(item.dataset.url);
    };
  });
}

function createFloatingButton() {
  const button = document.createElement('div');
  button.id = 'video-handler-button';
  button.innerHTML = '▶️';
  button.style.display = 'none';
  document.body.appendChild(button);

  button.onclick = () => {
    const menu = document.getElementById('video-handler-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  };

  return button;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "streamDetected") {
    streams = message.streams;
    const button = document.getElementById('video-handler-button') || createFloatingButton();
    button.style.display = 'block';
    updateMenu();
  }
});