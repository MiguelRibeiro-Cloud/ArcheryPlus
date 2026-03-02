// ============================================================
// FPTA ArcheryPlus - Chatbot Module
// ============================================================

const Chatbot = (() => {
    let isOpen = false;
    let history = [];
    let isProcessing = false;

    function init() {
        const toggle = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chat-close');
        const sendBtn = document.getElementById('chat-send');
        const input = document.getElementById('chat-input');

        toggle.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Add welcome message
        addBotMessage(t('chat.welcome'));
    }

    function toggleChat() {
        const window = document.getElementById('chatbot-window');
        isOpen = !isOpen;
        window.classList.toggle('active', isOpen);
        if (isOpen) {
            document.getElementById('chat-input').focus();
        }
    }

    function addBotMessage(text) {
        const container = document.getElementById('chat-messages');
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message bot';
        msgEl.innerHTML = `
            <div class="chat-msg-avatar"><i class="fas fa-bullseye"></i></div>
            <div class="chat-bubble">${formatMessage(text)}</div>
        `;
        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
    }

    function addUserMessage(text) {
        const container = document.getElementById('chat-messages');
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message user';
        msgEl.innerHTML = `
            <div class="chat-msg-avatar"><i class="fas fa-user"></i></div>
            <div class="chat-bubble">${escapeHtml(text)}</div>
        `;
        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.getElementById('chat-messages');
        const typing = document.createElement('div');
        typing.className = 'chat-message bot';
        typing.id = 'chat-typing';
        typing.innerHTML = `
            <div class="chat-msg-avatar"><i class="fas fa-bullseye"></i></div>
            <div class="chat-bubble">
                <div class="chat-typing"><span></span><span></span><span></span></div>
            </div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    function removeTyping() {
        const typing = document.getElementById('chat-typing');
        if (typing) typing.remove();
    }

    async function sendMessage() {
        if (isProcessing) return;
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addUserMessage(text);
        isProcessing = true;
        document.getElementById('chat-send').disabled = true;
        showTyping();

        // Check for local data queries first
        const localResponse = handleLocalQuery(text);
        if (localResponse) {
            removeTyping();
            addBotMessage(localResponse);
            history.push({ role: 'user', text: text });
            history.push({ role: 'model', text: localResponse });
            isProcessing = false;
            document.getElementById('chat-send').disabled = false;
            return;
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: history.slice(-10) })
            });

            removeTyping();

            const rawText = await response.text();
            let data;
            try {
                data = rawText ? JSON.parse(rawText) : { reply: '[DEBUG] Empty response from server (status ' + response.status + ')' };
            } catch (e) {
                data = { reply: '[DEBUG] Non-JSON response (status ' + response.status + '): ' + rawText.substring(0, 300) };
            }

            if (data.reply) {
                addBotMessage(data.reply);
                if (!data.reply.startsWith('[DEBUG]')) {
                    history.push({ role: 'user', text: text });
                    history.push({ role: 'model', text: data.reply });
                }
            } else {
                addBotMessage('[DEBUG] Unexpected data: ' + JSON.stringify(data));
            }
        } catch (error) {
            removeTyping();
            addBotMessage('[DEBUG] Network error: ' + error.message);
        }

        isProcessing = false;
        document.getElementById('chat-send').disabled = false;
    }

    function handleLocalQuery(text) {
        const lower = text.toLowerCase();

        // Athlete queries
        if (lower.includes('quantos atletas') || lower.includes('how many athletes') || lower.includes('total atletas') || lower.includes('total athletes')) {
            const active = MOCK_ATHLETES.filter(a => a.status === 'active').length;
            return currentLanguage === 'pt'
                ? `A FPTA tem atualmente ${MOCK_ATHLETES.length} atletas registados, dos quais ${active} estão ativos.`
                : `FPTA currently has ${MOCK_ATHLETES.length} registered athletes, of which ${active} are active.`;
        }

        if (lower.includes('pagamentos em atraso') || lower.includes('overdue payments') || lower.includes('pagamentos pendentes') || lower.includes('pending payments')) {
            const overdue = MOCK_PAYMENTS.filter(p => p.status === 'overdue');
            const pending = MOCK_PAYMENTS.filter(p => p.status === 'pending');
            const overdueNames = overdue.map(p => {
                const a = MOCK_ATHLETES.find(at => at.id === p.athleteId);
                return a ? `${a.firstName} ${a.lastName}` : '';
            }).filter(Boolean);
            if (currentLanguage === 'pt') {
                return `Existem ${overdue.length} pagamentos em atraso e ${pending.length} pendentes.\n\nAtletas com pagamentos em atraso: ${overdueNames.join(', ')}.`;
            } else {
                return `There are ${overdue.length} overdue payments and ${pending.length} pending.\n\nAthletes with overdue payments: ${overdueNames.join(', ')}.`;
            }
        }

        if (lower.includes('próximo torneio') || lower.includes('next tournament') || lower.includes('próxima competição')) {
            const upcoming = MOCK_TOURNAMENTS.filter(tr => tr.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));
            if (upcoming.length > 0) {
                const next = upcoming[0];
                return currentLanguage === 'pt'
                    ? `O próximo torneio é "${next.name}" a ${formatDatePT(next.date)} em ${next.location}.`
                    : `The next tournament is "${next.name}" on ${formatDateEN(next.date)} at ${next.location}.`;
            }
        }

        // Search for athlete by name
        const nameMatch = lower.match(/(?:atleta|athlete|dados de|data for|info sobre|info about|informação de|information about)\s+(.+)/);
        if (nameMatch) {
            const searchName = nameMatch[1].trim();
            const athlete = MOCK_ATHLETES.find(a =>
                `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchName) ||
                a.firstName.toLowerCase().includes(searchName) ||
                a.lastName.toLowerCase().includes(searchName)
            );
            if (athlete) {
                const club = MOCK_CLUBS.find(c => c.id === athlete.clubId);
                const scores = MOCK_SCORES.filter(s => s.athleteId === athlete.id);
                const best = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 'N/A';
                if (currentLanguage === 'pt') {
                    return `**${athlete.firstName} ${athlete.lastName}**\n• Clube: ${club ? club.name : 'N/A'}\n• Disciplina: ${athlete.discipline}\n• Categoria: ${athlete.ageCategory}\n• Licença: ${athlete.licenseNumber}\n• Melhor pontuação: ${best}\n• Estado: ${athlete.status === 'active' ? 'Ativo' : 'Inativo'}`;
                } else {
                    return `**${athlete.firstName} ${athlete.lastName}**\n• Club: ${club ? club.name : 'N/A'}\n• Discipline: ${athlete.discipline}\n• Category: ${athlete.ageCategory}\n• License: ${athlete.licenseNumber}\n• Best score: ${best}\n• Status: ${athlete.status === 'active' ? 'Active' : 'Inactive'}`;
                }
            }
        }

        return null; // No local response, send to AI
    }

    function formatMessage(text) {
        // Simple markdown-like formatting
        let html = escapeHtml(text);
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        html = html.replace(/• /g, '&bull; ');
        return html;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDatePT(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatDateEN(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    return { init, toggleChat };
})();
