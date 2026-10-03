import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle2, FileText, FolderArchive, ShieldCheck, Calendar } from 'lucide-react';
import { db } from '../../services/db';

interface AccountingExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  hideSensitiveData: boolean;
}

export const AccountingExportModal: React.FC<AccountingExportModalProps> = ({
  isOpen,
  onClose,
  hideSensitiveData
}) => {
  const today = new Date();
  const defaultYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(defaultYearMonth);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const txs = db.getTransactions().filter(t => t.date.startsWith(selectedMonth) || t.dueDate.startsWith(selectedMonth));
  const totalIn = txs.filter(t => t.type === 'entrada' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => t.type === 'saida' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
  const balance = totalIn - totalOut;

  let totalAttachments = 0;
  txs.forEach(t => {
    if (t.attachments) totalAttachments += t.attachments.length;
  });

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      const blob = await db.exportAccountingZip(selectedMonth);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pacote_Contabil_IBNS_Sapiranga_${selectedMonth}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err) {
      console.error('Error exporting zip:', err);
      alert('Erro ao gerar pacote contábil. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              Prestação de Contas Mensal
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-emerald-600" />
              Exportar Pacote Contábil (ZIP) para o Contador
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <p className="text-slate-600">
            Gere o pacote oficial de fechamento da <strong className="text-slate-900">IBNS - Igreja Batista Nacional em Sapiranga</strong> contendo o balancete completo com receitas, despesas, centros de custos, status das contas e todas as Notas Fiscais e Recibos anexados organizados por código de lançamento.
          </p>

          {/* Month selector */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Competência Contábil:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => {
                  setSelectedMonth(e.target.value);
                  setDownloadSuccess(false);
                }}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Lançamentos no Mês:</span>
              <span className="text-base font-extrabold text-slate-900">{txs.length} registros</span>
            </div>
          </div>

          {/* Monthly Breakdown Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <span className="text-[11px] text-emerald-800 font-medium block">Receitas Realizadas</span>
              <span className="text-base font-black text-emerald-700">{formatCurrency(totalIn)}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <span className="text-[11px] text-rose-800 font-medium block">Despesas Pagas</span>
              <span className="text-base font-black text-rose-700">{formatCurrency(totalOut)}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block">Superávit / Resultado</span>
              <span className={`text-base font-black ${balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          {/* Package Architecture Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              O arquivo .ZIP conterá:
            </h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">1.</span>
                <span><code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">Relatorio_Contabil_IBNS_{selectedMonth}.txt</code> com fluxo total, DRE e centros de custo.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">2.</span>
                <span>Pasta <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">Comprovantes_e_Notas_Fiscais/</code> contendo <strong>{totalAttachments} documentos</strong> nomeados padronizadamente como <code className="text-emerald-700 font-semibold">LANC-00XXX_SAIDA_NotaFiscal.pdf</code>.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">3.</span>
                <span><code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">LEIA-ME_CONTABILIDADE.txt</code> com instruções e assinatura digital.</span>
              </li>
            </ul>
          </div>

          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl flex items-center gap-2.5 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Pacote ZIP baixado com sucesso! Arquivo pronto para envio ao escritório de contabilidade.</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Gerando Pacote ZIP...' : 'Baixar Pacote Contábil (.ZIP)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
