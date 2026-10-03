export type UserRole = 'pastor' | 'tesouraria' | 'secretaria' | 'lider' | 'visitante';

export interface UserSession {
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl?: string;
  pin?: string;
  isAuthenticated: boolean;
}

export type ModuleType = 
  | 'dashboard'
  | 'finance'
  | 'members'
  | 'education'
  | 'social'
  | 'evangelism'
  | 'events'
  | 'agenda'
  | 'reports'
  | 'settings';

// ==================== FINANCEIRO ====================
export type TransactionType = 'entrada' | 'saida';
export type EntryCategory = 'Dízimo' | 'Oferta Geral' | 'Oferta Missionária' | 'Campanha de Construção' | 'Eventos / Cantina' | 'Doação Especial' | 'Rendimento Investimento' | 'Outros';
export type ExpenseCategory = 'Folha / Sustento Pastoral' | 'Água e Luz' | 'Aluguel / Manutenção do Templo' | 'Material de Expediente' | 'Ministério Infantil' | 'Louvor e Equipamentos' | 'Ação Social' | 'Missões' | 'Eventos' | 'Impostos / Taxas' | 'Outros';
export type PaymentStatus = 'pago' | 'agendado' | 'vencido';

export interface CostCenter {
  id: string;
  name: string;
  budgetMonthly: number;
  color: string;
  iconName: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'Conta Corrente' | 'Poupança' | 'Caixa Físico' | 'Conta Digital';
  bankName: string;
  agency?: string;
  accountNumber?: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
}

export interface InvestmentAccount {
  id: string;
  institution: string; // Ex: Nubank Cofrinho, Sicredi CDB, Inter LCI
  name: string;
  type: 'CDB Liquidez Diária' | 'Cofrinho Reserva Emergência' | 'Fundo Construção do Templo' | 'CDB Fundo Missionário' | 'LCI/LCA';
  initialAmount: number;
  currentAmount: number;
  yieldRate: string; // Ex: '100% CDI', '102% CDI'
  lastYieldMonth: number;
  purpose: string;
  updatedAt: string;
}

export interface TransactionAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileData: string; // Base64 data URL
  uploadedAt: string;
  receiptNumber?: string;
  documentType: 'Nota Fiscal' | 'Recibo' | 'Boleto' | 'Comprovante Pix' | 'Outro';
}

export interface FinancialTransaction {
  id: string;
  code: string; // Ex: LANC-00124
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  dueDate: string;
  status: PaymentStatus;
  category: EntryCategory | ExpenseCategory | string;
  costCenterId: string;
  accountId: string;
  // Identificação do Ofertante / Dizimista / Culto
  donorType?: 'membro' | 'manual' | 'culto_publico' | 'anonimo';
  memberId?: string; // Se for membro cadastrado
  memberName?: string;
  donorName?: string; // Nome manual / visitante
  worshipServiceType?: string; // Indicação do culto público
  isAnonymous?: boolean;
  isFixedRecurring?: boolean;
  fixedExpenseId?: string;
  paymentMethod: 'Pix' | 'Transferência Bancária' | 'Boleto' | 'Dinheiro' | 'Cartão' | 'Débito Automático';
  notes?: string;
  attachments: TransactionAttachment[];
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'entrada' | 'saida';
  isDefault?: boolean;
}

export interface CbnPlanSummary {
  yearMonth: string; // YYYY-MM
  totalTithes: number;
  cbnPercent: number; // 0.05 (5%)
  cbnAmount: number; // 5% dos dízimos
  status: 'pendente' | 'provisionado' | 'pago';
  dueDate: string; // Dia 05 do mês seguinte
  paymentTransactionId?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 to 31
  category: ExpenseCategory | string;
  costCenterId: string;
  accountId: string;
  supplier: string;
  autoGenerateMonthly: boolean;
  active: boolean;
}

// ==================== MEMBROS ====================
export type MemberRole = 'Membro Comum' | 'Obreiro(a)' | 'Pastor(a)' | 'Diácono' | 'Diaconisa' | 'Evangelista' | 'Presbítero' | 'Líder de Ministério' | 'Congregado / Visitante Frequente';
export type MemberStatus = 'Ativo' | 'Em Observação' | 'Transferido' | 'Afastado' | 'Falecido';

export interface MemberDocument {
  id: string;
  title: string;
  type: 'Certidão de Casamento' | 'Certidão de Batismo' | 'RG / CNH' | 'Certificado de Curso' | 'Carta de Transferência' | 'Outro';
  fileName: string;
  fileData: string; // Base64
  uploadedAt: string;
}

export interface Member {
  id: string;
  code: string; // Ex: MEM-0089
  fullName: string;
  preferredName?: string;
  photoUrl?: string;
  cpf: string;
  rg?: string;
  gender: 'Masculino' | 'Feminino';
  birthDate: string; // YYYY-MM-DD
  maritalStatus: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)';
  spouseName?: string;
  weddingDate?: string;
  email: string;
  phone: string; // WhatsApp
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string; // Sapiranga default
    state: string; // RS default
    zipCode: string;
  };
  role: MemberRole;
  status: MemberStatus;
  ministries: string[]; // Louvor, Infantil, Diaconia, etc.
  baptismDate?: string;
  membershipDate: string;
  profession?: string;
  talentsAndGifts?: string[];
  documents: MemberDocument[];
  notes?: string;
  createdAt: string;
}

// ==================== EDUCAÇÃO CRISTÃ ====================
export type CourseType = 
  | 'Discipulado'
  | 'Escola Bíblica Dominical (EBD)'
  | 'Curso de Membresia'
  | 'Curso de Batismo'
  | 'Curso de Diáconos'
  | 'Curso de Obreiros e Liderança'
  | 'Teologia Básica';

export interface Course {
  id: string;
  title: string;
  type: CourseType;
  description: string;
  workloadHours: number;
  instructorName: string;
  targetAudience: string;
  certificateTemplateBackground?: string; // Base64 image
  customCertificateTitle?: string;
  lessons: {
    id: string;
    title: string;
    description?: string;
  }[];
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  startDate: string;
  completionDate?: string;
  status: 'Em Andamento' | 'Concluído' | 'Trancado';
  progressPercentage: number;
  attendanceCount: number;
  totalClasses: number;
  finalGrade?: number;
  certificateIssued: boolean;
  certificateIssueDate?: string;
  certificateCode?: string;
}

// ==================== PROJETOS SOCIAIS ====================
export type SocialProgramType = 
  | 'Distribuição de Alimentos / Cestas Básicas'
  | 'Aulas de Música Gratuitas'
  | 'Cursos Profissionalizantes'
  | 'Bazar / Distribuição de Roupas'
  | 'Sopão Solidário'
  | 'Apoio Psicológico e Jurídico';

export interface AssistedFamily {
  id: string;
  headOfFamilyName: string;
  cpf: string;
  phone: string;
  neighborhood: string;
  address: string;
  membersCount: number;
  childrenCount: number;
  vulnerabilityLevel: 'Alta' | 'Média' | 'Baixa';
  monthlyIncome: number;
  registeredAt: string;
  lastAidDate?: string;
  status: 'Ativo' | 'Desligado';
  notes?: string;
}

export interface SocialActionDelivery {
  id: string;
  programType: SocialProgramType;
  familyId?: string;
  familyName?: string;
  beneficiaryName: string;
  date: string;
  itemsDelivered: string; // Ex: '1 Cesta Básica 20kg + 1 Fardo Leite'
  quantityNumber: number;
  volunteersInvolved: string;
  photos?: string[];
  notes?: string;
}

export interface MusicAndSkillsClass {
  id: string;
  title: string; // Ex: 'Violão para Jovens da Comunidade', 'Teclado Básico', 'Corte e Costura'
  programType: SocialProgramType;
  teacherName: string;
  dayOfWeek: string;
  time: string;
  studentsEnrolled: number;
  capacity: number;
  location: string;
}

// ==================== EVANGELISMO E MISSÕES ====================
export interface EvangelismAction {
  id: string;
  title: string;
  type: 'Impacto de Rua' | 'Visita nos Lares' | 'Culto nas Praças' | 'Folhetagem' | 'Evangelismo Hospitalar' | 'Célula / Pequeno Grupo';
  date: string;
  location: string;
  neighborhood: string;
  leaderName: string;
  volunteersCount: number;
  reachedPeopleCount: number;
  decisionsCount: number; // Pessoas que aceitaram a Cristo
  notes?: string;
}

export interface ReachedPerson {
  id: string;
  fullName: string;
  phone: string;
  neighborhood: string;
  firstContactDate: string;
  firstContactActionId?: string;
  stage: 'Contato Inicial' | 'Visita Realizada' | 'Iniciou Discipulado' | 'Frequentando Culto' | 'Candidato ao Batismo' | 'Batizado / Membro';
  assignedDiscipler?: string;
  lastContactDate?: string;
  notes?: string;
}

export interface SupportedMissionary {
  id: string;
  name: string;
  missionField: string; // Ex: 'Sertão Nordestino', 'Moçambique', 'Povos Indígenas RS'
  agency: string;
  monthlyAllowance: number;
  lastLetterDate?: string;
  latestReport?: string;
  photoUrl?: string;
  status: 'Ativo' | 'Licença';
}

// ==================== EVENTOS ====================
export interface ChurchEvent {
  id: string;
  title: string;
  type: 'Conferência' | 'Congresso' | 'Retiro Espiritual' | 'Culto Especial' | 'Noite de Louvor' | 'Batismo Coletivo' | 'Santa Ceia' | 'Acampamento' | 'Outro';
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  description: string;
  isPaid: boolean;
  ticketPrice?: number;
  capacity?: number;
  enrolledCount: number;
  bannerUrl?: string;
  status: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  volunteerTeams: {
    teamName: string; // Recepção, Multimídia, Som, Cantina, Segurança, Limpeza
    leader: string;
    volunteers: string[];
  }[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  participantName: string;
  phone: string;
  email?: string;
  isMember: boolean;
  memberId?: string;
  registeredAt: string;
  paid: boolean;
  paymentAmount: number;
  checkedIn: boolean;
  qrCodeToken: string;
}

// ==================== AGENDA & CALENDÁRIO ====================
export type AgendaEventType = 'aniversario' | 'conta_pagar' | 'evento' | 'social' | 'culto' | 'reuniao';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: AgendaEventType;
  description?: string;
  amount?: number;
  status?: string;
  refId?: string; // id do membro, transação, evento ou ação
  phone?: string; // para WhatsApp
  isUrgent?: boolean;
}

// ==================== AUDITORIA E SEGURANÇA ====================
export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: ModuleType;
  details: string;
  ipAddress?: string;
}
