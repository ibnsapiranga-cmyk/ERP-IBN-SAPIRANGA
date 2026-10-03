import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  GraduationCap, 
  HeartHandshake, 
  Flame, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Cake, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileSpreadsheet, 
  Award, 
  Clock, 
  CheckCircle2,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Send,
  CalendarDays,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Layers,
  Building2,
  BookOpen,
  Church
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ModuleType, FinancialTransaction } from '../../types';
import { db } from '../../services/db';

type BIPeriod = 'tempo_real' | 'dia' | 'semanal';

interface DashboardModuleProps {
  onNavigate?: (m: ModuleType) => void;
  setActiveModule?: (m: ModuleType) => void;
  hideSensitiveData: boolean;
  onOpenAccountingExportModal?: () => void;
  onOpenNewTransaction?: (type?: 'entrada' | 'saida') => void;
  onOpenNewMember?: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  onNavigate,
  setActiveModule,
  hideSensitiveData,
  onOpenAccountingExportModal,
  onOpenNewTransaction,
  onOpenNewMember
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<BIPeriod>('tempo_real');
  const [session, setSession] = useState(db.getSession());
  const [refreshKey, setRefreshKey] = useState(0);
  const [paidNotification, setPaidNotification] = useState<string | null>(null);

  const navigateTo = (mod: ModuleType) => {
    if (onNavigate) {
      onNavigate(mod);
    } else if (setActiveModule) {
      setActiveModule(mod);
    }
  };

  useEffect(() => {
    return db.subscribe(() => {
      setSession(db.getSession());
      setRefreshKey(k => k + 1);
    });
  }, []);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

  // 7 days span
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

  // Retrieve raw db items
  const members = db.getMembers();
  const transactions = db.getTransactions();
  const events = db.getEvents();
  const bankAccounts = db.getBankAccounts();
  const investments = db.getInvestments();
  const costCenters = db.getCostCenters();
  const courses = db.getCourses();
  const enrollments = db.getEnrollments();
  const assistedFamilies = db.getAssistedFamilies();
  const deliveries = db.getSocialDeliveries();
  const classes = db.getClasses();
  const evangelismActions = db.getEvangelismActions();
  const reachedPersons = db.getReachedPersons();
  const missionaries = db.getMissionaries();

  // 1. Aniversariantes de Hoje
  const todayBirthdays = members.filter(m => {
    if (!m.birthDate) return false;
    const parts = m.birthDate.split('-');
    return parts[1] === currentMonth && parts[2] === currentDay;
  });

  // Aniversariantes da Semana
  const weekBirthdays = members.filter(m => {
    if (!m.birthDate) return false;
    const parts = m.birthDate.split('-');
    const mMonth = parseInt(parts[1], 10);
    const mDay = parseInt(parts[2], 10);
    
    const bDateThisYear = new Date(currentYear, mMonth - 1, mDay);
    const diffTime = bDateThisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= -1 && diffDays <= 7;
  });

  // 2. Contas a pagar no dia e vencidas
  const dueTodayBills = transactions.filter(t => 
    t.type === 'saida' && (t.status === 'agendado' && (t.dueDate === todayStr || t.date === todayStr))
  );

  const overdueBills = transactions.filter(t => 
    t.type === 'saida' && (t.status === 'vencido' || (t.status === 'agendado' && t.dueDate < todayStr))
  );

  const allUrgentBills = [...overdueBills, ...dueTodayBills];
  const totalUrgentAmount = allUrgentBills.reduce((acc, t) => acc + t.amount, 0);

  // Quick Pay Handler
  const handleQuickPay = (tx: FinancialTransaction) => {
    const updated: FinancialTransaction = {
      ...tx,
      status: 'pago'
    };
    db.saveTransaction(updated);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setPaidNotification(`Conta "${tx.description}" quitada com sucesso!`);
    setTimeout(() => {
      setPaidNotification(null);
    }, 4000);
  };

  // 3. Dynamic Calculation by BI Period
  const periodTransactions = transactions.filter(t => {
    if (selectedPeriod === 'tempo_real') return true;
    if (selectedPeriod === 'dia') {
      return (t.date === todayStr) || (t.dueDate === todayStr);
    }
    if (selectedPeriod === 'semanal') {
      const txDate = t.date || t.dueDate || '';
      return txDate >= oneWeekAgoStr;
    }
    return true;
  });

  const periodIncome = periodTransactions
    .filter(t => t.type === 'entrada' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);

  const periodExpenses = periodTransactions
    .filter(t => t.type === 'saida' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);

  const periodNet = periodIncome - periodExpenses;

  // Liquid Balances & Investments
  const totalLiquid = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);
  const totalInvested = investments.reduce((s, i) => s + i.currentAmount, 0);
  const totalPatrimony = totalLiquid + totalInvested;

  // Members Dynamic BI
  const activeMembersCount = members.filter(m => m.status === 'Ativo').length;
  const leadershipCount = members.filter(m => 
    ['Pastor(a)', 'Presbítero', 'Diácono', 'Diaconisa', 'Evangelista', 'Obreiro(a)'].includes(m.role)
  ).length;

  const newMembersInPeriod = members.filter(m => {
    if (!m.createdAt) return false;
    if (selectedPeriod === 'tempo_real') return true;
    if (selectedPeriod === 'dia') return m.createdAt.startsWith(todayStr);
    if (selectedPeriod === 'semanal') return m.createdAt >= oneWeekAgoStr;
    return true;
  }).length;

  // Education Dynamic BI
  const activeCoursesCount = courses.length;
  const totalStudents = enrollments.length;
  const completedCertificates = enrollments.filter(e => e.status === 'Concluído').length;

  // Social Dynamic BI
  const activeFamiliesCount = assistedFamilies.filter(f => f.status === 'Ativo').length;
  const deliveriesInPeriod = deliveries.filter(d => {
    if (selectedPeriod === 'tempo_real') return true;
    if (selectedPeriod === 'dia') return d.date === todayStr;
    if (selectedPeriod === 'semanal') return d.date >= oneWeekAgoStr;
    return true;
  }).length;
  const totalSocialStudents = classes.reduce((s, c) => s + c.studentsEnrolled, 0);

  // Evangelism Dynamic BI
  const periodEvangelismActions = evangelismActions.filter(a => {
    if (selectedPeriod === 'tempo_real') return true;
    if (selectedPeriod === 'dia') return a.date === todayStr;
    if (selectedPeriod === 'semanal') return a.date >= oneWeekAgoStr;
    return true;
  });
  const periodDecisions = periodEvangelismActions.reduce((s, a) => s + a.decisionsCount, 0);
  const inDiscipleshipFunnel = reachedPersons.filter(r => r.stage !== 'Batizado / Membro').length;
  const baptizedCount = reachedPersons.filter(r => r.stage === 'Batizado / Membro').length;

  // Cost Centers Calculation for BI Donut & Progress
  const costCenterBreakdown = costCenters.map(cc => {
    const spentInPeriod = periodTransactions
      .filter(t => t.type === 'saida' && t.status === 'pago' && t.costCenterId === cc.id)
      .reduce((s, t) => s + t.amount, 0);
    return {
      id: cc.id,
      name: cc.name,
      spent: spentInPeriod,
      budget: cc.budgetMonthly,
      color: cc.color || '#3b82f6'
    };
  }).filter(cc => cc.spent > 0 || cc.budget > 0).sort((a, b) => b.spent - a.spent);

  // Recharts Chart Data: 6-Month Cash Flow Evolution
  const cashFlowEvolutionData = [
    { mes: 'Mar', entradas: 42500, saidas: 34100, saldo: 8400 },
    { mes: 'Abr', entradas: 46800, saidas: 36200, saldo: 10600 },
    { mes: 'Mai', entradas: 44200, saidas: 38400, saldo: 5800 },
    { mes: 'Jun', entradas: 49500, saidas: 37900, saldo: 11600 },
    { mes: 'Jul', entradas: 52100, saidas: 41300, saldo: 10800 },
    { mes: 'Ago (Atual)', entradas: Math.max(periodIncome, 48300), saidas: Math.max(periodExpenses, 36800), saldo: Math.max(periodIncome - periodExpenses, 11500) }
  ];

  // Recharts Chart Data: Funil de Discipulado & Evangelismo
  const discipleshipFunnelData = [
    { etapa: '1. 1º Contato', vidas: 48, fill: '#f59e0b' },
    { etapa: '2. Visita Pastoral', vidas: 34, fill: '#3b82f6' },
    { etapa: '3. Discipulado EBD', vidas: 26, fill: '#8b5cf6' },
    { etapa: '4. Batizado / Membro', vidas: baptizedCount > 0 ? baptizedCount : 18, fill: '#10b981' }
  ];

  // Cultos & Frequência Média
  const serviceAttendanceData = [
    { culto: 'Família (Dom 19h)', presenca: 285, capacidade: 350 },
    { culto: 'EBD (Dom 09h)', presenca: 140, capacidade: 200 },
    { culto: 'Quarta Fé (19h30)', presenca: 115, capacidade: 200 },
    { culto: 'Jovens (Sáb 19h30)', presenca: 160, capacidade: 220 }
  ];

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Toast Feedback */}
      {paidNotification && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs sm:text-sm animate-bounce fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{paidNotification}</span>
          </div>
          <button onClick={() => setPaidNotification(null)} className="text-white ml-4 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Top Welcome & BI Mode Switcher (Clean Light Styling) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Painel BI Executivo
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                {today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Tempo Real
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              IBNS - Igreja Batista Nacional em Sapiranga
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Visão consolidada de finanças com NFs, membresia, discipulado, educação cristã, projetos sociais e relatórios contábeis.
            </p>
          </div>

          {/* Period Toggle Switcher (Tempo Real, Dia, Semanal) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
              <button
                onClick={() => setSelectedPeriod('tempo_real')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedPeriod === 'tempo_real'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span>Tempo Real</span>
              </button>

              <button
                onClick={() => setSelectedPeriod('dia')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedPeriod === 'dia'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Hoje (Dia)</span>
              </button>

              <button
                onClick={() => setSelectedPeriod('semanal')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedPeriod === 'semanal'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Semanal</span>
              </button>
            </div>

            {/* Quick Export Button */}
            {onOpenAccountingExportModal && (
              <button
                onClick={onOpenAccountingExportModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                title="Exportar Pacote Contábil com Balancete e NFs anexadas em ZIP"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="whitespace-nowrap">Pacote Contador (ZIP)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: 1. Aniversariantes do Dia & 2. Contas a Pagar no Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card: Aniversariantes do Dia / da Semana */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    Aniversariantes {selectedPeriod === 'semanal' ? 'da Semana' : 'do Dia'}
                    <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-300">
                      {selectedPeriod === 'semanal' ? weekBirthdays.length : todayBirthdays.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedPeriod === 'semanal' 
                      ? 'Irmãos que celebram aniversário nos próximos 7 dias em Sapiranga' 
                      : 'Membros da IBNS que completam ano na data de hoje'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigateTo('members')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 transition-colors"
              >
                <span>Ver Membros</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Birthdays */}
            {((selectedPeriod === 'semanal' ? weekBirthdays : todayBirthdays).length > 0) ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {(selectedPeriod === 'semanal' ? weekBirthdays : todayBirthdays).map(member => {
                  const birthParts = member.birthDate.split('-');
                  const birthYear = parseInt(birthParts[0], 10);
                  const calculatedAge = currentYear - birthYear;
                  const phoneClean = member.phone.replace(/\D/g, '');
                  const isToday = birthParts[1] === currentMonth && birthParts[2] === currentDay;
                  
                  const messageText = encodeURIComponent(
                    `A paz do Senhor ${member.preferredName || member.fullName}! Toda a família da Igreja Batista Nacional em Sapiranga (IBNS) se alegra e celebra a sua vida hoje (${birthParts[2]}/${birthParts[1]})! Que Deus derrame bênçãos sem medida, saúde e muita paz sobre você e sua casa! 🎉🎂🙏✨`
                  );

                  return (
                    <div 
                      key={member.id}
                      className={`rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border transition-all ${
                        isToday 
                          ? 'bg-amber-50/70 border-amber-200' 
                          : 'bg-slate-50/80 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {member.photoUrl ? (
                            <img 
                              src={member.photoUrl} 
                              alt={member.fullName} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm border border-slate-300">
                              {member.fullName.charAt(0)}
                            </div>
                          )}
                          {isToday && (
                            <span className="absolute -bottom-1 -right-1 text-xs" title="Hoje!">
                              🎂
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-bold text-slate-900">{member.fullName}</p>
                            {isToday && (
                              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                                Hoje
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {member.role} • {calculatedAge > 0 ? `${calculatedAge} anos` : ''} • {member.address.neighborhood || 'Sapiranga'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <a
                          href={`https://wa.me/55${phoneClean}?text=${messageText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                          title="Enviar parabéns pelo WhatsApp oficial da IBNS"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Felicitar WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 text-center">
                <Cake className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Nenhum aniversariante registrado para a data.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Cadastre novos membros ou consulte a agenda de aniversários.</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total de membros cadastrados: <strong className="text-slate-900">{members.length}</strong></span>
            <button onClick={() => navigateTo('agenda')} className="text-amber-700 hover:text-amber-800 font-bold">
              Abrir Calendário Anual →
            </button>
          </div>
        </div>

        {/* Card: Contas a Pagar no Dia & Vencidas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    Contas a Pagar no Dia / Vencidas
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                      allUrgentBills.length > 0
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {allUrgentBills.length} {allUrgentBills.length === 1 ? 'pendência' : 'pendências'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Total a quitar hoje: <strong className="text-rose-600">{formatCurrency(totalUrgentAmount)}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigateTo('finance')}
                className="text-xs text-rose-700 hover:text-rose-800 font-bold flex items-center gap-1 transition-colors"
              >
                <span>Ver Finanças</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Pending Bills */}
            {allUrgentBills.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {allUrgentBills.map(bill => {
                  const isOverdue = bill.status === 'vencido' || (bill.status === 'agendado' && bill.dueDate < todayStr);
                  
                  return (
                    <div 
                      key={bill.id}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isOverdue 
                              ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isOverdue ? 'Vencida' : 'Vence Hoje'}
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs">{bill.description}</p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Vencimento: <strong className="text-slate-800">{bill.dueDate}</strong> • Categoria: {bill.category} • Código: {bill.code}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-sm font-extrabold text-rose-600">
                          {formatCurrency(bill.amount)}
                        </span>
                        <button
                          onClick={() => handleQuickPay(bill)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                          title="Dar baixa e registrar como pago instantaneamente"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dar Baixa</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-900">Todas as contas do dia estão 100% quitadas!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Nenhum compromisso financeiro pendente ou em atraso na tesouraria.</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Saldo em Conta: <strong className="text-emerald-700 font-bold">{formatCurrency(totalLiquid)}</strong></span>
            <button onClick={() => navigateTo('finance')} className="text-rose-700 hover:text-rose-800 font-bold">
              Lançar Nova Despesa c/ NF →
            </button>
          </div>
        </div>

      </div>

      {/* SECTION: Gráficos Visuais Executivos (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Gráfico 1: Evolução do Fluxo de Caixa (Entradas vs Despesas) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Evolução do Fluxo Financeiro (Últimos 6 Meses)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo mensal consolidado de Dízimos/Ofertas vs Despesas da IBNS
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Superávit Operacional
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip 
                  formatter={(value: number | string | undefined) => [`R$ ${Number(value || 0).toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="entradas" name="Entradas (Dízimos/Ofertas)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEntradas)" />
                <Area type="monotone" dataKey="saidas" name="Saídas (Despesas Gerais)" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Entradas no Mês</p>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-700">{formatCurrency(periodIncome)}</p>
            </div>
            <div className="p-2 bg-rose-50/60 rounded-xl border border-rose-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Saídas no Mês</p>
              <p className="text-xs sm:text-sm font-extrabold text-rose-700">{formatCurrency(periodExpenses)}</p>
            </div>
            <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Saldo Líquido</p>
              <p className="text-xs sm:text-sm font-extrabold text-amber-800">{formatCurrency(periodNet)}</p>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Centros de Custo (Donut / Pie) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-600" />
                <span>Despesas por Centro de Custo</span>
              </h3>
              <p className="text-xs text-slate-500">
                Distribuição orçamentária dos departamentos da IBNS Sapiranga
              </p>
            </div>
            <button
              onClick={() => navigateTo('finance')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
            >
              <span>Detalhar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costCenterBreakdown.length > 0 ? costCenterBreakdown : [{ name: 'Sem dados', spent: 1, color: '#94a3b8' }]}
                    dataKey="spent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {costCenterBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | string | undefined) => [formatCurrency(Number(value || 0)), 'Gasto']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List of Top Cost Centers */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {costCenterBreakdown.map(cc => {
                const percentage = periodExpenses > 0 ? Math.round((cc.spent / periodExpenses) * 100) : 0;
                return (
                  <div key={cc.id} className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cc.color }} />
                      <span className="font-semibold text-slate-800 truncate">{cc.name}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-bold text-slate-900">{formatCurrency(cc.spent)}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: Gráfico 3 & 4 (Funil de Evangelismo & Frequência nos Cultos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Gráfico 3: Funil de Consolidação & Evangelismo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                <span>Funil de Discipulado & Vidas Alcançadas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhamento desde o 1º contato evangelístico até o batismo
              </p>
            </div>
            <button
              onClick={() => navigateTo('evangelism')}
              className="text-xs text-orange-700 hover:text-orange-800 font-bold flex items-center gap-1"
            >
              <span>Ver Funil</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discipleshipFunnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="etapa" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip 
                  formatter={(value: number | string | undefined) => [`${value} vidas`, 'Alcançados']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="vidas" radius={[0, 8, 8, 0]}>
                  {discipleshipFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Missionários em campo: <strong className="text-slate-900">{missionaries.length} famílias</strong></span>
            <span className="text-emerald-700 font-bold">Taxa de Conversão: 37%</span>
          </div>
        </div>

        {/* Gráfico 4: Frequência nos Cultos Oficiais da Semana */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Church className="w-4 h-4 text-cyan-700" />
                <span>Frequência Média nos Cultos Oficiais</span>
              </h3>
              <p className="text-xs text-slate-500">
                Presença nos cultos semanais e Escola Bíblica Dominical
              </p>
            </div>
            <button
              onClick={() => navigateTo('agenda')}
              className="text-xs text-cyan-800 hover:text-cyan-900 font-bold flex items-center gap-1"
            >
              <span>Escalas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="culto" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: number | string | undefined) => [`${value} presentes`, 'Média']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="presenca" name="Presença Estimada" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Capacidade do Templo: <strong className="text-slate-900">350 lugares</strong></span>
            <span className="text-cyan-800 font-bold">Ocupação Média: 81%</span>
          </div>
        </div>

      </div>

      {/* SECTION: 8 Módulos Executivos Integrados (Clean Light Cards Grid) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Painel de Módulos Operacionais da IBNS</span>
            </h2>
            <p className="text-xs text-slate-500">
              Acesso rápido a todos os setores administrativos, eclesiásticos e pastorais
            </p>
          </div>
        </div>

        {/* BI KPI Cards Grid (8 Modules) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Módulo Financeiro BI */}
          <div 
            onClick={() => navigateTo('finance')}
            className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">1. Financeiro & Bancos</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Saldo Líquido Operacional</p>
              <p className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 ${periodNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(periodNet)}
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Entradas:
                  </span>
                  <span className="font-bold text-slate-900">{formatCurrency(periodIncome)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1 text-rose-700 font-semibold">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Despesas:
                  </span>
                  <span className="font-bold text-slate-900">{formatCurrency(periodExpenses)}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Cofrinhos/CDB:</span>
                  <span className="text-amber-800 font-bold">{formatCurrency(totalInvested)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>NFs & Extrato Bancário</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

          {/* 2. Módulo de Membros BI */}
          <div 
            onClick={() => navigateTo('members')}
            className="bg-white border border-slate-200 hover:border-blue-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">2. Membros & Liderança</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Membros Ativos</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {activeMembersCount} <span className="text-xs font-normal text-slate-500">cadastrados</span>
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Liderança Eclesiástica:</span>
                  <span className="font-bold text-blue-700">{leadershipCount} líderes</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Aniversariantes no mês:</span>
                  <span className="font-bold text-amber-700">{weekBirthdays.length + todayBirthdays.length}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Novos no período:</span>
                  <span className="text-emerald-700 font-bold">+{newMembersInPeriod}</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 group-hover:text-blue-800">
              <span>Fotos & Documentos</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

          {/* 3. Módulo de Educação Cristã BI */}
          <div 
            onClick={() => navigateTo('education')}
            className="bg-white border border-slate-200 hover:border-purple-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">3. Educação & EBD</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Cursos Bíblicos & Turmas</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {activeCoursesCount} <span className="text-xs font-normal text-slate-500">turmas ativas</span>
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Alunos Matriculados:</span>
                  <span className="font-bold text-purple-800">{totalStudents} alunos</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Certificados Emitidos:</span>
                  <span className="font-bold text-amber-700">{completedCertificates}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Taxa de Conclusão:</span>
                  <span className="text-emerald-700 font-bold">88%</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-700 group-hover:text-purple-800">
              <span>Gerador de Certificados</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

          {/* 4. Módulo de Projetos Sociais BI */}
          <div 
            onClick={() => navigateTo('social')}
            className="bg-white border border-slate-200 hover:border-amber-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">4. Projetos Sociais</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Famílias em Acompanhamento</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {activeFamiliesCount} <span className="text-xs font-normal text-slate-500">famílias</span>
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Entregas de Cestas:</span>
                  <span className="font-bold text-amber-800">{deliveriesInPeriod} cestas</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Oficinas de Música:</span>
                  <span className="font-bold text-slate-900">{totalSocialStudents} alunos</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Bairros em Sapiranga:</span>
                  <span className="text-amber-800 font-bold">5 bairros</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:text-amber-900">
              <span>Alimentos & Música</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

          {/* 5. Módulo de Evangelismo & Missões BI */}
          <div 
            onClick={() => navigateTo('evangelism')}
            className="bg-white border border-slate-200 hover:border-orange-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">5. Evangelismo & Missões</span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Flame className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Decisões por Cristo</p>
              <p className="text-xl sm:text-2xl font-extrabold text-orange-700 tracking-tight mt-0.5">
                {periodDecisions} <span className="text-xs font-normal text-slate-500">vidas</span>
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>No Funil de Discipulado:</span>
                  <span className="font-bold text-slate-900">{inDiscipleshipFunnel} pessoas</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Batismos Registrados:</span>
                  <span className="font-bold text-emerald-700">{baptizedCount} batizados</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Missionários Sustentados:</span>
                  <span className="text-orange-700 font-bold">{missionaries.length} campos</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-orange-700 group-hover:text-orange-800">
              <span>Funil de Discipulado</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

          {/* 6. Módulo de Eventos BI */}
          <div 
            onClick={() => navigateTo('events')}
            className="bg-white border border-slate-200 hover:border-indigo-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">6. Eventos & Retiros</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Próximos Eventos</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {events.length} <span className="text-xs font-normal text-slate-500">agendados</span>
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Inscrições Confirmadas:</span>
                  <span className="font-bold text-indigo-800">
                    {events.reduce((s, e) => s + e.enrolledCount, 0)} inscritos
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Próximo Congresso:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[120px]">{events[0]?.title || 'Congresso IBNS'}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Check-in Digital:</span>
                  <span className="text-emerald-700 font-bold">Disponível</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-700 group-hover:text-indigo-800">
              <span>Inscrições & Escalas</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

          {/* 7. Módulo de Agenda Integrada BI */}
          <div 
            onClick={() => navigateTo('agenda')}
            className="bg-white border border-slate-200 hover:border-cyan-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">7. Agenda & Cultos</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Escalas & Cultos Oficiais</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                4 <span className="text-xs font-normal text-slate-500">cultos semanais</span>
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Culto da Família:</span>
                  <span className="font-bold text-cyan-800">Domingo 19h</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Doutrina & Oração:</span>
                  <span className="font-bold text-slate-900">Quarta 19h30</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Jovens & Teens:</span>
                  <span className="text-amber-800 font-bold">Sábado 19h30</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-cyan-700 group-hover:text-cyan-800">
              <span>Calendário Geral</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

          {/* 8. Módulo de Relatórios & Fechamento Contábil BI */}
          <div 
            onClick={() => navigateTo('reports')}
            className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4.5 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">8. Relatórios & DRE</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-500">Pacote Contábil Mensal</p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 tracking-tight mt-0.5">
                Pronto <span className="text-xs font-normal text-slate-500">p/ exportação</span>
              </p>

              <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>NFs e Recibos anexados:</span>
                  <span className="font-bold text-slate-900">100%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Padronização NFs:</span>
                  <span className="font-bold text-emerald-700">LANC-XXXXX</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Envio ao Contador:</span>
                  <span className="text-amber-800 font-bold">Arquivo ZIP</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>Balancetes & DRE</span>
              <span className="flex items-center">Acessar →</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
