import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION_SOFIA = `Eres Sofía, la Asistente Virtual Oficial e Inteligente de ALIANZA ESTRATÉGICA S.A.S., plataforma corporativa de corretaje e intermediación en El Coca (Puerto Francisco de Orellana), Provincia de Orellana, Ecuador.

DATOS INSTITUCIONALES:
- Gerente General & Representante Legal: Adrián Arturo Íñiguez Lucio.
- Patrocinio Jurídico Especializado: Abg. Carlos Alfredo Íñiguez Rodríguez.
- Ubicación: El Coca (Puerto Francisco de Orellana), Orellana, Ecuador.
- RUC Corporativo: 2200260967001.
- Teléfono Oficial / WhatsApp de Contacto: 099 216 0967 (y 095 919 0794).

CATEGORÍAS COMERCIALES DE ACTIVOS Y DERIVADOS:
1. RE (Bienes Raíces Venta): Casas, lotes urbanos, fincas, terrenos comerciales, quintas.
2. AR (Arriendos): Departamentos, locales comerciales, oficinas, galpones industriales.
3. VH (Vehículos): Camionetas 4x4, autos familiares, camiones de carga, motocicletas.
4. MQ (Maquinaria Pesada): Maquinaria para sector petrolero, agrícola y de construcción (retroexcavadoras, tractores, generadores).
5. LQ (Segunda Mano / Remate): Activos inactivos, herramientas de trabajo y artículos de oportunidad.

PROCEDIMIENTOS DE CAPTACIÓN Y ENGANCHES:
- Consignación / Captación de Bienes: 100% Gratuita. No se cobra nada por publicar ni por tomar las fotos.
- Asesoría Legal e Inspección: Se verifica que el activo cuente con documentación en regla (escrituras sin gravámenes en RE/AR, matrículas al día y antecedentes limpios en VH/MQ).
- Cierre y Enganches: Se firman promesas de compraventa notariadas y contratos de corretaje formal con seguro jurídico.

ESQUEMA DE COMISIONES & REQUISITOS DE AGENTES:
- Regla de Reparto: 50% Empresa (ALIANZA S.A.S.) y 50% Fuerza de Ventas (25% Agente Captador / 25% Agente Vendedor, o 50% completo si el mismo agente capta y vende).
- Requisitos de Reclutamiento para Agentes: Título de Bachiller (indispensable), Hoja de Vida, Certificado de Antecedentes Penales actualizado, Croquis de residencia en El Coca, 3 referencias familiares verificables, copia de cédula/votación y selfie sosteniendo documentos.

DERIVACIÓN A CONTACTO AGENTE:
Cuando el cliente solicite acordar citas de inspección, negociar ofertas o consignar un bien, oriéntalo amablemente a contactar por WhatsApp directo a la Gerencia o con un Agente Comercial al número 099 216 0967.`;

function generateCorporateFallbackResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('arriendo') || p.includes('alquiler') || p.includes('departamento') || p.includes('local') || p.includes('galpon') || p.includes('oficina')) {
    return `En **ALIANZA ESTRATÉGICA S.A.S.** contamos con la categoría **AR (Arriendos)** en El Coca:\n\n` +
      `• **Departamentos ejecutivos y familiares** amoblados y sin amoblar.\n` +
      `• **Locales comerciales** en áreas transitadas y estratégicas.\n` +
      `• **Oficinas corporativas** y galpones industriales para el sector petrolero.\n\n` +
      `Todos nuestros contratos cuentan con blindaje notarial del Abg. Carlos Alfredo Íñiguez Rodríguez.\n` +
      `Para coordinar una inspección o solicitar disponibilidad, contáctanos al WhatsApp **099 216 0967**.`;
  }
  
  if (p.includes('casa') || p.includes('terreno') || p.includes('lote') || p.includes('finca') || p.includes('quinta') || p.includes('bienes raices') || p.includes('propiedad') || p.includes('inmueble') || p.includes('re')) {
    return `En nuestra categoría **RE (Bienes Raíces Venta)** gestionamos:\n\n` +
      `• **Casas residenciales** urbanas y conjuntos.\n` +
      `• **Lotes y terrenos comerciales** listos para construir.\n` +
      `• **Fincas agrícolas** y quintas vacacionales en Orellana.\n\n` +
      `Verificamos minuciosamente que las escrituras estén libres de gravámenes y al día en el Registro de la Propiedad.\n` +
      `¿Deseas vender o comprar? Escríbenos directamente al WhatsApp de Gerencia **099 216 0967**.`;
  }

  if (p.includes('vehiculo') || p.includes('carro') || p.includes('camioneta') || p.includes('moto') || p.includes('camion') || p.includes('vh')) {
    return `En nuestra sección de **VH (Vehículos)** intermediamos:\n\n` +
      `• **Camionetas 4x4** (ideales para trabajo petrolero y de campo).\n` +
      `• **Automóviles familiares y suvs**.\n` +
      `• **Camiones de carga** y motocicletas.\n\n` +
      `Garantizamos matrículas al día, revisión técnica aprobada y transferencia de dominio limpia.\n` +
      `Contáctanos para revisar opciones o consignar tu vehículo al **099 216 0967**.`;
  }

  if (p.includes('maquinaria') || p.includes('retro') || p.includes('tractor') || p.includes('generador') || p.includes('petroler') || p.includes('mq')) {
    return `En la categoría **MQ (Maquinaria Pesada)** comercializamos equipos para:\n\n` +
      `• **Sector Petrolero**: Generadores industriales, torres de iluminación, compresores.\n` +
      `• **Sector Agrícola y Construcción**: Retroexcavadoras, tractores, motoniveladoras.\n\n` +
      `Todos los equipos cuentan con historial técnico e inspección verificada.\n` +
      `Para consignar o arrendar maquinaria pesada en El Coca, comunícate al **099 216 0967**.`;
  }

  if (p.includes('remate') || p.includes('segunda mano') || p.includes('lq') || p.includes('usado') || p.includes('oferta') || p.includes('liquidacion')) {
    return `En la categoría **LQ (Segunda Mano / Remate)** ofrecemos:\n\n` +
      `• Herramientas de trabajo y equipos industriales usados.\n` +
      `• Artículos de oportunidad y activos en desuso con excelentes precios.\n\n` +
      `Revisa las ofertas de liquidación directamente en nuestro catálogo web o consulta al WhatsApp **099 216 0967**.`;
  }

  if (p.includes('comision') || p.includes('ganancia') || p.includes('porcentaje') || p.includes('50') || p.includes('pago')) {
    return `Nuestro esquema de comisiones es 100% transparente y equitativo:\n\n` +
      `• **50% para ALIANZA ESTRATÉGICA S.A.S.**\n` +
      `• **50% para la Fuerza de Ventas**:\n` +
      `  - 25% para el Agente Captador del bien.\n` +
      `  - 25% para el Agente Vendedor que cierra el negocio.\n` +
      `  - **¡50% completo!** si el mismo agente capta y vende la propiedad o activo.\n\n` +
      `Las comisiones se liquidan inmediatamente al concretar la firma notariada.`;
  }

  if (p.includes('agente') || p.includes('requisito') || p.includes('trabaj') || p.includes('vacante') || p.includes('postular') || p.includes('empleo')) {
    return `¡Súmate a la Fuerza de Ventas de **ALIANZA ESTRATÉGICA S.A.S.** en El Coca!\n\n` +
      `**Requisitos Obligatorios**:\n` +
      `1. Título de Bachiller (indispensable).\n` +
      `2. Hoja de Vida y Copia de Cédula/Votación.\n` +
      `3. Certificado de Antecedentes Penales actualizado.\n` +
      `4. Croquis de residencia en El Coca (Orellana).\n` +
      `5. 3 Referencias familiares verificables con teléfono.\n\n` +
      `Puedes presionar el botón **"Postular Agente"** en el encabezado de esta web o enviar tus documentos por WhatsApp al **095 919 0794**.`;
  }

  if (p.includes('consignar') || p.includes('vender') || p.includes('publicar') || p.includes('costo') || p.includes('gratis')) {
    return `La **consignación de activos es 100% GRATUITA** en ALIANZA ESTRATÉGICA S.A.S.:\n\n` +
      `• No cobramos absolutamente nada por tomar fotografías profesionales ni por publicar.\n` +
      `• Realizamos la inspección técnica y revisión jurídica de documentos.\n` +
      `• Promocionamos tu inmueble o vehículo en nuestros canales digitales y red de agentes.\n\n` +
      `Haz clic en el botón **"Quiero vender un Activo"** o comunícate con Gestión Comercial al **099 216 0967**.`;
  }

  if (p.includes('gerente') || p.includes('adrian') || p.includes('iniguez') || p.includes('abogado') || p.includes('ruc') || p.includes('legal') || p.includes('notaria')) {
    return `**DATOS INSTITUCIONALES Y LEGALES**:\n\n` +
      `• **Gerente General & Rep. Legal**: Adrián Arturo Íñiguez Lucio.\n` +
      `• **Patrocinio Jurídico Especializado**: Abg. Carlos Alfredo Íñiguez Rodríguez.\n` +
      `• **RUC Corporativo**: 2200260967001.\n` +
      `• **Ubicación**: El Coca (Puerto Francisco de Orellana), Provincia de Orellana, Ecuador.\n` +
      `• **Línea Directa WhatsApp**: 099 216 0967 / 095 919 0794.`;
  }

  return `¡Hola! Soy **Sofía**, Asistente Virtual Oficial de **ALIANZA ESTRATÉGICA S.A.S.** (El Coca, Ecuador).\n\n` +
    `Te ayudo a resolver consultas sobre nuestras 5 líneas de negocio:\n` +
    `1. 🏠 **RE (Bienes Raíces)**: Casas, lotes, fincas, terrenos.\n` +
    `2. 🔑 **AR (Arriendos)**: Departamentos, locales, galpones.\n` +
    `3. 🚗 **VH (Vehículos)**: Camionetas 4x4, autos, camiones.\n` +
    `4. 🚜 **MQ (Maquinaria Pesada)**: Equipos petroleros y agrícolas.\n` +
    `5. 🏷️ **LQ (Segunda Mano / Remate)**: Oportunidades y herramientas.\n\n` +
    `¿Qué información necesitas? También puedes contactar directamente a Gerencia vía WhatsApp al **099 216 0967**.`;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_SOFIA,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          return res.json({ text: response.text });
        }
      } catch (geminiErr: any) {
        console.warn('Google Gemini API request exception, using corporate fallback handler:', geminiErr?.message || geminiErr);
      }
    }

    const fallbackText = generateCorporateFallbackResponse(prompt);
    return res.json({ text: fallbackText });
  } catch (error: any) {
    console.error('Error procesando consulta /api/chat:', error);
    const fallbackText = generateCorporateFallbackResponse(req.body?.prompt || '');
    return res.json({ text: fallbackText });
  }
});

// Middleware para garantizar que vistas previas de WhatsApp, Facebook, Twitter y Telegram
// reciban siempre la URL absoluta correcta de og:image según el dominio que se esté consultando
app.get(['/', '/index.html'], (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = /facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Googlebot|bingbot|DuckDuckBot|Applebot/i.test(userAgent);
  const host = req.get('host') || '';

  if (isCrawler || host.includes('run.app') || host.includes('localhost')) {
    try {
      const proto = host.includes('localhost') ? (req.headers['x-forwarded-proto'] || req.protocol || 'http') : 'https';
      const origin = `${proto}://${host}`;
      const filePath = process.env.NODE_ENV === 'production'
        ? path.join(__dirname, 'dist', 'index.html')
        : path.join(__dirname, 'index.html');

      if (fs.existsSync(filePath)) {
        let html = fs.readFileSync(filePath, 'utf-8');
        // Reemplazar el dominio canónico con el origen actual para que los scrapers descarguen og-image.png sin fallar
        html = html.replace(/https:\/\/alianzaestrategica2026\.com/g, origin);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }
    } catch (err) {
      console.warn('Advertencia en Dynamic OG Crawler:', err);
    }
  }
  next();
});

if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port: Number(port) },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Servidor Express corriendo en http://0.0.0.0:${port}`);
});

