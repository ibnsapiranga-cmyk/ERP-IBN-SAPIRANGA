import React, { useState } from 'react';
import { PiggyBank, TrendingUp, Plus, Edit2, Trash2, ShieldCheck, Check, Sparkles, Building2, Globe } from 'lucide-react';
import { InvestmentAccount } from '../../types';
import { db } from '../../services/db';

interface InvestmentsManagerProps {
  hideSensitiveData: boolean;
}

export const InvestmentsManager: React.FC<InvestmentsManagerProps> = ({ hideSensitiveData }) => {
  const [investments, setInvestments] = useState<InvestmentAccount[]>(db.getInvestments());
  const [isEditing, setIsEditing] = useState(false);
  const [currentInv, setCurrentInv] = useState<Partial<InvestmentAccount>>({
    institution: 'Nubank (Caixinha)',
    name: '',
    type: 'Cofrinho Reserva Emergência',
    initialAmount: 0,
    currentAmount: 0,
    yieldRate: '100% do CDI',
    lastYieldMonth: 0,
    purpose: ''
  });

  const handleOpenNew = () => {
    setCurrentInv({
      id: `inv-${Date.now()}`,
      institution: 'Nubank (Caixinha)',
      name: '',
      type: 'Cofrinho Reserva Emergência',
      initialAmount: 0,
      currentAmount: 0,
      yieldRate: '100% do CDI',
      lastYieldMonth: 0,
      purpose: ''
    });
    setIsEditing(true);
  };

  const handleEdit = (inv: InvestmentAccount) => {
    setCurrentInv({ ...inv });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este investimento do controle?')) {
      db.deleteInvestment(id);
      setInvestments(db.getInvestments());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInv.name || (currentInv.currentAmount === undefined)) {
      alert('Preencha o nome do fundo/investimento e o valor.');
      return;
    }

    db.saveInvestment(currentInv as InvestmentAccount);
    setInvestments(db.getInvestments());
    setIsEditing(false);
  };

  const totalInvested = investments.reduce((s, i) => s + i.currentAmount, 0);
  const totalYieldMonth = investments.reduce((s, i) => s + i.lastYieldMonth, 0);

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Header & Total Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Investimentos, Cofrinhos Digitais & Reservas Especiais
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de reservas em CDBs, Caixinhas de bancos digitais e fundos de construção da IBNS Sapiranga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total em Reservas</span>
            <span className="text-lg font-black text-amber-800">{formatCurrency(totalInvested)}</span>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Rendimento Estimado / Mês</span>
            <span className="text-lg font-black text-emerald-700">+{formatCurrency(totalYieldMonth)}</span>
          </div>
          <button
            onClick={handleOpenNew}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Fundo / Cofrinho</span>
          </button>
        </div>
      </div>

      {/* Form modal/inline */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white border border-amber-300 rounded-2xl p-4 text-xs space-y-3 shadow-xs">
          <h4 className="font-bold text-amber-800 text-sm">
            {investments.some(i => i.id === currentInv.id) ? 'Atualizar Saldo / Dados do Investimento' : 'Novo Investimento / Cofrinho'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Instituição Bancária *</label>
              <input
                type="text"
                required
                value={currentInv.institution || ''}
                onChange={e => setCurrentInv(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Ex: Nubank Cofrinho, Banco Inter, Sicredi"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nome da Reserva / Finalidade *</label>
              <input
                type="text"
                required
                value={currentInv.name || ''}
                onChange={e => setCurrentInv(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Fundo Construção Novo Templo, Reserva de Emergência"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Modalidade</label>
              <select
                value={currentInv.type || 'Cofrinho Reserva Emergência'}
                onChange={e => setCurrentInv(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              >
                <option value="Cofrinho Reserva Emergência">Cofrinho Reserva de Emergência</option>
                <option value="Fundo Construção do Templo">Fundo de Construção do Templo</option>
                <option value="CDB Liquidez Diária">CDB Liquidez Diária (100% CDI)</option>
                <option value="CDB Fundo Missionário">CDB Fundo Missionário</option>
                <option value="LCI/LCA">LCI / LCA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Saldo Atual (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={currentInv.currentAmount || ''}
                onChange={e => setCurrentInv(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Taxa de Rendimento</label>
              <input
                type="text"
                value={currentInv.yieldRate || ''}
                onChange={e => setCurrentInv(prev => ({ ...prev, yieldRate: e.target.value }))}
                placeholder="Ex: 100% do CDI, 102% do CDI"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Rendimento no Último Mês (R$)</label>
              <input
                type="number"
                step="0.01"
                value={currentInv.lastYieldMonth || ''}
                onChange={e => setCurrentInv(prev => ({ ...prev, lastYieldMonth: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Destinação / Descrição da Meta</label>
            <input
              type="text"
              value={currentInv.purpose || ''}
              onChange={e => setCurrentInv(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Ex: Recursos acumulados para compra de cadeiras e reforma da fachada do templo"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs transition-colors"
            >
              Salvar Investimento
            </button>
          </div>
        </form>
      )}

      {/* Grid of Investment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {investments.map(inv => (
          <div
            key={inv.id}
            className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {inv.institution}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(inv)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title="Editar Saldo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{inv.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{inv.type}</p>

              <div className="my-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Saldo Acumulado:</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(inv.currentAmount)}</span>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 mt-1 font-semibold">
                  <span>Rendimento: {inv.yieldRate}</span>
                  <span>+{formatCurrency(inv.lastYieldMonth)}/mês</span>
                </div>
              </div>

              {inv.purpose && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{inv.purpose}"
                </p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Atualizado em: {new Date(inv.updatedAt).toLocaleDateString('pt-BR')}</span>
              <span className="text-amber-800 font-semibold">Reserva Protegida ✓</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
