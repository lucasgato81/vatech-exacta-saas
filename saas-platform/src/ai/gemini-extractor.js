const https = require('https');
const { analyzeDocumentSemantics } = require('./semantic-analyzer');

/**
 * AI Document Schema Extractor using Google Gemini API (Multimodal JSON Schema).
 * Falls back automatically to local Semantic Analyzer if no key is configured.
 */
async function extractSchemaWithGemini(documentInfo, apiKey) {
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    console.log('[AI Pipeline] Usando Semantic Analyzer Local (Sem chave Gemini configurada).');
    return analyzeDocumentSemantics(documentInfo);
  }

  console.log('[AI Pipeline] Chamando Gemini 2.5 Flash Multimodal para extração avançada...');

  const systemInstruction = `Você é um Engenheiro Especialista em Digitalização de Processos Técnicos e Formulários de Campo (SaaS Field Service).
Sua missão é ler o texto e estrutura deste documento técnico (ordem de serviço, checklist, laudo, termo de garantia ou relatório) e gerar uma especificação JSON exata, limpa e moderna para renderizar uma aplicação web mobile PWA completa para o técnico em campo.
Você DEVE estruturar o JSON com:
- metadata (title, category, company, description)
- header (lista de campos cadastrais com id, label, type, required)
- measurements (tabelas de medições técnicas como tensão, pressão, etc, se houver)
- checklist (categorias com itens, id, code, description, options [SIM, NAO, NA])
- narrative (campos de texto longo como diagnóstico, procedimentos)
- media (requisitos fotográficos obrigatórios com carimbo GPS)
- signatures (blocos de assinatura do técnico e cliente)`;

  const prompt = `Analise este documento técnico:
Nome original: ${documentInfo.originalName}
Páginas: ${documentInfo.numPages}

Texto extraído do documento:
"""
${documentInfo.text.slice(0, 15000)}
"""

Retorne EXCLUSIVAMENTE um objeto JSON válido seguindo a estrutura padrão de formulário de campo.`;

  const payload = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  return new Promise((resolve) => {
    const req = https.request(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 20000
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const data = JSON.parse(body);
              const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textContent) {
                const parsed = JSON.parse(textContent);
                console.log('[AI Pipeline] Extração via Gemini concluída com sucesso!');
                return resolve({
                  schemaVersion: '1.0.0',
                  id: 'tpl_' + Math.random().toString(36).substring(2, 9),
                  metadata: parsed.metadata || {},
                  schema: {
                    header: parsed.header || [],
                    measurements: parsed.measurements || [],
                    checklist: parsed.checklist || [],
                    narrative: parsed.narrative || [],
                    media: parsed.media || [],
                    signatures: parsed.signatures || []
                  },
                  aiPowered: true
                });
              }
            }
            console.warn('[AI Pipeline] Resposta não-200 do Gemini, usando fallback local.');
            resolve(analyzeDocumentSemantics(documentInfo));
          } catch (e) {
            console.error('[AI Pipeline] Erro ao processar JSON do Gemini:', e);
            resolve(analyzeDocumentSemantics(documentInfo));
          }
        });
      }
    );

    req.on('error', (err) => {
      console.warn('[AI Pipeline] Erro de rede com Gemini API:', err.message);
      resolve(analyzeDocumentSemantics(documentInfo));
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { extractSchemaWithGemini };
