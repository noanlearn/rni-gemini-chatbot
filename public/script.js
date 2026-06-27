const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let conversation = [];

// Configure marked
marked.setOptions({ breaks: true, gfm: true });

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendUserMessage(userMessage);
  conversation.push({ role: 'user', text: userMessage });

  input.value = '';
  input.disabled = true;

  const thinkingElement = appendThinking();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const resultText = typeof data.result === 'string' ? data.result.trim() : '';

    thinkingElement.remove();

    if (!resultText) {
      appendBotMessage('Sorry, no response received.');
    } else {
      appendBotMessage(resultText);
      conversation.push({ role: 'model', text: resultText });
    }
  } catch (error) {
    console.error('Chat request failed:', error);
    thinkingElement.remove();
    appendBotMessage('Failed to get response from server.');
  } finally {
    input.disabled = false;
    input.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendUserMessage(text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-end justify-end gap-2';
  wrapper.innerHTML = `
    <div class="bg-donor text-white rounded-2xl rounded-br-none px-4 py-3 text-sm max-w-[80%] shadow-sm leading-relaxed">
      ${escapeHtml(text)}
    </div>
    <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs shrink-0">
      <i class="fa-solid fa-user"></i>
    </div>
  `;
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBotMessage(text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-start gap-3';

  const avatar = document.createElement('div');
  avatar.className = 'w-8 h-8 rounded-full bg-donor flex items-center justify-center text-white text-xs shrink-0 shadow-md shadow-donor/20';
  avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

  const bubble = document.createElement('div');
  bubble.className = 'bg-slate-800 text-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-[85%] border border-slate-700/30 shadow-sm leading-relaxed bot-markdown';
  bubble.innerHTML = marked.parse(text);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendThinking() {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-start gap-3';
  wrapper.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-donor flex items-center justify-center text-white text-xs shrink-0 shadow-md shadow-donor/20">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-slate-700/30 shadow-sm flex items-center gap-1.5">
      Thinking 
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return wrapper;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}