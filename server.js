require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gemini API proxy endpoint - keeps API key secure on server
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const systemPrompt = `Você é o Assistente FPTA, o assistente de IA da plataforma de gestão da Federação Portuguesa de Tiro com Arco (FPTA). Você é fluente em Português de Portugal e Inglês. Responda sempre no idioma em que for perguntado.

Você ajuda os funcionários da federação com:
- Informações sobre atletas registados (nomes, clubes, categorias, pagamentos)
- Detalhes de torneios e calendários
- Classificações da liga e rankings
- Verificação de estado de pagamentos e quotas
- Questões gerais sobre tiro com arco
- Navegação no sistema

Contexto do sistema:
- A federação gere aproximadamente 30 atletas ativos
- Existem vários clubes filiados: CAL (Lisboa), Arcos do Porto, Arqueiros do Tejo, CTAB (Braga), Arqueiros do Algarve, CAC (Coimbra), SAC (Lisboa), Arqueiros do Minho
- Categorias de arco: Recurvo, Composto, Arco Nu, Arco Longo
- Categorias de idade: Sub-15, Sub-18, Sub-21, Sénior, Master
- Época atual: 2025/2026
- Torneios incluem: Liga Nacional (3 etapas), Campeonato Nacional Indoor/Outdoor, torneios regionais

Seja prestável, conciso e profissional. Use terminologia de tiro com arco correta.
Se lhe perguntarem sobre dados específicos de atletas que não conhece, indique que pode consultar o sistema para obter essa informação.`;

        const contents = [];

        // Add conversation history
        if (history && history.length > 0) {
            for (const msg of history) {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                });
            }
        }

        // Add current message with system context for first message
        if (contents.length === 0) {
            contents.push({
                role: 'user',
                parts: [{ text: systemPrompt + '\n\nPergunta do utilizador: ' + message }]
            });
        } else {
            contents.push({
                role: 'user',
                parts: [{ text: message }]
            });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return res.status(response.status).json({ error: 'AI service error', details: errorData });
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.json({ reply });
        } else {
            res.json({ reply: 'Desculpe, não consegui processar o seu pedido. Tente novamente.' });
        }
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🏹 ArcheryPlus FPTA Server running on http://localhost:${PORT}\n`);
});
