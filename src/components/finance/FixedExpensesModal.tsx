import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Clock, Building, Calendar, DollarSign } from 'lucide-react';
import { FixedExpense, ExpenseCategory } from '../../types';
import { db } from '../../services/db';

interface FixedExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hideSensitiveData: boolean;
}

export const FixedExpensesModal: React.FC<FixedExpensesModalProps> = ({
  isOpen,
  onClose,
  hideSensitiveData
}) => {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(db.getFixedExpenses());
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<FixedExpense>>({
    name: '',
    amount: 0,
    dueDay: 10,
    category: 'Aluguel / Manutenção do Templo',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    supplier: '',
    autoGenerateMonthly: true,
    active: true
  });

  const costCenters = db.getCostCenters();
  const accounts = db.getBankAccounts();

  if (!isOpen) return null;

  const handleOpenNew = () => {
    setCurrentExpense({
      id: `fix-${Date.now()}`,
      name: '',
      amount: 0,
      dueDay: 10,
      category: 'Aluguel / Manutenção do Templo',
      costCenterId: costCenters[0]?.id || 'cc-1',
      accountId: accounts[0]?.id || 'acc-1',
      supplier: '',
      autoGenerateMonthly: true,
      active: true
    });
    setIsEditing(true);
  };

  const handleEdit = (item: FixedExpense) => {
    setCurrentExpense({ ...item });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      db.deleteFixedExpense(id);
      setFixedExpenses(db.getFixedExpenses());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExpense.name || !currentExpense.amount || currentExpense.amount <= 0) {
      alert('Preencha o nome e um valor válido.');
      return;
    }

    db.saveFixedExpense(currentExpense as FixedExpense);
    setFixedExpenses(db.getFixedExpenses());
    setIsEditing(false);
  };

  const totalMonthly = fixedExpenses.filter(f => f.active).reduce((s, f) => s + f.amount, 0);

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Contas Recorrentes
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              Despesas Fixas Mensais da IBNS Sapiranga
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Summary Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 font-medium">Comprometimento Mensal em Contas Fixas:</p>
              <p className="text-xl font-black text-rose-700">{formatCurrency(totalMonthly)} / mês</p>
            </div>
            {!isEditing && (
              <button
                onClick={handleOpenNew}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Despesa Fixa</span>
              </button>
            )}
          </div>

          {/* Form when editing/creating */}
          {isEditing && (
            <form onSubmit={handleSave} className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-amber-800 mb-2">
                {currentExpense.id?.startsWith('fix-') && fixedExpenses.some(f => f.id === currentExpense.id) ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nome da Despesa / Conta *</label>
                  <input
                    type="text"
                    required
                    value={currentExpense.name || ''}
                    onChange={e => setCurrentExpense(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Aluguel do Templo, RGE Energia, Água Corsan"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Valor Estimado (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentExpense.amount || ''}
                    onChange={e => setCurrentExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dia do Vencimento (1 a 31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={currentExpense.dueDay || 10}
                    onChange={e => setCurrentExpense(prev => ({ ...prev, dueDay: parseInt(e.target.value) || 10 }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Centro de Custos</label>
                  <select
                    value={currentExpense.costCenterId || ''}
                    onChange={e => setCurrentExpense(prev => ({ ...prev, costCenterId: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    {costCenters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fornecedor / Favorecido</label>
                  <input
                    type="text"
                    value={currentExpense.supplier || ''}
                    onChange={e => setCurrentExpense(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Ex: RGE Sul, Imobiliária, Corsan"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  Salvar Despesa
                </button>
              </div>
            </form>
          )}

          {/* List of Fixed Expenses */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-700">Despesas Cadastradas:</p>
            {fixedExpenses.map(item => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200">
                      Dia {item.dueDay} de cada mês
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fornecedor: {item.supplier || 'N/A'} • Categoria: {item.category}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-rose-700">
                    {formatCurrency(item.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
