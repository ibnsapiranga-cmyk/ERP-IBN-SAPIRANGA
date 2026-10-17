import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON body parser with 10MB limit (protection against payload overload)
app.use(express.json({ limit: '10mb' }));

// Anti-DDoS / Rate Limiting (in-memory sliding window)
interface RateLimitTracker {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitTracker>();

const rateLimiter = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = ip.split(',')[0].trim();
    const now = Date.now();

    let tracker = rateLimitMap.get(clientIp);
    if (!tracker || now > tracker.resetAt) {
      tracker = { count: 1, resetAt: now + windowMs };
      rateLimitMap.set(clientIp, tracker);
    } else {
      tracker.count++;
    }

    if (tracker.count > maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Proteção Anti-Sobrecarga: Limite de requisições excedido. Tente novamente em alguns segundos.'
      });
      return;
    }

    next();
  };
};

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Security Check IP Endpoint
app.get('/api/security/client-info', (req: Request, res: Response) => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const cfCountry = req.headers['cf-ipcountry'] as string;
  const xCountry = req.headers['x-country-code'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '127.0.0.1');

  // Determine country if headers provided or default to BR for local
  let detectedCountry = 'BR';
  if (cfCountry) detectedCountry = cfCountry.toUpperCase();
  else if (xCountry) detectedCountry = xCountry.toUpperCase();

  res.json({
    ip,
    detectedCountry,
    isLocal: ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.'),
    serverTime: new Date().toISOString()
  });
});

// Correios CEP integration endpoint (ViaCEP proxy with validation)
app.get('/api/correios/cep/:cep', rateLimiter(60, 60000), async (req: Request, res: Response) => {
  try {
    const rawCep = req.params.cep || '';
    const cleanCep = rawCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      res.status(400).json({ error: 'CEP inválido. Deve conter exatamente 8 dígitos.' });
      return;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      throw new Error(`ViaCEP HTTP status ${response.status}`);
    }

    const data = (await response.json()) as any;
    if (data.erro) {
      res.status(404).json({ error: 'CEP não encontrado na base de dados dos Correios.' });
      return;
    }

    res.json({
      success: true,
      cep: data.cep,
      street: data.logradouro || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || 'RS',
      ibge: data.ibge || '',
      ddd: data.ddd || ''
    });
  } catch (err: any) {
    console.error('Error in /api/correios/cep:', err);
    res.status(500).json({ error: 'Falha ao consultar os Correios.', details: err?.message });
  }
});

// AI Bank Statement Reconciliation Route using Gemini (supports CSV, XLSX, PDF, OFX)
app.post('/api/ai/reconcile-statement', rateLimiter(30, 60000), async (req: Request, res: Response) => {
  try {
    let { rawText, format, fileBase64, mimeType, members = [], costCenters = [] } = req.body;

    // If PDF base64 provided and rawText is empty, extract text from PDF using pdf-parse
    if (fileBase64 && (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0)) {
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const pdfResult = await pdf(buffer);
        if (pdfResult && pdfResult.text) {
          rawText = pdfResult.text;
        }
      } catch (pdfError) {
        console.warn('PDF text extraction fallback notice:', pdfError);
      }
    }

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      res.status(400).json({ error: 'Conteúdo do extrato não fornecido ou ilegível no arquivo.' });
      return;
    }

    // Attempt Gemini AI reconciliation
    if (process.env.GEMINI_API_KEY) {
      try {
        const membersSummary = Array.isArray(members) 
          ? members.slice(0, 100).map((m: any) => `${m.id}: ${m.fullName}`).join(', ')
          : '';

        const prompt = `Você é o assistente contábil e financeiro de inteligência artificial da Igreja Batista Nacional em Sapiranga (IBNS).
Analise o extrato bancário (formato ${format || 'OFX/CSV/XLSX/PDF'}) a seguir.

INSTRUÇÕES RIGOROSAS:
1. Identifique CADA transação e seu método de pagamento real com base na descrição:
   - Se mencionar "debito", "compra deb", "compra no debito", "deb visa", "deb master" etc. -> DEVE ser "Cartão de Débito".
   - Se mencionar "credito", "fatura", "compra cred" -> "Cartão de Crédito".
   - Se mencionar "pix", "chave pix", "transferencia pix", "transf pix" -> "Pix".
   - Se mencionar "boleto", "cobranca", "titulo", "pagto titulo" -> "Boleto".
   - Se mencionar "ted", "doc", "tef", "transf entre contas" -> "Transferência Bancária".
   - Se mencionar "tarifa", "debito automatico", "deb aut", "cesta servicos", "iof" -> "Débito Automático".
   - Se mencionar "saque", "deposito em especie", "dinheiro" -> "Dinheiro".

2. Classificação de tipo:
   - Se valor negativo ou TRNTYPE DEBIT -> tipo "saida".
   - Se valor positivo ou TRNTYPE CREDIT -> tipo "entrada".

3. Categoria da Igreja:
   - Para Entradas: se for Pix de membro > R$ 50 -> "Dízimo". Se < R$ 50 ou não for membro -> "Oferta Voluntária" ou "Oferta Geral".
   - Para Saídas: Água e Luz (RGE, Corsan), Aluguel / Manutenção do Templo, Folha / Sustento Pastoral, Plano Cooperativo CBN, Louvor e Equipamentos, Ação Social, etc.

4. Cruzamento de Membros da Igreja:
   Lista de membros ativos cadastrados: [${membersSummary}]
   Se o nome do pagador no Pix bater com algum membro, vincule o memberId e nome.

5. Retorne APENAS um array JSON de objetos com as seguintes chaves exatas:
   - rawDescription (string)
   - cleanDescription (string: descrição limpa e legível)
   - amount (número positivo)
   - type ("entrada" | "saida")
   - paymentMethod ("Cartão de Débito" | "Cartão de Crédito" | "Pix" | "Boleto" | "Transferência Bancária" | "Débito Automático" | "Dinheiro")
   - category (string da categoria)
   - suggestedType ("dizimo" | "oferta" | "despesa" | "outro")
   - donorName (string ou null)
   - matchedMemberId (string ou null)
   - aiExplanation (string curta explicando o raciocínio)
   - aiConfidence (número de 0 a 1)

Conteúdo bruto do extrato:
${rawText.slice(0, 8000)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const outputText = response.text || '';
        try {
          const parsed = JSON.parse(outputText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            res.json({
              success: true,
              source: 'gemini-3.8-flash',
              items: parsed
            });
            return;
          }
        } catch (parseErr) {
          console.warn('Could not parse Gemini JSON directly, falling back:', parseErr);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local heuristic analyzer:', geminiErr);
      }
    }

    // Rule-based fallback reconciler
    res.json({
      success: true,
      source: 'heuristic-engine',
      items: null // Signal client to use built-in enhanced pattern matcher
    });
  } catch (err: any) {
    console.error('Error in /api/ai/reconcile-statement:', err);
    res.status(500).json({ error: 'Falha no processamento inteligente do extrato.', details: err?.message });
  }
});

// Setup server with Vite in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IBNS ERP Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
