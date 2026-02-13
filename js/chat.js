(function() {
  const chatHTML = `
    <div id="chat-widget" class="chat-widget">
      <button id="chat-toggle" class="chat-toggle" aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span class="chat-toggle-text">Chat with us</span>
      </button>
      <div id="chat-panel" class="chat-panel" hidden>
        <div class="chat-header">
          <h3>Support</h3>
          <p>We typically reply within a few hours</p>
          <button id="chat-close" class="chat-close" aria-label="Close chat">×</button>
        </div>
        <div class="chat-messages">
          <div class="chat-msg chat-msg-bot">
            <div class="chat-msg-bubble">Hi! 👋 Need online tech support? Type your question below and a volunteer will get back to you soon.</div>
          </div>
        </div>
        <form id="chat-form" class="chat-input-area">
          <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off">
          <button type="submit" class="chat-send" aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messages = document.querySelector('.chat-messages');
  const toggleText = toggle.querySelector('.chat-toggle-text');

  const replies = [
    "Thanks for reaching out! A volunteer will respond within 2–3 business days. In the meantime, feel free to browse our <a href='contact.html'>contact form</a> for other ways to get help.",
    "We've received your message. Someone from our team will get back to you soon!",
    "Got it — we'll look into this and reply shortly. Is there anything else we can help with?"
  ];

  function openChat() {
    panel.removeAttribute('hidden');
    panel.style.display = 'flex';
    toggle.classList.add('chat-open');
    if (toggleText) toggleText.textContent = 'Close chat';
    input.focus();
  }

  function closeChat() {
    panel.setAttribute('hidden', '');
    panel.style.display = 'none';
    toggle.classList.remove('chat-open');
    if (toggleText) toggleText.textContent = 'Chat with us';
  }

  function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-bot');
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.innerHTML = text;
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = !panel.hasAttribute('hidden');
    if (isOpen) closeChat();
    else openChat();
  });
  closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeChat();
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = '';

    setTimeout(function() {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      addMessage(reply, false);
    }, 800 + Math.random() * 700);
  });
})();
