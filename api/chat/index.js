module.exports = async function (context, req) {
    try {
        const { message, history } = req.body || {};
        const apiKey = process.env.AI_API_KEY;
        const apiUrl = process.env.AI_API_URL;

        if (!apiKey || !apiUrl) {
            context.res = {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: { reply: '[DEBUG] Missing environment variables: ' + (!apiKey ? 'AI_API_KEY ' : '') + (!apiUrl ? 'AI_API_URL' : '') }
            };
            return;
        }

        if (!message) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { reply: '[DEBUG] No message provided in request body.' }
            };
            return;
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

        if (history && history.length > 0) {
            for (const msg of history) {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                });
            }
        }

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

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
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
        });

        if (!response.ok) {
            const errorData = await response.text();
            let errorMsg = errorData;
            try { errorMsg = JSON.stringify(JSON.parse(errorData), null, 2); } catch (e) {}
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { reply: `[DEBUG] AI API Error ${response.status}: ${errorMsg}` }
            };
            return;
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { reply }
            };
        } else {
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { reply: '[DEBUG] Unexpected API response: ' + JSON.stringify(data) }
            };
        }
    } catch (error) {
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { reply: '[DEBUG] Function error: ' + error.message }
        };
    }
};
