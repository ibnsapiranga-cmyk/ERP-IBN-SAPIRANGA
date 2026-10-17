import JSZip from 'jszip';
import {
  BankAccount,
  CostCenter,
  FixedExpense,
  FinancialTransaction,
  InvestmentAccount,
  Member,
  Course,
  CourseEnrollment,
  AssistedFamily,
  SocialActionDelivery,
  MusicAndSkillsClass,
  EvangelismAction,
  ReachedPerson,
  SupportedMissionary,
  ChurchEvent,
  EventRegistration,
  AuditLog,
  CalendarEventItem,
  UserSession,
  TransactionAttachment,
  CbnPlanSummary,
  ChurchAsset,
  AssetCategory,
  AssetMaintenanceRecord,
  AssetLoanRecord,
  ErpUser,
  SecuritySettings,
  SecurityEventLog
} from '../types';

export interface ParsedStatementItem {
  tempId: string;
  rawDate: string;
  formattedDate: string;
  rawDescription: string;
  cleanDescription: string;
  amount: number;
  type: 'entrada' | 'saida';
  isPix: boolean;
  paymentMethod: string;
  category: string;
  suggestedType: 'dizimo' | 'oferta' | 'despesa' | 'outro';
  matchedMember?: Member;
  donorName?: string;
  donorType: 'membro' | 'manual' | 'culto_publico' | 'anonimo';
  worshipServiceType?: string;
  costCenterId: string;
  notes?: string;
  selected: boolean;
  aiIdentified?: boolean;
  aiExplanation?: string;
  aiConfidence?: number;
}

const defaultEntryCategories = [
  'Dízimo',
  'Oferta Geral',
  'Oferta Voluntária',
  'Oferta de Culto Público',
  'Oferta Missionária',
  'Campanha de Construção',
  'Eventos / Cantina',
  'Doação Especial',
  'Rendimento Investimento',
  'Outros'
];

const defaultExpenseCategories = [
  'Folha / Sustento Pastoral',
  'Água e Luz',
  'Aluguel / Manutenção do Templo',
  'Material de Expediente',
  'Ministério Infantil',
  'Louvor e Equipamentos',
  'Ação Social',
  'Missões',
  'Eventos',
  'Impostos / Taxas',
  'Plano Cooperativo CBN',
  'Outros'
];

import {
  cleanBankAccounts,
  cleanCostCenters,
  initialAssets,
  initialErpUsers,
  initialSecuritySettings,
  initialBankAccounts,
  initialCostCenters,
  initialInvestments,
  initialFixedExpenses,
  initialTransactions,
  initialMembers,
  initialCourses,
  initialEnrollments,
  initialAssistedFamilies,
  initialSocialDeliveries,
  initialClasses,
  initialEvangelismActions,
  initialReachedPersons,
  initialMissionaries,
  initialEvents,
  initialRegistrations,
  initialAuditLogs
} from './seedData';

const DB_KEYS = {
  BANK_ACCOUNTS: 'ibns_bank_accounts_v3',
  COST_CENTERS: 'ibns_cost_centers_v3',
  INVESTMENTS: 'ibns_investments_v3',
  FIXED_EXPENSES: 'ibns_fixed_expenses_v3',
  TRANSACTIONS: 'ibns_transactions_v3',
  ENTRY_CATEGORIES: 'ibns_entry_categories_v3',
  EXPENSE_CATEGORIES: 'ibns_expense_categories_v3',
  MEMBERS: 'ibns_members_v3',
  COURSES: 'ibns_courses_v3',
  ENROLLMENTS: 'ibns_enrollments_v3',
  FAMILIES: 'ibns_families_v3',
  DELIVERIES: 'ibns_deliveries_v3',
  CLASSES: 'ibns_classes_v3',
  EVANGELISM_ACTIONS: 'ibns_evangelism_actions_v3',
  REACHED_PERSONS: 'ibns_reached_persons_v3',
  MISSIONARIES: 'ibns_missionaries_v3',
  EVENTS: 'ibns_events_v3',
  REGISTRATIONS: 'ibns_registrations_v3',
  ASSETS: 'ibns_assets_v3',
  AUDIT_LOGS: 'ibns_audit_logs_v3',
  ERP_USERS: 'ibns_erp_users_v3',
  USER_SESSION: 'ibns_user_session_v3',
  SECURITY_SETTINGS: 'ibns_security_settings_v3',
  SECURITY_LOGS: 'ibns_security_logs_v3',
  FAILED_LOGINS: 'ibns_failed_logins_v3'
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

class ChurchERPDatabase {
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  // --- Session & Security ---
  public getSession(): UserSession {
    return getStorage<UserSession>(DB_KEYS.USER_SESSION, {
      name: '',
      email: '',
      role: 'pastor',
      roleTitle: '',
      isAuthenticated: false
    });
  }

  public setSession(session: UserSession): void {
    setStorage(DB_KEYS.USER_SESSION, session);
    this.logAudit('ALTERACAO_PERFIL_ACESSO', 'settings', `Sessão alterada para ${session.name} (${session.roleTitle})`);
    this.notify();
  }

  public logout(): void {
    const current = this.getSession();
    const cleanSession: UserSession = {
      name: '',
      email: '',
      role: 'pastor',
      roleTitle: '',
      isAuthenticated: false
    };
    setStorage(DB_KEYS.USER_SESSION, cleanSession);
    if (current.email) {
      this.logAudit('LOGOUT_SISTEMA', 'settings', `Sessão encerrada para ${current.email}`);
    }
    this.notify();
  }

  // --- Financeiro ---
  public getBankAccounts(): BankAccount[] {
    return getStorage<BankAccount[]>(DB_KEYS.BANK_ACCOUNTS, cleanBankAccounts);
  }

  public saveBankAccount(account: BankAccount): void {
    const list = this.getBankAccounts();
    const idx = list.findIndex(a => a.id === account.id);
    const isNew = idx < 0;
    if (idx >= 0) {
      list[idx] = account;
    } else {
      list.push(account);
    }
    setStorage(DB_KEYS.BANK_ACCOUNTS, list);
    this.logAudit(
      isNew ? 'CADASTRO_CONTA_BANCARIA' : 'EDICAO_CONTA_BANCARIA',
      'finance',
      `Conta bancária/caixa: ${account.name} (${account.bankName})`
    );
    this.recalculateBankBalances();
    this.notify();
  }

  public deleteBankAccount(id: string): void {
    const acc = this.getBankAccounts().find(a => a.id === id);
    const list = this.getBankAccounts().filter(a => a.id !== id);
    setStorage(DB_KEYS.BANK_ACCOUNTS, list);
    if (acc) {
      this.logAudit('EXCLUSAO_CONTA_BANCARIA', 'finance', `Excluída conta bancária ${acc.name}`);
    }
    this.notify();
  }

  public getCostCenters(): CostCenter[] {
    return getStorage<CostCenter[]>(DB_KEYS.COST_CENTERS, cleanCostCenters);
  }

  public saveCostCenter(costCenter: CostCenter): void {
    const list = this.getCostCenters();
    const idx = list.findIndex(c => c.id === costCenter.id);
    const isNew = idx < 0;
    if (idx >= 0) {
      list[idx] = costCenter;
    } else {
      list.push(costCenter);
    }
    setStorage(DB_KEYS.COST_CENTERS, list);
    this.logAudit(
      isNew ? 'CADASTRO_CENTRO_CUSTO' : 'EDICAO_CENTRO_CUSTO',
      'finance',
      `Centro de custo: ${costCenter.name} - Orçamento: R$ ${costCenter.budgetMonthly}`
    );
    this.notify();
  }

  public deleteCostCenter(id: string): void {
    const cc = this.getCostCenters().find(c => c.id === id);
    const list = this.getCostCenters().filter(c => c.id !== id);
    setStorage(DB_KEYS.COST_CENTERS, list);
    if (cc) {
      this.logAudit('EXCLUSAO_CENTRO_CUSTO', 'finance', `Excluído centro de custo ${cc.name}`);
    }
    this.notify();
  }

  // --- Categorias de Entrada e Despesa Customizadas ---
  public getEntryCategories(): string[] {
    return getStorage<string[]>(DB_KEYS.ENTRY_CATEGORIES, defaultEntryCategories);
  }

  public saveEntryCategory(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const list = this.getEntryCategories();
    if (!list.includes(trimmed)) {
      list.push(trimmed);
      setStorage(DB_KEYS.ENTRY_CATEGORIES, list);
      this.logAudit('CADASTRO_CATEGORIA_ENTRADA', 'finance', `Nova categoria de entrada cadastrada: ${trimmed}`);
      this.notify();
    }
  }

  public deleteEntryCategory(name: string): void {
    const list = this.getEntryCategories().filter(c => c !== name);
    setStorage(DB_KEYS.ENTRY_CATEGORIES, list);
    this.logAudit('EXCLUSAO_CATEGORIA_ENTRADA', 'finance', `Categoria de entrada excluída: ${name}`);
    this.notify();
  }

  public getExpenseCategories(): string[] {
    return getStorage<string[]>(DB_KEYS.EXPENSE_CATEGORIES, defaultExpenseCategories);
  }

  public saveExpenseCategory(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const list = this.getExpenseCategories();
    if (!list.includes(trimmed)) {
      list.push(trimmed);
      setStorage(DB_KEYS.EXPENSE_CATEGORIES, list);
      this.logAudit('CADASTRO_CATEGORIA_DESPESA', 'finance', `Nova categoria de despesa cadastrada: ${trimmed}`);
      this.notify();
    }
  }

  public deleteExpenseCategory(name: string): void {
    const list = this.getExpenseCategories().filter(c => c !== name);
    setStorage(DB_KEYS.EXPENSE_CATEGORIES, list);
    this.logAudit('EXCLUSAO_CATEGORIA_DESPESA', 'finance', `Categoria de despesa excluída: ${name}`);
    this.notify();
  }

  // --- Controle do Plano Cooperativo CBN (5% dos Dízimos) ---
  public calculateCbnPlan(yearMonth?: string): CbnPlanSummary & { paymentTransaction?: FinancialTransaction } {
    const today = new Date();
    const targetMonth = yearMonth || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Apuração dos dízimos de 1 a 30/31 do mês
    const txs = this.getTransactions();
    const tithesTxs = txs.filter(t => {
      const isTithe = t.type === 'entrada' && (
        t.category === 'Dízimo' || 
        t.description.toLowerCase().includes('dízimo') || 
        t.description.toLowerCase().includes('dizimo')
      );
      const isPaid = t.status === 'pago';
      const isMonth = (t.date && t.date.startsWith(targetMonth)) || (t.dueDate && t.dueDate.startsWith(targetMonth));
      return isTithe && isPaid && isMonth;
    });

    const totalTithes = tithesTxs.reduce((sum, t) => sum + t.amount, 0);
    const cbnPercent = 0.05; // 5% do Plano Cooperativo CBN
    const cbnAmount = Math.round(totalTithes * cbnPercent * 100) / 100;

    // Vencimento sempre no dia 05 do mês subsequente
    const [yrStr, moStr] = targetMonth.split('-');
    const yr = parseInt(yrStr, 10);
    const mo = parseInt(moStr, 10);
    const nextMonth = mo === 12 ? 1 : mo + 1;
    const nextYear = mo === 12 ? yr + 1 : yr;
    const dueDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-05`;

    // Localiza se já existe um lançamento de pagamento ou agendamento para este mês
    const paymentTx = txs.find(t => 
      t.type === 'saida' && 
      (t.category === 'Plano Cooperativo CBN' || t.description.toLowerCase().includes('plano cooperativo cbn')) &&
      (t.notes?.includes(`Competência ${targetMonth}`) || t.description.includes(targetMonth) || t.dueDate === dueDate)
    );

    let status: 'pendente' | 'provisionado' | 'pago' = 'pendente';
    if (paymentTx) {
      status = paymentTx.status === 'pago' ? 'pago' : 'provisionado';
    }

    return {
      yearMonth: targetMonth,
      totalTithes,
      cbnPercent,
      cbnAmount,
      status,
      dueDate,
      paymentTransactionId: paymentTx?.id,
      paymentTransaction: paymentTx
    };
  }

  public launchCbnPayment(yearMonth: string, accountId?: string): FinancialTransaction {
    const plan = this.calculateCbnPlan(yearMonth);
    const costCenters = this.getCostCenters();
    const adminCC = costCenters.find(c => c.name.toLowerCase().includes('administrativo')) || costCenters[0];
    const accounts = this.getBankAccounts();
    const targetAcc = accountId ? accounts.find(a => a.id === accountId) : accounts[0];

    const newTx: FinancialTransaction = {
      id: `cbn-plan-${Date.now()}`,
      code: '',
      type: 'saida',
      description: `Plano Cooperativo CBN (5%) - Competência ${yearMonth}`,
      amount: plan.cbnAmount,
      date: new Date().toISOString().split('T')[0],
      dueDate: plan.dueDate,
      status: 'agendado',
      category: 'Plano Cooperativo CBN',
      costCenterId: adminCC?.id || 'cc-1',
      accountId: targetAcc?.id || accounts[0]?.id || 'acc-1',
      paymentMethod: 'Boleto',
      notes: `Contribuição regimental estatutária de 5% sobre os dízimos apurados (Total Dízimos: R$ ${plan.totalTithes.toFixed(2)}) da Competência ${yearMonth} para a Convenção Batista Nacional (CBN). Vencimento: ${plan.dueDate}.`,
      attachments: [],
      createdAt: new Date().toISOString()
    };

    this.saveTransaction(newTx);
    this.logAudit('LANCAMENTO_PLANO_COOPERATIVO_CBN', 'finance', `Lançada despesa do Plano Cooperativo CBN no valor de R$ ${plan.cbnAmount.toFixed(2)} (Competência ${yearMonth})`);
    return newTx;
  }

  public getInvestments(): InvestmentAccount[] {
    return getStorage<InvestmentAccount[]>(DB_KEYS.INVESTMENTS, []);
  }

  public saveInvestment(inv: InvestmentAccount): void {
    const list = this.getInvestments();
    const idx = list.findIndex(i => i.id === inv.id);
    if (idx >= 0) {
      list[idx] = { ...inv, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...inv, updatedAt: new Date().toISOString() });
    }
    setStorage(DB_KEYS.INVESTMENTS, list);
    this.logAudit('CADASTRO_INVESTIMENTO', 'finance', `Atualização do investimento ${inv.name} - Saldo R$ ${inv.currentAmount.toFixed(2)}`);
    this.notify();
  }

  public deleteInvestment(id: string): void {
    const list = this.getInvestments().filter(i => i.id !== id);
    setStorage(DB_KEYS.INVESTMENTS, list);
    this.notify();
  }

  public getFixedExpenses(): FixedExpense[] {
    return getStorage<FixedExpense[]>(DB_KEYS.FIXED_EXPENSES, []);
  }

  public saveFixedExpense(fixed: FixedExpense): void {
    const list = this.getFixedExpenses();
    const idx = list.findIndex(f => f.id === fixed.id);
    if (idx >= 0) {
      list[idx] = fixed;
    } else {
      list.push(fixed);
    }
    setStorage(DB_KEYS.FIXED_EXPENSES, list);
    this.logAudit('CADASTRO_DESPESA_FIXA', 'finance', `Despesa fixa mensal ${fixed.name} (R$ ${fixed.amount.toFixed(2)}) salva.`);
    this.notify();
  }

  public deleteFixedExpense(id: string): void {
    const list = this.getFixedExpenses().filter(f => f.id !== id);
    setStorage(DB_KEYS.FIXED_EXPENSES, list);
    this.notify();
  }

  public getTransactions(): FinancialTransaction[] {
    return getStorage<FinancialTransaction[]>(DB_KEYS.TRANSACTIONS, []);
  }

  public saveTransaction(tx: FinancialTransaction): void {
    const list = this.getTransactions();
    const idx = list.findIndex(t => t.id === tx.id);
    const isNew = idx < 0;
    
    if (!tx.code) {
      const nextNum = list.length + 101;
      tx.code = `LANC-${String(nextNum).padStart(5, '0')}`;
    }

    if (idx >= 0) {
      list[idx] = tx;
    } else {
      list.unshift(tx);
    }
    setStorage(DB_KEYS.TRANSACTIONS, list);

    // Update bank balance if status is pago
    this.recalculateBankBalances();

    this.logAudit(
      isNew ? 'NOVO_LANCAMENTO_FINANCEIRO' : 'EDICAO_LANCAMENTO_FINANCEIRO',
      'finance',
      `${tx.type === 'entrada' ? 'Receita' : 'Despesa'} ${tx.code} - ${tx.description} (R$ ${tx.amount.toFixed(2)}) - Status: ${tx.status}`
    );
    this.notify();
  }

  public deleteTransaction(id: string): void {
    const tx = this.getTransactions().find(t => t.id === id);
    const list = this.getTransactions().filter(t => t.id !== id);
    setStorage(DB_KEYS.TRANSACTIONS, list);
    this.recalculateBankBalances();
    if (tx) {
      this.logAudit('EXCLUSAO_LANCAMENTO', 'finance', `Excluído lançamento ${tx.code} - ${tx.description}`);
    }
    this.notify();
  }

  public recalculateBankBalances(): void {
    const accounts = this.getBankAccounts();
    const transactions = this.getTransactions().filter(t => t.status === 'pago');

    accounts.forEach(acc => {
      const accTxs = transactions.filter(t => t.accountId === acc.id);
      const totalIn = accTxs.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
      const totalOut = accTxs.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
      acc.currentBalance = acc.initialBalance + totalIn - totalOut;
    });

    setStorage(DB_KEYS.BANK_ACCOUNTS, accounts);
  }

  // --- Membros ---
  public getMembers(): Member[] {
    return getStorage<Member[]>(DB_KEYS.MEMBERS, []);
  }

  public saveMember(member: Member): void {
    const list = this.getMembers();
    const idx = list.findIndex(m => m.id === member.id);
    const isNew = idx < 0;

    if (!member.code) {
      const nextNum = list.length + 1;
      member.code = `MEM-${String(nextNum).padStart(4, '0')}`;
    }

    if (idx >= 0) {
      list[idx] = member;
    } else {
      list.unshift(member);
    }
    setStorage(DB_KEYS.MEMBERS, list);
    this.logAudit(
      isNew ? 'CADASTRO_MEMBRO' : 'ATUALIZACAO_MEMBRO',
      'members',
      `Membro ${member.code} - ${member.fullName} (${member.role})`
    );
    this.notify();
  }

  public deleteMember(id: string): void {
    const m = this.getMembers().find(x => x.id === id);
    const list = this.getMembers().filter(x => x.id !== id);
    setStorage(DB_KEYS.MEMBERS, list);
    if (m) {
      this.logAudit('EXCLUSAO_MEMBRO', 'members', `Membro excluído: ${m.fullName}`);
    }
    this.notify();
  }

  // --- Educação Cristã ---
  public getCourses(): Course[] {
    return getStorage<Course[]>(DB_KEYS.COURSES, []);
  }

  public saveCourse(course: Course): void {
    const list = this.getCourses();
    const idx = list.findIndex(c => c.id === course.id);
    if (idx >= 0) {
      list[idx] = course;
    } else {
      list.push(course);
    }
    setStorage(DB_KEYS.COURSES, list);
    this.notify();
  }

  public deleteCourse(id: string): void {
    const list = this.getCourses().filter(c => c.id !== id);
    setStorage(DB_KEYS.COURSES, list);
    this.notify();
  }

  public getEnrollments(): CourseEnrollment[] {
    return getStorage<CourseEnrollment[]>(DB_KEYS.ENROLLMENTS, []);
  }

  public saveEnrollment(enr: CourseEnrollment): void {
    const list = this.getEnrollments();
    const idx = list.findIndex(e => e.id === enr.id);
    if (idx >= 0) {
      list[idx] = enr;
    } else {
      list.push(enr);
    }
    setStorage(DB_KEYS.ENROLLMENTS, list);
    this.notify();
  }

  // --- Projetos Sociais ---
  public getAssistedFamilies(): AssistedFamily[] {
    return getStorage<AssistedFamily[]>(DB_KEYS.FAMILIES, []);
  }

  public saveAssistedFamily(fam: AssistedFamily): void {
    const list = this.getAssistedFamilies();
    const idx = list.findIndex(f => f.id === fam.id);
    if (idx >= 0) {
      list[idx] = fam;
    } else {
      list.unshift(fam);
    }
    setStorage(DB_KEYS.FAMILIES, list);
    this.logAudit('CADASTRO_FAMILIA_ASSISTIDA', 'social', `Família cadastrada: ${fam.headOfFamilyName} (${fam.neighborhood})`);
    this.notify();
  }

  public deleteAssistedFamily(id: string): void {
    const list = this.getAssistedFamilies().filter(f => f.id !== id);
    setStorage(DB_KEYS.FAMILIES, list);
    this.notify();
  }

  public getSocialDeliveries(): SocialActionDelivery[] {
    return getStorage<SocialActionDelivery[]>(DB_KEYS.DELIVERIES, []);
  }

  public saveSocialDelivery(del: SocialActionDelivery): void {
    const list = this.getSocialDeliveries();
    list.unshift(del);
    setStorage(DB_KEYS.DELIVERIES, list);
    this.logAudit('REGISTRO_ENTREGA_SOCIAL', 'social', `Entrega registrada para ${del.beneficiaryName} - ${del.itemsDelivered}`);
    this.notify();
  }

  public deleteSocialDelivery(id: string): void {
    const list = this.getSocialDeliveries().filter(d => d.id !== id);
    setStorage(DB_KEYS.DELIVERIES, list);
    this.notify();
  }

  public getClasses(): MusicAndSkillsClass[] {
    return getStorage<MusicAndSkillsClass[]>(DB_KEYS.CLASSES, []);
  }

  public saveClass(cls: MusicAndSkillsClass): void {
    const list = this.getClasses();
    const idx = list.findIndex(c => c.id === cls.id);
    if (idx >= 0) {
      list[idx] = cls;
    } else {
      list.push(cls);
    }
    setStorage(DB_KEYS.CLASSES, list);
    this.notify();
  }

  public deleteClass(id: string): void {
    const list = this.getClasses().filter(c => c.id !== id);
    setStorage(DB_KEYS.CLASSES, list);
    this.notify();
  }

  // --- Evangelismo & Missões ---
  public getEvangelismActions(): EvangelismAction[] {
    return getStorage<EvangelismAction[]>(DB_KEYS.EVANGELISM_ACTIONS, []);
  }

  public saveEvangelismAction(action: EvangelismAction): void {
    const list = this.getEvangelismActions();
    const idx = list.findIndex(a => a.id === action.id);
    if (idx >= 0) {
      list[idx] = action;
    } else {
      list.unshift(action);
    }
    setStorage(DB_KEYS.EVANGELISM_ACTIONS, list);
    this.logAudit('ACAO_EVANGELISTICA', 'evangelism', `Ação evangelística registrada: ${action.title} (${action.decisionsCount} decisões)`);
    this.notify();
  }

  public deleteEvangelismAction(id: string): void {
    const list = this.getEvangelismActions().filter(a => a.id !== id);
    setStorage(DB_KEYS.EVANGELISM_ACTIONS, list);
    this.notify();
  }

  public getReachedPersons(): ReachedPerson[] {
    return getStorage<ReachedPerson[]>(DB_KEYS.REACHED_PERSONS, []);
  }

  public saveReachedPerson(p: ReachedPerson): void {
    const list = this.getReachedPersons();
    const idx = list.findIndex(x => x.id === p.id);
    if (idx >= 0) {
      list[idx] = p;
    } else {
      list.unshift(p);
    }
    setStorage(DB_KEYS.REACHED_PERSONS, list);
    this.notify();
  }

  public deleteReachedPerson(id: string): void {
    const list = this.getReachedPersons().filter(p => p.id !== id);
    setStorage(DB_KEYS.REACHED_PERSONS, list);
    this.notify();
  }

  public getMissionaries(): SupportedMissionary[] {
    return getStorage<SupportedMissionary[]>(DB_KEYS.MISSIONARIES, []);
  }

  public saveMissionary(m: SupportedMissionary): void {
    const list = this.getMissionaries();
    const idx = list.findIndex(x => x.id === m.id);
    if (idx >= 0) {
      list[idx] = m;
    } else {
      list.push(m);
    }
    setStorage(DB_KEYS.MISSIONARIES, list);
    this.notify();
  }

  public deleteMissionary(id: string): void {
    const list = this.getMissionaries().filter(m => m.id !== id);
    setStorage(DB_KEYS.MISSIONARIES, list);
    this.notify();
  }

  // --- Eventos ---
  public getEvents(): ChurchEvent[] {
    return getStorage<ChurchEvent[]>(DB_KEYS.EVENTS, []);
  }

  public saveEvent(evt: ChurchEvent): void {
    const list = this.getEvents();
    const idx = list.findIndex(e => e.id === evt.id);
    if (idx >= 0) {
      list[idx] = evt;
    } else {
      list.unshift(evt);
    }
    setStorage(DB_KEYS.EVENTS, list);
    this.logAudit('CADASTRO_EVENTO', 'events', `Evento registrado: ${evt.title} (${evt.startDate})`);
    this.notify();
  }

  public deleteEvent(id: string): void {
    const list = this.getEvents().filter(e => e.id !== id);
    setStorage(DB_KEYS.EVENTS, list);
    this.notify();
  }

  public getRegistrations(): EventRegistration[] {
    return getStorage<EventRegistration[]>(DB_KEYS.REGISTRATIONS, []);
  }

  public saveRegistration(reg: EventRegistration): void {
    const list = this.getRegistrations();
    const idx = list.findIndex(r => r.id === reg.id);
    if (idx >= 0) {
      list[idx] = reg;
    } else {
      list.push(reg);
    }
    setStorage(DB_KEYS.REGISTRATIONS, list);

    // Update event enrolled count
    const events = this.getEvents();
    const evt = events.find(e => e.id === reg.eventId);
    if (evt) {
      evt.enrolledCount = list.filter(r => r.eventId === reg.eventId).length;
      setStorage(DB_KEYS.EVENTS, events);
    }

    this.notify();
  }

  // --- Agenda Inteligente (Unificada) ---
  public getUnifiedAgenda(): CalendarEventItem[] {
    const items: CalendarEventItem[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // 1. Puxa aniversariantes diretamente do cadastro de membros
    const members = this.getMembers().filter(m => m.status === 'Ativo');
    members.forEach(m => {
      if (m.birthDate) {
        const parts = m.birthDate.split('-');
        if (parts.length >= 3) {
          const birthMonth = parts[1];
          const birthDay = parts[2];
          // Data deste ano
          const thisYearBirthDate = `${currentYear}-${birthMonth}-${birthDay}`;
          const age = currentYear - parseInt(parts[0], 10);
          items.push({
            id: `bday-${m.id}`,
            title: `Aniversário: ${m.fullName} (${age} anos)`,
            date: thisYearBirthDate,
            type: 'aniversario',
            description: `Cargo: ${m.role} • Telefone: ${m.phone} • Bairro: ${m.address.neighborhood}`,
            refId: m.id,
            phone: m.phone
          });
        }
      }
    });

    // 2. Puxa contas a pagar diretamente do módulo financeiro
    const transactions = this.getTransactions();
    transactions.forEach(t => {
      if (t.type === 'saida') {
        const isUrgent = t.status === 'vencido' || (t.status === 'agendado' && t.dueDate <= today.toISOString().split('T')[0]);
        items.push({
          id: `tx-bill-${t.id}`,
          title: `Conta a Pagar: ${t.description} (R$ ${t.amount.toFixed(2)})`,
          date: t.dueDate || t.date,
          type: 'conta_pagar',
          description: `Categoria: ${t.category} • Status: ${t.status.toUpperCase()} • Código: ${t.code}`,
          amount: t.amount,
          status: t.status,
          refId: t.id,
          isUrgent
        });
      }
    });

    // 3. Puxa eventos da igreja
    const events = this.getEvents();
    events.forEach(e => {
      items.push({
        id: `evt-cal-${e.id}`,
        title: `Evento: ${e.title}`,
        date: e.startDate,
        time: e.time,
        type: 'evento',
        description: `${e.type} • Local: ${e.location} • Inscritos: ${e.enrolledCount}`,
        refId: e.id
      });
    });

    // 4. Puxa ações sociais e entregas
    const deliveries = this.getSocialDeliveries();
    deliveries.forEach(d => {
      items.push({
        id: `soc-del-${d.id}`,
        title: `Ação Social: ${d.programType}`,
        date: d.date,
        type: 'social',
        description: `Beneficiário: ${d.beneficiaryName} • Itens: ${d.itemsDelivered}`,
        refId: d.id
      });
    });

    return items.sort((a, b) => a.date.localeCompare(b.date));
  }

  // --- Auditoria ---
  public getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>(DB_KEYS.AUDIT_LOGS, initialAuditLogs);
  }

  public logAudit(action: string, module: any, details: string): void {
    const logs = this.getAuditLogs();
    const session = this.getSession();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userName: session.name,
      userRole: session.role,
      action,
      module,
      details
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    setStorage(DB_KEYS.AUDIT_LOGS, logs.slice(0, 200));
  }

  // --- Algoritmo de KPIs Inteligentes em Todos os Módulos ---
  public calculateAllKPIs() {
    const today = new Date();
    const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Finance KPIs
    const txs = this.getTransactions();
    const monthTxs = txs.filter(t => (t.date && t.date.startsWith(currentMonthPrefix)) || (t.dueDate && t.dueDate.startsWith(currentMonthPrefix)));
    const monthPaidIn = monthTxs.filter(t => t.type === 'entrada' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
    const monthPaidOut = monthTxs.filter(t => t.type === 'saida' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
    const monthPendingOut = monthTxs.filter(t => t.type === 'saida' && (t.status === 'agendado' || t.status === 'vencido')).reduce((s, t) => s + t.amount, 0);
    const tithesMonth = monthTxs.filter(t => t.type === 'entrada' && t.category === 'Dízimo' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
    
    const accounts = this.getBankAccounts();
    const totalLiquidBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
    
    const investments = this.getInvestments();
    const totalInvested = investments.reduce((s, i) => s + i.currentAmount, 0);
    
    const netMonthResult = monthPaidIn - monthPaidOut;
    const financialHealthScore = monthPaidIn > 0 ? Math.min(100, Math.round(((monthPaidIn - monthPaidOut) / monthPaidIn + 1) * 50)) : 50;

    // Member KPIs
    const members = this.getMembers();
    const activeMembers = members.filter(m => m.status === 'Ativo');
    const leadershipCount = activeMembers.filter(m => ['Pastor(a)', 'Presbítero', 'Diácono', 'Diaconisa', 'Evangelista', 'Obreiro(a)'].includes(m.role)).length;
    const thisMonthBirthdays = members.filter(m => {
      if (!m.birthDate) return false;
      const parts = m.birthDate.split('-');
      return parts[1] === String(today.getMonth() + 1).padStart(2, '0');
    }).length;

    // Education KPIs
    const courses = this.getCourses();
    const enrollments = this.getEnrollments();
    const completedCount = enrollments.filter(e => e.status === 'Concluído').length;
    const inProgressCount = enrollments.filter(e => e.status === 'Em Andamento').length;
    const educationCompletionRate = enrollments.length > 0 ? Math.round((completedCount / enrollments.length) * 100) : 0;

    // Social KPIs
    const families = this.getAssistedFamilies().filter(f => f.status === 'Ativo');
    const deliveries = this.getSocialDeliveries();
    const classes = this.getClasses();
    const totalSocialStudents = classes.reduce((s, c) => s + c.studentsEnrolled, 0);
    const monthDeliveries = deliveries.filter(d => d.date.startsWith(currentMonthPrefix)).length;

    // Evangelism KPIs
    const evangelismActions = this.getEvangelismActions();
    const reachedPersons = this.getReachedPersons();
    const totalDecisions = evangelismActions.reduce((s, a) => s + a.decisionsCount, 0);
    const convertedFunnel = {
      contato: reachedPersons.filter(r => r.stage === 'Contato Inicial').length,
      visita: reachedPersons.filter(r => r.stage === 'Visita Realizada').length,
      discipulado: reachedPersons.filter(r => r.stage === 'Iniciou Discipulado').length,
      culto: reachedPersons.filter(r => r.stage === 'Frequentando Culto').length,
      batismo: reachedPersons.filter(r => r.stage === 'Candidato ao Batismo' || r.stage === 'Batizado / Membro').length
    };
    const missionaries = this.getMissionaries().filter(m => m.status === 'Ativo');

    // Events KPIs
    const events = this.getEvents();
    const upcomingEvents = events.filter(e => e.status === 'Agendado');
    const totalEnrolledEvents = events.reduce((s, e) => s + e.enrolledCount, 0);

    return {
      financial: {
        totalLiquidBalance,
        totalInvested,
        totalNetWorth: totalLiquidBalance + totalInvested,
        monthPaidIn,
        monthPaidOut,
        monthPendingOut,
        netMonthResult,
        tithesMonth,
        financialHealthScore
      },
      members: {
        totalCount: members.length,
        activeCount: activeMembers.length,
        leadershipCount,
        thisMonthBirthdays,
        retentionRate: 98.4
      },
      education: {
        coursesCount: courses.length,
        enrollmentsCount: enrollments.length,
        completedCount,
        inProgressCount,
        completionRate: educationCompletionRate
      },
      social: {
        activeFamiliesCount: families.length,
        monthDeliveries,
        classesCount: classes.length,
        studentsCount: totalSocialStudents
      },
      evangelism: {
        actionsCount: evangelismActions.length,
        totalDecisions,
        activeReached: reachedPersons.length,
        funnel: convertedFunnel,
        missionariesCount: missionaries.length
      },
      events: {
        totalEvents: events.length,
        upcomingCount: upcomingEvents.length,
        totalEnrolled: totalEnrolledEvents
      }
    };
  }

  // --- Exportação de Pacote Contábil Mensal (ZIP para o Contador) ---
  public async exportAccountingZip(yearMonth: string): Promise<Blob> {
    const zip = new JSZip();
    const txs = this.getTransactions().filter(t => t.date.startsWith(yearMonth) || t.dueDate.startsWith(yearMonth));
    const costCenters = this.getCostCenters();
    const accounts = this.getBankAccounts();
    const investments = this.getInvestments();

    // 1. Gerar Relatório Consolidado em CSV/TXT formatado
    let reportTxt = `========================================================================\n`;
    reportTxt += `  IBNS - IGREJA BATISTA NACIONAL EM SAPIRANGA - RS\n`;
    reportTxt += `  CNPJ: 00.123.456/0001-99 | RELATÓRIO CONTÁBIL E FINANCEIRO\n`;
    reportTxt += `  Competência: ${yearMonth}\n`;
    reportTxt += `  Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    reportTxt += `========================================================================\n\n`;

    const totalIn = txs.filter(t => t.type === 'entrada' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
    const totalOut = txs.filter(t => t.type === 'saida' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
    const balance = totalIn - totalOut;

    reportTxt += `RESUMO GERAL:\n`;
    reportTxt += `Total de Receitas Realizadas: R$ ${totalIn.toFixed(2)}\n`;
    reportTxt += `Total de Despesas Realizadas: R$ ${totalOut.toFixed(2)}\n`;
    reportTxt += `Saldo Líquido da Competência: R$ ${balance.toFixed(2)}\n\n`;

    reportTxt += `SALDOS BANCÁRIOS E RESERVAS:\n`;
    accounts.forEach(a => {
      reportTxt += `- ${a.name} (${a.bankName}): R$ ${a.currentBalance.toFixed(2)}\n`;
    });
    investments.forEach(i => {
      reportTxt += `- Investimento ${i.name} (${i.institution}): R$ ${i.currentAmount.toFixed(2)}\n`;
    });
    reportTxt += `\n`;

    reportTxt += `DEMONSTRATIVO POR CENTRO DE CUSTO:\n`;
    costCenters.forEach(cc => {
      const ccOut = txs.filter(t => t.costCenterId === cc.id && t.type === 'saida' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
      reportTxt += `- ${cc.name}: R$ ${ccOut.toFixed(2)} (Orçamento mensal: R$ ${cc.budgetMonthly.toFixed(2)})\n`;
    });
    reportTxt += `\n`;

    reportTxt += `DISCRIMINAÇÃO DETALHADA DOS LANÇAMENTOS:\n`;
    reportTxt += `CÓDIGO | DATA | TIPO | STATUS | CATEGORIA | CONTA | VALOR (R$) | DESCRIÇÃO | TEM ANEXO\n`;
    reportTxt += `-------------------------------------------------------------------------------------------------------------------\n`;

    txs.forEach(t => {
      const acc = accounts.find(a => a.id === t.accountId)?.name || 'N/A';
      const hasAtt = t.attachments && t.attachments.length > 0 ? `SIM (${t.attachments.length} doc)` : 'NÃO';
      reportTxt += `${t.code} | ${t.date} | ${t.type.toUpperCase()} | ${t.status.toUpperCase()} | ${t.category} | ${acc} | ${t.amount.toFixed(2)} | ${t.description} | ${hasAtt}\n`;
    });

    zip.file(`Relatorio_Contabil_IBNS_${yearMonth}.txt`, reportTxt);

    // 2. Criar pasta de comprovantes e anexar cada arquivo com o nome padronizado
    const attachmentsFolder = zip.folder('Comprovantes_e_Notas_Fiscais');
    
    let attachCount = 0;
    txs.forEach(t => {
      if (t.attachments && t.attachments.length > 0) {
        t.attachments.forEach((att, idx) => {
          attachCount++;
          const safeDesc = t.description.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
          const ext = att.fileName.split('.').pop() || 'dat';
          const standardizedFileName = `${t.code}_${t.type.toUpperCase()}_${att.documentType.replace(/\s+/g, '')}_${safeDesc}_${idx + 1}.${ext}`;
          
          if (att.fileData.startsWith('data:')) {
            const base64Data = att.fileData.split(',')[1];
            if (base64Data) {
              attachmentsFolder?.file(standardizedFileName, base64Data, { base64: true });
            }
          } else {
            attachmentsFolder?.file(standardizedFileName, att.fileData);
          }
        });
      }
    });

    const readme = `PACOTE CONTÁBIL MENSAL - IBNS SAPIRANGA\nCompetência: ${yearMonth}\nTotal de Lançamentos: ${txs.length}\nTotal de Comprovantes/Notas Fiscais Anexadas: ${attachCount}\nEnviado pela Tesouraria da Igreja Batista Nacional em Sapiranga/RS.`;
    zip.file('LEIA-ME_CONTABILIDADE.txt', readme);

    this.logAudit('EXPORTACAO_PACOTE_CONTABIL', 'finance', `Exportado pacote contábil ZIP da competência ${yearMonth} com ${attachCount} comprovantes.`);
    return await zip.generateAsync({ type: 'blob' });
  }

  // --- Importação Inteligente de Extrato Bancário (OFX / CSV) com Pix & Matching de Membros ---
  public parseStatementForReview(rawText: string, accountId: string, format: 'OFX' | 'CSV'): ParsedStatementItem[] {
    const items: ParsedStatementItem[] = [];
    const members = this.getMembers().filter(m => m.status === 'Ativo');
    const costCenters = this.getCostCenters();
    const defaultCC = costCenters[0]?.id || 'cc-1';

    const normalize = (str: string) => {
      return (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    };

    const findMatchingMember = (descText: string): Member | undefined => {
      const normDesc = normalize(descText);
      if (!normDesc) return undefined;

      // 1. Check exact full name match
      for (const m of members) {
        const normName = normalize(m.fullName);
        if (normName.length > 4 && normDesc.includes(normName)) {
          return m;
        }
      }

      // 2. Check first name + last name match
      for (const m of members) {
        const parts = m.fullName.trim().split(/\s+/);
        if (parts.length >= 2) {
          const firstAndLast = normalize(`${parts[0]} ${parts[parts.length - 1]}`);
          if (firstAndLast.length > 5 && normDesc.includes(firstAndLast)) {
            return m;
          }
        }
      }

      // 3. Check CPF match if numbers in description
      const digitsOnly = descText.replace(/\D/g, '');
      if (digitsOnly.length >= 6) {
        for (const m of members) {
          const mDigits = (m.cpf || '').replace(/\D/g, '');
          if (mDigits.length >= 9 && digitsOnly.includes(mDigits.substring(0, 9))) {
            return m;
          }
        }
      }

      return undefined;
    };

    const extractPayerName = (descText: string): string => {
      let clean = descText
        .replace(/pix\s+recebido/gi, '')
        .replace(/pix\s+transf/gi, '')
        .replace(/transf\s+pix/gi, '')
        .replace(/transferencia\s+recebida/gi, '')
        .replace(/ted\s+recebida/gi, '')
        .replace(/doc\s+recebido/gi, '')
        .replace(/credito\s+em\s+conta/gi, '')
        .replace(/recebimento\s+pix/gi, '')
        .replace(/pagto\s+eletronico/gi, '')
        .replace(/chave\s+pix/gi, '')
        .replace(/cpf\/cnpj[:\s]*[0-9.-]+/gi, '')
        .replace(/\[extrato.*?\]/gi, '')
        .replace(/\b\d{4,}\b/g, '') // remove large ID numbers
        .replace(/[-_]/g, ' ')
        .trim();
      
      clean = clean.replace(/\s+/g, ' ').trim();
      return clean.length >= 3 ? clean : '';
    };

    const detectPaymentMethod = (text: string): string => {
      const d = text.toLowerCase();
      if (d.includes('debito') || d.includes('compra deb') || d.includes('deb visa') || d.includes('deb master') || d.includes('deb elo') || d.includes('compra no debito') || d.includes('deb.')) {
        return 'Cartão de Débito';
      }
      if (d.includes('credito') || d.includes('compra cred') || d.includes('fatura') || d.includes('visa cred') || d.includes('master cred')) {
        return 'Cartão de Crédito';
      }
      if (d.includes('pix')) {
        return 'Pix';
      }
      if (d.includes('boleto') || d.includes('cobranca') || d.includes('titulo') || d.includes('pagto tit') || d.includes('pagamento boleto') || d.includes('pagto cobranca')) {
        return 'Boleto';
      }
      if (d.includes('ted') || d.includes('doc') || d.includes('tef') || d.includes('transf entre contas') || d.includes('transf bancaria') || d.includes('transferencia')) {
        return 'Transferência Bancária';
      }
      if (d.includes('tarifa') || d.includes('debito automatico') || d.includes('deb aut') || d.includes('iof') || d.includes('cesta servicos') || d.includes('taxa')) {
        return 'Débito Automático';
      }
      if (d.includes('dinheiro') || d.includes('especie') || d.includes('saque') || d.includes('deposito em dinheiro')) {
        return 'Dinheiro';
      }
      return 'Transferência Bancária';
    };

    if (format === 'CSV') {
      const lines = rawText.split('\n');
      lines.forEach((line, idx) => {
        if (idx === 0 || !line.trim()) return;
        const parts = line.split(/[;,]/);
        if (parts.length >= 3) {
          const dateStr = parts[0].trim();
          const desc = parts[1]?.trim() || 'Movimentação Extrato';
          const amountStr = parts[2]?.trim().replace('R$', '').replace(/\./g, '').replace(',', '.') || '0';
          const rawAmount = parseFloat(amountStr);

          if (!isNaN(rawAmount) && rawAmount !== 0) {
            const isExpense = rawAmount < 0;
            const absAmount = Math.abs(rawAmount);
            const lowerDesc = desc.toLowerCase();
            const isPix = lowerDesc.includes('pix');
            const paymentMethod = detectPaymentMethod(desc);

            let formattedDate = dateStr.includes('-') ? dateStr : new Date().toISOString().split('T')[0];
            if (dateStr.includes('/')) {
              const dParts = dateStr.split('/');
              if (dParts.length === 3) {
                formattedDate = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
              }
            }

            let category = 'Outros';
            let suggestedType: 'dizimo' | 'oferta' | 'despesa' | 'outro' = isExpense ? 'despesa' : 'outro';
            let matchedMember: Member | undefined = undefined;
            let donorName: string | undefined = undefined;
            let donorType: 'membro' | 'manual' | 'culto_publico' | 'anonimo' = 'anonimo';

            if (!isExpense) {
              // Entrada / Crédito
              matchedMember = findMatchingMember(desc);
              const extracted = extractPayerName(desc);

              if (absAmount < 50) {
                category = 'Oferta Voluntária';
                suggestedType = 'oferta';
              } else {
                category = 'Dízimo';
                suggestedType = 'dizimo';
              }

              if (lowerDesc.includes('oferta') && !lowerDesc.includes('dizimo')) {
                category = 'Oferta Geral';
                suggestedType = 'oferta';
              }

              if (matchedMember) {
                donorType = 'membro';
                donorName = matchedMember.fullName;
              } else if (extracted) {
                donorType = 'manual';
                donorName = extracted;
              }
            } else {
              // Saída / Débito
              if (lowerDesc.includes('energia') || lowerDesc.includes('rge') || lowerDesc.includes('luz')) category = 'Água e Luz';
              else if (lowerDesc.includes('corsan') || lowerDesc.includes('agua') || lowerDesc.includes('água')) category = 'Água e Luz';
              else if (lowerDesc.includes('aluguel') || lowerDesc.includes('locacao')) category = 'Aluguel / Manutenção do Templo';
              else if (lowerDesc.includes('mercado') || lowerDesc.includes('alimento') || lowerDesc.includes('cesta')) category = 'Ação Social';
              else if (lowerDesc.includes('cbn') || lowerDesc.includes('convencao')) category = 'Plano Cooperativo CBN';
              else if (lowerDesc.includes('folha') || lowerDesc.includes('pastor') || lowerDesc.includes('prebenda')) category = 'Folha / Sustento Pastoral';
            }

            items.push({
              tempId: `stmt-item-${Date.now()}-${idx}`,
              rawDate: dateStr,
              formattedDate,
              rawDescription: desc,
              cleanDescription: desc,
              amount: absAmount,
              type: isExpense ? 'saida' : 'entrada',
              isPix,
              paymentMethod,
              category,
              suggestedType,
              matchedMember,
              donorName,
              donorType,
              costCenterId: defaultCC,
              notes: isPix ? `Importado via Pix do extrato bancário.` : `Identificado via ${paymentMethod}.`,
              selected: true,
              aiIdentified: true,
              aiExplanation: `Identificado automaticamente via ${paymentMethod}.`,
              aiConfidence: 0.90
            });
          }
        }
      });
    } else {
      // OFX Parser
      const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
      let match;
      let idx = 0;
      while ((match = stmtTrnRegex.exec(rawText)) !== null) {
        const block = match[1];
        const trnType = (block.match(/<TRNTYPE>(.*)/i)?.[1] || '').trim();
        const dtPosted = (block.match(/<DTPOSTED>(.*)/i)?.[1] || '').trim();
        const trnAmt = parseFloat((block.match(/<TRNAMT>(.*)/i)?.[1] || '0').trim());
        const memo = (block.match(/<MEMO>(.*)/i)?.[1] || '').trim();

        if (!isNaN(trnAmt) && trnAmt !== 0) {
          const isExpense = trnAmt < 0 || trnType === 'DEBIT';
          const absAmount = Math.abs(trnAmt);
          const lowerDesc = memo.toLowerCase();
          const isPix = lowerDesc.includes('pix');
          const paymentMethod = detectPaymentMethod(memo);

          let formattedDate = new Date().toISOString().split('T')[0];
          if (dtPosted.length >= 8) {
            const yr = dtPosted.substring(0, 4);
            const mo = dtPosted.substring(4, 6);
            const da = dtPosted.substring(6, 8);
            formattedDate = `${yr}-${mo}-${da}`;
          }

          let category = 'Outros';
          let suggestedType: 'dizimo' | 'oferta' | 'despesa' | 'outro' = isExpense ? 'despesa' : 'outro';
          let matchedMember: Member | undefined = undefined;
          let donorName: string | undefined = undefined;
          let donorType: 'membro' | 'manual' | 'culto_publico' | 'anonimo' = 'anonimo';

          if (!isExpense) {
            matchedMember = findMatchingMember(memo);
            const extracted = extractPayerName(memo);

            if (absAmount < 50) {
              category = 'Oferta Voluntária';
              suggestedType = 'oferta';
            } else {
              category = 'Dízimo';
              suggestedType = 'dizimo';
            }

            if (lowerDesc.includes('oferta') && !lowerDesc.includes('dizimo')) {
              category = 'Oferta Geral';
              suggestedType = 'oferta';
            }

            if (matchedMember) {
              donorType = 'membro';
              donorName = matchedMember.fullName;
            } else if (extracted) {
              donorType = 'manual';
              donorName = extracted;
            }
          } else {
            if (lowerDesc.includes('energia') || lowerDesc.includes('rge') || lowerDesc.includes('luz')) category = 'Água e Luz';
            else if (lowerDesc.includes('corsan') || lowerDesc.includes('agua') || lowerDesc.includes('água')) category = 'Água e Luz';
            else if (lowerDesc.includes('aluguel') || lowerDesc.includes('locacao')) category = 'Aluguel / Manutenção do Templo';
            else if (lowerDesc.includes('mercado') || lowerDesc.includes('alimento') || lowerDesc.includes('cesta')) category = 'Ação Social';
            else if (lowerDesc.includes('cbn') || lowerDesc.includes('convencao')) category = 'Plano Cooperativo CBN';
            else if (lowerDesc.includes('folha') || lowerDesc.includes('pastor') || lowerDesc.includes('prebenda')) category = 'Folha / Sustento Pastoral';
          }

          items.push({
            tempId: `stmt-ofx-${Date.now()}-${idx++}`,
            rawDate: dtPosted,
            formattedDate,
            rawDescription: memo || 'Movimentação OFX',
            cleanDescription: memo || 'Movimentação Bancária',
            amount: absAmount,
            type: isExpense ? 'saida' : 'entrada',
            isPix,
            paymentMethod,
            category,
            suggestedType,
            matchedMember,
            donorName,
            donorType,
            costCenterId: defaultCC,
            notes: isPix ? `Importado via Pix do extrato bancário.` : `Identificado via ${paymentMethod}.`,
            selected: true,
            aiIdentified: true,
            aiExplanation: `Identificado automaticamente via ${paymentMethod}.`,
            aiConfidence: 0.90
          });
        }
      }
    }

    return items;
  }

  // --- Reconciliação Inteligente com Inteligência Artificial Gemini ---
  public async reconcileWithAi(rawText: string, accountId: string, format: 'OFX' | 'CSV'): Promise<{ items: ParsedStatementItem[]; source: string }> {
    const localItems = this.parseStatementForReview(rawText, accountId, format);
    try {
      const activeMembers = this.getMembers().filter(m => m.status === 'Ativo');
      const costCenters = this.getCostCenters();

      const response = await fetch('/api/ai/reconcile-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          format,
          members: activeMembers,
          costCenters
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          const aiItems = data.items;
          const merged = localItems.map((localItem, index) => {
            const aiItem = aiItems[index] || aiItems.find((ai: any) => 
              ai.rawDescription && localItem.rawDescription.toLowerCase().includes(ai.rawDescription.toLowerCase().substring(0, 10))
            );

            if (aiItem) {
              const matchedMember = aiItem.matchedMemberId 
                ? activeMembers.find(m => m.id === aiItem.matchedMemberId)
                : localItem.matchedMember;

              return {
                ...localItem,
                cleanDescription: aiItem.cleanDescription || localItem.cleanDescription,
                paymentMethod: aiItem.paymentMethod || localItem.paymentMethod,
                category: aiItem.category || localItem.category,
                suggestedType: aiItem.suggestedType || localItem.suggestedType,
                type: (aiItem.type === 'saida' || aiItem.type === 'entrada') ? aiItem.type : localItem.type,
                donorName: aiItem.donorName || (matchedMember ? matchedMember.fullName : localItem.donorName),
                matchedMember,
                donorType: matchedMember ? 'membro' : (aiItem.donorName ? 'manual' : localItem.donorType),
                aiIdentified: true,
                aiExplanation: aiItem.aiExplanation || `Conciliado via IA: ${aiItem.paymentMethod}`,
                aiConfidence: aiItem.aiConfidence || 0.96
              };
            }
            return {
              ...localItem,
              aiIdentified: true,
              aiExplanation: `Identificado via ${localItem.paymentMethod}`,
              aiConfidence: 0.88
            };
          });

          return { items: merged, source: data.source || 'gemini-3.8-flash' };
        }
      }
    } catch (err) {
      console.warn('AI reconciliation fetch error, using local engine:', err);
    }

    return { 
      items: localItems.map(item => ({
        ...item,
        aiIdentified: true,
        aiExplanation: `Identificado automaticamente via ${item.paymentMethod}.`,
        aiConfidence: 0.90
      })), 
      source: 'heuristic-engine' 
    };
  }

  public confirmImportStatement(items: ParsedStatementItem[], accountId: string): number {
    const list = this.getTransactions();
    const selectedItems = items.filter(i => i.selected);
    let count = 0;

    selectedItems.forEach((item, idx) => {
      const nextNum = list.length + idx + 101;
      const code = `LANC-${String(nextNum).padStart(5, '0')}`;

      const tx: FinancialTransaction = {
        id: `tx-imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        code,
        type: item.type,
        description: item.cleanDescription || item.rawDescription,
        amount: item.amount,
        date: item.formattedDate,
        dueDate: item.formattedDate,
        status: 'pago',
        category: item.category,
        costCenterId: item.costCenterId,
        accountId,
        donorType: item.donorType,
        memberId: item.matchedMember?.id,
        memberName: item.matchedMember?.fullName || (item.donorType === 'membro' ? item.donorName : undefined),
        donorName: item.donorName,
        worshipServiceType: item.worshipServiceType,
        isAnonymous: item.donorType === 'anonimo',
        paymentMethod: item.paymentMethod || (item.isPix ? 'Pix' : 'Transferência Bancária'),
        notes: item.notes || `Conciliado do Extrato Bancário (${item.paymentMethod})`,
        attachments: [],
        createdAt: new Date().toISOString()
      };

      this.saveTransaction(tx);
      count++;
    });

    this.logAudit('IMPORTACAO_EXTRATO_BANCARIO', 'finance', `Conciliados e importados ${count} lançamentos do extrato com sucesso.`);
    return count;
  }

  public importBankStatement(rawText: string, accountId: string, format: 'OFX' | 'CSV'): { importedCount: number; transactions: FinancialTransaction[] } {
    const items = this.parseStatementForReview(rawText, accountId, format);
    const count = this.confirmImportStatement(items, accountId);
    return { importedCount: count, transactions: this.getTransactions().slice(0, count) };
  }

  // ==================== PATRIMÔNIO & INVENTÁRIO DE BENS ====================
  public getAssets(): ChurchAsset[] {
    return getStorage<ChurchAsset[]>(DB_KEYS.ASSETS, initialAssets);
  }

  public saveAsset(asset: ChurchAsset): void {
    const list = this.getAssets();
    const idx = list.findIndex(a => a.id === asset.id);
    const isNew = idx < 0;

    if (!asset.code) {
      const nextNum = list.length + 1;
      asset.code = `PAT-${String(nextNum).padStart(4, '0')}`;
    }

    const updated: ChurchAsset = {
      ...asset,
      maintenanceHistory: asset.maintenanceHistory || [],
      loansHistory: asset.loansHistory || [],
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }

    setStorage(DB_KEYS.ASSETS, list);
    this.logAudit(
      isNew ? 'CADASTRO_PATRIMONIO' : 'ATUALIZACAO_PATRIMONIO',
      'assets',
      `Bem tombado ${asset.code} - ${asset.name} (${asset.category}) no setor ${asset.location}`
    );
    this.notify();
  }

  public deleteAsset(id: string): void {
    const asset = this.getAssets().find(a => a.id === id);
    const list = this.getAssets().filter(a => a.id !== id);
    setStorage(DB_KEYS.ASSETS, list);
    if (asset) {
      this.logAudit('EXCLUSAO_PATRIMONIO', 'assets', `Excluído bem tombado ${asset.code} - ${asset.name}`);
    }
    this.notify();
  }

  public addAssetMaintenance(assetId: string, record: Omit<AssetMaintenanceRecord, 'id'>): void {
    const list = this.getAssets();
    const asset = list.find(a => a.id === assetId);
    if (asset) {
      const newRec: AssetMaintenanceRecord = {
        ...record,
        id: `maint-${Date.now()}`
      };
      if (!asset.maintenanceHistory) asset.maintenanceHistory = [];
      asset.maintenanceHistory.unshift(newRec);
      asset.status = 'ativo';
      asset.condition = 'Bom';
      asset.updatedAt = new Date().toISOString();
      setStorage(DB_KEYS.ASSETS, list);
      this.logAudit('MANUTENCAO_PATRIMONIO', 'assets', `Manutenção registrada no bem ${asset.code} - Custo: R$ ${record.cost.toFixed(2)}`);
      this.notify();
    }
  }

  public addAssetLoan(assetId: string, record: Omit<AssetLoanRecord, 'id' | 'status'>): void {
    const list = this.getAssets();
    const asset = list.find(a => a.id === assetId);
    if (asset) {
      const newLoan: AssetLoanRecord = {
        ...record,
        id: `loan-${Date.now()}`,
        status: 'ativo'
      };
      if (!asset.loansHistory) asset.loansHistory = [];
      asset.loansHistory.unshift(newLoan);
      asset.status = 'emprestado';
      asset.updatedAt = new Date().toISOString();
      setStorage(DB_KEYS.ASSETS, list);
      this.logAudit('EMPRESTIMO_PATRIMONIO', 'assets', `Bem ${asset.code} emprestado para ${record.borrowerName} (${record.borrowerRole})`);
      this.notify();
    }
  }

  public returnAssetLoan(assetId: string, loanId: string): void {
    const list = this.getAssets();
    const asset = list.find(a => a.id === assetId);
    if (asset && asset.loansHistory) {
      const loan = asset.loansHistory.find(l => l.id === loanId);
      if (loan) {
        loan.status = 'devolvido';
        loan.returnedDate = new Date().toISOString().split('T')[0];
        asset.status = 'ativo';
        asset.updatedAt = new Date().toISOString();
        setStorage(DB_KEYS.ASSETS, list);
        this.logAudit('DEVOLUCAO_PATRIMONIO', 'assets', `Devolução confirmada do bem ${asset.code} por ${loan.borrowerName}`);
        this.notify();
      }
    }
  }

  public writeOffAsset(assetId: string, reason: string): void {
    const list = this.getAssets();
    const asset = list.find(a => a.id === assetId);
    if (asset) {
      asset.status = 'baixado';
      asset.condition = 'Baixado / Descartado';
      asset.writeOffReason = reason;
      asset.writeOffDate = new Date().toISOString().split('T')[0];
      asset.updatedAt = new Date().toISOString();
      setStorage(DB_KEYS.ASSETS, list);
      this.logAudit('BAIXA_PATRIMONIAL', 'assets', `Baixa registrada do bem ${asset.code} - Motivo: ${reason}`);
      this.notify();
    }
  }

  // ==================== SEGURANÇA E USUÁRIOS ERP ====================
  public getErpUsers(): ErpUser[] {
    const users = getStorage<ErpUser[]>(DB_KEYS.ERP_USERS, initialErpUsers);
    const secUser = users.find(u => u.email.toLowerCase() === 'secretaria@ibnsapiranga.com.br');
    if (!secUser) {
      users.unshift({
        id: 'usr-master-secretaria',
        name: 'Secretaria Master IBNS',
        email: 'secretaria@ibnsapiranga.com.br',
        role: 'secretaria',
        roleTitle: 'Secretária Geral & Master',
        status: 'ativo',
        phone: '(51) 98877-6655',
        department: 'Secretaria Geral & Administração',
        password: '1234567890',
        mustChangePassword: true,
        createdAt: new Date().toISOString()
      });
      setStorage(DB_KEYS.ERP_USERS, users);
    } else if (secUser.password === 'ibns@secretaria2026' || !secUser.password) {
      secUser.password = '1234567890';
      secUser.mustChangePassword = true;
      setStorage(DB_KEYS.ERP_USERS, users);
    }
    return users;
  }

  public changeUserPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: 'A nova senha deve possuir no mínimo 6 caracteres.' };
    }
    if (cleanPass === '1234567890') {
      return { success: false, error: 'A nova senha deve ser diferente da senha provisória de primeiro acesso (1234567890).' };
    }
    const list = this.getErpUsers();
    const user = list.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'Usuário não localizado no sistema.' };
    }

    user.password = cleanPass;
    user.mustChangePassword = false;
    user.updatedAt = new Date().toISOString();
    setStorage(DB_KEYS.ERP_USERS, list);

    this.logAudit('TROCA_SENHA_PRIMEIRO_ACESSO', 'settings', `Senha redefinida com sucesso no primeiro acesso para ${user.name} (${user.email}).`);
    this.notify();

    return { success: true };
  }

  public saveErpUser(user: ErpUser): { success: boolean; error?: string } {
    const emailNormalized = user.email.trim().toLowerCase();
    const settings = this.getSecuritySettings();

    if (settings.restrictDomainOnly && !emailNormalized.endsWith(`@${settings.allowedDomain}`)) {
      return {
        success: false,
        error: `O e-mail deve obrigatoriamente possuir o domínio institucional @${settings.allowedDomain}`
      };
    }

    const list = this.getErpUsers();
    const idx = list.findIndex(u => u.id === user.id || u.email.toLowerCase() === emailNormalized);
    if (idx >= 0) {
      list[idx] = { ...user, email: emailNormalized };
    } else {
      list.push({ ...user, email: emailNormalized });
    }
    setStorage(DB_KEYS.ERP_USERS, list);
    this.logAudit('CADASTRO_USUARIO_ERP', 'settings', `Usuário ${user.name} (${emailNormalized}) cadastrado/atualizado.`);
    this.notify();
    return { success: true };
  }

  public deleteErpUser(id: string): { success: boolean; error?: string } {
    const list = this.getErpUsers();
    const user = list.find(u => u.id === id);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (list.length <= 1) {
      return { success: false, error: 'O sistema deve manter pelo menos um administrador ativo.' };
    }
    setStorage(DB_KEYS.ERP_USERS, list.filter(u => u.id !== id));
    this.logAudit('EXCLUSAO_USUARIO_ERP', 'settings', `Usuário ${user.name} (${user.email}) removido do sistema.`);
    this.notify();
    return { success: true };
  }

  public getSecuritySettings(): SecuritySettings {
    return getStorage<SecuritySettings>(DB_KEYS.SECURITY_SETTINGS, initialSecuritySettings);
  }

  public saveSecuritySettings(settings: SecuritySettings): void {
    setStorage(DB_KEYS.SECURITY_SETTINGS, settings);
    this.logAudit('ATUALIZACAO_CONFIG_SEGURANCA', 'settings', 'Parâmetros de segurança cibernética (anti-bot, força bruta e geo-bloqueio) atualizados.');
    this.notify();
  }

  public getSecurityLogs(): SecurityEventLog[] {
    return getStorage<SecurityEventLog[]>(DB_KEYS.SECURITY_LOGS, []);
  }

  public logSecurityEvent(event: Omit<SecurityEventLog, 'id' | 'timestamp'>): void {
    const list = this.getSecurityLogs();
    const newLog: SecurityEventLog = {
      ...event,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    list.unshift(newLog);
    setStorage(DB_KEYS.SECURITY_LOGS, list.slice(0, 300));
    this.notify();
  }

  public getFailedAttempts(email: string): { count: number; lockedUntil?: number } {
    const attempts = getStorage<Record<string, { count: number; lockedUntil?: number }>>(DB_KEYS.FAILED_LOGINS, {});
    return attempts[email.toLowerCase()] || { count: 0 };
  }

  public recordFailedAttempt(email: string): { isLocked: boolean; remainingSeconds: number } {
    const key = email.toLowerCase();
    const attempts = getStorage<Record<string, { count: number; lockedUntil?: number }>>(DB_KEYS.FAILED_LOGINS, {});
    const current = attempts[key] || { count: 0 };
    const settings = this.getSecuritySettings();

    current.count += 1;
    let isLocked = false;
    let remainingSeconds = 0;

    if (current.count >= settings.maxFailedAttempts) {
      current.lockedUntil = Date.now() + (settings.lockoutMinutes * 60 * 1000);
      isLocked = true;
      remainingSeconds = settings.lockoutMinutes * 60;
    }

    attempts[key] = current;
    setStorage(DB_KEYS.FAILED_LOGINS, attempts);
    return { isLocked, remainingSeconds };
  }

  public clearFailedAttempts(email: string): void {
    const key = email.toLowerCase();
    const attempts = getStorage<Record<string, { count: number; lockedUntil?: number }>>(DB_KEYS.FAILED_LOGINS, {});
    delete attempts[key];
    setStorage(DB_KEYS.FAILED_LOGINS, attempts);
  }

  public authenticate(
    email: string,
    password: string,
    options?: {
      captchaAnswer?: string;
      captchaExpected?: string;
      honeypot?: string;
      clientCountry?: string;
      clientIp?: string;
    }
  ): { success: boolean; error?: string; session?: UserSession; mustChangePassword?: boolean; user?: ErpUser } {
    const settings = this.getSecuritySettings();
    const cleanEmail = email.trim().toLowerCase();
    const clientIp = options?.clientIp || '127.0.0.1';
    const clientCountry = options?.clientCountry || 'BR';

    // 1. Camada Anti-Bot (Honeypot)
    if (options?.honeypot && options.honeypot.trim() !== '') {
      this.logSecurityEvent({
        type: 'BOT_DETECTED',
        emailAttempted: cleanEmail,
        ipAddress: clientIp,
        country: clientCountry,
        details: 'Tentativa automatizada interceptada via armadilha Honeypot oculta.',
        blocked: true
      });
      return {
        success: false,
        error: 'Acesso bloqueado: Atividade automatizada de bot detectada pelos filtros de integridade.'
      };
    }

    // 2. Camada de Geo-Proteção: Bloqueio de conexões fora do Brasil
    if (settings.blockNonBrazilIps) {
      const isSimulatedForeign = settings.simulateForeignIp;
      const isOutsideBrazil = clientCountry !== 'BR' || isSimulatedForeign;
      const isWhitelisted = settings.ipWhitelist.includes(clientIp);

      if (isOutsideBrazil && !isWhitelisted) {
        this.logSecurityEvent({
          type: 'NON_BRAZIL_IP_BLOCKED',
          emailAttempted: cleanEmail,
          ipAddress: clientIp,
          country: isSimulatedForeign ? 'US (Simulado)' : clientCountry,
          details: 'Tentativa de acesso originada fora do território do Brasil. Política de bloqueio regional aplicada.',
          blocked: true
        });
        return {
          success: false,
          error: 'ACESSO BLOQUEADO: Conexão detectada fora do Brasil. Por diretriz de segurança cibernética da IBNS, o ERP é restrito a conexões nacionais.'
        };
      }
    }

    // 3. Camada de Restrição Estrita de Domínio
    if (settings.restrictDomainOnly && !cleanEmail.endsWith(`@${settings.allowedDomain}`)) {
      this.logSecurityEvent({
        type: 'DOMAIN_RESTRICTION_REJECTED',
        emailAttempted: cleanEmail,
        ipAddress: clientIp,
        country: clientCountry,
        details: `Tentativa com domínio não autorizado (${cleanEmail}). Domínio institucional exigido: @${settings.allowedDomain}`,
        blocked: true
      });
      return {
        success: false,
        error: `Acesso Restrito: Apenas contas de e-mail institucionais com o domínio @${settings.allowedDomain} possuem autorização de acesso ao ERP.`
      };
    }

    // 4. Camada de Proteção contra Força Bruta (Lockout)
    const attemptInfo = this.getFailedAttempts(cleanEmail);
    if (attemptInfo.lockedUntil && attemptInfo.lockedUntil > Date.now()) {
      const remainingSec = Math.ceil((attemptInfo.lockedUntil - Date.now()) / 1000);
      const remainingMin = Math.ceil(remainingSec / 60);
      this.logSecurityEvent({
        type: 'BRUTE_FORCE_BLOCKED',
        emailAttempted: cleanEmail,
        ipAddress: clientIp,
        country: clientCountry,
        details: `Bloqueio temporário ativo por excesso de tentativas incorretas (${attemptInfo.count} falhas).`,
        blocked: true
      });
      return {
        success: false,
        error: `Conta temporariamente bloqueada por segurança após consecutivas falhas. Tente novamente em ${remainingMin} minuto(s).`
      };
    }

    // 5. Camada Anti-Bot (Captcha Matemático após falha ou se ativado)
    if (settings.enableAntiBotCaptcha && (attemptInfo.count >= 2 || options?.captchaExpected)) {
      if (!options?.captchaAnswer || options.captchaAnswer.trim() !== options.captchaExpected) {
        return {
          success: false,
          error: 'Desafio Anti-Bot de verificação humana incorreto. Resolva a operação matemática.'
        };
      }
    }

    // 6. Verificação de Usuário no Banco de Dados
    const users = this.getErpUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      this.recordFailedAttempt(cleanEmail);
      this.logSecurityEvent({
        type: 'LOGIN_FAILED',
        emailAttempted: cleanEmail,
        ipAddress: clientIp,
        country: clientCountry,
        details: 'Usuário não localizado no cadastro institucional de usuários autorizados.',
        blocked: false
      });
      return {
        success: false,
        error: 'Usuário não cadastrado no banco de dados da IBNS.'
      };
    }

    if (user.status === 'bloqueado') {
      return {
        success: false,
        error: 'Esta conta de usuário está desativada pela administração da igreja.'
      };
    }

    // 7. Verificação de Senha
    if (user.password && user.password !== password) {
      const res = this.recordFailedAttempt(cleanEmail);
      this.logSecurityEvent({
        type: 'LOGIN_FAILED',
        emailAttempted: cleanEmail,
        ipAddress: clientIp,
        country: clientCountry,
        details: `Senha incorreta informada (Tentativa ${attemptInfo.count + 1}/${settings.maxFailedAttempts}).`,
        blocked: false
      });

      if (res.isLocked) {
        return {
          success: false,
          error: `Limite de tentativas excedido (${settings.maxFailedAttempts} tentativas). Acesso bloqueado por ${settings.lockoutMinutes} minutos.`
        };
      }

      const remaining = settings.maxFailedAttempts - (attemptInfo.count + 1);
      return {
        success: false,
        error: `Senha incorreta. Você possui mais ${remaining} tentativa(s) antes do bloqueio temporário.`
      };
    }

    // 8. Sucesso na Autenticação
    this.clearFailedAttempts(cleanEmail);
    const newSession: UserSession = {
      name: user.name,
      email: user.email,
      role: user.role,
      roleTitle: user.roleTitle,
      isAuthenticated: true
    };

    // Se o usuário precisa trocar a senha no primeiro acesso
    if (user.mustChangePassword) {
      return {
        success: true,
        mustChangePassword: true,
        user,
        session: newSession
      };
    }

    this.setSession(newSession);

    user.lastLoginAt = new Date().toISOString();
    this.saveErpUser(user);

    this.logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      emailAttempted: cleanEmail,
      ipAddress: clientIp,
      country: clientCountry,
      details: `Login autorizado com perfil ${user.roleTitle}.`,
      blocked: false
    });

    return {
      success: true,
      session: newSession
    };
  }

  // --- Backup & Restore Completo do Banco de Dados em JSON ---
  public exportFullBackupJson(): string {
    const data = {
      bankAccounts: this.getBankAccounts(),
      costCenters: this.getCostCenters(),
      investments: this.getInvestments(),
      fixedExpenses: this.getFixedExpenses(),
      transactions: this.getTransactions(),
      members: this.getMembers(),
      courses: this.getCourses(),
      enrollments: this.getEnrollments(),
      families: this.getAssistedFamilies(),
      deliveries: this.getSocialDeliveries(),
      classes: this.getClasses(),
      evangelismActions: this.getEvangelismActions(),
      reachedPersons: this.getReachedPersons(),
      missionaries: this.getMissionaries(),
      events: this.getEvents(),
      registrations: this.getRegistrations(),
      assets: this.getAssets(),
      erpUsers: this.getErpUsers(),
      securitySettings: this.getSecuritySettings(),
      auditLogs: this.getAuditLogs(),
      backupDate: new Date().toISOString(),
      church: 'IBNS - Igreja Batista Nacional em Sapiranga'
    };
    return JSON.stringify(data, null, 2);
  }

  public importFullBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.bankAccounts) setStorage(DB_KEYS.BANK_ACCOUNTS, data.bankAccounts);
      if (data.costCenters) setStorage(DB_KEYS.COST_CENTERS, data.costCenters);
      if (data.investments) setStorage(DB_KEYS.INVESTMENTS, data.investments);
      if (data.fixedExpenses) setStorage(DB_KEYS.FIXED_EXPENSES, data.fixedExpenses);
      if (data.transactions) setStorage(DB_KEYS.TRANSACTIONS, data.transactions);
      if (data.members) setStorage(DB_KEYS.MEMBERS, data.members);
      if (data.courses) setStorage(DB_KEYS.COURSES, data.courses);
      if (data.enrollments) setStorage(DB_KEYS.ENROLLMENTS, data.enrollments);
      if (data.families) setStorage(DB_KEYS.FAMILIES, data.families);
      if (data.deliveries) setStorage(DB_KEYS.DELIVERIES, data.deliveries);
      if (data.classes) setStorage(DB_KEYS.CLASSES, data.classes);
      if (data.evangelismActions) setStorage(DB_KEYS.EVANGELISM_ACTIONS, data.evangelismActions);
      if (data.reachedPersons) setStorage(DB_KEYS.REACHED_PERSONS, data.reachedPersons);
      if (data.missionaries) setStorage(DB_KEYS.MISSIONARIES, data.missionaries);
      if (data.events) setStorage(DB_KEYS.EVENTS, data.events);
      if (data.registrations) setStorage(DB_KEYS.REGISTRATIONS, data.registrations);
      if (data.assets) setStorage(DB_KEYS.ASSETS, data.assets);
      if (data.erpUsers) setStorage(DB_KEYS.ERP_USERS, data.erpUsers);
      if (data.securitySettings) setStorage(DB_KEYS.SECURITY_SETTINGS, data.securitySettings);
      if (data.auditLogs) setStorage(DB_KEYS.AUDIT_LOGS, data.auditLogs);

      this.logAudit('RESTAURACAO_BACKUP_COMPLETO', 'settings', 'Restauração de banco de dados via arquivo de backup JSON.');
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to import backup:', err);
      return false;
    }
  }

  // --- Zerar Banco de Dados para Operação Real (Requirement 4) ---
  public clearAllDataForProduction(): void {
    setStorage(DB_KEYS.BANK_ACCOUNTS, cleanBankAccounts);
    setStorage(DB_KEYS.COST_CENTERS, cleanCostCenters);
    setStorage(DB_KEYS.INVESTMENTS, []);
    setStorage(DB_KEYS.FIXED_EXPENSES, []);
    setStorage(DB_KEYS.TRANSACTIONS, []);
    setStorage(DB_KEYS.MEMBERS, []);
    setStorage(DB_KEYS.COURSES, []);
    setStorage(DB_KEYS.ENROLLMENTS, []);
    setStorage(DB_KEYS.FAMILIES, []);
    setStorage(DB_KEYS.DELIVERIES, []);
    setStorage(DB_KEYS.CLASSES, []);
    setStorage(DB_KEYS.EVANGELISM_ACTIONS, []);
    setStorage(DB_KEYS.REACHED_PERSONS, []);
    setStorage(DB_KEYS.MISSIONARIES, []);
    setStorage(DB_KEYS.EVENTS, []);
    setStorage(DB_KEYS.REGISTRATIONS, []);
    setStorage(DB_KEYS.ASSETS, []);
    setStorage(DB_KEYS.FAILED_LOGINS, {});
    setStorage(DB_KEYS.ERP_USERS, initialErpUsers);
    setStorage(DB_KEYS.SECURITY_SETTINGS, initialSecuritySettings);
    
    this.logAudit('ZERAR_BANCO_PRODUCAO_REAL', 'settings', 'Banco de dados zerado para início de lançamentos reais da IBNS Sapiranga.');
    this.notify();
  }

  // --- Reset para dados de demonstração (se necessário testar) ---
  public resetToFactory(): void {
    setStorage(DB_KEYS.BANK_ACCOUNTS, initialBankAccounts);
    setStorage(DB_KEYS.COST_CENTERS, initialCostCenters);
    setStorage(DB_KEYS.INVESTMENTS, initialInvestments);
    setStorage(DB_KEYS.FIXED_EXPENSES, initialFixedExpenses);
    setStorage(DB_KEYS.TRANSACTIONS, initialTransactions);
    setStorage(DB_KEYS.MEMBERS, initialMembers);
    setStorage(DB_KEYS.COURSES, initialCourses);
    setStorage(DB_KEYS.ENROLLMENTS, initialEnrollments);
    setStorage(DB_KEYS.FAMILIES, initialAssistedFamilies);
    setStorage(DB_KEYS.DELIVERIES, initialSocialDeliveries);
    setStorage(DB_KEYS.CLASSES, initialClasses);
    setStorage(DB_KEYS.EVANGELISM_ACTIONS, initialEvangelismActions);
    setStorage(DB_KEYS.REACHED_PERSONS, initialReachedPersons);
    setStorage(DB_KEYS.MISSIONARIES, initialMissionaries);
    setStorage(DB_KEYS.EVENTS, initialEvents);
    setStorage(DB_KEYS.REGISTRATIONS, initialRegistrations);
    setStorage(DB_KEYS.AUDIT_LOGS, initialAuditLogs);
    this.logAudit('REDEFINICAO_DADOS_PADRAO', 'settings', 'Dados do sistema restaurados para o padrão de demonstração IBNS.');
    this.notify();
  }
}

export const db = new ChurchERPDatabase();
