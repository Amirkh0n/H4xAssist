// ======= CONFIG: System Prompt (UZ) =======
    const DEFAULT_SYSTEM_PROMPT = `Siz DevInnovator kompaniyasi tomonidan yaratilgan \"H4x Assist\" nomli yordamchisiz. Sizda axborot xavfsizligi va dasturlash ohangi bor, lekin doimo xavfsiz, qonuniy va foydali maslahatlardan chetga chiqmaydi. 
— Javoblar qisqa, aniq, va amaliy bo'lsin. 
— Dasturlash misollarida Python, HTML, CSS, JS yoki foydalanuvchi so'ragan tilni ko'rsating. 
— Kiberxavfsizlik, pentesting, etikal haking bo'yicha mutaxasis sifatida eng yaxshi javobni ko'rsating.
— O'zbek tilida javob bering (kerak bo'lsa inglizcha terminlarni ishlatishingiz mumkin). `;

    // ======= LocalStorage helpers =======
    const LS_KEY = 'h4x-puter-chats-v1';
        
          // Global variables
        let currentChatId = null;
        let chats = {};
        let isTyping = false;

        // Matrix background effect
        function initMatrix() {
            const canvas = document.querySelector('.matrix-bg');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
            const charArray = chars.split('');
            
            const drops = [];
            const fontSize = 14;
            const columns = canvas.width / fontSize;
            
            for(let i = 0; i < columns; i++) {
                drops[i] = 1;
            }
            
            function draw() {
                ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#00ff41';
                ctx.font = fontSize + 'px monospace';
                
                for(let i = 0; i < drops.length; i++) {
                    const text = charArray[Math.floor(Math.random() * charArray.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    
                    if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }
            
            setInterval(draw, 100);
        }

        // Initialize app
        function initApp() {
            loadChats();
            setupEventListeners();
            initMatrix();
            
            // Auto-resize textarea
            const messageInput = document.getElementById('messageInput');
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        }

        // Event listeners
        function setupEventListeners() {
            const messageInput = document.getElementById('messageInput');
            
            messageInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', function(e) {
                const sidebar = document.getElementById('sidebar');
                const menuBtn = document.querySelector('.menu-btn');
                
                if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                    document.getElementById('mainContent').classList.remove('sidebar-open');
                }
            });

            // Prevent sidebar close when clicking inside
            document.getElementById('sidebar').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        // Sidebar functions
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('sidebar-open');
        }

        // Chat management
        function createNewChat() {
            const chatId = 'chat_' + Date.now();
            const chat = {
                id: chatId,
                title: 'Yangi Chat',
                createdAt: new Date().toISOString(),
                model: "gpt-5",
                systemPrompt: DEFAULT_SYSTEM_PROMPT,
                messages: [ { role:'system', content: DEFAULT_SYSTEM_PROMPT } ]
          };
            
            chats[chatId] = chat;
            currentChatId = chatId;
            
            saveChats();
            renderChatList();
            clearMessages();
            showWelcomeScreen();
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
                document.getElementById('mainContent').classList.remove('sidebar-open');
            }
        }

        function switchToChat(chatId) {
            if (currentChatId === chatId) return;
            
            currentChatId = chatId;
            renderMessages();
            renderChatList();
            hideWelcomeScreen();
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
                document.getElementById('mainContent').classList.remove('sidebar-open');
            }
        }

        function deleteChat(chatId, event) {
            event.stopPropagation();
            
            if (confirm('Bu chatni o\'chirmoqchimisiz?')) {
                delete chats[chatId];
                
                if (currentChatId === chatId) {
                    currentChatId = null;
                    clearMessages();
                    showWelcomeScreen();
                }
                
                saveChats();
                renderChatList();
            }
        }

        // Message handling
        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (!message || isTyping) return;
            
            if (!currentChatId) {
                createNewChat();
            }
            
            const userMessage = {
                id: Date.now(),
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            };
            
            chats[currentChatId].messages.push(userMessage);
            chats[currentChatId].updatedAt = new Date().toISOString();
            
            // Update chat title if it's the first message
            if (chats[currentChatId].messages.length === 1) {
                chats[currentChatId].title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
            }
            
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            hideWelcomeScreen();
            renderMessages();
            saveChats();
            renderChatList();
            
            // Simulate AI response
            showTypingIndicator();
            generateAIResponse(message);
            
        }

async function generateAIResponse(userMessage) {
    const opts = { model: "gpt-5", stream: false };

    try {
        // faqat massivni yuboramiz
        const response = await puter.ai.chat(
            chats[currentChatId].messages,  // 1-argument
            false,                          // 2-argument (testMode emas)
            opts                            // 3-argument
        );

        const aiMessage = {
            id: Date.now(),
            role: 'assistant',
            content: response.message.content, // non-stream javob shunday bo‘ladi
            timestamp: new Date().toISOString()
        };

        chats[currentChatId].messages.push(aiMessage);
        chats[currentChatId].updatedAt = new Date().toISOString();

    } catch (error) {
        console.error("AI response error:", error);
        alert(error.message || JSON.stringify(error));
    }

    hideTypingIndicator();
    renderMessages();
    saveChats();
    renderChatList();
}

        function showTypingIndicator() {
            isTyping = true;
            document.getElementById('typingIndicator').style.display = 'flex';
            document.getElementById('sendBtn').disabled = true;
            scrollToBottom();
        }

        function hideTypingIndicator() {
            isTyping = false;
            document.getElementById('typingIndicator').style.display = 'none';
            document.getElementById('sendBtn').disabled = false;
        }

        // Rendering functions
        function renderMessages() {
            if (!currentChatId || !chats[currentChatId]) return;
            
            const messagesContainer = document.getElementById('messages');
            const messages = chats[currentChatId].messages.slice(1);
            
            messagesContainer.innerHTML = '';
            
            messages.forEach(message => {
                const messageElement = createMessageElement(message);
                messagesContainer.appendChild(messageElement);
            });
            
            // Add typing indicator back
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.id = 'typingIndicator';
            typingIndicator.innerHTML = `
                <span>AI yozmoqda</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            
            scrollToBottom();
        }

        function createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.role}`;
            
            let content;
            if (message.role === 'assistant') {
                content = marked.parse(message.content);
            } else {
                content = message.content.replace(/\n/g, '<br>');
            }
            
            messageDiv.innerHTML = content;
            
            // Highlight code blocks
            messageDiv.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
                
                // Add copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.onclick = () => copyCode(block.textContent);
                
                block.parentElement.style.position = 'relative';
                block.parentElement.appendChild(copyBtn);
            });
            
            return messageDiv;
        }

        function renderChatList() {
            const chatList = document.getElementById('chatList');
            const sortedChats = Object.values(chats).sort((a, b) => 
                new Date(b.updatedAt) - new Date(a.updatedAt)
            );
            
            chatList.innerHTML = '';
            
            sortedChats.forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.className = `chat-item ${currentChatId === chat.id ? 'active' : ''}`;
                chatItem.onclick = () => switchToChat(chat.id);
                
                const lastMessage = chat.messages[chat.messages.length - 1];
                const preview = lastMessage ? 
                    (lastMessage.role === 'user' ? 'Siz: ' : 'AI: ') + 
                    lastMessage.content.substring(0, 50) + '...' : 
                    'Bo\'sh chat';
                
                chatItem.innerHTML = `
                    <div class="title">${chat.title}</div>
                    <div class="preview">${preview}</div>
                    <div class="date">${formatDate(chat.updatedAt)}</div>
                    <button onclick="deleteChat('${chat.id}', event)" style="
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        background: #ff0000;
                        color: white;
                        border: none;
                        padding: 2px 6px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 10px;
                    ">×</button>
                `;
                
                chatItem.style.position = 'relative';
                chatList.appendChild(chatItem);
            });
        }

        // Utility functions
        function copyCode(text) {
            navigator.clipboard.writeText(text).then(() => {
                // Show feedback
                const notification = document.createElement('div');
                notification.textContent = 'Kod nusxalandi!';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #00ff41;
                    color: #000;
                    padding: 10px 20px;
                    border-radius: 5px;
                                        z-index: 10000;
                    animation: slideInRight 0.3s ease;
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            });
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) {
                return date.toLocaleTimeString('uz-UZ', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            } else if (days === 1) {
                return 'Kecha';
            } else if (days < 7) {
                return `${days} kun oldin`;
            } else {
                return date.toLocaleDateString('uz-UZ');
            }
        }

        function scrollToBottom() {
            const messagesContainer = document.getElementById('messages');
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }

        function clearMessages() {
            document.getElementById('messages').innerHTML = '';
        }

        function showWelcomeScreen() {
            document.getElementById('welcomeScreen').style.display = 'flex';
        }

        function hideWelcomeScreen() {
            const welcomeScreen = document.getElementById('welcomeScreen');
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
        }

        // Storage functions
        function saveChats() {
            localStorage.setItem('ai_chats', JSON.stringify(chats));
        }

        function loadChats() {
            const savedChats = localStorage.getItem('ai_chats');
            if (savedChats) {
                chats = JSON.parse(savedChats);
            }
            renderChatList();
        }

        // Responsive handling
        window.addEventListener('resize', () => {
            const canvas = document.querySelector('.matrix-bg');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Auto-close sidebar on mobile when resizing
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
                document.getElementById('mainContent').classList.remove('sidebar-open');
            }
        });

        // Initialize app when DOM is loaded
        document.addEventListener('DOMContentLoaded', initApp);

        // Additional animations for better UX
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .send-btn:active {
                animation: pulse 0.2s ease;
            }
            
            .message-input:focus {
                animation: glow 0.5s ease;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .welcome-screen {
                animation: fadeInUp 0.8s ease;
            }
            
            .feature {
                animation: fadeInUp 0.8s ease;
                animation-fill-mode: both;
            }
            
            .feature:nth-child(1) { animation-delay: 0.1s; }
            .feature:nth-child(2) { animation-delay: 0.2s; }
            .feature:nth-child(3) { animation-delay: 0.3s; }
            .feature:nth-child(4) { animation-delay: 0.4s; }
            
            /* Enhanced scrollbar for Firefox */
            .messages {
                scrollbar-width: thin;
                scrollbar-color: #00ff41 #111;
            }
            
            /* Loading animation */
            .loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid #333;
                border-radius: 50%;
                border-top-color: #00ff41;
                animation: spin 1s ease-in-out infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Message hover effects */
            .message:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 255, 65, 0.15);
            }
            
            .message.user:hover {
                box-shadow: 0 8px 25px rgba(0, 255, 65, 0.3);
            }
            
            /* Improved mobile styles */
            @media (max-width: 480px) {
                .header-title {
                    font-size: 16px;
                }
                
                .message {
                    padding: 12px 16px;
                    max-width: 100%;
                }
                
                .welcome-title {
                    font-size: 32px;
                }
                
                .welcome-subtitle {
                    font-size: 16px;
                    padding: 0 20px;
                }
                
                .features {
                    grid-template-columns: 1fr;
                    padding: 0 20px;
                }
                
                .input-area {
                    padding: 15px;
                }
                
                .message-input {
                    font-size: 16px; /* Prevents zoom on iOS */
                }
            }
            
            /* Dark theme enhancements */
            .message a {
                color: #00ff41;
                text-decoration: none;
                border-bottom: 1px solid #00ff41;
                transition: all 0.3s ease;
            }
            
            .message a:hover {
                color: #fff;
                border-bottom-color: #fff;
                text-shadow: 0 0 10px #00ff41;
            }
            
            .message blockquote {
                border-left: 4px solid #00ff41;
                background: rgba(0, 255, 65, 0.1);
                margin: 10px 0;
                padding: 10px 20px;
                font-style: italic;
            }
            
            .message table {
                border-collapse: collapse;
                width: 100%;
                margin: 10px 0;
            }
            
            .message th, .message td {
                border: 1px solid #333;
                padding: 8px 12px;
                text-align: left;
            }
            
            .message th {
                background: #001a00;
                color: #00ff41;
                font-weight: bold;
            }
            
            .message ul, .message ol {
                padding-left: 20px;
                margin: 10px 0;
            }
            
            .message li {
                margin: 5px 0;
            }
            
            /* Enhanced code styling */
            .message pre {
                position: relative;
                background: linear-gradient(135deg, #000, #0a0a0a);
                border: 1px solid #00ff41;
                box-shadow: 0 4px 15px rgba(0, 255, 65, 0.2);
            }
            
            .message pre::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, #00ff41, transparent);
            }
            
            /* Syntax highlighting customization */
            .hljs {
                background: transparent !important;
                color: #00ff41 !important;
            }
            
            .hljs-keyword {
                color: #ff6b6b !important;
            }
            
            .hljs-string {
                color: #4ecdc4 !important;
            }
            
            .hljs-number {
                color: #ffe66d !important;
            }
            
            .hljs-comment {
                color: #666 !important;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);

        // Advanced features
        function exportChat() {
            if (!currentChatId || !chats[currentChatId]) {
                alert('Hech qanday chat tanlanmagan!');
                return;
            }
            
            const chat = chats[currentChatId];
            const exportData = {
                title: chat.title,
                messages: chat.messages,
                createdAt: chat.createdAt,
                exportedAt: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat_${chat.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function importChat(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importData = JSON.parse(e.target.result);
                    const chatId = 'chat_' + Date.now();
                    
                    chats[chatId] = {
                        id: chatId,
                        title: importData.title || 'Import qilingan Chat',
                        messages: importData.messages || [],
                        createdAt: importData.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    saveChats();
                    renderChatList();
                    switchToChat(chatId);
                    
                    alert('Chat muvaffaqiyatli import qilindi!');
                } catch (error) {
                    alert('Xatolik: Chat faylini o\'qib bo\'lmadi!');
                }
            };
            reader.readAsText(file);
        }

        // Add export/import buttons to sidebar
        function addExportImportButtons() {
            const sidebar = document.getElementById('sidebar');
            const header = sidebar.querySelector('.sidebar-header');
            
            const exportBtn = document.createElement('button');
            exportBtn.className = 'new-chat-btn';
            exportBtn.style.marginTop = '5px';
            exportBtn.textContent = '📤 Export Chat';
            exportBtn.onclick = exportChat;
            
            const importBtn = document.createElement('button');
            importBtn.className = 'new-chat-btn';
            importBtn.style.marginTop = '5px';
            importBtn.textContent = '📥 Import Chat';
            importBtn.onclick = () => document.getElementById('importFile').click();
            
            const importFile = document.createElement('input');
            importFile.type = 'file';
            importFile.id = 'importFile';
            importFile.accept = '.json';
            importFile.style.display = 'none';
            importFile.onchange = importChat;
            
            header.appendChild(exportBtn);
            header.appendChild(importBtn);
            header.appendChild(importFile);
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + N - New chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                createNewChat();
            }
            
            // Ctrl/Cmd + S - Export current chat
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                exportChat();
            }
            
            // Ctrl/Cmd + B - Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
            
            // Escape - Close sidebar
            if (e.key === 'Escape') {
                document.getElementById('sidebar').classList.remove('active');
                document.getElementById('mainContent').classList.remove('sidebar-open');
            }
        });

        // Initialize export/import functionality
        document.addEventListener('DOMContentLoaded', function() {
            addExportImportButtons();
        });

        // Service Worker for offline functionality (optional)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }

        // Auto-save functionality
        setInterval(() => {
            if (Object.keys(chats).length > 0) {
                saveChats();
            }
        }, 30000); // Save every 30 seconds

        console.log('🚀 AI Terminal Chat initialized successfully!');
        console.log('🎯 Features: Matrix background, Markdown support, Code highlighting, Chat history');
        console.log('⌨️  Shortcuts: Ctrl+N (New chat), Ctrl+S (Export), Ctrl+B (Toggle sidebar), Esc (Close sidebar)');