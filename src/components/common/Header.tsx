import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Bell, 
  Eye, 
  EyeOff, 
  Cake, 
  AlertCircle,
  FileSpreadsheet,
  Lock,
  ChevronDown,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { ModuleType, UserRole, UserSession } from '../../types';
import { db } from '../../services/db';
import { ChurchLogo } from './ChurchLogo';

interface HeaderProps {
  activeModule: ModuleType;
  setActiveModule?: (m: ModuleType) => void;
  onNavigate?: (m: ModuleType) => void;
  onOpenMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  hideSensitiveData: boolean;
  setHideSensitiveData?: (v: boolean) => void;
  onTogglePrivacy?: () => void;
  onOpenAccountingExport?: () => void;
  onOpenAccountingExportModal?: () => void;
  onOpenSecurityModal?: () => void;
  onOpenNewTransaction?: (type: 'entrada' | 'saida') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  onNavigate,
  onOpenMobileMenu,
  onToggleSidebar,
  hideSensitiveData,
  setHideSensitiveData,
  onTogglePrivacy,
  onOpenAccountingExport,
  onOpenAccountingExportModal,
  onOpenSecurityModal,
  onOpenNewTransaction
}) => {
  const [session, setSession] = useState<UserSession>(db.getSession());
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (mod: ModuleType) => {
    if (onNavigate) {
      onNavigate(mod);
    } else if (setActiveModule) {
      setActiveModule(mod);
    }
  };

  const handleToggleMenu = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else if (onOpenMobileMenu) {
      onOpenMobileMenu();
    }
  };

  const handleTogglePrivacy = () => {
    if (onTogglePrivacy) {
      onTogglePrivacy();
    } else if (setHideSensitiveData) {
      setHideSensitiveData(!hideSensitiveData);
    }
  };

  const handleExportAccounting = () => {
    if (onOpenAccountingExportModal) {
      onOpenAccountingExportModal();
    } else if (onOpenAccountingExport) {
      onOpenAccountingExport();
    }
  };

  useEffect(() => {
    return db.subscribe(() => {
      setSession(db.getSession());
    });
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${currentMonth}-${currentDay}`;

  // Notifications
  const members = db.getMembers();
  const transactions = db.getTransactions();

  const todayBirthdays = members.filter(m => {
    if (!m.birthDate) return false;
    const parts = m.birthDate.split('-');
    return parts[1] === currentMonth && parts[2] === currentDay;
  });

  const dueBills = transactions.filter(t => 
    t.type === 'saida' && (t.status === 'vencido' || (t.status === 'agendado' && (t.dueDate <= todayStr || t.date <= todayStr)))
  );

  const totalAlerts = todayBirthdays.length + dueBills.length;

  const handleSwitchRole = (role: UserRole, title: string, name: string, email: string) => {
    db.setSession({
      name,
      email,
      role,
      roleTitle: title,
      isAuthenticated: true
    });
    setShowRoleSelector(false);
  };

  return (
    <header className="bg-white text-slate-850 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              onClick={handleToggleMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div 
              onClick={() => handleNavigate('dashboard')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none py-1"
              title="IBNS Sapiranga - ERP Gestão 360º"
            >
              <ChurchLogo 
                variant="horizontal" 
                size="sm" 
                className="group-hover:opacity-90 transition-opacity" 
              />
              <div className="hidden xl:flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[10px] font-black text-amber-700 tracking-wider uppercase leading-tight">
                  ERP GESTÃO 360º
                </span>
                <span className="text-[9px] text-slate-500 font-semibold leading-tight">
                  Gestão Total
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Session */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Privacy Mask Toggle */}
            <button
              onClick={handleTogglePrivacy}
              title={hideSensitiveData ? "Modo Privacidade Ativo (Valores Ocultos)" : "Ocultar Valores e CPFs na Tela"}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                hideSensitiveData 
                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {hideSensitiveData ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-slate-500" />}
              <span className="hidden md:inline">
                {hideSensitiveData ? 'Privacidade Ativa' : 'Ocultar Valores'}
              </span>
            </button>

            {/* Quick Accounting Export Button */}
            <button
              onClick={handleExportAccounting}
              title="Gerar Pacote Contábil Mensal para envio ao Contador"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold hidden sm:flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden lg:inline">Pacote p/ Contador</span>
            </button>

            {/* Notifications Menu (Birthdays & Urgent Bills) */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative transition-colors focus:outline-none"
                title="Notificações e Alertas do Dia"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900">Central de Alertas IBNS</h3>
                    </div>
                    <button 
                      onClick={() => setShowNotificationMenu(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-2 text-sm">
                    {/* Aniversariantes de Hoje */}
                    <div className="py-2.5">
                      <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Cake className="w-3.5 h-3.5 text-amber-600" /> Aniversariantes de Hoje ({todayBirthdays.length})
                        </span>
                      </div>
                      {todayBirthdays.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nenhum aniversariante registrado para hoje.</p>
                      ) : (
                        todayBirthdays.map(m => (
                          <div key={m.id} className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 my-1.5 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{m.fullName}</p>
                              <p className="text-[11px] text-slate-500">{m.role} • {m.phone}</p>
                            </div>
                            <a
                              href={`https://wa.me/55${m.phone.replace(/\D/g, '')}?text=A%20paz%20do%20Senhor%20${encodeURIComponent(m.preferredName || m.fullName)}!%20A%20fam%C3%ADlia%20IBNS%20Sapiranga%20te%20deseja%20um%20feliz%20anivers%C3%A1rio%20aben%C3%A7oado!`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold transition-colors"
                            >
                              WhatsApp
                            </a>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Contas a Pagar Urgentes */}
                    <div className="py-2.5">
                      <div className="flex items-center justify-between text-xs text-rose-700 font-bold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Contas Vencidas ou a Vencer Hoje ({dueBills.length})
                        </span>
                      </div>
                      {dueBills.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Todas as contas do período estão quitadas em dia.</p>
                      ) : (
                        dueBills.map(b => (
                          <div key={b.id} className="bg-rose-50/60 border border-rose-100 rounded-xl p-2.5 my-1.5 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{b.description}</p>
                              <p className="text-[11px] text-slate-500">
                                {hideSensitiveData ? 'R$ •••••' : `R$ ${b.amount.toFixed(2)}`} • Venc: {b.dueDate}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setShowNotificationMenu(false);
                                handleNavigate('finance');
                              }}
                              className="text-[11px] bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg font-bold transition-colors"
                            >
                              Ver
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotificationMenu(false);
                        handleNavigate('agenda');
                      }}
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold"
                    >
                      Abrir Agenda Completa & Calendário →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Session & Role Switcher */}
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  {session.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{session.name}</p>
                  <p className="text-[10px] text-amber-700 font-semibold leading-tight">{session.roleTitle}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showRoleSelector && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3.5 animate-in fade-in slide-in-from-top-2">
                  <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuário Autenticado</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Domínio Verificado
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{session.name || 'Usuário IBNS'}</p>
                    <p className="text-xs text-amber-700 font-bold">{session.roleTitle || 'Administração'}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{session.email || 'pastor@ibnsapiranga.com.br'}</p>
                  </div>

                  {/* Sessão Ativa & Detalhes */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 mb-2">
                    <p className="text-[11px] font-semibold text-slate-500">Credencial Operacional:</p>
                    <p className="font-mono text-slate-800 text-[11px] truncate">{session.email}</p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Sessão Criptografada Ativa
                    </p>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        handleNavigate('settings');
                      }}
                      className="w-full text-left text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-50/70 p-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Configurações de Segurança do ERP</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        db.logout();
                      }}
                      className="w-full text-left text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50/80 p-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sair / Encerrar Sessão (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
