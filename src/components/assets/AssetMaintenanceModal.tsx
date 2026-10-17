import React, { useState } from 'react';
import { X, Wrench, Save, DollarSign, Calendar, UserCheck } from 'lucide-react';
import { db } from '../../services/db';
import { ChurchAsset } from '../../types';

interface AssetMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ChurchAsset;
  onSuccess?: () => void;
}

export const AssetMaintenanceModal: React.FC<AssetMaintenanceModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess
}) => {
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [provider, setProvider] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Informe a descrição do serviço de manutenção realizado.');
      return;
    }

    const costNum = parseFloat(cost.replace(/\./g, '').replace(',', '.')) || 0;

    db.addAssetMaintenance(asset.id, {
      description: description.trim(),
      cost: costNum,
      date,
      provider: provider.trim() || undefined,
      performedBy: performedBy.trim() || 'Equipe de Manutenção IBNS',
      notes: notes.trim() || undefined
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Registrar Manutenção / Reparo
              </h2>
              <p className="text-xs text-slate-500">
                {asset.code} - {asset.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Descrição do Reparo / Manutenção Preventiva *
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Troca de faders, higienização interna e calibração"
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Custo do Reparo (R$)
              </label>
              <input
                type="text"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0,00"
                className="w-full font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Data do Serviço *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Oficina / Assistência Técnica
              </label>
              <input
                type="text"
                value={provider}
                onChange={e => setProvider(e.target.value)}
                placeholder="Ex: ÁudioTech Sapiranga"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Responsável pelo Acompanhamento
              </label>
              <input
                type="text"
                value={performedBy}
                onChange={e => setPerformedBy(e.target.value)}
                placeholder="Ex: Diácono Marcos / Zeladoria"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Observações / Garantia do Reparo
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Garantia do serviço de 90 dias com Nota Fiscal 1234."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Maintenance History */}
          {asset.maintenanceHistory && asset.maintenanceHistory.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <h3 className="font-bold text-slate-900 mb-2">Manutenções Anteriores</h3>
              <div className="space-y-1.5">
                {asset.maintenanceHistory.map(maint => (
                  <div key={maint.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{maint.description}</span>
                      <div className="text-[10px] text-slate-500">
                        {new Date(maint.date).toLocaleDateString('pt-BR')} &bull; {maint.provider || 'Interno'} &bull; {maint.performedBy}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      R$ {maint.cost.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Gravar Manutenção</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
