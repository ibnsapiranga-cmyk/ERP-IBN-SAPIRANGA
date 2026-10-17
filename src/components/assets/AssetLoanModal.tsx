import React, { useState } from 'react';
import { X, Save, Handshake, Calendar, User, Phone, CheckCircle2, RotateCcw } from 'lucide-react';
import { db } from '../../services/db';
import { ChurchAsset } from '../../types';

interface AssetLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ChurchAsset;
  onSuccess?: () => void;
}

export const AssetLoanModal: React.FC<AssetLoanModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess
}) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [borrowerRole, setBorrowerRole] = useState('Líder de Ministério');
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!borrowerName.trim()) {
      alert('Informe o nome do responsável pelo empréstimo.');
      return;
    }

    db.addAssetLoan(asset.id, {
      borrowerName: borrowerName.trim(),
      borrowerPhone: borrowerPhone.trim(),
      borrowerRole: borrowerRole.trim(),
      loanDate: new Date().toISOString().split('T')[0],
      expectedReturnDate,
      purpose: purpose.trim() || 'Uso institucional / Evento da Igreja',
      notes: notes.trim() || undefined
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  const activeLoan = asset.loansHistory?.find(l => l.status === 'ativo');

  const handleReturnLoan = (loanId: string) => {
    if (confirm('Confirmar a devolução deste equipamento para o patrimônio da igreja?')) {
      db.returnAssetLoan(asset.id, loanId);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Termo de Cautela & Empréstimo
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Active loan warning/actions if currently borrowed */}
          {activeLoan ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span>Equipamento atualmente emprestado:</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div>Responsável: <strong>{activeLoan.borrowerName}</strong> ({activeLoan.borrowerRole})</div>
                <div>Telefone/WhatsApp: <strong>{activeLoan.borrowerPhone || 'Não informado'}</strong></div>
                <div>Data do Empréstimo: <strong>{new Date(activeLoan.loanDate).toLocaleDateString('pt-BR')}</strong></div>
                <div>Previsão de Devolução: <strong>{new Date(activeLoan.expectedReturnDate).toLocaleDateString('pt-BR')}</strong></div>
                {activeLoan.purpose && <div>Finalidade: <em>{activeLoan.purpose}</em></div>}
              </div>

              <button
                type="button"
                onClick={() => handleReturnLoan(activeLoan.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Devolução ao Templo</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Solicitante / Responsável *
                </label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={e => setBorrowerName(e.target.value)}
                  placeholder="Ex: Pr. Auxiliar / Diácono Carlos"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={borrowerPhone}
                    onChange={e => setBorrowerPhone(e.target.value)}
                    placeholder="(51) 99999-9999"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ministério / Função
                  </label>
                  <input
                    type="text"
                    value={borrowerRole}
                    onChange={e => setBorrowerRole(e.target.value)}
                    placeholder="Ex: Ministério de Louvor"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Data Prevista de Devolução *
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={e => setExpectedReturnDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo / Finalidade do Empréstimo
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="Ex: Ensaio no Anexo / Evento Evangelístico na Praça"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observações / Termo de Responsabilidade
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Acondicionado com cabos originais e fonte de alimentação."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Emitir Cautela</span>
                </button>
              </div>

            </form>
          )}

          {/* Historical Loans */}
          {asset.loansHistory && asset.loansHistory.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <h3 className="font-bold text-slate-900 mb-2">Histórico de Empréstimos Anteriores</h3>
              <div className="space-y-1.5">
                {asset.loansHistory.map(loan => (
                  <div key={loan.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{loan.borrowerName}</span> ({loan.borrowerRole})
                      <div className="text-[10px] text-slate-500">
                        {new Date(loan.loanDate).toLocaleDateString('pt-BR')} até {loan.returnedDate ? new Date(loan.returnedDate).toLocaleDateString('pt-BR') : 'Devolução pendente'}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                      loan.status === 'devolvido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
