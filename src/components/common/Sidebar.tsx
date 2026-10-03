import React from 'react';
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  GraduationCap, 
  HeartHandshake, 
  Flame, 
  CalendarDays, 
  Calendar, 
  BarChart3, 
  Shield, 
  X,
  Church,
  ChevronRight
} from 'lucide-react';
import { ModuleType } from '../../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule?: (m: ModuleType) => void;
  onSelectModule?: (m: ModuleType) => void;
  isOpen?: boolean;
  isOpenMobile?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  onSelectModule,
  isOpen,
  isOpenMobile,
  onClose,
  onCloseMobile
}) => {
  const isMenuOpen = isOpen ?? isOpenMobile ?? false;

  const handleClose = () => {
    if (onClose) onClose();
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelect = (mod: ModuleType) => {
    if (onSelectModule) {
      onSelectModule(mod);
    } else if (setActiveModule) {
      setActiveModule(mod);
    }
    handleClose();
  };

  const menuItems = [
    {
      id: 'dashboard' as ModuleType,
      label: 'Painel Geral (BI)',
      icon: LayoutDashboard,
      badge: 'Tempo Real'
    },
    {
      id: 'finance' as ModuleType,
      label: '1. Financeiro & Bancos',
      icon: DollarSign,
      badge: 'NFs & Extratos'
    },
    {
      id: 'members' as ModuleType,
      label: '2. Cadastro de Membros',
      icon: Users,
      badge: 'Docs & Fotos'
    },
    {
      id: 'education' as ModuleType,
      label: '3. Educação Bíblica & EBD',
      icon: GraduationCap,
      badge: 'Certificados'
    },
    {
      id: 'social' as ModuleType,
      label: '4. Projetos Sociais',
      icon: HeartHandshake,
      badge: 'Cestas & Música'
    },
    {
      id: 'evangelism' as ModuleType,
      label: '5. Evangelismo & Missões',
      icon: Flame,
      badge: 'Funil de Vidas'
    },
    {
      id: 'events' as ModuleType,
      label: '6. Eventos & Retiros',
      icon: CalendarDays,
      badge: 'Inscrições'
    },
    {
      id: 'agenda' as ModuleType,
      label: '7. Agenda & Cultos',
      icon: Calendar,
      badge: 'Escalas'
    },
    {
      id: 'reports' as ModuleType,
      label: '8. Relatórios Contábeis',
      icon: BarChart3,
      badge: 'Balancete ZIP'
    },
    {
      id: 'settings' as ModuleType,
      label: 'Segurança & Auditoria',
      icon: Shield,
      badge: 'LGPD'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMenuOpen && (
        <div 
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Drawer / Column */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-lg lg:shadow-none ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Inside Drawer */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              ✝
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">IBNS Sapiranga</p>
              <p className="text-[11px] font-semibold text-amber-700 mt-0.5">ERP de Gestão Total</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Church Identity Header (Desktop only) */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-amber-50/50 via-slate-50 to-white hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs">
              ✝
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-amber-800">
                Igreja Batista Nacional
              </p>
              <p className="text-sm font-bold text-slate-800">
                Sapiranga - RS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Navegação Principal
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id || (item.id === 'evangelism' && (activeModule as string) === 'missions');

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-600'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-slate-950/10 text-slate-950'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>IBNS Sapiranga 2026</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Segurança Criptografada • LGPD
          </p>
        </div>
      </aside>
    </>
  );
};
