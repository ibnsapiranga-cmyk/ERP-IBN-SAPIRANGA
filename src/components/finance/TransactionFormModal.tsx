import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Trash2, 
  Check, 
  DollarSign, 
  FileCheck, 
  Calendar,
  AlertCircle,
  Eye,
  UserCheck,
  User,
  Church,
  HelpCircle,
  Tag,
  Plus
} from 'lucide-react';
import { 
  FinancialTransaction, 
  TransactionType, 
  PaymentStatus, 
  TransactionAttachment 
} from '../../types';
import { db } from '../../services/db';
import { CategoriesManagerModal } from './CategoriesManagerModal';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  transactionToEdit?: FinancialTransaction | null;
}

const WORSHIP_SERVICES = [
  'Culto de Celebração (Domingo - Noite)',
  'Culto Matutino & EBD (Domingo - Manhã)',
  'Culto de Doutrina & Oração (Quarta-feira)',
  'Culto da Juventude / Jovens IBNS',
  'Culto de Mulheres / Ministério Feminino',
  'Culto de Homens / Ministério Masculino',
  'Culto Infantil / EBF Especial',
  'Culto de Vigília / Oração Matutina',
  'Culto Especial de Ações de Graças',
  'Culto Fúnebre / Cerimônia'
];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  initialType = 'entrada',
  transactionToEdit
}) => {
  const accounts = db.getBankAccounts();
  const costCenters = db.getCostCenters();
  const members = db.getMembers().filter(m => m.status === 'Ativo');

  const [entryCategories, setEntryCategories] = useState<string[]>(db.getEntryCategories());
  const [expenseCategories, setExpenseCategories] = useState<string[]>(db.getExpenseCategories());
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  const [type, setType] = useState<TransactionType>(transactionToEdit?.type || initialType);
  const [description, setDescription] = useState(transactionToEdit?.description || '');
  const [amount, setAmount] = useState<string>(transactionToEdit?.amount ? String(transactionToEdit.amount) : '');
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(transactionToEdit?.dueDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<PaymentStatus>(transactionToEdit?.status || 'pago');
  
  const [category, setCategory] = useState<string>(
    transactionToEdit?.category || (initialType === 'entrada' ? 'Dízimo' : 'Água e Luz')
  );
  const [costCenterId, setCostCenterId] = useState(transactionToEdit?.costCenterId || costCenters[0]?.id || '');
  const [accountId, setAccountId] = useState(transactionToEdit?.accountId || accounts[0]?.id || '');
  
  // Donor identification modes: 'membro' | 'manual' | 'culto_publico' | 'anonimo'
  const [donorType, setDonorType] = useState<'membro' | 'manual' | 'culto_publico' | 'anonimo'>(() => {
    if (transactionToEdit?.isAnonymous) return 'anonimo';
    if (transactionToEdit?.donorType) return transactionToEdit.donorType;
    if (transactionToEdit?.memberId) return 'membro';
    if (transactionToEdit?.worshipServiceType) return 'culto_publico';
    if (transactionToEdit?.donorName) return 'manual';
    return 'membro';
  });

  const [memberId, setMemberId] = useState(transactionToEdit?.memberId || '');
  const [donorName, setDonorName] = useState(transactionToEdit?.donorName || '');
  const [worshipServiceType, setWorshipServiceType] = useState(
    transactionToEdit?.worshipServiceType || WORSHIP_SERVICES[0]
  );
  
  // Link to fixed expense
  const [fixedExpenseId, setFixedExpenseId] = useState(transactionToEdit?.fixedExpenseId || '');
  
  const [paymentMethod, setPaymentMethod] = useState<any>(transactionToEdit?.paymentMethod || 'Pix');
  const [notes, setNotes] = useState(transactionToEdit?.notes || '');
  const [attachments, setAttachments] = useState<TransactionAttachment[]>(transactionToEdit?.attachments || []);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [docType, setDocType] = useState<any>('Nota Fiscal');

  // Preview attachment modal
  const [previewAttachment, setPreviewAttachment] = useState<TransactionAttachment | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setDate(transactionToEdit.date);
      setDueDate(transactionToEdit.dueDate);
      setStatus(transactionToEdit.status);
      setCategory(transactionToEdit.category);
      setCostCenterId(transactionToEdit.costCenterId);
      setAccountId(transactionToEdit.accountId);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setNotes(transactionToEdit.notes || '');
      setAttachments(transactionToEdit.attachments || []);
      setFixedExpenseId(transactionToEdit.fixedExpenseId || '');
      setMemberId(transactionToEdit.memberId || '');
      setDonorName(transactionToEdit.donorName || '');
      setWorshipServiceType(transactionToEdit.worshipServiceType || WORSHIP_SERVICES[0]);

      if (transactionToEdit.isAnonymous) {
        setDonorType('anonimo');
      } else if (transactionToEdit.donorType) {
        setDonorType(transactionToEdit.donorType);
      } else if (transactionToEdit.memberId) {
        setDonorType('membro');
      } else if (transactionToEdit.worshipServiceType) {
        setDonorType('culto_publico');
      } else if (transactionToEdit.donorName) {
        setDonorType('manual');
      } else {
        setDonorType('membro');
      }
    }
  }, [transactionToEdit]);

  const refreshCategories = () => {
    setEntryCategories(db.getEntryCategories());
    setExpenseCategories(db.getExpenseCategories());
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target?.result as string;
        const rawCode = transactionToEdit?.code || `LANC-${Date.now().toString().slice(-5)}`;
        const autoName = `${rawCode}_${String(docType).replace(/\s+/g, '')}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const newAttachment: TransactionAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          fileName: autoName,
          originalName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileData,
          uploadedAt: new Date().toISOString(),
          receiptNumber: receiptNumber || undefined,
          documentType: docType
        };

        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }

    const selectedMember = members.find(m => m.id === memberId);
    let finalMemberName: string | undefined = undefined;
    let finalDonorName: string | undefined = undefined;
    let finalWorshipService: string | undefined = undefined;

    if (type === 'entrada') {
      if (donorType === 'membro') {
        finalMemberName = selectedMember?.fullName;
        finalDonorName = selectedMember?.fullName;
      } else if (donorType === 'manual') {
        finalDonorName = donorName.trim();
      } else if (donorType === 'culto_publico') {
        finalWorshipService = worshipServiceType;
        finalDonorName = worshipServiceType;
      }
    }

    const transaction: FinancialTransaction = {
      id: transactionToEdit?.id || `tx-${Date.now()}`,
      code: transactionToEdit?.code || '',
      type,
      description: description.trim(),
      amount: numAmount,
      date,
      dueDate,
      status,
      category,
      costCenterId,
      accountId,
      donorType: type === 'entrada' ? donorType : undefined,
      memberId: type === 'entrada' && donorType === 'membro' ? memberId : undefined,
      memberName: finalMemberName,
      donorName: finalDonorName,
      worshipServiceType: finalWorshipService,
      isAnonymous: type === 'entrada' ? donorType === 'anonimo' : false,
      fixedExpenseId: fixedExpenseId || undefined,
      isFixedRecurring: !!fixedExpenseId,
      paymentMethod,
      notes: notes || undefined,
      attachments,
      createdAt: transactionToEdit?.createdAt || new Date().toISOString()
    };

    db.saveTransaction(transaction);
    onClose();
  };

  const isTitheOrOffering = type === 'entrada';

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                type === 'entrada' 
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}>
                {type === 'entrada' ? 'Receita / Dízimo / Oferta' : 'Despesa / Saída / NF'}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                {transactionToEdit ? `Editar Lançamento ${transactionToEdit.code}` : 'Novo Lançamento Financeiro'}
              </h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body / Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            
            {/* Toggle Type (Entrada vs Saída) */}
            {!transactionToEdit && (
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setType('entrada');
                    setCategory('Dízimo');
                  }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === 'entrada'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Entrada (Dízimos / Ofertas)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('saida');
                    setCategory('Água e Luz');
                  }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === 'saida'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Saída / Despesa</span>
                </button>
              </div>
            )}

            {/* Description & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Dízimo Mensal, Oferta de Domingo, Luz RGE Templo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-black text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Dates & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Data de Competência
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Status de Pagamento
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="pago">Pago / Efetivado</option>
                  <option value="agendado">Agendado / Provisionado</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>

            {/* Category, Cost Center, Bank Account */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold">Categoria *</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoriesModalOpen(true)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-0.5"
                  >
                    <Tag className="w-3 h-3" />
                    <span>Gerenciar</span>
                  </button>
                </div>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  {(type === 'entrada' ? entryCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Centro de Custos
                </label>
                <select
                  value={costCenterId}
                  onChange={e => setCostCenterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  {costCenters.map(cc => (
                    <option key={cc.id} value={cc.id}>{cc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Conta / Caixa Destino
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SEÇÃO ESPECÍFICA DE DÍZIMO / OFERTA / IDENTIFICAÇÃO DO DOADOR */}
            {isTitheOrOffering && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      Identificação do Doador / Culto Público
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Vincule o dízimo ao cadastro do membro, insira o nome avulso, registre o culto público ou marque como anônimo.
                    </p>
                  </div>
                </div>

                {/* Donor Type Selector Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setDonorType('membro')}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
                      donorType === 'membro'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Membro Cadastrado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDonorType('manual')}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
                      donorType === 'manual'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Nome Avulso / Visitante</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDonorType('culto_publico')}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
                      donorType === 'culto_publico'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Church className="w-3.5 h-3.5" />
                    <span>Culto Público Geral</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDonorType('anonimo')}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
                      donorType === 'anonimo'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Anônimo</span>
                  </button>
                </div>

                {/* Sub-inputs depending on donorType */}
                {donorType === 'membro' && (
                  <div className="animate-in fade-in">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Selecione o Membro Cadastrado na IBNS *
                    </label>
                    <select
                      value={memberId}
                      onChange={e => {
                        setMemberId(e.target.value);
                        const m = members.find(item => item.id === e.target.value);
                        if (m) setDonorName(m.fullName);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Buscar membro na lista ({members.length} cadastrados)...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} — {m.role} {m.phone ? `(${m.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {donorType === 'manual' && (
                  <div className="animate-in fade-in">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nome da Pessoa / Doador(a) *
                    </label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo de Oliveira (Visitante), Irmã Maria"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {donorType === 'culto_publico' && (
                  <div className="animate-in fade-in">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Culto Público / Reunião Congregacional *
                    </label>
                    <select
                      value={worshipServiceType}
                      onChange={e => setWorshipServiceType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                    >
                      {WORSHIP_SERVICES.map(srv => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>
                )}

                {donorType === 'anonimo' && (
                  <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center gap-2 animate-in fade-in">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Lançamento registrado como dízimo ou oferta anônima na tesouraria.</span>
                  </div>
                )}

              </div>
            )}

            {/* Payment Method & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="Pix">Chave Pix (Banco / QR Code)</option>
                  <option value="Transferência Bancária">Transferência Bancária / TED</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Dinheiro">Dinheiro Físico (Espécie)</option>
                  <option value="Cartão">Cartão Débito / Crédito</option>
                  <option value="Débito Automático">Débito Automático</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Observações / Detalhes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Ref. culto de domingo, nota fiscal eletrônica, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Upload de Nota Fiscal / Recibo / Comprovante */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Anexar Nota Fiscal / Recibo / Comprovante
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    O documento é armazenado e padronizado para exportação contábil mensal da IBNS.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Tipo de Documento</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="Nota Fiscal">Nota Fiscal (NF-e / DANFE)</option>
                    <option value="Recibo">Recibo Assinado</option>
                    <option value="Boleto">Boleto com Autenticação</option>
                    <option value="Comprovante Pix">Comprovante Pix</option>
                    <option value="Outro">Outro Documento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Número NF / Recibo</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={e => setReceiptNumber(e.target.value)}
                    placeholder="Ex: NF-44921 / REC-890"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>

                <div className="flex items-end">
                  <label className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Selecionar Arquivo</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-700">Arquivos Anexados ({attachments.length}):</p>
                  {attachments.map((att) => (
                    <div key={att.id} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{att.fileName}</p>
                          <p className="text-[10px] text-slate-500">
                            {att.documentType} {att.receiptNumber ? `(Nº ${att.receiptNumber})` : ''} • Original: {att.originalName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Visualizar Comprovante"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                          title="Remover anexo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer / Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Lançamento</span>
              </button>
            </div>
          </form>

        </div>

        {/* Visualizador de Anexo Modal */}
        {previewAttachment && (
          <div className="fixed inset-0 z-60 bg-slate-900/80 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900 truncate">{previewAttachment.fileName}</h4>
                <button onClick={() => setPreviewAttachment(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-96 overflow-auto flex items-center justify-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                {previewAttachment.fileData.startsWith('data:image') || previewAttachment.fileData.startsWith('data:image/svg') ? (
                  <img src={previewAttachment.fileData} alt="Comprovante" className="max-w-full rounded" />
                ) : (
                  <div className="text-center p-6 text-slate-700">
                    <FileText className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                    <p className="font-bold">{previewAttachment.fileName}</p>
                    <p className="text-xs text-slate-500 mt-1">Documento pronto para exportação contábil.</p>
                  </div>
                )}
              </div>

              <div className="text-right">
                <button
                  onClick={() => setPreviewAttachment(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Fechar Visualizador
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CategoriesManagerModal
        isOpen={isCategoriesModalOpen}
        onClose={() => {
          setIsCategoriesModalOpen(false);
          refreshCategories();
        }}
        initialType={type}
      />
    </>
  );
};
