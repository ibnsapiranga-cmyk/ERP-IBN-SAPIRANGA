import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  TrendingUp, 
  Users, 
  HeartHandshake, 
  Globe2, 
  DollarSign, 
  Layers,
  Calendar
} from 'lucide-react';
import { db } from '../../services/db';

interface ReportsModuleProps {
  hideSensitiveData: boolean;
  onOpenAccountingExportModal: () => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  hideSensitiveData,
  onOpenAccountingExportModal
}) => {
  const [reportType, setReportType] = useState<'finance' | 'members' | 'social' | 'missions'>('finance');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  const kpis = db.calculateAllKPIs();
  const txs = db.getTransactions();
  const members = db.getMembers();
  const costCenters = db.getCostCenters();
  const families = db.getAssistedFamilies();
  const deliveries = db.getSocialDeliveries();
  const actions = db.getEvangelismActions();
  const missionaries = db.getMissionaries();

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              Módulo 8
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Relatórios Executivos, DRE & Prestação de Contas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geração de demonstrativos oficiais para assembleia geral da IBNS Sapiranga e envio à contabilidade.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAccountingExportModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Pacote Contábil (.ZIP)</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-slate-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setReportType('finance')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            reportType === 'finance' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Balancete Financeiro & DRE</span>
        </button>

        <button
          onClick={() => setReportType('members')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            reportType === 'members' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Relatório de Membresia & Crescimento</span>
        </button>

        <button
          onClick={() => setReportType('social')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            reportType === 'social' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Balanço Social & Cestas</span>
        </button>

        <button
          onClick={() => setReportType('missions')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            reportType === 'missions' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Missões & Ações Evangelísticas</span>
        </button>
      </div>

      {/* Printable Report Sheet Layout */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs print:bg-white print:text-black print:border-none">
        
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 uppercase">
              IGREJA BATISTA NACIONAL EM SAPIRANGA - IBNS
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              CNPJ: 00.000.000/0001-00 • Sapiranga/RS • Pastor Presidente: Pr. Marcos Oliveira
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Competência:</span>
            <span className="font-bold text-amber-850 text-sm">Agosto de 2026</span>
          </div>
        </div>

        {/* 1. Finance Report */}
        {reportType === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total de Entradas</span>
                <span className="text-lg font-black text-emerald-700">{formatCurrency(kpis.financial.monthPaidIn)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total de Saídas Pagas</span>
                <span className="text-lg font-black text-rose-700">{formatCurrency(kpis.financial.monthPaidOut)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Superávit do Mês</span>
                <span className="text-lg font-black text-slate-900">{formatCurrency(kpis.financial.netMonthResult)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total em Reservas / Cofrinhos</span>
                <span className="text-lg font-black text-amber-800">{formatCurrency(kpis.financial.totalInvested)}</span>
              </div>
            </div>

            {/* Cost Center Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-xs">Despesas por Centro de Custos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Centro de Custos</th>
                      <th className="p-2.5">Orçamento Previsto</th>
                      <th className="p-2.5">Realizado no Mês</th>
                      <th className="p-2.5">Saldo Disponível</th>
                      <th className="p-2.5 text-right">% Executado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {costCenters.map(cc => {
                      const spent = txs.filter(t => t.costCenterId === cc.id && t.type === 'saida' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
                      const pct = cc.budgetMonthly > 0 ? ((spent / cc.budgetMonthly) * 100).toFixed(1) : '0';
                      return (
                        <tr key={cc.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{cc.name}</td>
                          <td className="p-2.5 text-slate-600">{formatCurrency(cc.budgetMonthly)}</td>
                          <td className="p-2.5 text-rose-700 font-semibold">{formatCurrency(spent)}</td>
                          <td className="p-2.5 text-emerald-700">{formatCurrency(Math.max(0, cc.budgetMonthly - spent))}</td>
                          <td className="p-2.5 text-right font-bold text-slate-700">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Members Report */}
        {reportType === 'members' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total de Membros</span>
                <span className="text-xl font-black text-slate-900">{members.length} cadastrados</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Membros Ativos em Comunhão</span>
                <span className="text-xl font-black text-emerald-700">{members.filter(m => m.status === 'Ativo').length} membros</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Crescimento no Último Trimestre</span>
                <span className="text-xl font-black text-amber-800">+12%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-xs">Distribuição Eclesiástica de Cargos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Membro Comum', 'Obreiro(a)', 'Pastor(a)', 'Diácono', 'Diaconisa', 'Evangelista', 'Presbítero'].map(role => {
                  const count = members.filter(m => m.role === role).length;
                  return (
                    <div key={role} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">{role}</span>
                      <span className="text-base font-bold text-slate-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Social Report */}
        {reportType === 'social' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Famílias Assistidas</span>
                <span className="text-xl font-black text-rose-700">{families.length} lares</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cestas Entregues Total</span>
                <span className="text-xl font-black text-emerald-700">{deliveries.length} entregas</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vidas Beneficiadas</span>
                <span className="text-xl font-black text-slate-900">{families.reduce((s, f) => s + f.membersCount, 0)} pessoas</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Missions Report */}
        {reportType === 'missions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pessoas Abordadas em Sapiranga</span>
                <span className="text-xl font-black text-cyan-700">{actions.reduce((s, a) => s + a.reachedPeopleCount, 0)} vidas</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Decisões de Fé</span>
                <span className="text-xl font-black text-emerald-700">{actions.reduce((s, a) => s + a.decisionsCount, 0)} conversões</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Campos Missionários Ativos</span>
                <span className="text-xl font-black text-amber-800">{missionaries.length} campos</span>
              </div>
            </div>
          </div>
        )}

        {/* Signatures Area for General Assembly / Council */}
        <div className="pt-8 mt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-slate-400 w-48 mx-auto mb-1" />
            <p className="font-bold text-slate-900">Pr. Marcos Oliveira</p>
            <p className="text-slate-500 text-[10px]">Pastor Presidente - IBNS</p>
          </div>
          <div>
            <div className="border-t border-slate-400 w-48 mx-auto mb-1" />
            <p className="font-bold text-slate-900">Diác. Paulo Silva</p>
            <p className="text-slate-500 text-[10px]">Tesoureiro / Conselho Fiscal</p>
          </div>
        </div>

      </div>

    </div>
  );
};
