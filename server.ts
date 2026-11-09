import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Endpoint de chat con Google Gemini para la Asistente Sofía
  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, history, apiKey: clientApiKey } = req.body;
      const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(200).json({ 
          text: null,
          note: 'No API Key configured on server; using local response.' 
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `Eres Sofía, la Asistente Virtual Oficial e Inteligente de ALIANZA ESTRATÉGICA S.A.S. (Plataforma corporativa de corretaje e intermediación en El Coca, Orellana, Ecuador - alianzaestrategica2026.com).
      
Responde de forma amable, profesional y precisa sobre compraventa y arriendo de bienes raíces, vehículos, maquinaria pesada, comisiones 50/50 y trámites notariales en El Coca, Orellana.
NUNCA proporciones datos personales privados de ningún directivo. Los canales de contacto oficiales son WhatsApp 099 216 0967 / 095 919 0794 y los correos corporativos oficiales de @alianzaestrategica2026.com.`;

      const contents = [];
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item && item.parts && item.parts[0]?.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.parts[0].text }]
            });
          }
        }
      }
      contents.push({ role: 'user', parts: [{ text: prompt || '' }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || '';
      return res.json({ text: replyText });
    } catch (error) {
      console.error('Error in /api/chat:', error);
      return res.status(200).json({ 
        text: null,
        error: error instanceof Error ? error.message : 'Error processing request' 
      });
    }
  });

  // Integración con Vite en modo desarrollo
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Modo producción
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
