import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Upload, 
  Filter, 
  Search, 
  FileSpreadsheet, 
  Building2, 
  PiggyBank, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit2, 
  Eye, 
  Calendar,
  CreditCard,
  Wallet,
  TrendingUp,
  Download,
  Tag,
  Church,
  UserCheck,
  User,
  ShieldCheck,
  Settings2,
  Sparkles
} from 'lucide-react';
import { 
  FinancialTransaction, 
  PaymentStatus, 
  TransactionType, 
  BankAccount, 
  CostCenter, 
  TransactionAttachment 
} from '../../types';
import { db } from '../../services/db';
import { TransactionFormModal } from './TransactionFormModal';
import { FixedExpensesModal } from './FixedExpensesModal';
import { InvestmentsManager } from './InvestmentsManager';
import { BankStatementImportModal } from './BankStatementImportModal';
import { AccountingExportModal } from './AccountingExportModal';
import { BankAccountModal } from './BankAccountModal';
import { CostCenterModal } from './CostCenterModal';
import { CategoriesManagerModal } from './CategoriesManagerModal';
import { CbnPlanCard } from './CbnPlanCard';
import { FixedExpensesWidget } from './FixedExpensesWidget';

interface FinanceModuleProps {
  hideSensitiveData: boolean;
  onOpenAccountingExportModal: () => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  hideSensitiveData,
  onOpenAccountingExportModal
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'cbn' | 'fixed' | 'investments' | 'costCenters' | 'accounts'>('transactions');
  
  // Data from DB
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(db.getTransactions());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(db.getBankAccounts());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(db.getCostCenters());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [costCenterFilter, setCostCenterFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('entrada');
  const [txToEdit, setTxToEdit] = useState<FinancialTransaction | null>(null);
  
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  
  // Bank Account Modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);

  // Cost Center Modal
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [costCenterToEdit, setCostCenterToEdit] = useState<CostCenter | null>(null);

  // Categories Modal
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Preview attachment
  const [previewAttachment, setPreviewAttachment] = useState<TransactionAttachment | null>(null);

  useEffect(() => {
    return db.subscribe(() => {
      setTransactions(db.getTransactions());
      setBankAccounts(db.getBankAccounts());
      setCostCenters(db.getCostCenters());
    });
  }, []);

  const handleNewTransaction = (type: TransactionType) => {
    setTxInitialType(type);
    setTxToEdit(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: FinancialTransaction) => {
    setTxToEdit(tx);
    setTxInitialType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento financeiro?')) {
      db.deleteTransaction(id);
    }
  };

  const handleToggleStatus = (tx: FinancialTransaction) => {
    const nextStatus: PaymentStatus = tx.status === 'pago' ? 'agendado' : 'pago';
    db.saveTransaction({
      ...tx,
      status: nextStatus
    });
  };

  const handleNewAccount = () => {
    setAccountToEdit(null);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (acc: BankAccount) => {
    setAccountToEdit(acc);
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (bankAccounts.length <= 1) {
      alert('É necessário manter pelo menos uma conta bancária/caixa cadastrado.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir esta conta corrente? Lançamentos associados permanecerão no histórico.')) {
      db.deleteBankAccount(id);
    }
  };

  const handleNewCostCenter = () => {
    setCostCenterToEdit(null);
    setIsCostCenterModalOpen(true);
  };

  const handleEditCostCenter = (cc: CostCenter) => {
    setCostCenterToEdit(cc);
    setIsCostCenterModalOpen(true);
  };

  const handleDeleteCostCenter = (id: string) => {
    if (costCenters.length <= 1) {
      alert('É necessário manter pelo menos um centro de custos.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este centro de custos?')) {
      db.deleteCostCenter(id);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (costCenterFilter !== 'all' && t.costCenterId !== costCenterFilter) return false;
    if (monthFilter && !t.date.startsWith(monthFilter) && !t.dueDate.startsWith(monthFilter)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(term);
      const matchCode = t.code?.toLowerCase().includes(term);
      const matchMember = t.memberName?.toLowerCase().includes(term);
      const matchDonor = t.donorName?.toLowerCase().includes(term);
      const matchService = t.worshipServiceType?.toLowerCase().includes(term);
      const matchCat = t.category?.toLowerCase().includes(term);
      if (!matchDesc && !matchCode && !matchMember && !matchDonor && !matchService && !matchCat) return false;
    }
    return true;
  });

  const totalLiquid = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);
  const totalEntries = filteredTransactions.filter(t => t.type === 'entrada' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
  const totalExits = filteredTransactions.filter(t => t.type === 'saida' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
  const totalPending = filteredTransactions.filter(t => t.type === 'saida' && (t.status === 'agendado' || t.status === 'vencido')).reduce((s, t) => s + t.amount, 0);

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Top Banner with Accounts and Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Tesouraria &amp; Finanças IBNS
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Gestão Financeira, Dízimos, Ofertas &amp; Contas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Controle de dízimos, ofertas públicas, conciliação Pix, plano CBN 5%, contas correntes e prestação contábil da IBNS Sapiranga.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleNewTransaction('entrada')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Lançar Dízimo / Oferta</span>
            </button>

            <button
              onClick={() => handleNewTransaction('saida')}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Lançar Despesa c/ NF</span>
            </button>

            <button
              onClick={() => setIsStatementModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200 transition-colors"
              title="Importar e analisar extrato Pix/OFX/CSV"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Importar Extrato Pix</span>
            </button>

            <button
              onClick={onOpenAccountingExportModal}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-300 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Pacote Contábil (.ZIP)</span>
            </button>
          </div>
        </div>

        {/* Bank Accounts & Balances Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {bankAccounts.map(acc => (
            <div 
              key={acc.id} 
              className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200/90 flex items-center justify-between transition-colors group cursor-pointer"
              onClick={() => handleEditAccount(acc)}
            >
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-500 font-bold block truncate">{acc.name} ({acc.bankName})</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(acc.currentBalance)}</span>
                {acc.pixKey && (
                  <span className="text-[9px] text-slate-400 font-mono block truncate">Pix: {acc.pixKey}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div 
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-2xs" 
                  style={{ backgroundColor: acc.color }}
                  title={acc.bankName}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAccount(acc);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-900 rounded transition-opacity"
                  title="Editar Conta"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Quick Add Bank Account Button */}
          <button
            onClick={handleNewAccount}
            className="border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-900 transition-all"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Adicionar Conta Bancária</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'transactions' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Lançamentos &amp; Caixa ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cbn')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'cbn' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Plano Cooperativo CBN (5%)</span>
        </button>

        <button
          onClick={() => setActiveTab('fixed')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'fixed' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Despesas Fixas &amp; Recorrentes</span>
        </button>

        <button
          onClick={() => setActiveTab('investments')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'investments' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Investimentos &amp; Cofrinhos</span>
        </button>

        <button
          onClick={() => setActiveTab('costCenters')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'costCenters' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Centros de Custos ({costCenters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'accounts' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Contas &amp; Caixas ({bankAccounts.length})</span>
        </button>

        <button
          onClick={() => setIsCategoriesModalOpen(true)}
          className="px-3.5 py-2 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center gap-1.5 ml-auto"
        >
          <Tag className="w-4 h-4 text-amber-600" />
          <span>Gerenciar Categorias</span>
        </button>
      </div>

      {/* Main Tab View: Transactions & Cash Flow */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          
          {/* Quick widgets row: CBN Card preview + Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* CBN Plan Card Widget */}
            <div className="lg:col-span-1">
              <CbnPlanCard hideSensitiveData={hideSensitiveData} />
            </div>

            {/* Cash Flow Summary Strip */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Entradas Realizadas</span>
                <span className="text-base font-black text-emerald-700">{formatCurrency(totalEntries)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Dízimos e Ofertas recebidos</span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Despesas Pagas</span>
                <span className="text-base font-black text-rose-700">{formatCurrency(totalExits)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Contas e NFs quitadas</span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo Período</span>
                <span className={`text-base font-black ${totalEntries - totalExits >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(totalEntries - totalExits)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Resultado operacional</span>
              </div>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar dízimo, membro, culto, NF..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold"
              >
                <option value="all">Todos os Tipos</option>
                <option value="entrada">Entradas (Dízimos/Ofertas)</option>
                <option value="saida">Saídas (Despesas/NFs)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold"
              >
                <option value="all">Todos os Status</option>
                <option value="pago">Pago / Recebido</option>
                <option value="agendado">Agendado / Provisionado</option>
                <option value="vencido">Vencido</option>
              </select>

              {/* Cost Center Filter */}
              <select
                value={costCenterFilter}
                onChange={e => setCostCenterFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold"
              >
                <option value="all">Todos os Centros de Custo</option>
                {costCenters.map(cc => (
                  <option key={cc.id} value={cc.id}>{cc.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold"
              />
              {monthFilter && (
                <button
                  onClick={() => setMonthFilter('')}
                  className="text-slate-400 hover:text-slate-700 p-1 font-bold"
                  title="Limpar filtro de mês"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Código / Data</th>
                    <th className="py-3 px-4">Descrição &amp; Doador / Culto</th>
                    <th className="py-3 px-4">Categoria / C. Custo</th>
                    <th className="py-3 px-4">Conta Bancária</th>
                    <th className="py-3 px-4">Valor (R$)</th>
                    <th className="py-3 px-4">Comprovante / NF</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                        Nenhum lançamento financeiro encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(t => {
                      const costCenter = costCenters.find(c => c.id === t.costCenterId);
                      const bankAcc = bankAccounts.find(a => a.id === t.accountId);

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-amber-800 block">{t.code}</span>
                            <span className="text-[10px] text-slate-400">{t.date}</span>
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{t.description}</p>
                            
                            {/* Tithe Donor or Culto Publico tags */}
                            {t.type === 'entrada' && (
                              <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                                {t.donorType === 'membro' && t.memberName && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                                    <User className="w-2.5 h-2.5" />
                                    Membro: {t.memberName}
                                  </span>
                                )}
                                {t.donorType === 'culto_publico' && t.worshipServiceType && (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1">
                                    <Church className="w-2.5 h-2.5" />
                                    {t.worshipServiceType}
                                  </span>
                                )}
                                {t.donorType === 'manual' && t.donorName && (
                                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-1">
                                    <UserCheck className="w-2.5 h-2.5" />
                                    Doador: {t.donorName}
                                  </span>
                                )}
                                {t.isAnonymous && (
                                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                    Anônimo
                                  </span>
                                )}
                              </div>
                            )}

                            {t.paymentMethod && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Via {t.paymentMethod}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-slate-900 font-bold block">{t.category}</span>
                            <span className="text-[10px] text-slate-500">
                              {costCenter?.name || 'Geral'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-slate-800 font-medium block">{bankAcc?.name || 'Caixa'}</span>
                            <span className="text-[10px] text-slate-400">{bankAcc?.bankName}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`font-black text-sm ${t.type === 'entrada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {t.attachments && t.attachments.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setPreviewAttachment(t.attachments[0])}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1 text-[11px] font-bold transition-colors"
                                  title="Ver Nota Fiscal / Recibo"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{t.attachments[0].documentType}</span>
                                </button>
                                {t.attachments.length > 1 && (
                                  <span className="text-[10px] text-slate-500 font-bold">+{t.attachments.length - 1}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Sem anexo</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleStatus(t)}
                              title="Clique para alternar status (Pago / Agendado)"
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors border ${
                                t.status === 'pago' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : t.status === 'vencido'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-amber-50 text-amber-850 border-amber-200'
                              }`}
                            >
                              {t.status === 'pago' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {t.status === 'agendado' && <Clock className="w-3 h-3 text-amber-600" />}
                              {t.status === 'vencido' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                              <span>{t.status.toUpperCase()}</span>
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditTransaction(t)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Editar Lançamento"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(t.id)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Excluir Lançamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Subtab: CBN 5% Plan Full Tab */}
      {activeTab === 'cbn' && (
        <div className="space-y-4">
          <CbnPlanCard hideSensitiveData={hideSensitiveData} />
        </div>
      )}

      {/* Subtab: Fixed Expenses with widget filters */}
      {activeTab === 'fixed' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsFixedModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Gerenciar &amp; Cadastrar Despesa Fixa</span>
            </button>
          </div>
          <FixedExpensesWidget hideSensitiveData={hideSensitiveData} />
        </div>
      )}

      {/* Subtab: Investments & Cofrinhos */}
      {activeTab === 'investments' && (
        <InvestmentsManager hideSensitiveData={hideSensitiveData} />
      )}

      {/* Subtab: Centros de Custo & Orçamentos */}
      {activeTab === 'costCenters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Centros de Custos &amp; Departamentos</h3>
              <p className="text-xs text-slate-500">Cadastre e configure o orçamento mensal de cada ministério da IBNS.</p>
            </div>
            <button
              onClick={handleNewCostCenter}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Centro de Custo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {costCenters.map(cc => {
              const spent = transactions
                .filter(t => t.costCenterId === cc.id && t.type === 'saida' && t.status === 'pago')
                .reduce((s, t) => s + t.amount, 0);
              
              const pct = cc.budgetMonthly > 0 ? Math.min(100, Math.round((spent / cc.budgetMonthly) * 100)) : 0;

              return (
                <div key={cc.id} className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cc.color }} />
                        <span className="text-xs font-bold text-slate-900">{cc.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditCostCenter(cc)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Editar Centro de Custo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCostCenter(cc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Excluir Centro de Custo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">Orçamento Mensal:</p>
                    <p className="text-base font-extrabold text-slate-900">{formatCurrency(cc.budgetMonthly)}</p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Executado no Mês:</span>
                        <span className="font-bold text-rose-700">{formatCurrency(spent)} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Disponível: {formatCurrency(Math.max(0, cc.budgetMonthly - spent))}</span>
                    <span className="text-emerald-700 font-bold">Ativo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab: Contas & Caixas */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Contas Bancárias &amp; Caixas Físicos</h3>
              <p className="text-xs text-slate-500">Cadastre e edite as contas correntes (Inter, Sicredi, Nubank, Caixa Tesouraria).</p>
            </div>
            <button
              onClick={handleNewAccount}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conta Bancária</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankAccounts.map(acc => (
              <div key={acc.id} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: acc.color }} />
                      <h4 className="font-extrabold text-slate-900 text-sm">{acc.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditAccount(acc)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Editar Conta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Excluir Conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold">{acc.bankName} • Tipo: {acc.type.toUpperCase()}</p>
                  
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo Atual em Caixa</span>
                    <span className="text-lg font-black text-slate-900">{formatCurrency(acc.currentBalance)}</span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    {acc.agency && <p><strong>Agência:</strong> {acc.agency} {acc.accountNumber ? `• <strong>Conta:</strong> ${acc.accountNumber}` : ''}</p>}
                    {acc.pixKey && <p className="font-mono text-[11px]"><strong>Chave Pix:</strong> {acc.pixKey}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txInitialType}
        transactionToEdit={txToEdit}
      />

      <BankAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
      />

      <CostCenterModal
        isOpen={isCostCenterModalOpen}
        onClose={() => setIsCostCenterModalOpen(false)}
        costCenterToEdit={costCenterToEdit}
      />

      <CategoriesManagerModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      <FixedExpensesModal
        isOpen={isFixedModalOpen}
        onClose={() => setIsFixedModalOpen(false)}
        hideSensitiveData={hideSensitiveData}
      />

      <BankStatementImportModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
      />

      {/* Preview Attachment Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 truncate">{previewAttachment.fileName}</h4>
              <button onClick={() => setPreviewAttachment(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-auto flex items-center justify-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              {previewAttachment.fileData.startsWith('data:image') || previewAttachment.fileData.startsWith('data:image/svg') ? (
                <img src={previewAttachment.fileData} alt="Comprovante" className="max-w-full rounded" />
              ) : (
                <div className="text-center p-6 text-slate-700">
                  <FileText className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                  <p className="font-bold">{previewAttachment.fileName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Documento arquivado para envio ao contador no fechamento mensal.
                  </p>
                </div>
              )}
            </div>

            <div className="text-right">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Fechar Visualizador
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
