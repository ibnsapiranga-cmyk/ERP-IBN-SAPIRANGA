import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';
import { db } from '../../services/db';

interface CategoriesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'entrada' | 'saida';
}

export const CategoriesManagerModal: React.FC<CategoriesManagerModalProps> = ({
  isOpen,
  onClose,
  initialType = 'entrada'
}) => {
  const [activeTab, setActiveTab] = useState<'entrada' | 'saida'>(initialType);
  const [entryCategories, setEntryCategories] = useState<string[]>(db.getEntryCategories());
  const [expenseCategories, setExpenseCategories] = useState<string[]>(db.getExpenseCategories());
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (activeTab === 'entrada') {
      db.saveEntryCategory(newCategoryName);
      setEntryCategories(db.getEntryCategories());
    } else {
      db.saveExpenseCategory(newCategoryName);
      setExpenseCategories(db.getExpenseCategories());
    }
    setNewCategoryName('');
  };

  const handleDelete = (name: string) => {
    if (confirm(`Deseja remover a categoria "${name}"?`)) {
      if (activeTab === 'entrada') {
        db.deleteEntryCategory(name);
        setEntryCategories(db.getEntryCategories());
      } else {
        db.deleteExpenseCategory(name);
        setExpenseCategories(db.getExpenseCategories());
      }
    }
  };

  const currentList = activeTab === 'entrada' ? entryCategories : expenseCategories;

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Plano de Contas
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Gerenciar Categorias Financeiras
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('entrada')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'entrada' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Categorias de Entrada ({entryCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saida')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'saida' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Categorias de Despesa ({expenseCategories.length})</span>
          </button>
        </div>

        {/* Add Category Form */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder={`Nova categoria de ${activeTab === 'entrada' ? 'receita / dízimo / oferta' : 'despesa / conta'}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
          {currentList.length === 0 ? (
            <p className="text-center text-slate-400 py-6">Nenhuma categoria cadastrada.</p>
          ) : (
            currentList.map((cat, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-amber-300 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeTab === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-slate-900">{cat}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Excluir Categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
