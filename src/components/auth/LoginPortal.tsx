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
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Check
} from 'lucide-react';
import { db } from '../../services/db';
import { ErpUser, UserSession } from '../../types';
import { ChurchLogo } from '../common/ChurchLogo';

interface LoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  // Step: 'login' | 'change_password'
  const [step, setStep] = useState<'login' | 'change_password'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot

  // First access password change state
  const [pendingUser, setPendingUser] = useState<ErpUser | null>(null);
  const [pendingSession, setPendingSession] = useState<UserSession | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

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
      // Check if user must change password on first access
      if (result.mustChangePassword && result.user) {
        setPendingUser(result.user);
        setPendingSession(result.session);
        setStep('change_password');
        return;
      }

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

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError('');

    if (!pendingUser) return;

    if (!newPassword || newPassword.length < 6) {
      setChangePassError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword === '1234567890') {
      setChangePassError('A nova senha não pode ser a senha provisória padrão (1234567890). Escolha uma senha segura.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePassError('A confirmação de senha não coincide com a nova senha digitada.');
      return;
    }

    setIsChangingPass(true);
    const res = db.changeUserPassword(pendingUser.email, newPassword);
    setIsChangingPass(false);

    if (res.success && pendingSession) {
      // Establish session and conclude login
      db.setSession(pendingSession);
      onLoginSuccess(pendingSession);
    } else {
      setChangePassError(res.error || 'Erro ao redefinir a senha.');
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
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-7 text-white text-center relative border-b border-amber-900/30">
          {/* Official Church Logo */}
          <div className="flex justify-center mb-2">
            <ChurchLogo 
              variant="stacked" 
              size="lg" 
              className="drop-shadow-lg" 
            />
          </div>

          {/* Underneath the logo: ERP GESTÃO 360º PARA IGREJA */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-black tracking-wider uppercase shadow-xs">
              ERP GESTÃO 360º PARA IGREJA
            </div>
          </div>

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

        {/* ================= STEP 1: LOGIN STANDARD FORM ================= */}
        {step === 'login' && (
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

          </div>
        )}

        {/* ================= STEP 2: PRIMEIRA TROCA DE SENHA OBRIGATÓRIA ================= */}
        {step === 'change_password' && pendingUser && (
          <div className="p-6 sm:p-7 space-y-5 animate-in fade-in">
            
            <div className="text-center space-y-1.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-bold">
                <KeyRound className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Primeiro Acesso - Troca Obrigatória de Senha
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Por diretriz estatutária de segurança da IBNS Sapiranga, altere sua senha provisória para sua senha pessoal definitiva.
              </p>
            </div>

            {/* User Ident badge */}
            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{pendingUser.name}</span>
                <span className="bg-amber-200/80 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingUser.roleTitle}
                </span>
              </div>
              <p className="font-mono text-slate-600 text-[11px]">{pendingUser.email}</p>
            </div>

            {/* Error Message */}
            {changePassError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{changePassError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nova Senha Pessoal Definitiva:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => {
                      setNewPassword(e.target.value);
                      setChangePassError('');
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full text-xs font-medium pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nova Senha:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      setChangePassError('');
                    }}
                    placeholder="Repita a nova senha"
                    className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700">Requisitos da senha:</p>
                <div className="flex items-center gap-1.5">
                  <Check className={`w-3.5 h-3.5 ${newPassword.length >= 6 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`} />
                  <span>No mínimo 6 caracteres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className={`w-3.5 h-3.5 ${newPassword && newPassword !== '1234567890' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`} />
                  <span>Diferente da senha provisória de primeiro acesso</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className={`w-3.5 h-3.5 ${newPassword && newPassword === confirmPassword ? 'text-emerald-600 font-bold' : 'text-slate-400'}`} />
                  <span>Confirmação idêntica à nova senha</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-1/3 text-xs font-bold text-slate-600 hover:bg-slate-100 py-2.5 rounded-xl transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass || !newPassword || !confirmPassword}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isChangingPass ? 'Salvando...' : 'Salvar Nova Senha & Entrar'}</span>
                </button>
              </div>

            </form>

          </div>
        )}

      </div>

    </div>
  );
};
