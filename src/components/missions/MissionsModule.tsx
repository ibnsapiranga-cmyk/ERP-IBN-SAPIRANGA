import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Plus, 
  MapPin, 
  Users, 
  Heart, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Search, 
  Compass, 
  Phone, 
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { EvangelismAction, SupportedMissionary, ReachedPerson } from '../../types';
import { db } from '../../services/db';

interface MissionsModuleProps {
  hideSensitiveData: boolean;
}

export const MissionsModule: React.FC<MissionsModuleProps> = ({ hideSensitiveData }) => {
  const [actions, setActions] = useState<EvangelismAction[]>(db.getEvangelismActions());
  const [missionaries, setMissionaries] = useState<SupportedMissionary[]>(db.getMissionaries());
  const [reachedPersons, setReachedPersons] = useState<ReachedPerson[]>(db.getReachedPersons());
  const [activeTab, setActiveTab] = useState<'actions' | 'missionaries' | 'reached'>('actions');

  // Modals / forms
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<EvangelismAction | null>(null);

  const [isMissionaryModalOpen, setIsMissionaryModalOpen] = useState(false);
  const [missionaryToEdit, setMissionaryToEdit] = useState<SupportedMissionary | null>(null);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<ReachedPerson | null>(null);

  const [actionForm, setActionForm] = useState<Partial<EvangelismAction>>({
    title: '',
    type: 'Impacto de Rua',
    location: 'Sapiranga - Praça da Bandeira / Centro',
    neighborhood: 'Centro',
    date: new Date().toISOString().split('T')[0],
    reachedPeopleCount: 50,
    decisionsCount: 5,
    volunteersCount: 15,
    leaderName: 'Ev. Carlos Alberto',
    notes: ''
  });

  const [missionaryForm, setMissionaryForm] = useState<Partial<SupportedMissionary>>({
    name: '',
    missionField: 'Sertão Nordestino',
    agency: 'Junta de Missões Nacionais',
    monthlyAllowance: 650,
    status: 'Ativo',
    lastLetterDate: new Date().toISOString().split('T')[0],
    latestReport: ''
  });

  const [personForm, setPersonForm] = useState<Partial<ReachedPerson>>({
    fullName: '',
    phone: '',
    neighborhood: 'Centro',
    firstContactDate: new Date().toISOString().split('T')[0],
    stage: 'Contato Inicial',
    assignedDiscipler: 'Pr. Marcos Oliveira',
    notes: ''
  });

  useEffect(() => {
    return db.subscribe(() => {
      setActions(db.getEvangelismActions());
      setMissionaries(db.getMissionaries());
      setReachedPersons(db.getReachedPersons());
    });
  }, []);

  // Action Handlers
  const handleOpenNewAction = () => {
    setActionToEdit(null);
    setActionForm({
      title: '',
      type: 'Impacto de Rua',
      location: 'Sapiranga - Praça da Bandeira / Centro',
      neighborhood: 'Centro',
      date: new Date().toISOString().split('T')[0],
      reachedPeopleCount: 50,
      decisionsCount: 5,
      volunteersCount: 15,
      leaderName: 'Ev. Carlos Alberto',
      notes: ''
    });
    setIsActionModalOpen(true);
  };

  const handleOpenEditAction = (act: EvangelismAction) => {
    setActionToEdit(act);
    setActionForm({ ...act });
    setIsActionModalOpen(true);
  };

  const handleDeleteAction = (id: string, title: string) => {
    if (confirm(`Deseja excluir o registro da ação evangelística "${title}"?`)) {
      db.deleteEvangelismAction(id);
    }
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionForm.title) return;

    if (actionToEdit) {
      db.saveEvangelismAction({
        ...actionToEdit,
        ...actionForm,
        id: actionToEdit.id
      } as EvangelismAction);
    } else {
      db.saveEvangelismAction({
        ...actionForm,
        id: `ev-${Date.now()}`
      } as EvangelismAction);
    }

    setIsActionModalOpen(false);
  };

  // Missionary Handlers
  const handleOpenNewMissionary = () => {
    setMissionaryToEdit(null);
    setMissionaryForm({
      name: '',
      missionField: 'Sertão Nordestino',
      agency: 'Junta de Missões Nacionais',
      monthlyAllowance: 650,
      status: 'Ativo',
      lastLetterDate: new Date().toISOString().split('T')[0],
      latestReport: ''
    });
    setIsMissionaryModalOpen(true);
  };

  const handleOpenEditMissionary = (mis: SupportedMissionary) => {
    setMissionaryToEdit(mis);
    setMissionaryForm({ ...mis });
    setIsMissionaryModalOpen(true);
  };

  const handleDeleteMissionary = (id: string, name: string) => {
    if (confirm(`Deseja excluir o cadastro do missionário "${name}"?`)) {
      db.deleteMissionary(id);
    }
  };

  const handleSaveMissionary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionaryForm.name) return;

    if (missionaryToEdit) {
      db.saveMissionary({
        ...missionaryToEdit,
        ...missionaryForm,
        id: missionaryToEdit.id
      } as SupportedMissionary);
    } else {
      db.saveMissionary({
        ...missionaryForm,
        id: `mis-${Date.now()}`
      } as SupportedMissionary);
    }

    setIsMissionaryModalOpen(false);
  };

  // Person Handlers
  const handleOpenNewPerson = () => {
    setPersonToEdit(null);
    setPersonForm({
      fullName: '',
      phone: '',
      neighborhood: 'Centro',
      firstContactDate: new Date().toISOString().split('T')[0],
      stage: 'Contato Inicial',
      assignedDiscipler: 'Pr. Marcos Oliveira',
      notes: ''
    });
    setIsPersonModalOpen(true);
  };

  const handleOpenEditPerson = (rp: ReachedPerson) => {
    setPersonToEdit(rp);
    setPersonForm({ ...rp });
    setIsPersonModalOpen(true);
  };

  const handleDeletePerson = (id: string, name: string) => {
    if (confirm(`Deseja excluir o registro da vida alcançada "${name}"?`)) {
      db.deleteReachedPerson(id);
    }
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personForm.fullName) return;

    if (personToEdit) {
      db.saveReachedPerson({
        ...personToEdit,
        ...personForm,
        id: personToEdit.id
      } as ReachedPerson);
    } else {
      db.saveReachedPerson({
        ...personForm,
        id: `rp-${Date.now()}`
      } as ReachedPerson);
    }

    setIsPersonModalOpen(false);
  };

  const totalReached = actions.reduce((s, a) => s + (a.reachedPeopleCount || 0), 0);
  const totalDecisions = actions.reduce((s, a) => s + (a.decisionsCount || 0), 0);
  const totalMonthlySupport = missionaries.filter(m => m.status === 'Ativo').reduce((s, m) => s + m.monthlyAllowance, 0);

  const formatCurrency = (val: number) => {
    if (hideSensitiveData) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300">
              Módulo 5
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Evangelismo Urbano & Missões Mundiais IBNS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Impactos evangelísticos em Sapiranga, vidas alcançadas para Cristo e sustento financeiro de missionários de campo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenNewAction}
            className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Nova Ação Evangelística</span>
          </button>

          <button
            onClick={handleOpenNewPerson}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Cadastrar Vida Alcançada</span>
          </button>

          <button
            onClick={handleOpenNewMissionary}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Missionário</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Ações Evangelísticas em Sapiranga</span>
          <span className="text-xl font-extrabold text-slate-900">{actions.length} impactos</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Pessoas Abordadas / Folhetos</span>
          <span className="text-xl font-extrabold text-cyan-700">{totalReached} abordadas</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Decisões de Fé & Reconciliação</span>
          <span className="text-xl font-extrabold text-emerald-700">{totalDecisions} vidas</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Investimento Mensal em Missões</span>
          <span className="text-xl font-extrabold text-amber-800">{formatCurrency(totalMonthlySupport)}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'actions'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Ações Evangelísticas ({actions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reached')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'reached'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Vidas Alcançadas & Discipulado ({reachedPersons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missionaries')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'missionaries'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Missionários Sustentados ({missionaries.length})</span>
        </button>
      </div>

      {/* Tab: Actions */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map(act => (
            <div
              key={act.id}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {act.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{act.date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{act.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{act.location} ({act.neighborhood})</span>
                </p>

                <div className="grid grid-cols-3 gap-2 my-3 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Abordagens</span>
                    <span className="font-extrabold text-cyan-700">{act.reachedPeopleCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Decisões</span>
                    <span className="font-extrabold text-emerald-700">{act.decisionsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Voluntários</span>
                    <span className="font-extrabold text-slate-700">{act.volunteersCount}</span>
                  </div>
                </div>

                {act.notes && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    "{act.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Líder: <strong className="text-slate-800">{act.leaderName}</strong></span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditAction(act)}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="Editar Ação"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAction(act.id, act.title)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="Excluir Ação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Reached Persons */}
      {activeTab === 'reached' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nome da Vida</th>
                <th className="p-3">Contato / WhatsApp</th>
                <th className="p-3">Bairro</th>
                <th className="p-3">Estágio no Funil</th>
                <th className="p-3">Discipulador Responsável</th>
                <th className="p-3">Data Contato</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reachedPersons.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{p.fullName}</td>
                  <td className="p-3 font-mono text-slate-700">
                    {p.phone ? (
                      <a
                        href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{p.phone}</span>
                      </a>
                    ) : 'Sem telefone'}
                  </td>
                  <td className="p-3 text-slate-600 font-medium">{p.neighborhood}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {p.stage}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{p.assignedDiscipler || 'Pr. Marcos'}</td>
                  <td className="p-3 font-mono text-slate-400">{p.firstContactDate}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditPerson(p)}
                        className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                        title="Editar Contato"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(p.id, p.fullName)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors"
                        title="Excluir Registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Missionaries */}
      {activeTab === 'missionaries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missionaries.map(mis => (
            <div
              key={mis.id}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                    {mis.agency}
                  </span>
                  <span className="text-[10px] text-slate-400">Status: {mis.status}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{mis.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>Campo: {mis.missionField}</span>
                </p>

                <div className="my-3 space-y-1 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Agência / Junta:</span>
                    <span className="font-semibold text-slate-900">{mis.agency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Sustento IBNS:</span>
                    <span className="text-base font-extrabold text-amber-800">{formatCurrency(mis.monthlyAllowance)}</span>
                  </div>
                  {mis.lastLetterDate && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Última Carta:</span>
                      <span className="text-slate-600 font-medium">{mis.lastLetterDate}</span>
                    </div>
                  )}
                </div>

                {mis.latestReport && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    "{mis.latestReport}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold">Sustento Ativo ✓</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditMissionary(mis)}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="Editar Missionário"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMissionary(mis.id, mis.name)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="Excluir Missionário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {actionToEdit ? 'Editar Ação Evangelística' : 'Registrar Ação Evangelística'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Evangelismo Urbano IBNS Sapiranga</p>
                </div>
              </div>
              <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSaveAction} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título da Ação:</label>
                <input
                  type="text"
                  required
                  value={actionForm.title}
                  onChange={e => setActionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Impacto Evangelístico Praça da Bandeira"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo:</label>
                  <select
                    value={actionForm.type}
                    onChange={e => setActionForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Impacto de Rua">Impacto de Rua</option>
                    <option value="Evangelismo Porta a Porta">Evangelismo Porta a Porta</option>
                    <option value="Visitação em Hospitais">Visitação em Hospitais</option>
                    <option value="Ação em Praças">Ação em Praças</option>
                    <option value="Evangelismo Digital">Evangelismo Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data:</label>
                  <input
                    type="date"
                    required
                    value={actionForm.date}
                    onChange={e => setActionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Local:</label>
                  <input
                    type="text"
                    required
                    value={actionForm.location}
                    onChange={e => setActionForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Praça da Bandeira"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bairro:</label>
                  <select
                    value={actionForm.neighborhood}
                    onChange={e => setActionForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Centro">Centro</option>
                    <option value="Amaral Ribeiro">Amaral Ribeiro</option>
                    <option value="São Luiz">São Luiz</option>
                    <option value="Santa Fé">Santa Fé</option>
                    <option value="Sete de Setembro">Sete de Setembro</option>
                    <option value="Oeste">Oeste</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Abordagens:</label>
                  <input
                    type="number"
                    value={actionForm.reachedPeopleCount}
                    onChange={e => setActionForm(prev => ({ ...prev, reachedPeopleCount: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Decisões:</label>
                  <input
                    type="number"
                    value={actionForm.decisionsCount}
                    onChange={e => setActionForm(prev => ({ ...prev, decisionsCount: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Voluntários:</label>
                  <input
                    type="number"
                    value={actionForm.volunteersCount}
                    onChange={e => setActionForm(prev => ({ ...prev, volunteersCount: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Líder da Ação:</label>
                <input
                  type="text"
                  required
                  value={actionForm.leaderName}
                  onChange={e => setActionForm(prev => ({ ...prev, leaderName: e.target.value }))}
                  placeholder="Ev. Carlos Alberto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{actionToEdit ? 'Salvar Alterações' : 'Salvar Ação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Missionary Modal */}
      {isMissionaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {missionaryToEdit ? 'Editar Missionário' : 'Cadastrar Missionário'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Missões Nacionais e Mundiais IBNS</p>
                </div>
              </div>
              <button onClick={() => setIsMissionaryModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSaveMissionary} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Missionário / Família:</label>
                <input
                  type="text"
                  required
                  value={missionaryForm.name}
                  onChange={e => setMissionaryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Mis. João & Família"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Campo Missionário:</label>
                  <input
                    type="text"
                    required
                    value={missionaryForm.missionField}
                    onChange={e => setMissionaryForm(prev => ({ ...prev, missionField: e.target.value }))}
                    placeholder="Sertão, África, Índia..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Agência / Junta:</label>
                  <input
                    type="text"
                    required
                    value={missionaryForm.agency}
                    onChange={e => setMissionaryForm(prev => ({ ...prev, agency: e.target.value }))}
                    placeholder="JMN, JMM, CBN Missões"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sustento Mensal (R$):</label>
                  <input
                    type="number"
                    required
                    value={missionaryForm.monthlyAllowance}
                    onChange={e => setMissionaryForm(prev => ({ ...prev, monthlyAllowance: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status:</label>
                  <select
                    value={missionaryForm.status}
                    onChange={e => setMissionaryForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Em Licença">Em Licença</option>
                    <option value="Encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Último Relatório / Motivo de Oração:</label>
                <textarea
                  rows={2}
                  value={missionaryForm.latestReport}
                  onChange={e => setMissionaryForm(prev => ({ ...prev, latestReport: e.target.value }))}
                  placeholder="Resumo da carta missionária recente..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMissionaryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{missionaryToEdit ? 'Salvar Alterações' : 'Salvar Missionário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reached Person Modal */}
      {isPersonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {personToEdit ? 'Editar Vida Alcançada' : 'Cadastrar Vida Alcançada'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Discipulado e Consolidação IBNS</p>
                </div>
              </div>
              <button onClick={() => setIsPersonModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={personForm.fullName}
                  onChange={e => setPersonForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ex: João Batista Ribeiro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Telefone / Whats:</label>
                  <input
                    type="text"
                    value={personForm.phone}
                    onChange={e => setPersonForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(51) 99999-9999"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bairro:</label>
                  <select
                    value={personForm.neighborhood}
                    onChange={e => setPersonForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Centro">Centro</option>
                    <option value="Amaral Ribeiro">Amaral Ribeiro</option>
                    <option value="São Luiz">São Luiz</option>
                    <option value="Santa Fé">Santa Fé</option>
                    <option value="Sete de Setembro">Sete de Setembro</option>
                    <option value="Oeste">Oeste</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estágio no Funil:</label>
                  <select
                    value={personForm.stage}
                    onChange={e => setPersonForm(prev => ({ ...prev, stage: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Contato Inicial">Contato Inicial</option>
                    <option value="Visitou o Culto">Visitou o Culto</option>
                    <option value="Iniciou Discipulado">Iniciou Discipulado</option>
                    <option value="Candidato ao Batismo">Candidato ao Batismo</option>
                    <option value="Membro Ativo">Membro Ativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discipulador Responsável:</label>
                  <input
                    type="text"
                    value={personForm.assignedDiscipler}
                    onChange={e => setPersonForm(prev => ({ ...prev, assignedDiscipler: e.target.value }))}
                    placeholder="Pr. Marcos Oliveira"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPersonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{personToEdit ? 'Salvar Alterações' : 'Salvar Contato'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
