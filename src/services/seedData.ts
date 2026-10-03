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
  AuditLog
} from '../types';

export const initialBankAccounts: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Banco Inter - Conta Principal',
    type: 'Conta Digital',
    bankName: 'Banco Inter S.A.',
    agency: '0001',
    accountNumber: '1489201-9',
    initialBalance: 12500.00,
    currentBalance: 18450.70,
    color: '#F97316'
  },
  {
    id: 'acc-2',
    name: 'Sicredi - Conta Missões e Obras',
    type: 'Conta Corrente',
    bankName: 'Sicredi Pioneira RS',
    agency: '0167',
    accountNumber: '58420-4',
    initialBalance: 8200.00,
    currentBalance: 14320.00,
    color: '#16A34A'
  },
  {
    id: 'acc-3',
    name: 'Caixa Físico Central (Espécie)',
    type: 'Caixa Físico',
    bankName: 'Tesouraria IBNS Sapiranga',
    initialBalance: 950.00,
    currentBalance: 1840.00,
    color: '#3B82F6'
  }
];

export const initialCostCenters: CostCenter[] = [
  { id: 'cc-1', name: 'Administrativo & Templo', budgetMonthly: 7500, color: '#64748B', iconName: 'Building2' },
  { id: 'cc-2', name: 'Sustento Pastoral', budgetMonthly: 6000, color: '#8B5CF6', iconName: 'UserCheck' },
  { id: 'cc-3', name: 'Missões & Evangelismo', budgetMonthly: 3000, color: '#EF4444', iconName: 'Globe' },
  { id: 'cc-4', name: 'Ação Social Amor em Ação', budgetMonthly: 2500, color: '#F59E0B', iconName: 'HeartHandshake' },
  { id: 'cc-5', name: 'Louvor & Multimídia', budgetMonthly: 1500, color: '#06B6D4', iconName: 'Music' },
  { id: 'cc-6', name: 'Ministério Infantil (IBNS Kids)', budgetMonthly: 1200, color: '#EC4899', iconName: 'Smile' },
  { id: 'cc-7', name: 'Jovens & Adolescentes', budgetMonthly: 1000, color: '#10B981', iconName: 'Flame' },
  { id: 'cc-8', name: 'Patrimônio & Obras Templo', budgetMonthly: 5000, color: '#F97316', iconName: 'Hammer' }
];

export const initialInvestments: InvestmentAccount[] = [
  {
    id: 'inv-1',
    institution: 'Nubank (Caixinha)',
    name: 'Reserva de Emergência IBNS',
    type: 'Cofrinho Reserva Emergência',
    initialAmount: 15000,
    currentAmount: 17850.40,
    yieldRate: '100% do CDI (Rendimento Diário)',
    lastYieldMonth: 168.30,
    purpose: 'Fundo de contingência para manutenções urgentes e despesas extraordinárias.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv-2',
    institution: 'Sicredi Pioneira',
    name: 'Fundo de Construção do Novo Templo',
    type: 'Fundo Construção do Templo',
    initialAmount: 40000,
    currentAmount: 52400.90,
    yieldRate: '103% do CDI (Liquidez 90 dias)',
    lastYieldMonth: 480.20,
    purpose: 'Recursos acumulados da campanha de ampliação do auditório e salas de EBD.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv-3',
    institution: 'Banco Inter',
    name: 'CDB Fundo Missionário Global',
    type: 'CDB Fundo Missionário',
    initialAmount: 10000,
    currentAmount: 11920.15,
    yieldRate: '102% do CDI',
    lastYieldMonth: 112.50,
    purpose: 'Garantir sustento contínuo aos missionários adotados pela igreja no campo.',
    updatedAt: new Date().toISOString()
  }
];

export const initialFixedExpenses: FixedExpense[] = [
  {
    id: 'fix-1',
    name: 'Aluguel do Imóvel do Templo Central',
    amount: 3200.00,
    dueDay: 10,
    category: 'Aluguel / Manutenção do Templo',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    supplier: 'Imobiliária Sapiranga Ltda',
    autoGenerateMonthly: true,
    active: true
  },
  {
    id: 'fix-2',
    name: 'RGE Sul - Energia Elétrica do Templo',
    amount: 1150.00,
    dueDay: 15,
    category: 'Água e Luz',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    supplier: 'RGE Sul Distribuidora de Energia',
    autoGenerateMonthly: true,
    active: true
  },
  {
    id: 'fix-3',
    name: 'Corsan - Fornecimento de Água',
    amount: 280.00,
    dueDay: 18,
    category: 'Água e Luz',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    supplier: 'Corsan Sapiranga',
    autoGenerateMonthly: true,
    active: true
  },
  {
    id: 'fix-4',
    name: 'Internet Fibra Óptica e Telefonia',
    amount: 179.90,
    dueDay: 5,
    category: 'Material de Expediente',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    supplier: 'Operadora NetFibra Sapiranga',
    autoGenerateMonthly: true,
    active: true
  },
  {
    id: 'fix-5',
    name: 'Sustento Pastoral - Pr. Presidente Marcos',
    amount: 4500.00,
    dueDay: 5,
    category: 'Folha / Sustento Pastoral',
    costCenterId: 'cc-2',
    accountId: 'acc-1',
    supplier: 'Pr. Marcos Oliveira',
    autoGenerateMonthly: true,
    active: true
  },
  {
    id: 'fix-6',
    name: 'Honorários de Assessoria Contábil',
    amount: 650.00,
    dueDay: 20,
    category: 'Impostos / Taxas',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    supplier: 'Escritório Contábil Sapiranga',
    autoGenerateMonthly: true,
    active: true
  }
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const currentDay = String(today.getDate()).padStart(2, '0');

export const initialTransactions: FinancialTransaction[] = [
  {
    id: 'tx-1',
    code: 'LANC-00101',
    type: 'entrada',
    description: 'Dízimo Nominal - Família Oliveira',
    amount: 1200.00,
    date: `${currentYear}-${currentMonth}-03`,
    dueDate: `${currentYear}-${currentMonth}-03`,
    status: 'pago',
    category: 'Dízimo',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    memberId: 'mem-1',
    memberName: 'Marcos Oliveira',
    paymentMethod: 'Pix',
    notes: 'Dízimo referente ao mês corrente via chave Pix CNPJ',
    attachments: [
      {
        id: 'att-1',
        fileName: 'LANC-00101_ComprovantePix.png',
        originalName: 'comprovante_pix_marcos.png',
        fileType: 'image/png',
        fileData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23f0fdf4"/><text x="20" y="50" fill="%23166534" font-size="16" font-family="sans-serif">Comprovante Pix - R$ 1.200,00</text><text x="20" y="90" fill="%23374151" font-size="12" font-family="sans-serif">Destino: IBNS Sapiranga (Inter)</text><text x="20" y="120" fill="%236b7280" font-size="11" font-family="sans-serif">Autenticacao: 8F7A1290BC33</text></svg>',
        uploadedAt: `${currentYear}-${currentMonth}-03T10:15:00Z`,
        documentType: 'Comprovante Pix'
      }
    ],
    createdAt: `${currentYear}-${currentMonth}-03T10:15:00Z`
  },
  {
    id: 'tx-2',
    code: 'LANC-00102',
    type: 'entrada',
    description: 'Ofertas do Culto de Domingo Noturno',
    amount: 2450.00,
    date: `${currentYear}-${currentMonth}-04`,
    dueDate: `${currentYear}-${currentMonth}-04`,
    status: 'pago',
    category: 'Oferta Geral',
    costCenterId: 'cc-1',
    accountId: 'acc-3',
    isAnonymous: true,
    paymentMethod: 'Dinheiro',
    notes: 'Contagem efetuada pela comissão de tesouraria após o culto',
    attachments: [],
    createdAt: `${currentYear}-${currentMonth}-04T22:00:00Z`
  },
  {
    id: 'tx-3',
    code: 'LANC-00103',
    type: 'entrada',
    description: 'Oferta Especial para Missões - Projeto África',
    amount: 1800.00,
    date: `${currentYear}-${currentMonth}-07`,
    dueDate: `${currentYear}-${currentMonth}-07`,
    status: 'pago',
    category: 'Oferta Missionária',
    costCenterId: 'cc-3',
    accountId: 'acc-2',
    paymentMethod: 'Transferência Bancária',
    attachments: [],
    createdAt: `${currentYear}-${currentMonth}-07T14:30:00Z`
  },
  {
    id: 'tx-4',
    code: 'LANC-00104',
    type: 'saida',
    description: 'Pagamento Aluguel Templo Central - Sapiranga',
    amount: 3200.00,
    date: `${currentYear}-${currentMonth}-10`,
    dueDate: `${currentYear}-${currentMonth}-10`,
    status: 'pago',
    category: 'Aluguel / Manutenção do Templo',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    fixedExpenseId: 'fix-1',
    paymentMethod: 'Boleto',
    notes: 'Recibo de quitação emitido pela Imobiliária',
    attachments: [
      {
        id: 'att-2',
        fileName: 'LANC-00104_ReciboAluguel.pdf',
        originalName: 'recibo_aluguel_mes.pdf',
        fileType: 'application/pdf',
        fileData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23eff6ff"/><text x="20" y="50" fill="%231e40af" font-size="16" font-family="sans-serif">Recibo de Aluguel - R$ 3.200,00</text><text x="20" y="90" fill="%23374151" font-size="12" font-family="sans-serif">Imobiliaria Sapiranga Ltda</text><text x="20" y="120" fill="%236b7280" font-size="11" font-family="sans-serif">Quitado em 10/' + currentMonth + '</text></svg>',
        uploadedAt: `${currentYear}-${currentMonth}-10T11:00:00Z`,
        documentType: 'Recibo',
        receiptNumber: 'REC-2026-891'
      }
    ],
    createdAt: `${currentYear}-${currentMonth}-10T11:00:00Z`
  },
  {
    id: 'tx-5',
    code: 'LANC-00105',
    type: 'saida',
    description: 'Compra de 20 Cestas Básicas p/ Projeto Amor em Ação',
    amount: 1980.00,
    date: `${currentYear}-${currentMonth}-12`,
    dueDate: `${currentYear}-${currentMonth}-12`,
    status: 'pago',
    category: 'Ação Social',
    costCenterId: 'cc-4',
    accountId: 'acc-1',
    paymentMethod: 'Pix',
    notes: 'Supermercado Rissul Sapiranga - Nota Fiscal NF-e 44921',
    attachments: [
      {
        id: 'att-3',
        fileName: 'LANC-00105_NotaFiscal_44921.pdf',
        originalName: 'Danfe_Rissul_44921.pdf',
        fileType: 'application/pdf',
        fileData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23fef3c7"/><text x="20" y="45" fill="%2392400e" font-size="15" font-weight="bold" font-family="sans-serif">DANFE NOTA FISCAL N 44921</text><text x="20" y="80" fill="%23374151" font-size="12" font-family="sans-serif">Emitente: Supermercados Rissul Sapiranga</text><text x="20" y="110" fill="%23374151" font-size="12" font-family="sans-serif">Destinatario: IBNS - CNPJ 00.123.456/0001-99</text><text x="20" y="140" fill="%2315803d" font-size="14" font-weight="bold" font-family="sans-serif">Total: R$ 1.980,00</text></svg>',
        uploadedAt: `${currentYear}-${currentMonth}-12T16:20:00Z`,
        documentType: 'Nota Fiscal',
        receiptNumber: 'NF-e 44921'
      }
    ],
    createdAt: `${currentYear}-${currentMonth}-12T16:20:00Z`
  },
  {
    id: 'tx-6',
    code: 'LANC-00106',
    type: 'saida',
    description: 'Fatura RGE Energia Elétrica - Templo',
    amount: 1150.00,
    date: `${currentYear}-${currentMonth}-15`,
    dueDate: `${currentYear}-${currentMonth}-15`,
    status: 'agendado',
    category: 'Água e Luz',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    fixedExpenseId: 'fix-2',
    paymentMethod: 'Débito Automático',
    attachments: [],
    createdAt: `${currentYear}-${currentMonth}-01T08:00:00Z`
  },
  {
    id: 'tx-7',
    code: 'LANC-00107',
    type: 'saida',
    description: 'Corsan - Conta de Água Templo Central',
    amount: 280.00,
    date: `${currentYear}-${currentMonth}-18`,
    dueDate: `${currentYear}-${currentMonth}-18`,
    status: 'agendado',
    category: 'Água e Luz',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    fixedExpenseId: 'fix-3',
    paymentMethod: 'Boleto',
    attachments: [],
    createdAt: `${currentYear}-${currentMonth}-01T08:00:00Z`
  },
  {
    id: 'tx-8',
    code: 'LANC-00108',
    type: 'saida',
    description: 'Manutenção de Microfones e Cabos de Áudio',
    amount: 420.00,
    date: `${currentYear}-${currentMonth}-05`,
    dueDate: `${currentYear}-${currentMonth}-05`,
    status: 'pago',
    category: 'Louvor e Equipamentos',
    costCenterId: 'cc-5',
    accountId: 'acc-1',
    paymentMethod: 'Pix',
    attachments: [],
    createdAt: `${currentYear}-${currentMonth}-05T15:00:00Z`
  },
  {
    id: 'tx-9',
    code: 'LANC-00109',
    type: 'saida',
    description: 'Padaria & Confeitaria Sapiranga - Café de Comunhão Obreiros',
    amount: 285.50,
    date: `${currentYear}-${currentMonth}-${currentDay}`,
    dueDate: `${currentYear}-${currentMonth}-${currentDay}`,
    status: 'agendado',
    category: 'Material de Expediente',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    paymentMethod: 'Pix',
    notes: 'Vencimento hoje - Autorizado pela Tesouraria',
    attachments: [
      {
        id: 'att-4',
        fileName: 'LANC-00109_Boleto_Cafe.pdf',
        originalName: 'boleto_cafe_comunhao.pdf',
        fileType: 'application/pdf',
        fileData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23fff1f2"/><text x="20" y="50" fill="%239f1239" font-size="16" font-family="sans-serif">Boleto a Vencer Hoje - R$ 285,50</text><text x="20" y="90" fill="%23374151" font-size="12" font-family="sans-serif">Padaria Sapiranga</text></svg>',
        uploadedAt: `${currentYear}-${currentMonth}-${currentDay}T08:00:00Z`,
        documentType: 'Boleto',
        receiptNumber: 'BOL-9941'
      }
    ],
    createdAt: `${currentYear}-${currentMonth}-${currentDay}T08:00:00Z`
  },
  {
    id: 'tx-10',
    code: 'LANC-00110',
    type: 'saida',
    description: 'Manutenção Preventiva de Ar-Condicionado do Templo',
    amount: 450.00,
    date: `${currentYear}-${currentMonth}-02`,
    dueDate: `${currentYear}-${currentMonth}-02`,
    status: 'vencido',
    category: 'Aluguel / Manutenção do Templo',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    paymentMethod: 'Boleto',
    notes: 'Conta pendente de regularização - Técnico ClimaSapiranga',
    attachments: [],
    createdAt: `${currentYear}-${currentMonth}-01T10:00:00Z`
  },
  {
    id: 'tx-11',
    code: 'LANC-00111',
    type: 'entrada',
    description: 'Dízimo Nominal do Dia - Transferência Pix',
    amount: 650.00,
    date: `${currentYear}-${currentMonth}-${currentDay}`,
    dueDate: `${currentYear}-${currentMonth}-${currentDay}`,
    status: 'pago',
    category: 'Dízimo',
    costCenterId: 'cc-1',
    accountId: 'acc-1',
    paymentMethod: 'Pix',
    notes: 'Dízimo entregue hoje via Pix Banco Inter',
    attachments: [],
    createdAt: `${currentYear}-${currentMonth}-${currentDay}T09:30:00Z`
  }
];

export const initialMembers: Member[] = [
  {
    id: 'mem-1',
    code: 'MEM-0001',
    fullName: 'Marcos Aurélio de Oliveira',
    preferredName: 'Pr. Marcos',
    cpf: '348.912.840-22',
    rg: '1098472910',
    gender: 'Masculino',
    birthDate: `${currentYear - 48}-${currentMonth}-${currentDay}`, // Aniversariante Hoje!
    maritalStatus: 'Casado(a)',
    spouseName: 'Pra. Débora Cristina Oliveira',
    weddingDate: '2001-05-12',
    email: 'marcos.pastor@ibnsapiranga.org.br',
    phone: '(51) 99824-3310',
    address: {
      street: 'Rua São Pedro',
      number: '420',
      neighborhood: 'Centro',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93800-050'
    },
    role: 'Pastor(a)',
    status: 'Ativo',
    ministries: ['Pastoral', 'Ensino', 'Liderança'],
    baptismDate: '1992-11-15',
    membershipDate: '2015-02-10',
    profession: 'Pastor e Teólogo',
    talentsAndGifts: ['Pregação', 'Aconselhamento', 'Gestão', 'Ensino'],
    documents: [
      {
        id: 'doc-1',
        title: 'Certificado de Ordenação Pastoral',
        type: 'Certificado de Curso',
        fileName: 'cert_ordenacao_pastor_marcos.pdf',
        fileData: 'data:text/plain;base64,Q2VydGlmaWNhZG8gZGUgT3JkZW5hw6fDo28gUGFzdG9yYWwgQk5CIC0gUHIuIE1hcmNvcyBPbGl2ZWlyYQ==',
        uploadedAt: '2023-01-10T10:00:00Z'
      }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'mem-2',
    code: 'MEM-0002',
    fullName: 'Débora Cristina Oliveira',
    preferredName: 'Pra. Débora',
    cpf: '450.812.390-11',
    gender: 'Feminino',
    birthDate: `${currentYear - 44}-${currentMonth}-${String(Math.min(28, Number(currentDay) + 1)).padStart(2, '0')}`, // Aniversariante esta semana
    maritalStatus: 'Casado(a)',
    spouseName: 'Pr. Marcos Aurélio de Oliveira',
    weddingDate: '2001-05-12',
    email: 'debora.oliveira@ibnsapiranga.org.br',
    phone: '(51) 99712-4455',
    address: {
      street: 'Rua São Pedro',
      number: '420',
      neighborhood: 'Centro',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93800-050'
    },
    role: 'Pastor(a)',
    status: 'Ativo',
    ministries: ['Mulheres', 'Ação Social', 'Intercessão'],
    baptismDate: '1995-04-20',
    membershipDate: '2015-02-10',
    profession: 'Psicóloga',
    talentsAndGifts: ['Aconselhamento Familiar', 'Música', 'Ministração'],
    documents: [],
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'mem-3',
    code: 'MEM-0003',
    fullName: 'Ricardo dos Santos Silveira',
    preferredName: 'Pb. Ricardo (Tesoureiro)',
    cpf: '582.341.900-55',
    gender: 'Masculino',
    birthDate: `${currentYear - 39}-${currentMonth}-${currentDay}`, // Aniversário hoje também!
    maritalStatus: 'Casado(a)',
    spouseName: 'Luciana Silveira',
    email: 'ricardo.tesouraria@ibnsapiranga.org.br',
    phone: '(51) 99650-8822',
    address: {
      street: 'Av. 20 de Setembro',
      number: '1850',
      neighborhood: 'Amaral Ribeiro',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93802-100'
    },
    role: 'Presbítero',
    status: 'Ativo',
    ministries: ['Tesouraria', 'Administrativo', 'Conselho Fiscal'],
    baptismDate: '2004-12-05',
    membershipDate: '2016-04-15',
    profession: 'Contador',
    talentsAndGifts: ['Finanças', 'Gestão Estratégica', 'Pregação'],
    documents: [],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'mem-4',
    code: 'MEM-0004',
    fullName: 'Eliane Maria da Silva',
    preferredName: 'Diac. Eliane (Secretária)',
    cpf: '612.449.120-77',
    gender: 'Feminino',
    birthDate: '1988-09-03',
    maritalStatus: 'Casado(a)',
    email: 'secretaria@ibnsapiranga.org.br',
    phone: '(51) 99180-2244',
    address: {
      street: 'Rua Presidente Kennedy',
      number: '560',
      neighborhood: 'São Luiz',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93804-200'
    },
    role: 'Diaconisa',
    status: 'Ativo',
    ministries: ['Secretaria', 'Recepção', 'Diaconia'],
    baptismDate: '2008-03-23',
    membershipDate: '2017-06-20',
    profession: 'Assistente Administrativa',
    talentsAndGifts: ['Organização', 'Comunicação', 'Acolhimento'],
    documents: [],
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'mem-5',
    code: 'MEM-0005',
    fullName: 'Gabriel Henrique Schmitt',
    preferredName: 'Gabriel Schmitt',
    cpf: '723.190.450-88',
    gender: 'Masculino',
    birthDate: '1997-11-20',
    maritalStatus: 'Solteiro(a)',
    email: 'gabriel.louvor@ibnsapiranga.org.br',
    phone: '(51) 99344-9011',
    address: {
      street: 'Rua Major Bento Alves',
      number: '920',
      neighborhood: 'Sete de Setembro',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93801-410'
    },
    role: 'Líder de Ministério',
    status: 'Ativo',
    ministries: ['Ministério de Louvor', 'Jovens IBNS'],
    baptismDate: '2014-10-12',
    membershipDate: '2018-01-15',
    profession: 'Músico e Designer',
    talentsAndGifts: ['Violão', 'Voz', 'Produção Musical', 'Mídias Sociais'],
    documents: [],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'mem-6',
    code: 'MEM-0006',
    fullName: 'Carlos Eduardo Becker',
    preferredName: 'Ev. Carlos Becker',
    cpf: '811.234.567-00',
    gender: 'Masculino',
    birthDate: '1979-04-10',
    maritalStatus: 'Casado(a)',
    email: 'carlos.evangelismo@ibnsapiranga.org.br',
    phone: '(51) 98112-7700',
    address: {
      street: 'Rua Kraemer-Eck',
      number: '310',
      neighborhood: 'Santa Fé',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93805-110'
    },
    role: 'Evangelista',
    status: 'Ativo',
    ministries: ['Missões & Evangelismo', 'Discipulado', 'Visitação'],
    baptismDate: '1998-07-19',
    membershipDate: '2015-08-10',
    profession: 'Comerciante',
    talentsAndGifts: ['Evangelismo Pessoal', 'Visitação', 'Oração'],
    documents: [],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'mem-7',
    code: 'MEM-0007',
    fullName: 'Ana Paula Rodrigues',
    preferredName: 'Ana Paula (Kids)',
    cpf: '933.401.782-99',
    gender: 'Feminino',
    birthDate: '1991-08-20', // Aniversariante no mês
    maritalStatus: 'Solteiro(a)',
    email: 'anapaula.kids@ibnsapiranga.org.br',
    phone: '(51) 99233-1199',
    address: {
      street: 'Rua Duque de Caxias',
      number: '140',
      neighborhood: 'Oeste',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93806-030'
    },
    role: 'Obreiro(a)',
    status: 'Ativo',
    ministries: ['Ministério Infantil (IBNS Kids)', 'Educação Cristã'],
    baptismDate: '2010-09-05',
    membershipDate: '2019-03-10',
    profession: 'Pedagoga',
    talentsAndGifts: ['Ensino Infantil', 'Teatro', 'Contação de Histórias'],
    documents: [],
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'mem-8',
    code: 'MEM-0008',
    fullName: 'Juliana Fagundes Moreira',
    preferredName: 'Juliana Fagundes',
    cpf: '402.189.330-44',
    gender: 'Feminino',
    birthDate: '1995-12-14',
    maritalStatus: 'Casado(a)',
    email: 'juliana.fagundes@gmail.com',
    phone: '(51) 99877-6655',
    address: {
      street: 'Rua Padre Réus',
      number: '88',
      neighborhood: 'Centro',
      city: 'Sapiranga',
      state: 'RS',
      zipCode: '93800-112'
    },
    role: 'Membro Comum',
    status: 'Ativo',
    ministries: ['Recepção', 'Coral'],
    baptismDate: '2021-12-19',
    membershipDate: '2022-01-10',
    profession: 'Enfermeira',
    talentsAndGifts: ['Primeiros Socorros', 'Acolhimento', 'Canto'],
    documents: [],
    photoUrl: 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=200&auto=format&fit=crop&q=80',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

export const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Curso de Membresia e Doutrinas IBNS',
    type: 'Curso de Membresia',
    description: 'Curso preparatório obrigatório para novos membros e congregados que desejam se integrar à IBNS Sapiranga.',
    workloadHours: 12,
    instructorName: 'Pr. Marcos Oliveira',
    targetAudience: 'Novos convertidos e transferências de outras igrejas',
    customCertificateTitle: 'Certificado de Conclusão do Curso de Membresia',
    lessons: [
      { id: 'l-1', title: 'Nossa História e Visão Eclesiástica' },
      { id: 'l-2', title: 'Declaração Doutrinária Batista Nacional' },
      { id: 'l-3', title: 'Ordenanças: Batismo Bíblico e Ceia do Senhor' },
      { id: 'l-4', title: 'Vida Cristã Prática, Dízimos e Ministério' }
    ]
  },
  {
    id: 'course-2',
    title: 'Preparatório para o Batismo nas Águas',
    type: 'Curso de Batismo',
    description: 'Instrução bíblica fundamental sobre a salvação em Jesus Cristo e o compromisso público da fé.',
    workloadHours: 10,
    instructorName: 'Ev. Carlos Becker',
    targetAudience: 'Candidatos ao batismo',
    customCertificateTitle: 'Certificado de Aptidão ao Santo Batismo',
    lessons: [
      { id: 'lb-1', title: 'O Significado Bíblico do Batismo' },
      { id: 'lb-2', title: 'Arrependimento, Fé e Nova Vida' },
      { id: 'lb-3', title: 'O Fruto do Espírito Santo e Oração' },
      { id: 'lb-4', title: 'O Testemunho Público e a Igreja Local' }
    ]
  },
  {
    id: 'course-3',
    title: 'Escola de Diaconia e Serviço Cristão',
    type: 'Curso de Diáconos',
    description: 'Formação eclesiástica e prática para candidatos ao diaconato e obreiros de apoio.',
    workloadHours: 24,
    instructorName: 'Pb. Ricardo Silveira & Diac. Eliane Silva',
    targetAudience: 'Membros indicados pela liderança para o serviço diaconal',
    customCertificateTitle: 'Certificado de Formação Diaconal',
    lessons: [
      { id: 'ld-1', title: 'O Modelo Bíblico dos Diáconos em Atos 6' },
      { id: 'ld-2', title: 'Requisitos Espirituais e Morais (1 Tm 3)' },
      { id: 'ld-3', title: 'Zelo pelo Patrimônio, Santa Ceia e Ação Social' },
      { id: 'ld-4', title: 'Acolhimento, Segurança e Ordem nos Cultos' }
    ]
  },
  {
    id: 'course-4',
    title: 'Discipulado 1 a 1: Primeiros Passos na Fé',
    type: 'Discipulado',
    description: 'Acompanhamento personalizado semanal para consolidação do novo convertido na fé em Cristo.',
    workloadHours: 16,
    instructorName: 'Equipe de Discipulado IBNS',
    targetAudience: 'Novas decisões por Cristo',
    customCertificateTitle: 'Certificado de Conclusão do Discipulado Fundamental',
    lessons: [
      { id: 'dp-1', title: 'Certeza da Salvação' },
      { id: 'dp-2', title: 'Como Estudar a Bíblia e Orar' },
      { id: 'dp-3', title: 'Vencendo Tentações no Dia a Dia' },
      { id: 'dp-4', title: 'Compartilhando a Fé com Família e Amigos' }
    ]
  },
  {
    id: 'course-5',
    title: 'Curso de Obreiros e Liderança Bíblica',
    type: 'Curso de Obreiros e Liderança',
    description: 'Capacitação teológica, homilética e pastoral para líderes de células, ministérios e futuros presbíteros.',
    workloadHours: 32,
    instructorName: 'Pr. Marcos Oliveira',
    targetAudience: 'Líderes de ministérios e obreiros',
    customCertificateTitle: 'Certificado de Formação de Líderes e Obreiros',
    lessons: [
      { id: 'lo-1', title: 'Caráter e Integridade do Líder Cristão' },
      { id: 'lo-2', title: 'Princípios de Interpretação e Pregação Bíblica' },
      { id: 'lo-3', title: 'Aconselhamento e Gestão de Conflitos' },
      { id: 'lo-4', title: 'Multiplicação de Discípulos e Visão Estratégica' }
    ]
  }
];

export const initialEnrollments: CourseEnrollment[] = [
  {
    id: 'enr-1',
    courseId: 'course-1',
    memberId: 'mem-8',
    memberName: 'Juliana Fagundes Moreira',
    memberEmail: 'juliana.fagundes@gmail.com',
    startDate: '2026-02-01',
    completionDate: '2026-03-15',
    status: 'Concluído',
    progressPercentage: 100,
    attendanceCount: 4,
    totalClasses: 4,
    finalGrade: 9.8,
    certificateIssued: true,
    certificateIssueDate: '2026-03-15',
    certificateCode: 'CERT-IBNS-2026-0041'
  },
  {
    id: 'enr-2',
    courseId: 'course-2',
    memberId: 'mem-5',
    memberName: 'Gabriel Henrique Schmitt',
    startDate: '2026-07-01',
    status: 'Em Andamento',
    progressPercentage: 75,
    attendanceCount: 3,
    totalClasses: 4,
    certificateIssued: false
  },
  {
    id: 'enr-3',
    courseId: 'course-3',
    memberId: 'mem-7',
    memberName: 'Ana Paula Rodrigues',
    startDate: '2026-06-10',
    status: 'Em Andamento',
    progressPercentage: 50,
    attendanceCount: 2,
    totalClasses: 4,
    certificateIssued: false
  }
];

export const initialAssistedFamilies: AssistedFamily[] = [
  {
    id: 'fam-1',
    headOfFamilyName: 'Maria Lurdes da Silva',
    cpf: '512.981.340-99',
    phone: '(51) 99120-7711',
    neighborhood: 'Santa Fé',
    address: 'Rua das Hortênsias, 145',
    membersCount: 5,
    childrenCount: 3,
    vulnerabilityLevel: 'Alta',
    monthlyIncome: 950.00,
    registeredAt: '2025-08-10',
    lastAidDate: `${currentYear}-${currentMonth}-12`,
    status: 'Ativo',
    notes: 'Mãe solo, desempregada, recebe cesta básica mensal e apoio do bazar'
  },
  {
    id: 'fam-2',
    headOfFamilyName: 'João Carlos Pereira',
    cpf: '633.220.890-44',
    phone: '(51) 99450-3322',
    neighborhood: 'Amaral Ribeiro',
    address: 'Beco dos Cravos, 40',
    membersCount: 4,
    childrenCount: 2,
    vulnerabilityLevel: 'Alta',
    monthlyIncome: 1200.00,
    registeredAt: '2025-10-15',
    lastAidDate: `${currentYear}-${currentMonth}-12`,
    status: 'Ativo',
    notes: 'Família assistida com cesta básica e filho mais velho faz aula de violão na igreja'
  },
  {
    id: 'fam-3',
    headOfFamilyName: 'Cleide Regina Souza',
    cpf: '744.119.550-11',
    phone: '(51) 98011-8844',
    neighborhood: 'São Luiz',
    address: 'Rua Tiradentes, 89',
    membersCount: 3,
    childrenCount: 1,
    vulnerabilityLevel: 'Média',
    monthlyIncome: 1600.00,
    registeredAt: '2026-01-20',
    lastAidDate: `${currentYear}-${currentMonth}-02`,
    status: 'Ativo',
    notes: 'Atendida com roupas de inverno e auxílio temporário'
  }
];

export const initialSocialDeliveries: SocialActionDelivery[] = [
  {
    id: 'del-1',
    programType: 'Distribuição de Alimentos / Cestas Básicas',
    familyId: 'fam-1',
    familyName: 'Família Maria Lurdes',
    beneficiaryName: 'Maria Lurdes da Silva',
    date: `${currentYear}-${currentMonth}-12`,
    itemsDelivered: '1 Cesta Básica 20kg + 1 Fardo Leite Integral + 1 Kit Higiene',
    quantityNumber: 1,
    volunteersInvolved: 'Pra. Débora, Diac. Eliane, Carlos Becker',
    notes: 'Entrega domiciliar realizada no bairro Santa Fé com momento de oração'
  },
  {
    id: 'del-2',
    programType: 'Distribuição de Alimentos / Cestas Básicas',
    familyId: 'fam-2',
    familyName: 'Família João Carlos Pereira',
    beneficiaryName: 'João Carlos Pereira',
    date: `${currentYear}-${currentMonth}-12`,
    itemsDelivered: '1 Cesta Básica 20kg + Kit de Alimentos',
    quantityNumber: 1,
    volunteersInvolved: 'Pb. Ricardo, Gabriel Schmitt',
    notes: 'Retirada na sede da IBNS Sapiranga'
  },
  {
    id: 'del-3',
    programType: 'Bazar / Distribuição de Roupas',
    beneficiaryName: 'Comunidade Bairro São Luiz (15 famílias)',
    date: `${currentYear}-${currentMonth}-05`,
    itemsDelivered: '180 Peças de Agasalhos e Cobertores de Inverno',
    quantityNumber: 180,
    volunteersInvolved: 'Equipe Amor em Ação (8 voluntários)',
    notes: 'Ação de inverno na quadra comunitária com café da manhã comunitário'
  }
];

export const initialClasses: MusicAndSkillsClass[] = [
  {
    id: 'class-1',
    title: 'Oficina de Violão para Crianças e Jovens',
    programType: 'Aulas de Música Gratuitas',
    teacherName: 'Gabriel Schmitt',
    dayOfWeek: 'Sábado',
    time: '14:00 às 15:30',
    studentsEnrolled: 16,
    capacity: 20,
    location: 'Sala 3 de Música - IBNS Templo'
  },
  {
    id: 'class-2',
    title: 'Teclado e Teoria Musical para Iniciantes',
    programType: 'Aulas de Música Gratuitas',
    teacherName: 'Juliana Fagundes',
    dayOfWeek: 'Sábado',
    time: '16:00 às 17:30',
    studentsEnrolled: 12,
    capacity: 15,
    location: 'Sala 3 de Música - IBNS Templo'
  },
  {
    id: 'class-3',
    title: 'Curso Profissionalizante: Informática Básica e Currículo',
    programType: 'Cursos Profissionalizantes',
    teacherName: 'Pb. Ricardo Silveira',
    dayOfWeek: 'Quinta-feira',
    time: '19:30 às 21:00',
    studentsEnrolled: 18,
    capacity: 20,
    location: 'Laboratório Comunitário IBNS'
  }
];

export const initialEvangelismActions: EvangelismAction[] = [
  {
    id: 'ev-1',
    title: 'Impacto Evangelístico na Praça da Bandeira - Sapiranga',
    type: 'Culto nas Praças',
    date: `${currentYear}-${currentMonth}-08`,
    location: 'Praça da Bandeira (Centro)',
    neighborhood: 'Centro',
    leaderName: 'Ev. Carlos Becker',
    volunteersCount: 22,
    reachedPeopleCount: 85,
    decisionsCount: 7,
    notes: 'Apresentação musical acústica, distribuição de folhetos e oração por enfermos. 7 pessoas entregaram suas vidas a Cristo!'
  },
  {
    id: 'ev-2',
    title: 'Visitação Evangelística e Acolhimento no Bairro Santa Fé',
    type: 'Visita nos Lares',
    date: `${currentYear}-${currentMonth}-10`,
    location: 'Bairro Santa Fé',
    neighborhood: 'Santa Fé',
    leaderName: 'Pr. Marcos & Carlos Becker',
    volunteersCount: 12,
    reachedPeopleCount: 28,
    decisionsCount: 3,
    notes: 'Visitas com oração nas famílias assistidas pelos projetos sociais'
  }
];

export const initialReachedPersons: ReachedPerson[] = [
  {
    id: 'rp-1',
    fullName: 'Mateus Oliveira Fontoura',
    phone: '(51) 99331-4455',
    neighborhood: 'Centro',
    firstContactDate: `${currentYear}-${currentMonth}-08`,
    firstContactActionId: 'ev-1',
    stage: 'Iniciou Discipulado',
    assignedDiscipler: 'Gabriel Schmitt',
    lastContactDate: `${currentYear}-${currentMonth}-11`,
    notes: 'Aceitou a Jesus na Praça da Bandeira. Muito sedento pela Palavra, já participou do culto no domingo!'
  },
  {
    id: 'rp-2',
    fullName: 'Fernanda Machado Dornelles',
    phone: '(51) 99812-3901',
    neighborhood: 'Amaral Ribeiro',
    firstContactDate: `${currentYear}-${currentMonth}-08`,
    firstContactActionId: 'ev-1',
    stage: 'Frequentando Culto',
    assignedDiscipler: 'Pra. Débora',
    lastContactDate: `${currentYear}-${currentMonth}-13`,
    notes: 'Convidada no impacto, compareceu no Culto da Família com a mãe.'
  },
  {
    id: 'rp-3',
    fullName: 'Cláudio Renato Souza',
    phone: '(51) 98044-1234',
    neighborhood: 'Santa Fé',
    firstContactDate: `${currentYear}-${currentMonth}-10`,
    firstContactActionId: 'ev-2',
    stage: 'Visita Realizada',
    assignedDiscipler: 'Carlos Becker',
    lastContactDate: `${currentYear}-${currentMonth}-10`,
    notes: 'Pediu visita pastoral por estar passando por um momento de luto familiar.'
  }
];

export const initialMissionaries: SupportedMissionary[] = [
  {
    id: 'mis-1',
    name: 'Pr. Josué & Família Santos',
    missionField: 'Sertão do Piauí (Comunidades Quilombolas)',
    agency: 'Junta de Missões Nacionais',
    monthlyAllowance: 1200.00,
    lastLetterDate: `${currentYear}-${currentMonth}-01`,
    latestReport: 'Concluímos a perfuração de um poço artesiano na comunidade e batizamos 14 novos crentes neste trimestre. Glória a Deus!',
    status: 'Ativo',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'mis-2',
    name: 'Missionária Sarah Silva',
    missionField: 'Maputo - Moçambique (África)',
    agency: 'Missão Horizontes Mundiais',
    monthlyAllowance: 800.00,
    lastLetterDate: `${currentYear}-07-15`,
    latestReport: 'A escola comunitária atende 120 crianças órfãs com alimentação e educação cristã diária. Agradecemos pelo sustento fiel da IBNS!',
    status: 'Ativo',
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80'
  }
];

export const initialEvents: ChurchEvent[] = [
  {
    id: 'evt-1',
    title: 'Conferência da Família IBNS 2026: Lares Restaurados',
    type: 'Conferência',
    startDate: `${currentYear}-${currentMonth}-22`,
    endDate: `${currentYear}-${currentMonth}-24`,
    time: '19:30',
    location: 'Auditório Principal - IBNS Sapiranga',
    description: '3 noites de ministrações profundas, palestras para casais, jovens e solteiros com preletores convidados.',
    isPaid: true,
    ticketPrice: 35.00,
    capacity: 250,
    enrolledCount: 142,
    bannerUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
    status: 'Agendado',
    volunteerTeams: [
      { teamName: 'Recepção e Credenciamento', leader: 'Diac. Eliane Silva', volunteers: ['Juliana Fagundes', 'Maria Lúcia', 'Beatriz'] },
      { teamName: 'Música & Áudio', leader: 'Gabriel Schmitt', volunteers: ['Lucas', 'Felipe', 'Mateus'] },
      { teamName: 'Cantina e Coffee Break', leader: 'Pra. Débora', volunteers: ['Terezinha', 'Rosa', 'Clara'] }
    ]
  },
  {
    id: 'evt-2',
    title: 'Noite de Louvor & Adoração: Chama Viva',
    type: 'Noite de Louvor',
    startDate: `${currentYear}-${currentMonth}-29`,
    endDate: `${currentYear}-${currentMonth}-29`,
    time: '20:00',
    location: 'Templo Central IBNS Sapiranga',
    description: 'Uma noite especial de intercessão, ministração profunda e adoração sem pressa aberta a toda a cidade.',
    isPaid: false,
    capacity: 300,
    enrolledCount: 198,
    status: 'Agendado',
    volunteerTeams: [
      { teamName: 'Multimídia e Transmissão', leader: 'Gabriel Schmitt', volunteers: ['Daniel', 'Guilherme'] }
    ]
  },
  {
    id: 'evt-3',
    title: 'Santo Batismo nas Águas - Rio dos Sinos / Sítio',
    type: 'Batismo Coletivo',
    startDate: `${currentYear}-09-13`,
    endDate: `${currentYear}-09-13`,
    time: '09:30',
    location: 'Sítio Betel - Sapiranga/RS',
    description: 'Celebração solene do batismo de novos discípulos seguida de almoço fraterno de comunhão.',
    isPaid: false,
    capacity: 200,
    enrolledCount: 45,
    status: 'Agendado',
    volunteerTeams: [
      { teamName: 'Organização e Diaconia', leader: 'Pb. Ricardo Silveira', volunteers: ['Carlos Becker', 'Marcos'] }
    ]
  }
];

export const initialRegistrations: EventRegistration[] = [
  {
    id: 'reg-1',
    eventId: 'evt-1',
    participantName: 'Juliana Fagundes Moreira',
    phone: '(51) 99877-6655',
    email: 'juliana.fagundes@gmail.com',
    isMember: true,
    memberId: 'mem-8',
    registeredAt: `${currentYear}-${currentMonth}-05T14:00:00Z`,
    paid: true,
    paymentAmount: 35.00,
    checkedIn: false,
    qrCodeToken: 'TKT-CONF-2026-001'
  },
  {
    id: 'reg-2',
    eventId: 'evt-1',
    participantName: 'Cláudia Silva de Souza',
    phone: '(51) 99112-9900',
    email: 'claudia.souza@gmail.com',
    isMember: false,
    registeredAt: `${currentYear}-${currentMonth}-07T18:30:00Z`,
    paid: true,
    paymentAmount: 35.00,
    checkedIn: false,
    qrCodeToken: 'TKT-CONF-2026-002'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: `${currentYear}-${currentMonth}-${currentDay}T09:00:00Z`,
    userName: 'Pr. Marcos Oliveira',
    userRole: 'pastor',
    action: 'LOGIN_SISTEMA',
    module: 'dashboard',
    details: 'Acesso autenticado ao painel administrativo IBNS ERP com perfil de Pastor Presidente.'
  },
  {
    id: 'log-2',
    timestamp: `${currentYear}-${currentMonth}-12T16:20:00Z`,
    userName: 'Pb. Ricardo Silveira',
    userRole: 'tesouraria',
    action: 'CADASTRO_LANCAMENTO_NF',
    module: 'finance',
    details: 'Lançamento de despesa LANC-00105 de R$ 1.980,00 com anexo de Nota Fiscal DANFE 44921.'
  }
];
