import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Users, 
  PackageCheck, 
  Calendar, 
  MapPin, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  BookOpen,
  Music,
  ShoppingBag,
  Sparkles,
  Download,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { AssistedFamily, SocialActionDelivery, MusicAndSkillsClass } from '../../types';
import { db } from '../../services/db';

export const SocialModule: React.FC = () => {
  const [families, setFamilies] = useState<AssistedFamily[]>(db.getAssistedFamilies());
  const [deliveries, setDeliveries] = useState<SocialActionDelivery[]>(db.getSocialDeliveries());
  const [classes, setClasses] = useState<MusicAndSkillsClass[]>(db.getClasses());

  const [activeTab, setActiveTab] = useState<'families' | 'deliveries' | 'classes'>('families');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [familyToEdit, setFamilyToEdit] = useState<AssistedFamily | null>(null);

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<MusicAndSkillsClass | null>(null);

  // Form states
  const [familyForm, setFamilyForm] = useState<Partial<AssistedFamily>>({
    headOfFamilyName: '',
    cpf: '',
    phone: '',
    neighborhood: 'São Luiz',
    address: 'Rua das Palmeiras, 120',
    membersCount: 4,
    childrenCount: 2,
    vulnerabilityLevel: 'Alta',
    monthlyIncome: 1200,
    status: 'Ativo',
    notes: 'Família cadastrada para auxílio de cesta básica e apoio pastoral.'
  });

  const [newDelivery, setNewDelivery] = useState<Partial<SocialActionDelivery>>({
    programType: 'Distribuição de Alimentos / Cestas Básicas',
    beneficiaryName: '',
    date: new Date().toISOString().split('T')[0],
    itemsDelivered: '1 Cesta Básica 20kg + 1 Fardo de Leite',
    quantityNumber: 1,
    volunteersInvolved: 'Diaconia IBNS',
    notes: ''
  });

  const [classForm, setClassForm] = useState<Partial<MusicAndSkillsClass>>({
    title: '',
    programType: 'Aulas de Música Gratuitas',
    teacherName: 'Levita Mateus',
    dayOfWeek: 'Sábado',
    time: '14:00 - 15:30',
    studentsEnrolled: 12,
    capacity: 20,
    location: 'Templo Sede IBNS'
  });

  useEffect(() => {
    return db.subscribe(() => {
      setFamilies(db.getAssistedFamilies());
      setDeliveries(db.getSocialDeliveries());
      setClasses(db.getClasses());
    });
  }, []);

  const handleOpenNewFamily = () => {
    setFamilyToEdit(null);
    setFamilyForm({
      headOfFamilyName: '',
      cpf: '',
      phone: '',
      neighborhood: 'São Luiz',
      address: '',
      membersCount: 4,
      childrenCount: 2,
      vulnerabilityLevel: 'Alta',
      monthlyIncome: 1200,
      status: 'Ativo',
      notes: ''
    });
    setIsFamilyModalOpen(true);
  };

  const handleOpenEditFamily = (fam: AssistedFamily) => {
    setFamilyToEdit(fam);
    setFamilyForm({ ...fam });
    setIsFamilyModalOpen(true);
  };

  const handleDeleteFamily = (id: string, name: string) => {
    if (confirm(`Deseja excluir o cadastro da família de "${name}"?`)) {
      db.deleteAssistedFamily(id);
    }
  };

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.headOfFamilyName) return;

    if (familyToEdit) {
      db.saveAssistedFamily({
        ...familyToEdit,
        ...familyForm,
        id: familyToEdit.id
      } as AssistedFamily);
    } else {
      db.saveAssistedFamily({
        ...familyForm,
        id: `fam-${Date.now()}`,
        registeredAt: new Date().toISOString().split('T')[0],
        status: 'Ativo'
      } as AssistedFamily);
    }

    setIsFamilyModalOpen(false);
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelivery.beneficiaryName) return;

    db.saveSocialDelivery({
      ...newDelivery,
      id: `del-${Date.now()}`
    } as SocialActionDelivery);

    setIsDeliveryModalOpen(false);
    setNewDelivery({
      programType: 'Distribuição de Alimentos / Cestas Básicas',
      beneficiaryName: '',
      date: new Date().toISOString().split('T')[0],
      itemsDelivered: '1 Cesta Básica 20kg',
      quantityNumber: 1,
      volunteersInvolved: 'Diaconia IBNS'
    });
  };

  const handleDeleteDelivery = (id: string) => {
    if (confirm('Deseja excluir o registro desta entrega social?')) {
      db.deleteSocialDelivery(id);
    }
  };

  const handleOpenNewClass = () => {
    setClassToEdit(null);
    setClassForm({
      title: '',
      programType: 'Aulas de Música Gratuitas',
      teacherName: 'Levita Mateus',
      dayOfWeek: 'Sábado',
      time: '14:00 - 15:30',
      studentsEnrolled: 10,
      capacity: 20,
      location: 'Templo Sede IBNS'
    });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: MusicAndSkillsClass) => {
    setClassToEdit(cls);
    setClassForm({ ...cls });
    setIsClassModalOpen(true);
  };

  const handleDeleteClass = (id: string, title: string) => {
    if (confirm(`Deseja excluir a oficina/classe "${title}"?`)) {
      db.deleteClass(id);
    }
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.title) return;

    if (classToEdit) {
      db.saveClass({
        ...classToEdit,
        ...classForm,
        id: classToEdit.id
      } as MusicAndSkillsClass);
    } else {
      db.saveClass({
        ...classForm,
        id: `cls-${Date.now()}`
      } as MusicAndSkillsClass);
    }

    setIsClassModalOpen(false);
  };

  const totalPeopleAssisted = families.reduce((s, f) => s + (f.membersCount || 0), 0);
  const totalBaskets = deliveries.reduce((s, d) => s + (d.quantityNumber || 1), 0);
  const totalStudents = classes.reduce((s, c) => s + (c.studentsEnrolled || 0), 0);

  const filteredFamilies = families.filter(f => {
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      return f.headOfFamilyName.toLowerCase().includes(t) || f.neighborhood.toLowerCase().includes(t) || f.cpf.includes(t);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
              Módulo 4
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Ação Social, Cestas Básicas & Capacitação Comunitária
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de famílias assistidas em Sapiranga, entregas de alimentos e oficinas musicais gratuitas da IBNS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenNewFamily}
            className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Família</span>
          </button>

          <button
            onClick={() => setIsDeliveryModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Registrar Entrega</span>
          </button>

          <button
            onClick={handleOpenNewClass}
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Music className="w-4 h-4" />
            <span>Nova Oficina Social</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Famílias em Acompanhamento</span>
          <span className="text-xl font-extrabold text-slate-900">{families.length} lares</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Vidas Beneficiadas</span>
          <span className="text-xl font-extrabold text-rose-700">{totalPeopleAssisted} pessoas</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Cestas / Alimentos Entregues</span>
          <span className="text-xl font-extrabold text-amber-800">{totalBaskets} cestas</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Alunos nas Oficinas Gratuitas</span>
          <span className="text-xl font-extrabold text-purple-700">{totalStudents} alunos</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('families')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'families'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Famílias Cadastradas ({families.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'deliveries'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Histórico de Entregas ({deliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'classes'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Oficinas e Aulas de Música ({classes.length})</span>
        </button>
      </div>

      {/* Tab 1: Families */}
      {activeTab === 'families' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar família por nome, CPF ou bairro..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-rose-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFamilies.map(fam => (
              <div
                key={fam.id}
                className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      fam.vulnerabilityLevel === 'Alta' 
                        ? 'bg-rose-50 text-rose-800 border-rose-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      Vulnerabilidade {fam.vulnerabilityLevel}
                    </span>
                    <span className="text-[10px] text-slate-400">Desde {fam.registeredAt}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{fam.headOfFamilyName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{fam.neighborhood} • {fam.address}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Pessoas no Lar:</span>
                      <span className="font-bold text-slate-900">{fam.membersCount} ({fam.childrenCount} crianças)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Renda Declarada:</span>
                      <span className="font-bold text-emerald-700">R$ {fam.monthlyIncome.toFixed(2)}</span>
                    </div>
                  </div>

                  {fam.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      "{fam.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    <a
                      href={`https://wa.me/55${fam.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                      title="Contato WhatsApp"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    <button
                      onClick={() => {
                        setNewDelivery(prev => ({ ...prev, beneficiaryName: fam.headOfFamilyName }));
                        setIsDeliveryModalOpen(true);
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg font-bold transition-colors"
                    >
                      + Cesta
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditFamily(fam)}
                      className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                      title="Editar Família"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFamily(fam.id, fam.headOfFamilyName)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors"
                      title="Excluir Família"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Deliveries */}
      {activeTab === 'deliveries' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Beneficiário</th>
                <th className="p-3">Itens Doados</th>
                <th className="p-3">Voluntários / Equipe</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.map(del => (
                <tr key={del.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{del.date}</td>
                  <td className="p-3 font-bold text-slate-900">{del.beneficiaryName}</td>
                  <td className="p-3 text-amber-900 font-bold">{del.itemsDelivered}</td>
                  <td className="p-3 text-slate-700">{del.volunteersInvolved}</td>
                  <td className="p-3 text-emerald-700 font-bold">Concluído ✓</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteDelivery(del.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Classes */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    {cls.dayOfWeek} às {cls.time}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{cls.studentsEnrolled}/{cls.capacity} alunos</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{cls.title}</h4>
                <p className="text-xs text-slate-500">Professor: <strong className="text-slate-800">{cls.teacherName}</strong></p>
                <p className="text-xs text-slate-500">Local: {cls.location}</p>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-purple-600 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (cls.studentsEnrolled / cls.capacity) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEditClass(cls)}
                  className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                  title="Editar Oficina"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClass(cls.id, cls.title)}
                  className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Excluir Oficina"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Family Modal */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {familyToEdit ? 'Editar Família Assistida' : 'Cadastrar Família Assistida'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Ação Social IBNS Sapiranga</p>
                </div>
              </div>
              <button onClick={() => setIsFamilyModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSaveFamily} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Chefe de Família:</label>
                <input
                  type="text"
                  required
                  value={familyForm.headOfFamilyName}
                  onChange={e => setFamilyForm(prev => ({ ...prev, headOfFamilyName: e.target.value }))}
                  placeholder="Ex: Maria das Graças Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CPF:</label>
                  <input
                    type="text"
                    value={familyForm.cpf}
                    onChange={e => setFamilyForm(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Telefone / Whats:</label>
                  <input
                    type="text"
                    value={familyForm.phone}
                    onChange={e => setFamilyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(51) 99999-9999"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bairro (Sapiranga):</label>
                  <select
                    value={familyForm.neighborhood}
                    onChange={e => setFamilyForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  >
                    <option value="Centro">Centro</option>
                    <option value="São Luiz">São Luiz</option>
                    <option value="Amaral Ribeiro">Amaral Ribeiro</option>
                    <option value="Santa Fé">Santa Fé</option>
                    <option value="Sete de Setembro">Sete de Setembro</option>
                    <option value="Oeste">Oeste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vulnerabilidade:</label>
                  <select
                    value={familyForm.vulnerabilityLevel}
                    onChange={e => setFamilyForm(prev => ({ ...prev, vulnerabilityLevel: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Endereço Completo:</label>
                <input
                  type="text"
                  value={familyForm.address}
                  onChange={e => setFamilyForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número, complemento"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qtd Pessoas no Lar:</label>
                  <input
                    type="number"
                    value={familyForm.membersCount}
                    onChange={e => setFamilyForm(prev => ({ ...prev, membersCount: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Renda Familiar Estimada (R$):</label>
                  <input
                    type="number"
                    value={familyForm.monthlyIncome}
                    onChange={e => setFamilyForm(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Observações da Diaconia:</label>
                <textarea
                  rows={2}
                  value={familyForm.notes}
                  onChange={e => setFamilyForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFamilyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{familyToEdit ? 'Salvar Alterações' : 'Cadastrar Família'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Registrar Entrega de Alimentos</h4>
                  <p className="text-[11px] text-slate-500">Distribuição Comunitária IBNS</p>
                </div>
              </div>
              <button onClick={() => setIsDeliveryModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Beneficiário / Família:</label>
                <input
                  type="text"
                  required
                  value={newDelivery.beneficiaryName}
                  onChange={e => setNewDelivery(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                  placeholder="Nome do responsável que recebeu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Data da Entrega:</label>
                <input
                  type="date"
                  required
                  value={newDelivery.date}
                  onChange={e => setNewDelivery(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Itens Doados:</label>
                <input
                  type="text"
                  required
                  value={newDelivery.itemsDelivered}
                  onChange={e => setNewDelivery(prev => ({ ...prev, itemsDelivered: e.target.value }))}
                  placeholder="Ex: 1 Cesta Básica 20kg + 1 Cobertor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Voluntários Responsáveis:</label>
                <input
                  type="text"
                  value={newDelivery.volunteersInvolved}
                  onChange={e => setNewDelivery(prev => ({ ...prev, volunteersInvolved: e.target.value }))}
                  placeholder="Diaconia IBNS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Entrega</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {classToEdit ? 'Editar Oficina Social' : 'Cadastrar Oficina Social / Música'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Capacitação Comunitária IBNS</p>
                </div>
              </div>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título da Oficina:</label>
                <input
                  type="text"
                  required
                  value={classForm.title}
                  onChange={e => setClassForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Violão para Iniciantes / Teclado"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instrutor / Professor Voluntário:</label>
                <input
                  type="text"
                  required
                  value={classForm.teacherName}
                  onChange={e => setClassForm(prev => ({ ...prev, teacherName: e.target.value }))}
                  placeholder="Ex: Levita Mateus"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dia da Semana:</label>
                  <select
                    value={classForm.dayOfWeek}
                    onChange={e => setClassForm(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                  >
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Horário:</label>
                  <input
                    type="text"
                    value={classForm.time}
                    onChange={e => setClassForm(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="14:00 - 15:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacidade (vagas):</label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={e => setClassForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 10 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Alunos Inscritos:</label>
                  <input
                    type="number"
                    value={classForm.studentsEnrolled}
                    onChange={e => setClassForm(prev => ({ ...prev, studentsEnrolled: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{classToEdit ? 'Salvar Alterações' : 'Salvar Oficina'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
