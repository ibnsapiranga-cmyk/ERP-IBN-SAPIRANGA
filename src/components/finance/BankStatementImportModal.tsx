import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Tag,
  HelpCircle,
  Zap,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db, ParsedStatementItem } from '../../services/db';
import { BankAccount } from '../../types';

interface BankStatementImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const BankStatementImportModal: React.FC<BankStatementImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const accounts = db.getBankAccounts();
  const members = db.getMembers().filter(m => m.status === 'Ativo');
  const entryCategories = db.getEntryCategories();
  const expenseCategories = db.getExpenseCategories();

  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [fileFormat, setFileFormat] = useState<'OFX' | 'CSV' | 'XLSX' | 'PDF'>('OFX');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [rawContent, setRawContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedStatementItem[]>([]);
  const [importResult, setImportResult] = useState<{ importedCount: number } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const lower = file.name.toLowerCase();

    if (lower.endsWith('.ofx')) {
      setFileFormat('OFX');
      setFileBase64('');
      setMimeType('text/plain');
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRawContent(ev.target?.result as string || '');
      };
      reader.readAsText(file);
    } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      setFileFormat('XLSX');
      setFileBase64('');
      setMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const buffer = ev.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
          setRawContent(csvText);
        } catch (err) {
          console.error('Erro ao ler XLSX:', err);
          alert('Não foi possível ler o arquivo Excel. Verifique o formato.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (lower.endsWith('.pdf')) {
      setFileFormat('PDF');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const b64 = dataUrl.split(',')[1] || '';
        setFileBase64(b64);
        setMimeType('application/pdf');
        setRawContent(`[DOCUMENTO EXTRATO PDF: ${file.name} - Tamanho: ${Math.round(file.size / 1024)} KB. Pronto para leitura inteligente e conciliação com IA.]`);
      };
      reader.readAsDataURL(file);
    } else {
      // Default to CSV
      setFileFormat('CSV');
      setFileBase64('');
      setMimeType('text/csv');
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRawContent(ev.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const handleSampleLoad = (fmt: 'OFX' | 'CSV' | 'XLSX' | 'PDF') => {
    setFileFormat(fmt);
    const todayStr = new Date().toISOString().split('T')[0];
    const dateDigits = new Date().toISOString().replace(/\D/g, '').substring(0, 8);

    if (fmt === 'CSV') {
      const sampleCsv = `Data;Descricao;Valor
${todayStr};PIX TRANSF MARCOS OLIVEIRA;750.00
${todayStr};PIX RECEBIDO JOAO PEDRO SILVA;35.00
${todayStr};COMPRA NO DEBITO POSTO IPIRANGA SAPIRANGA;-240.00
${todayStr};COMPRA NO DEBITO SUPERMERCADO RISSUL CESTAS;-680.50
${todayStr};PAGTO BOLETO ALUGUEL DO TEMPLO;-3200.00
${todayStr};PAGTO BOLETO RGE ENERGIA;-980.20
${todayStr};PIX RECEBIDO OFERTA VOLUNTARIA;45.00
${todayStr};DEBITO AUTOMATICO TARIFA BANCARIA CESTA;-48.90`;
      setRawContent(sampleCsv);
      setFileBase64('');
      setFileName('extrato_sicredi_ibns_exemplo.csv');
    } else if (fmt === 'XLSX') {
      const sampleExcelData = `Data;Historico / Lancamento;Documento;Valor
${todayStr};PIX TRANSF MARCOS OLIVEIRA;PIX-8921;750.00
${todayStr};PIX RECEBIDO DOACAO CULTO;PIX-8922;50.00
${todayStr};COMPRA NO DEBITO POSTO IPIRANGA;DEB-4102;-240.00
${todayStr};COMPRA NO DEBITO SUPERMERCADO RISSUL;DEB-4103;-680.50
${todayStr};PAGTO BOLETO ALUGUEL TEMPLO;BOL-0912;-3200.00
${todayStr};PAGTO BOLETO RGE ENERGIA;BOL-0913;-980.20`;
      setRawContent(sampleExcelData);
      setFileBase64('');
      setFileName('extrato_bancario_sicredi_ibns.xlsx');
    } else if (fmt === 'PDF') {
      const samplePdfText = `SICREDI - EXTRATO DE CONTA CORRENTE
Cooperativa: 0167 / Conta: 84920-1 - IGREJA BATISTA NACIONAL EM SAPIRANGA
Período: Mês Atual

DATA       HISTÓRICO                                      VALOR (R$)
${todayStr}  PIX RECEBIDO PR MARCOS OLIVEIRA                +750,00
${todayStr}  PIX RECEBIDO OFERTA JOAO SILVA                 +35,00
${todayStr}  COMPRA NO DEBITO POSTO IPIRANGA SAPIRANGA      -240,00
${todayStr}  COMPRA NO DEBITO SUPERMERCADO RISSUL CESTAS    -680,50
${todayStr}  PAGTO BOLETO ALUGUEL DO TEMPLO                 -3.200,00
${todayStr}  PAGTO BOLETO RGE ENERGIA ELÉTRICA              -980,20
${todayStr}  DEBITO AUTOMATICO TARIFA CESTA RELACIONAMENTO  -48,90`;
      setRawContent(samplePdfText);
      setFileBase64('');
      setFileName('extrato_sicredi_oficial_ibns.pdf');
    } else {
      const sampleOfx = `OFXHEADER:100
DATA:OFXSGML
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>${dateDigits}
<TRNAMT>750.00
<MEMO>PIX TRANSF MARCOS OLIVEIRA
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>${dateDigits}
<TRNAMT>40.00
<MEMO>PIX RECEBIDO DOACAO CULTO
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>${dateDigits}
<TRNAMT>-240.00
<MEMO>COMPRA NO DEBITO POSTO IPIRANGA SAPIRANGA
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>${dateDigits}
<TRNAMT>-680.50
<MEMO>COMPRA NO DEBITO SUPERMERCADO RISSUL
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>${dateDigits}
<TRNAMT>-3200.00
<MEMO>PAGTO BOLETO ALUGUEL DO TEMPLO
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
      setRawContent(sampleOfx);
      setFileBase64('');
      setFileName('extrato_sicredi_ibns_exemplo.ofx');
    }
  };

  const handleAnalyzeWithAi = async () => {
    if (!rawContent.trim() && !fileBase64) {
      alert('Por favor, selecione um arquivo de extrato (CSV, XLSX, PDF ou OFX) ou cole o texto do extrato.');
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await db.reconcileWithAi(rawContent, selectedAccountId, fileFormat, fileBase64, mimeType);
      if (result.items.length === 0) {
        alert('Nenhuma movimentação foi detectada no extrato.');
        setIsAiLoading(false);
        return;
      }
      setParsedItems(result.items);
      setAiSource(result.source);
      setStep('review');
    } catch (err) {
      console.error('Error in AI reconciliation:', err);
      const items = db.parseStatementForReview(rawContent, selectedAccountId, fileFormat);
      setParsedItems(items);
      setStep('review');
    } finally {
      setIsAiLoading(false);
    }
  };
    }
  };

  const handleAnalyze = () => {
    handleAnalyzeWithAi();
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setParsedItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const handleToggleItem = (tempId: string) => {
    setParsedItems(prev => prev.map(item => 
      item.tempId === tempId ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleUpdateItemCategory = (tempId: string, category: string) => {
    setParsedItems(prev => prev.map(item => {
      if (item.tempId === tempId) {
        let suggestedType = item.suggestedType;
        if (category === 'Dízimo') suggestedType = 'dizimo';
        else if (category.includes('Oferta')) suggestedType = 'oferta';
        return { ...item, category, suggestedType };
      }
      return item;
    }));
  };

  const handleUpdateItemMember = (tempId: string, memberId: string) => {
    setParsedItems(prev => prev.map(item => {
      if (item.tempId === tempId) {
        if (!memberId) {
          return { ...item, matchedMember: undefined, donorType: 'anonimo', donorName: undefined };
        }
        const m = members.find(mbr => mbr.id === memberId);
        return {
          ...item,
          matchedMember: m,
          donorType: 'membro',
          donorName: m?.fullName
        };
      }
      return item;
    }));
  };

  const handleUpdateItemDonorType = (tempId: string, donorType: any) => {
    setParsedItems(prev => prev.map(item => {
      if (item.tempId === tempId) {
        return { ...item, donorType };
      }
      return item;
    }));
  };

  const handleConfirmImport = () => {
    const selected = parsedItems.filter(i => i.selected);
    if (selected.length === 0) {
      alert('Selecione pelo menos um lançamento para importar.');
      return;
    }

    const count = db.confirmImportStatement(parsedItems, selectedAccountId);
    setImportResult({ importedCount: count });
    if (onImportSuccess) onImportSuccess();
  };

  const selectedCount = parsedItems.filter(i => i.selected).length;
  const pixCount = parsedItems.filter(i => i.isPix).length;
  const tithesCount = parsedItems.filter(i => i.category === 'Dízimo').length;
  const offeringsCount = parsedItems.filter(i => i.category.includes('Oferta')).length;
  const totalAmountSelected = parsedItems
    .filter(i => i.selected)
    .reduce((sum, i) => sum + (i.type === 'entrada' ? i.amount : -i.amount), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Conciliação Inteligente
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {step === 'upload' ? 'Passo 1 de 2: Seleção do Extrato' : 'Passo 2 de 2: Análise & Classificação'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                Importação e Análise de Extrato Bancário
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {step === 'upload' ? (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            
            {/* Explanatory Rule Banner */}
            <div className="bg-amber-50/90 border border-amber-200/90 p-3.5 rounded-xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">Regras de Análise Automática Aplicadas:</h4>
                <ul className="list-disc list-inside text-[11px] text-slate-600 mt-1 space-y-0.5">
                  <li><strong>Pix &lt; R$ 50,00:</strong> Classificado automaticamente como <span className="text-amber-800 font-bold">Oferta Voluntária</span>.</li>
                  <li><strong>Pix &ge; R$ 50,00:</strong> Classificado automaticamente como <span className="text-emerald-800 font-bold">Dízimo</span>.</li>
                  <li><strong>Matching com Membros:</strong> O sistema cruza os nomes e CPFs das descrições do Pix com os membros ativos da IBNS.</li>
                  <li>Todas as classificações podem ser ajustadas ou confirmadas no próximo passo antes do lançamento no caixa.</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Conta Bancária de Destino</label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Formato do Arquivo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFileFormat('OFX')}
                    className={`py-2.5 rounded-xl font-extrabold transition-all ${fileFormat === 'OFX' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                  >
                    OFX (Bancário)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileFormat('CSV')}
                    className={`py-2.5 rounded-xl font-extrabold transition-all ${fileFormat === 'CSV' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                  >
                    CSV / Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-500/80 rounded-2xl p-6 text-center bg-slate-50 transition-colors">
              <Upload className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-extrabold text-slate-900">Selecione o arquivo de extrato bancário (.ofx ou .csv)</p>
              <p className="text-xs text-slate-500 mt-0.5">Compatível com Banco Inter, Sicredi, Nubank, Caixa, BB, etc.</p>

              <label className="inline-block mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-colors">
                Buscar Arquivo no Computador
                <input
                  type="file"
                  accept=".ofx,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {fileName && (
                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800 font-bold">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>

            {/* Load Sample Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-slate-500">
              <span className="text-[11px]">Deseja testar a análise inteligente agora?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSampleLoad('CSV')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-amber-900 font-bold text-[11px] transition-colors"
                >
                  Carregar Exemplo CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleLoad('OFX')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-amber-900 font-bold text-[11px] transition-colors"
                >
                  Carregar Exemplo OFX
                </button>
              </div>
            </div>

            {/* Raw Content Preview (optional) */}
            {rawContent && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Prévia do Conteúdo Carregado:</label>
                <textarea
                  value={rawContent}
                  onChange={e => setRawContent(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono text-[11px] text-slate-800"
                />
              </div>
            )}

          </div>
        ) : (
          /* STEP 2: REVIEW & CONFIRMATION */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Identificados</span>
                <span className="text-base font-black text-slate-900">{parsedItems.length} transações</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Pix Detectados</span>
                <span className="text-base font-black text-amber-900">{pixCount} via Pix</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Dízimos (&ge; R$50)</span>
                <span className="text-base font-black text-emerald-900">{tithesCount} dízimos</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Ofertas (&lt; R$50)</span>
                <span className="text-base font-black text-blue-900">{offeringsCount} ofertas</span>
              </div>
            </div>

            {/* Table Controls */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={selectedCount === parsedItems.length && parsedItems.length > 0}
                  onChange={e => handleToggleSelectAll(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 w-4 h-4"
                />
                <span>Selecionar Todos ({selectedCount} de {parsedItems.length} selecionados)</span>
              </label>

              <div className="text-slate-600 font-bold">
                Saldo Selecionado: <span className={totalAmountSelected >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{formatCurrency(totalAmountSelected)}</span>
              </div>
            </div>

            {/* Parsed Items List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {parsedItems.map((item) => (
                <div
                  key={item.tempId}
                  className={`p-3 rounded-xl border transition-all ${
                    item.selected 
                      ? 'bg-white border-amber-300 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    {/* Left: Checkbox + Description & Date */}
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleItem(item.tempId)}
                        className="rounded text-amber-500 focus:ring-0 w-4 h-4 mt-1 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-xs truncate max-w-[220px]">
                            {item.cleanDescription}
                          </span>
                          {item.isPix && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              Pix
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {item.formattedDate}
                          </span>
                        </div>

                        {/* Matched Member / Donor Selector */}
                        {item.type === 'entrada' && (
                          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                              Doador:
                            </span>
                            
                            <select
                              value={item.matchedMember?.id || ''}
                              onChange={e => handleUpdateItemMember(item.tempId, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                            >
                              <option value="">{item.donorName ? `Nome Extraído: ${item.donorName}` : 'Não vinculado (Anônimo / Culto)'}</option>
                              {members.map(m => (
                                <option key={m.id} value={m.id}>
                                  Membro: {m.fullName}
                                </option>
                              ))}
                            </select>

                            {item.matchedMember && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                                Membro Vinculado
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Category Selector & Amount */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block sm:text-right mb-0.5">Categoria</label>
                        <select
                          value={item.category}
                          onChange={e => handleUpdateItemCategory(item.tempId, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                        >
                          {(item.type === 'entrada' ? entryCategories : expenseCategories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">Valor</span>
                        <span className={`text-sm font-black tracking-tight ${item.type === 'entrada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {item.type === 'entrada' ? '+' : '-'} {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Success Notification after confirmation */}
            {importResult && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center gap-3 text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Conciliação Concluída com Sucesso!</p>
                  <p className="text-xs text-slate-600">
                    Foram importados <strong>{importResult.importedCount} lançamentos</strong> diretamente para a tesouraria da IBNS.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2.5">
          {step === 'review' ? (
            <button
              type="button"
              onClick={() => {
                setStep('upload');
                setImportResult(null);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Arquivo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
            >
              {importResult ? 'Concluir' : 'Cancelar'}
            </button>

            {step === 'upload' ? (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!rawContent.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Analisar Extrato &amp; Pix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !importResult ? (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={selectedCount === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Importar {selectedCount} Lançamentos</span>
              </button>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};
