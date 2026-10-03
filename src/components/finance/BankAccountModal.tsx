import React, { useState, useEffect } from 'react';
import { X, Building2, Wallet, Check, Trash2 } from 'lucide-react';
import { BankAccount } from '../../types';
import { db } from '../../services/db';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: BankAccount | null;
}

const PRESET_COLORS = [
  '#F97316', // Laranja (Inter)
  '#16A34A', // Verde (Sicredi / Sicoob)
  '#3B82F6', // Azul (Caixa / BB)
  '#8B5CF6', // Roxo (Nubank)
  '#E11D48', // Vermelho (Bradesco / Santander)
  '#64748B', // Cinza / Slate
  '#0D9488', // Teal
  '#D97706'  // Âmbar
];

export const BankAccountModal: React.FC<BankAccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit
}) => {
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    name: '',
    type: 'Conta Corrente',
    bankName: '',
    agency: '',
    accountNumber: '',
    initialBalance: 0,
    currentBalance: 0,
    color: '#F97316'
  });

  useEffect(() => {
    if (accountToEdit) {
      setFormData(accountToEdit);
    } else {
      setFormData({
        id: `acc-${Date.now()}`,
        name: '',
        type: 'Conta Digital',
        bankName: '',
        agency: '',
        accountNumber: '',
        initialBalance: 0,
        currentBalance: 0,
        color: '#F97316'
      });
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.bankName?.trim()) {
      alert('Por favor, informe o nome descritivo e a instituição bancária.');
      return;
    }

    const newAcc: BankAccount = {
      id: formData.id || `acc-${Date.now()}`,
      name: formData.name.trim(),
      type: (formData.type as any) || 'Conta Corrente',
      bankName: formData.bankName.trim(),
      agency: formData.agency?.trim() || '',
      accountNumber: formData.accountNumber?.trim() || '',
      initialBalance: Number(formData.initialBalance) || 0,
      currentBalance: Number(formData.currentBalance ?? formData.initialBalance) || 0,
      color: formData.color || '#F97316'
    };

    db.saveBankAccount(newAcc);
    onClose();
  };

  const handleDelete = () => {
    if (accountToEdit && confirm(`Tem certeza que deseja excluir a conta "${accountToEdit.name}"?`)) {
      db.deleteBankAccount(accountToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Tesouraria
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                {accountToEdit ? 'Editar Conta / Caixa' : 'Nova Conta Bancária ou Caixa'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Nome da Conta / Identificação *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Banco Inter - Principal, Caixa Físico da Secretaria"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tipo de Conta</label>
              <select
                value={formData.type || 'Conta Corrente'}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              >
                <option value="Conta Digital">Conta Digital (Inter, Nubank, C6)</option>
                <option value="Conta Corrente">Conta Corrente Tradicional</option>
                <option value="Caixa Físico">Caixa Físico / Espécie (Secretaria)</option>
                <option value="Poupança">Poupança</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Instituição Bancária *</label>
              <input
                type="text"
                required
                value={formData.bankName || ''}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Ex: Banco Inter S.A., Sicredi, Caixa"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Agência</label>
              <input
                type="text"
                value={formData.agency || ''}
                onChange={e => setFormData({ ...formData, agency: e.target.value })}
                placeholder="Ex: 0001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Número da Conta</label>
              <input
                type="text"
                value={formData.accountNumber || ''}
                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Ex: 1489201-9"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Saldo Inicial (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.initialBalance ?? 0}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    initialBalance: val,
                    currentBalance: accountToEdit ? formData.currentBalance : val
                  });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Cor de Identificação</label>
              <div className="flex items-center gap-2 pt-1">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${formData.color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            {accountToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Conta</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Conta</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
