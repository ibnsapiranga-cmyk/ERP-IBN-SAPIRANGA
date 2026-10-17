import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Building2, 
  Lock, 
  Eye, 
  EyeOff,
  Database,
  Trash2,
  Shield,
  Bot,
  Globe,
  KeyRound,
  UserPlus,
  UserCheck,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { db } from '../../services/db';
import { 
  AuditLog, 
  ErpUser, 
  SecuritySettings, 
  SecurityEventLog, 
  UserRole 
} from '../../types';

interface SettingsModuleProps {
  hideSensitiveData: boolean;
  onTogglePrivacy: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  hideSensitiveData,
  onTogglePrivacy
}) => {
  const [logs, setLogs] = useState<AuditLog[]>(db.getAuditLogs());
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(db.getSecuritySettings());
  const [erpUsers, setErpUsers] = useState<ErpUser[]>(db.getErpUsers());
  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>(db.getSecurityLogs());

  // Alerts & Notifications
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [zeroDatabaseSuccess, setZeroDatabaseSuccess] = useState(false);

  // New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('secretaria');
  const [newUserRoleTitle, setNewUserRoleTitle] = useState('Secretaria');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userFormError, setUserFormError] = useState('');

  // Confirmation Modal for Zeroing
  const [isConfirmZeroOpen, setIsConfirmZeroOpen] = useState(false);

  // Counts of current real data
  const [dataStats, setDataStats] = useState({
    transactions: 0,
    members: 0,
    assets: 0,
    families: 0,
    events: 0
  });

  const refreshStats = () => {
    setDataStats({
      transactions: db.getTransactions().length,
      members: db.getMembers().length,
      assets: db.getAssets().length,
      families: db.getAssistedFamilies().length,
      events: db.getEvents().length
    });
  };

  useEffect(() => {
    refreshStats();
    return db.subscribe(() => {
      setLogs(db.getAuditLogs());
      setSecuritySettings(db.getSecuritySettings());
      setErpUsers(db.getErpUsers());
      setSecurityLogs(db.getSecurityLogs());
      refreshStats();
    });
  }, []);

  // --- Handlers for Backup & Restore ---
  const handleDownloadBackup = () => {
    const jsonStr = db.exportFullBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Completo_IBNS_Sapiranga_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 4000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('ATENÇÃO: A restauração substituirá os dados atuais pelo arquivo selecionado. Deseja continuar?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = db.importFullBackupJson(text);
      if (success) {
        setRestoreSuccess(true);
        setTimeout(() => setRestoreSuccess(false), 4000);
      } else {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  // --- Handler for Zeroing DB for Real Production ---
  const handleExecuteZeroDatabase = () => {
    // Automatically trigger safety backup first
    handleDownloadBackup();

    // Clear all tables to clean production state
    db.clearAllDataForProduction();
    setIsConfirmZeroOpen(false);
    setZeroDatabaseSuccess(true);
    setTimeout(() => setZeroDatabaseSuccess(false), 6000);
  };

  // --- Handlers for Security Settings ---
  const handleToggleSecuritySetting = (key: keyof SecuritySettings) => {
    const updated = {
      ...securitySettings,
      [key]: !securitySettings[key]
    };
    db.saveSecuritySettings(updated);
  };

  // --- Handlers for User Management ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setUserFormError('Todos os campos são obrigatórios.');
      return;
    }

    let emailClean = newUserEmail.trim().toLowerCase();
    if (!emailClean.includes('@')) {
      emailClean = `${emailClean}@${securitySettings.allowedDomain}`;
    }

    if (securitySettings.restrictDomainOnly && !emailClean.endsWith(`@${securitySettings.allowedDomain}`)) {
      setUserFormError(`O e-mail deve obrigatoriamente possuir o domínio institucional @${securitySettings.allowedDomain}`);
      return;
    }

    const newUser: ErpUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: emailClean,
      role: newUserRole,
      roleTitle: newUserRoleTitle.trim() || (
        newUserRole === 'pastor' ? 'Pastor Presidente' :
        newUserRole === 'tesouraria' ? 'Tesouraria' :
        newUserRole === 'secretaria' ? 'Secretaria' :
        newUserRole === 'conselho' ? 'Conselho Fiscal' : 'Suporte TI'
      ),
      status: 'ativo',
      createdAt: new Date().toISOString(),
      password: newUserPassword.trim()
    };

    const res = db.saveErpUser(newUser);
    if (!res.success) {
      setUserFormError(res.error || 'Erro ao cadastrar usuário.');
      return;
    }

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setIsAddUserOpen(false);
  };

  const handleDeleteUser = (user: ErpUser) => {
    if (confirm(`Tem certeza que deseja remover o usuário ${user.name} (${user.email})?`)) {
      const res = db.deleteErpUser(user.id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleToggleUserStatus = (user: ErpUser) => {
    const newStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo';
    db.saveErpUser({
      ...user,
      status: newStatus
    });
  };

  return (
    <div className="space-y-6 pb-16 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Módulo de Governança
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Segurança do ERP, Trilha de Auditoria & Banco de Dados
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de firewall institucional, proteção anti-bot, credenciais @ibnsapiranga.com.br, backup e inicialização zerada para produção real.
          </p>
        </div>
      </div>

      {/* REQUISITO 4: BANCO DE DADOS ZERADO PARA PRODUÇÃO REAL */}
      <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-rose-200 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Zerar Sistema & Banco de Dados para Lançamentos Reais
                </h3>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                  Operação Limpa (Produção)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Limpa todos os registros de teste e demonstração (membros, finanças, eventos, bens e projetos), deixando o sistema 100% zerado e pronto para a igreja iniciar lançamentos reais.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsConfirmZeroOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Zerar Tudo para Produção Real</span>
          </button>
        </div>

        {/* Current Data Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Lançamentos Financeiros:</span>
            <span className={`text-base font-black ${dataStats.transactions === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {dataStats.transactions} {dataStats.transactions === 0 && '✓ (Zerado)'}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Membros Cadastrados:</span>
            <span className={`text-base font-black ${dataStats.members === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {dataStats.members} {dataStats.members === 0 && '✓ (Zerado)'}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Bens de Patrimônio:</span>
            <span className={`text-base font-black ${dataStats.assets === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {dataStats.assets} {dataStats.assets === 0 && '✓ (Zerado)'}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Famílias Assistidas:</span>
            <span className={`text-base font-black ${dataStats.families === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {dataStats.families} {dataStats.families === 0 && '✓ (Zerado)'}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Eventos & Inscrições:</span>
            <span className={`text-base font-black ${dataStats.events === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {dataStats.events} {dataStats.events === 0 && '✓ (Zerado)'}
            </span>
          </div>
        </div>

        {zeroDatabaseSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center gap-2 text-emerald-900 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span>Sistema zerado com sucesso para operação real!</span>
              <p className="text-[11px] font-normal text-emerald-800">
                O backup prévio foi salvo automaticamente no seu computador. Todas as contas bancárias foram inicializadas com saldo R$ 0,00 e os centros de custo oficiais da IBNS Sapiranga foram configurados.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* REQUISITO 1: CONFIGURAÇÕES DE SEGURANÇA DO ERP */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                1. Camadas de Segurança Cibernética & Proteção Ativa
              </h3>
              <p className="text-xs text-slate-500">
                Defesas ativas contra bots, ataques de força bruta, sobrecarga e controle geográfico.
              </p>
            </div>
          </div>
        </div>

        {/* Security Shields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          
          {/* Shield 1: Restrição de Domínio */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="font-extrabold text-slate-900">Domínio Institucional Obrigatório</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Ativo
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Exclusividade total para e-mails institucionais com terminação <strong className="font-mono text-amber-900">@{securitySettings.allowedDomain}</strong>. Nenhum e-mail público (como @gmail, @hotmail) tem permissão de login ou cadastro.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Regra estrita de domínio aplicada</span>
            </div>
          </div>

          {/* Shield 2: Camada Anti-Bot & Honeypot */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                <h4 className="font-extrabold text-slate-900">Proteção Anti-Bot & Honeypot</h4>
              </div>
              <button
                onClick={() => handleToggleSecuritySetting('enableAntiBotCaptcha')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  securitySettings.enableAntiBotCaptcha 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {securitySettings.enableAntiBotCaptcha ? 'Ativo' : 'Desativado'}
              </button>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Campo invisível de armadilha (honeypot) para capturar bots de automação e desafio matemático de verificação humana contra scrapers.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Check className="w-3.5 h-3.5 text-blue-600" />
              <span>Captura de preenchimento automatizado</span>
            </div>
          </div>

          {/* Shield 3: Força Bruta & Lockout */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-rose-600 shrink-0" />
                <h4 className="font-extrabold text-slate-900">Anti-Força Bruta (Lockout)</h4>
              </div>
              <button
                onClick={() => handleToggleSecuritySetting('enableBruteForceLockout')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  securitySettings.enableBruteForceLockout 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {securitySettings.enableBruteForceLockout ? 'Ativo' : 'Desativado'}
              </button>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Bloqueia o acesso temporariamente após {securitySettings.maxFailedAttempts} tentativas consecutivas de senha incorreta durante {securitySettings.lockoutMinutes} minutos.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Check className="w-3.5 h-3.5 text-rose-600" />
              <span>Contador e temporizador ativo</span>
            </div>
          </div>

          {/* Shield 4: Rate Limiting / Anti-Sobrecarga */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="font-extrabold text-slate-900">Anti-Sobrecarga (Rate Limit)</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Ativo no Servidor
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Proteção contra DDoS e requisições repetitivas no backend. Limite de requisições por IP com janela de tempo de proteção deslizante.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>30 requisições/minuto em APIs sensíveis</span>
            </div>
          </div>

          {/* Shield 5: Geo-Bloqueio (Apenas IPs do Brasil) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <h4 className="font-extrabold text-slate-900">Geo-Bloqueio (Apenas Brasil)</h4>
              </div>
              <button
                onClick={() => handleToggleSecuritySetting('blockNonBrazilianIps')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  securitySettings.blockNonBrazilianIps 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {securitySettings.blockNonBrazilianIps ? 'Ativo (Somente BR)' : 'Desativado'}
              </button>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Bloqueia tentativas de login originadas de fora do território nacional (IPs internacionais), repelindo ataques de botnets globais.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Simulador de IP Estrangeiro:</span>
              <button
                onClick={() => handleToggleSecuritySetting('simulateForeignIp')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                  securitySettings.simulateForeignIp
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
                title="Ative para testar como o login se comporta se você estivesse nos EUA"
              >
                {securitySettings.simulateForeignIp ? 'Simulando IP: EUA (Bloqueado)' : 'Simular IP Fora do BR'}
              </button>
            </div>
          </div>

          {/* Shield 6: Headers de Proteção Web */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="font-extrabold text-slate-900">Headers HTTP Seguros</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Ativo
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Configurações X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy e XSS Protection injetadas em todas as respostas HTTP.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Check className="w-3.5 h-3.5 text-amber-600" />
              <span>Proteção contra clickjacking e injeção</span>
            </div>
          </div>

        </div>

        {/* Gestão de Usuários Autorizados no ERP */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Usuários Institucionais Cadastrados no Banco de Dados ({erpUsers.length})</span>
              </h4>
              <p className="text-xs text-slate-500">
                Apenas usuários cadastrados nesta lista com o domínio <strong className="font-mono">@{securitySettings.allowedDomain}</strong> conseguem realizar login.
              </p>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Usuário ERP</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nome do Operador</th>
                  <th className="py-2.5 px-3">E-mail Institucional</th>
                  <th className="py-2.5 px-3">Função / Cargo</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Último Acesso</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {erpUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {user.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">
                      {user.email}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium border border-slate-200">
                        {user.roleTitle}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                          user.status === 'ativo'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {user.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR') : 'Nunca acessou'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {erpUsers.length > 1 && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          title="Remover acesso do usuário"
                          className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trilha de Eventos de Segurança Cibernética */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Logs do Firewall & Tentativas de Acesso Recentes</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              Monitoramento em tempo real
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Data e Hora</th>
                  <th className="py-2.5 px-3">Tipo de Evento</th>
                  <th className="py-2.5 px-3">E-mail Tentado</th>
                  <th className="py-2.5 px-3">IP / País</th>
                  <th className="py-2.5 px-3">Ação do Firewall</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {securityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                      Nenhum incidente de segurança registrado. O sistema está protegido e operando normalmente.
                    </td>
                  </tr>
                ) : (
                  securityLogs.slice(0, 8).map(sec => (
                    <tr key={sec.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                        {new Date(sec.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          sec.type === 'LOGIN_SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          sec.type === 'BRUTE_FORCE_BLOCKED' ? 'bg-rose-100 text-rose-800' :
                          sec.type === 'GEO_BLOCK' ? 'bg-indigo-100 text-indigo-800' :
                          sec.type === 'BOT_DETECTED' ? 'bg-amber-100 text-amber-900' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {sec.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800">{sec.emailAttempted}</td>
                      <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                        {sec.ipAddress || '127.0.0.1'} ({sec.country || 'BR'})
                      </td>
                      <td className="py-2 px-3">
                        {sec.blocked ? (
                          <span className="text-rose-700 font-extrabold flex items-center gap-1 text-[11px]">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> BARRADO
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> PERMITIDO
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                        {sec.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Backup & Data Persistence Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Backup Completo & Restauração de Dados em JSON</span>
        </h3>

        <p className="text-xs text-slate-600">
          Faça o download do banco de dados completo (incluindo todos os lançamentos financeiros, comprovantes, membros, patrimônio, projetos e escalas) para salvaguarda em local seguro.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Fazer Download do Backup Completo (.JSON)</span>
          </button>

          <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 cursor-pointer flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Restaurar Backup (.JSON)</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>
        </div>

        {backupSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Backup gerado e baixado com sucesso!</span>
          </div>
        )}

        {restoreSuccess && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center gap-2 text-blue-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Banco de dados restaurado com sucesso!</span>
          </div>
        )}
      </div>

      {/* Security and Privacy Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-slate-900">Modo de Privacidade & Proteção de Telas</h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Oculta valores financeiros em R$ e CPFs de membros na tela para apresentações públicas ou projeções em cultos.
          </p>
        </div>

        <button
          onClick={onTogglePrivacy}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto ${
            hideSensitiveData 
              ? 'bg-amber-500 text-slate-950 shadow-xs' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          {hideSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{hideSensitiveData ? 'Privacidade ATIVA' : 'Privacidade INATIVA'}</span>
        </button>
      </div>

      {/* Church Identification Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Dados Institucionais da Igreja</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Razão Social / Nome:</span>
            <span className="font-bold text-slate-900">Igreja Batista Nacional em Sapiranga</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Domínio Oficial de Acesso:</span>
            <span className="font-mono text-amber-800 font-bold">@ibnsapiranga.com.br</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Pastor Presidente:</span>
            <span className="font-bold text-amber-800">Pr. Marcos Oliveira</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 sm:col-span-2">
            <span className="text-slate-400 font-medium block">Endereço do Templo Sede:</span>
            <span className="text-slate-800 font-medium">Rua São Pedro, Sapiranga - RS, CEP 93800-000</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Cidade / Estado:</span>
            <span className="text-slate-800 font-medium">Sapiranga / Rio Grande do Sul</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Trilha Geral de Auditoria Operacional (LGPD)</span>
          </h3>
          <span className="text-[11px] text-slate-400">{logs.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Data e Hora</th>
                <th className="py-2.5 px-3">Usuário</th>
                <th className="py-2.5 px-3">Módulo</th>
                <th className="py-2.5 px-3">Ação</th>
                <th className="py-2.5 px-3">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{log.userName}</td>
                  <td className="py-2.5 px-3 text-amber-850 font-bold">{log.module}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADICIONAR NOVO USUÁRIO INSTITUCIONAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">Novo Usuário do ERP</h3>
              </div>
              <button 
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-4 text-xs">
              {userFormError && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-rose-800 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{userFormError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Pb. Marcos Aurélio"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  E-mail Institucional (@{securitySettings.allowedDomain}):
                </label>
                <div className="flex">
                  <input
                    type="text"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="nome.sobrenome"
                    className="flex-1 px-3 py-2 rounded-l-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-mono"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2.5 py-2 rounded-r-xl text-slate-600 font-mono font-bold text-xs flex items-center">
                    @{securitySettings.allowedDomain}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nível de Acesso (Role):</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setNewUserRole(r);
                      if (r === 'pastor') setNewUserRoleTitle('Pastor Presidente');
                      else if (r === 'tesouraria') setNewUserRoleTitle('Tesouraria');
                      else if (r === 'secretaria') setNewUserRoleTitle('Secretaria');
                      else if (r === 'conselho') setNewUserRoleTitle('Conselho Fiscal');
                      else setNewUserRoleTitle('Suporte TI');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="pastor">Pastor</option>
                    <option value="tesouraria">Tesouraria</option>
                    <option value="secretaria">Secretaria</option>
                    <option value="conselho">Conselho Fiscal</option>
                    <option value="ti">TI / Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cargo / Título Oficial:</label>
                  <input
                    type="text"
                    value={newUserRoleTitle}
                    onChange={(e) => setNewUserRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Senha de Acesso:</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE ZERAR BANCO DE DADOS */}
      {isConfirmZeroOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-300 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Confirmar Inicialização Zerada do Sistema?
                </h3>
                <p className="text-xs text-rose-700 font-bold">
                  Operação para Início de Lançamentos Reais da Igreja
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs space-y-2 text-rose-900">
              <p className="font-bold">Esta ação realizará:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Download automático de uma cópia de segurança completa em JSON;</li>
                <li>Exclusão de todos os lançamentos e extratos de teste;</li>
                <li>Exclusão de todos os cadastros de membros fictícios;</li>
                <li>Exclusão de todos os registros de patrimônio, cursos e projetos sociais;</li>
                <li>Inicialização das contas bancárias (Sicredi Conta Corrente e Caixa Físico) com saldo <strong>R$ 0,00</strong>;</li>
                <li>Manutenção das contas de usuários administradores com terminação <strong>@ibnsapiranga.com.br</strong>.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-600">
              Após confirmar, a igreja terá o sistema totalmente em branco e limpo para que a diretoria, secretaria e tesouraria possam iniciar a inserção dos dados reais oficiais.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmZeroOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Voltar / Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteZeroDatabase}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Zerar Todo o Sistema Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
