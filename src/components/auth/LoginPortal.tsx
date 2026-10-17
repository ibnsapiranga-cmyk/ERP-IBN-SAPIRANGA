import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Globe, 
  Eye, 
  EyeOff, 
  Bot, 
  ShieldAlert, 
  Church, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { db } from '../../services/db';
import { UserSession } from '../../types';

interface LoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot

  // Anti-bot Captcha challenge
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(4);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // Lockout countdown
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Client connection info
  const [clientInfo, setClientInfo] = useState<{ ip: string; country: string; isLocal: boolean }>({
    ip: '127.0.0.1',
    country: 'BR',
    isLocal: true
  });

  const securitySettings = db.getSecuritySettings();

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setNum1(n1);
    setNum2(n2);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();

    // Fetch IP and Geo info from server
    fetch('/api/security/client-info')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setClientInfo({
            ip: data.ip || '127.0.0.1',
            country: data.detectedCountry || 'BR',
            isLocal: data.isLocal || false
          });
        }
      })
      .catch(() => {
        // Fallback local detection
        setClientInfo({
          ip: '127.0.0.1',
          country: 'BR',
          isLocal: true
        });
      });
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Check email domain validity in real-time
  const isDomainInvalid = email.trim().length > 0 && 
    securitySettings.restrictDomainOnly && 
    !email.trim().toLowerCase().endsWith(`@${securitySettings.allowedDomain}`);

  const handleQuickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe seu e-mail institucional e senha.');
      return;
    }

    setIsSubmitting(true);

    const expectedCaptcha = String(num1 + num2);

    // Call authentication method in db.ts
    const result = db.authenticate(email, password, {
      captchaAnswer: captchaAnswer.trim(),
      captchaExpected: expectedCaptcha,
      honeypot: honeypot,
      clientCountry: securitySettings.simulateForeignIp ? 'US' : clientInfo.country,
      clientIp: clientInfo.ip
    });

    setIsSubmitting(false);

    if (result.success && result.session) {
      onLoginSuccess(result.session);
    } else {
      setErrorMessage(result.error || 'Credenciais inválidas.');
      generateCaptcha();

      // Check if locked out
      const attempt = db.getFailedAttempts(email);
      if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
        const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
        setLockoutSeconds(remaining);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10">
        
        {/* Top Header with Church Branding */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 mb-3 border-2 border-amber-400">
            ✝
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">
            IBNS ERP Eclesiástico
          </h1>
          <p className="text-xs text-amber-300 font-medium mt-0.5">
            Igreja Batista Nacional em Sapiranga - RS
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-semibold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portal Seguro & Autenticação Institucional</span>
          </div>
        </div>

        {/* Security badges info banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Conexão: <strong>{securitySettings.simulateForeignIp ? 'EUA (Simulado)' : 'Brasil (RS)'}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>TLS 1.3 Criptografado</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">

          {/* Error / Alert Message */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Falha de Acesso:</span>
                <span>{errorMessage}</span>
                {lockoutSeconds > 0 && (
                  <div className="mt-1 font-mono font-bold text-rose-700">
                    Tempo restante de bloqueio: {Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Honeypot hidden input for anti-bot detection */}
            <input 
              type="text" 
              name="website_url_hp" 
              value={honeypot} 
              onChange={e => setHoneypot(e.target.value)} 
              tabIndex={-1} 
              autoComplete="off" 
              className="hidden" 
              style={{ display: 'none', position: 'absolute', opacity: 0 }} 
            />

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                E-mail Institucional (@ibnsapiranga.com.br)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  disabled={lockoutSeconds > 0}
                  placeholder="usuario@ibnsapiranga.com.br"
                  className={`w-full text-xs font-medium pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    isDomainInvalid 
                      ? 'border-rose-300 focus:ring-rose-500 text-rose-900 bg-rose-50/50' 
                      : 'border-slate-200 focus:ring-amber-500 text-slate-800'
                  }`}
                  required
                />
              </div>

              {/* Real-time Domain Warning */}
              {isDomainInvalid && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>Atenção: Apenas e-mails do domínio @ibnsapiranga.com.br são autorizados.</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  disabled={lockoutSeconds > 0}
                  placeholder="Digite sua senha"
                  className="w-full text-xs font-medium pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Anti-Bot Captcha Challenge */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-600" />
                  <span>Verificação Anti-Bot:</span>
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1"
                  title="Novo Desafio"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Trocar</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-amber-100 border border-amber-300 font-mono font-bold text-slate-900 px-3 py-1.5 rounded-xl text-sm select-none tracking-widest">
                  {num1} + {num2} = ?
                </div>
                <input
                  type="number"
                  value={captchaAnswer}
                  onChange={e => setCaptchaAnswer(e.target.value)}
                  placeholder="Resposta"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 text-center"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0 || isDomainInvalid}
              className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Validando Credenciais...' : 'Acessar ERP com Segurança'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </form>

          {/* Quick Credential Picker for Instant Testing */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              Acesso Rápido de Teste (Usuários Cadastrados @ibnsapiranga.com.br)
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('pastor@ibnsapiranga.com.br', 'ibns@pastor2026')}
                className="bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 p-2 rounded-xl border border-slate-200 text-left font-medium transition-colors"
              >
                <span className="font-bold block text-slate-900">Pastor Presidente</span>
                <span className="text-[10px] text-slate-500 truncate block">pastor@ibnsapiranga...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('tesouraria@ibnsapiranga.com.br', 'ibns@tesouraria2026')}
                className="bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 p-2 rounded-xl border border-slate-200 text-left font-medium transition-colors"
              >
                <span className="font-bold block text-slate-900">Tesouraria</span>
                <span className="text-[10px] text-slate-500 truncate block">tesouraria@ibnsapiranga...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('secretaria@ibnsapiranga.com.br', 'ibns@secretaria2026')}
                className="bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-900 p-2 rounded-xl border border-slate-200 text-left font-medium transition-colors"
              >
                <span className="font-bold block text-slate-900">Secretaria</span>
                <span className="text-[10px] text-slate-500 truncate block">secretaria@ibnsapiranga...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@ibnsapiranga.com.br', 'ibns@admin2026')}
                className="bg-slate-100 hover:bg-purple-100 text-slate-800 hover:text-purple-900 p-2 rounded-xl border border-slate-200 text-left font-medium transition-colors"
              >
                <span className="font-bold block text-slate-900">Admin TI / Seg</span>
                <span className="text-[10px] text-slate-500 truncate block">admin@ibnsapiranga...</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 border-t border-slate-100 p-3.5 text-center text-[10px] text-slate-500">
          Igreja Batista Nacional em Sapiranga &bull; Sistema Protegido por Camadas Cibernéticas IBNS
        </div>

      </div>

    </div>
  );
};
