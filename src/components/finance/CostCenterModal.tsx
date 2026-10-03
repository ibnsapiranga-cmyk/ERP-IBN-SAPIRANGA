import React, { useState, useEffect } from 'react';
import { X, Layers, Check, Trash2 } from 'lucide-react';
import { CostCenter } from '../../types';
import { db } from '../../services/db';

interface CostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  costCenterToEdit?: CostCenter | null;
}

const PRESET_COLORS = [
  '#64748B', // Slate (Administrativo)
  '#8B5CF6', // Roxo (Pastoral)
  '#EF4444', // Vermelho (Missões)
  '#F59E0B', // Âmbar (Ação Social)
  '#06B6D4', // Ciano (Louvor)
  '#EC4899', // Rosa (Infantil)
  '#10B981', // Verde (Jovens)
  '#F97316', // Laranja (Obras / Patrimônio)
  '#3B82F6'  // Azul (Geral)
];

export const CostCenterModal: React.FC<CostCenterModalProps> = ({
  isOpen,
  onClose,
  costCenterToEdit
}) => {
  const [formData, setFormData] = useState<Partial<CostCenter>>({
    name: '',
    budgetMonthly: 1000,
    color: '#64748B',
    iconName: 'Building2'
  });

  useEffect(() => {
    if (costCenterToEdit) {
      setFormData(costCenterToEdit);
    } else {
      setFormData({
        id: `cc-${Date.now()}`,
        name: '',
        budgetMonthly: 2000,
        color: '#64748B',
        iconName: 'Building2'
      });
    }
  }, [costCenterToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Por favor, informe o nome do centro de custo.');
      return;
    }

    const newCC: CostCenter = {
      id: formData.id || `cc-${Date.now()}`,
      name: formData.name.trim(),
      budgetMonthly: Number(formData.budgetMonthly) || 0,
      color: formData.color || '#64748B',
      iconName: formData.iconName || 'Building2'
    };

    db.saveCostCenter(newCC);
    onClose();
  };

  const handleDelete = () => {
    if (costCenterToEdit && confirm(`Tem certeza que deseja excluir o centro de custo "${costCenterToEdit.name}"?`)) {
      db.deleteCostCenter(costCenterToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Orçamento
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                {costCenterToEdit ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Nome do Centro de Custo / Ministério *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Louvor & Multimídia, Missões, Obras do Templo"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Orçamento Mensal Previsto (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.budgetMonthly ?? 0}
              onChange={e => setFormData({ ...formData, budgetMonthly: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Limite planejado para gastos mensais deste ministério / setor da igreja.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Cor do Gráfico e Indicadores</label>
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            {costCenterToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
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
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
