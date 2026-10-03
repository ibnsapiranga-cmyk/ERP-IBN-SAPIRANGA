import React, { useState } from 'react';
import { Landmark, Calendar, CheckCircle2, Clock, AlertCircle, ArrowUpRight, Plus, FileText } from 'lucide-react';
import { db } from '../../services/db';

interface CbnPlanCardProps {
  selectedMonth?: string; // YYYY-MM
  hideSensitiveData?: boolean;
}

export const CbnPlanCard: React.FC<CbnPlanCardProps> = ({
  selectedMonth,
  hideSensitiveData
}) => {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    if (selectedMonth) return selectedMonth;
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [notification, setNotification] = useState<string | null>(null);

  const plan = db.calculateCbnPlan(currentMonth);

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleLaunchPayment = () => {
    if (plan.status === 'pago') {
      alert('Este mês já consta como pago à Convenção Batista Nacional.');
      return;
    }

    if (plan.paymentTransaction) {
      alert('A despesa do Plano Cooperativo já foi lançada no fluxo de caixa.');
      return;
    }

    if (plan.cbnAmount <= 0) {
      alert('Não há dízimos apurados para este mês para gerar o valor do Plano Cooperativo.');
      return;
    }

    const tx = db.launchCbnPayment(currentMonth);
    setNotification(`Despesa ${tx.code} no valor de ${formatCurrency(plan.cbnAmount)} provisionada no caixa com vencimento em ${plan.dueDate}!`);
    setTimeout(() => setNotification(null), 5000);
  };

  const [yr, mo] = currentMonth.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthLabel = `${monthNames[parseInt(mo, 10) - 1]} / ${yr}`;

  return (
    <div className="bg-linear-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700/60 relative overflow-hidden">
      
      {/* Decorative watermark / glow */}
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Info & Competence */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Estatuto CBN • 5%
                </span>
                <span className="text-xs text-slate-300 font-medium">Convenção Batista Nacional</span>
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Plano Cooperativo CBN — {monthLabel}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Todo dízimo apurado de <strong>1º a 30 de {monthNames[parseInt(mo, 10) - 1]}</strong> destina <strong>5%</strong> regimental à Convenção. Vencimento: <span className="text-amber-300 font-bold">05/{String(parseInt(mo, 10) === 12 ? 1 : parseInt(mo, 10) + 1).padStart(2, '0')}/{parseInt(mo, 10) === 12 ? parseInt(yr, 10) + 1 : yr}</span>.
          </p>
        </div>

        {/* Center: Live Calculation Numbers */}
        <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl">
          <div className="border-r border-slate-700 pr-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Dízimos do Mês</span>
            <span className="text-sm font-extrabold text-emerald-400">{formatCurrency(plan.totalTithes)}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block">A Pagar CBN (5%)</span>
            <span className="text-xl font-black text-amber-300 tracking-tight">{formatCurrency(plan.cbnAmount)}</span>
          </div>
        </div>

        {/* Right: Status & Action Button */}
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5 border ${
              plan.status === 'pago' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : plan.status === 'provisionado'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {plan.status === 'pago' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {plan.status === 'provisionado' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
              {plan.status === 'pendente' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
              <span>{plan.status === 'pago' ? 'PAGO À CONVENÇÃO' : plan.status === 'provisionado' ? 'PROVISIONADO NO CAIXA' : 'AGUARDANDO PROVISÃO'}</span>
            </span>
          </div>

          {!plan.paymentTransaction ? (
            <button
              onClick={handleLaunchPayment}
              disabled={plan.cbnAmount <= 0}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Despesa no Caixa</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-300 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lançamento: <span className="font-mono text-amber-300 font-bold">{plan.paymentTransaction.code}</span></span>
            </div>
          )}
        </div>

      </div>

      {/* Notification toast */}
      {notification && (
        <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

    </div>
  );
};
