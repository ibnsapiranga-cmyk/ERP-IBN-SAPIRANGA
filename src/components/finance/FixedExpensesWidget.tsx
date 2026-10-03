import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight, DollarSign, Layers } from 'lucide-react';
import { FixedExpense } from '../../types';
import { db } from '../../services/db';

interface FixedExpensesWidgetProps {
  onOpenManageModal: () => void;
  hideSensitiveData?: boolean;
}

export const FixedExpensesWidget: React.FC<FixedExpensesWidgetProps> = ({
  onOpenManageModal,
  hideSensitiveData
}) => {
  const [periodFilter, setPeriodFilter] = useState<'semanal' | 'quinzenal' | 'mensal'>('mensal');
  const fixedExpenses = db.getFixedExpenses().filter(f => f.active);

  const today = new Date();
  const currentDay = today.getDate();

  // Helper to filter expenses based on period
  // Semanal: due within next 7 days or in current week
  // Quinzenal: due in 1st half (1-15) or 2nd half (16-31)
  // Mensal: all active expenses of the month
  const filteredExpenses = fixedExpenses.filter(expense => {
    if (periodFilter === 'mensal') return true;
    if (periodFilter === 'quinzenal') {
      if (currentDay <= 15) {
        return expense.dueDay <= 15;
      } else {
        return expense.dueDay > 15;
      }
    }
    if (periodFilter === 'semanal') {
      // due in next 7 days
      const diff = expense.dueDay - currentDay;
      return diff >= 0 && diff <= 7;
    }
    return true;
  });

  const totalPeriod = filteredExpenses.reduce((sum, f) => sum + f.amount, 0);
  const totalMonthly = fixedExpenses.reduce((sum, f) => sum + f.amount, 0);

  // Today's due expenses
  const dueToday = fixedExpenses.filter(f => f.dueDay === currentDay);

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
      
      {/* Header with Title and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Contas Recorrentes
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
              Despesas Fixas Comprometidas
            </h4>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold text-slate-600">
          <button
            onClick={() => setPeriodFilter('semanal')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              periodFilter === 'semanal' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriodFilter('quinzenal')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              periodFilter === 'quinzenal' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            {currentDay <= 15 ? '1ª Quinzena' : '2ª Quinzena'}
          </button>
          <button
            onClick={() => setPeriodFilter('mensal')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              periodFilter === 'mensal' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Amount Totals */}
      <div className="grid grid-cols-2 gap-3 my-3">
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {periodFilter === 'semanal' ? 'Previsão Próx. 7 dias' : periodFilter === 'quinzenal' ? 'Previsão da Quinzena' : 'Total Fixas do Mês'}
          </span>
          <span className="text-lg font-black text-rose-600 tracking-tight">
            {formatCurrency(totalPeriod)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'conta' : 'contas'} no período
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Mensal Base</span>
          <span className="text-lg font-black text-slate-800 tracking-tight">
            {formatCurrency(totalMonthly)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {fixedExpenses.length} compromissos cadastrados
          </span>
        </div>
      </div>

      {/* Due Today Highlight (if any) */}
      {dueToday.length > 0 && (
        <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">
              {dueToday.length} {dueToday.length === 1 ? 'conta vence' : 'contas vencem'} HOJE (Dia {currentDay}):
            </span>
            <span className="text-amber-800 font-semibold truncate max-w-[180px]">
              {dueToday.map(d => d.name).join(', ')}
            </span>
          </div>
          <span className="font-extrabold text-amber-700 shrink-0">
            {formatCurrency(dueToday.reduce((s, d) => s + d.amount, 0))}
          </span>
        </div>
      )}

      {/* Mini List Preview */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
        {filteredExpenses.length === 0 ? (
          <p className="text-center text-slate-400 py-3 text-[11px]">Nenhuma despesa fixa com vencimento neste período.</p>
        ) : (
          filteredExpenses.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  item.dueDay === currentDay 
                    ? 'bg-amber-500 text-white font-black' 
                    : item.dueDay < currentDay 
                    ? 'bg-slate-200 text-slate-600' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  Dia {item.dueDay}
                </span>
                <span className="font-semibold text-slate-800 text-xs truncate max-w-[140px] sm:max-w-[200px]">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-900 text-xs">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Manage Button */}
      <button
        onClick={onOpenManageModal}
        className="w-full mt-3 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
      >
        <span>Gerenciar Contas e Despesas Fixas</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

    </div>
  );
};
