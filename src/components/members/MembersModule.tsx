import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Edit2, 
  Trash2, 
  Cake, 
  ShieldCheck, 
  Award,
  FileText,
  Eye,
  Calendar,
  LayoutGrid,
  List,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import { Member, MemberRole, MemberStatus } from '../../types';
import { db } from '../../services/db';
import { MemberFormModal } from './MemberFormModal';
import { MemberCardModal } from './MemberCardModal';

interface MembersModuleProps {
  hideSensitiveData: boolean;
}

export const MembersModule: React.FC<MembersModuleProps> = ({ hideSensitiveData }) => {
  const [members, setMembers] = useState<Member[]>(db.getMembers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [birthdayMonthFilter, setBirthdayMonthFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [memberForCard, setMemberForCard] = useState<Member | null>(null);

  // Delete modal state
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleteSuccessFeedback, setDeleteSuccessFeedback] = useState<string | null>(null);

  useEffect(() => {
    return db.subscribe(() => {
      setMembers(db.getMembers());
    });
  }, []);

  const handleOpenNew = () => {
    setMemberToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (m: Member) => {
    setMemberToEdit(m);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      const name = memberToDelete.fullName;
      db.deleteMember(memberToDelete.id);
      setMemberToDelete(null);
      setDeleteSuccessFeedback(`Cadastro de "${name}" excluído com sucesso.`);
      setTimeout(() => setDeleteSuccessFeedback(null), 4000);
    }
  };

  const handleOpenCard = (m: Member) => {
    setMemberForCard(m);
    setIsCardModalOpen(true);
  };

  const filteredMembers = members.filter(m => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (neighborhoodFilter !== 'all' && m.address.neighborhood !== neighborhoodFilter) return false;
    if (birthdayMonthFilter !== 'all') {
      const parts = m.birthDate?.split('-');
      if (!parts || parts[1] !== birthdayMonthFilter) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(term);
      const matchCpf = m.cpf?.toLowerCase().includes(term);
      const matchPhone = m.phone?.toLowerCase().includes(term);
      const matchCode = m.code?.toLowerCase().includes(term);
      const matchNeighborhood = m.address.neighborhood?.toLowerCase().includes(term);
      if (!matchName && !matchCpf && !matchPhone && !matchCode && !matchNeighborhood) return false;
    }
    return true;
  });

  const activeCount = members.filter(m => m.status === 'Ativo').length;
  const leadershipCount = members.filter(m => ['Pastor(a)', 'Presbítero', 'Diácono', 'Diaconisa', 'Evangelista', 'Obreiro(a)'].includes(m.role)).length;
  
  const today = new Date();
  const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
  const thisMonthBirthdays = members.filter(m => {
    const parts = m.birthDate?.split('-');
    return parts && parts[1] === currentMonthStr;
  }).length;

  const maskCpf = (cpf: string) => {
    if (hideSensitiveData) return '•••.•••.•••-••';
    return cpf;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setNeighborhoodFilter('all');
    setBirthdayMonthFilter('all');
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Feedback Toast */}
      {deleteSuccessFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{deleteSuccessFeedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
              Módulo 2
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Secretaria & Cadastro de Membros IBNS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão completa de membros, obreiros, pastores, diáconos e evangelistas com fotos, certidões e emissor de carteirinha.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-600">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'}`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'}`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenNew}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Membro</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total de Membros Cadastrados</span>
          <span className="text-xl font-extrabold text-slate-900">{members.length}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Membros em Comunhão (Ativos)</span>
          <span className="text-xl font-extrabold text-emerald-700">{activeCount}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Corpo de Obreiros / Liderança</span>
          <span className="text-xl font-extrabold text-amber-800">{leadershipCount}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Aniversariantes Deste Mês</span>
          <span className="text-xl font-extrabold text-purple-700">{thisMonthBirthdays} membros</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF, bairro..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">Todos os Cargos</option>
            <option value="Membro Comum">Membro Comum</option>
            <option value="Obreiro(a)">Obreiro(a)</option>
            <option value="Pastor(a)">Pastor(a)</option>
            <option value="Diácono">Diácono</option>
            <option value="Diaconisa">Diaconisa</option>
            <option value="Evangelista">Evangelista</option>
            <option value="Presbítero">Presbítero</option>
            <option value="Líder de Ministério">Líder de Ministério</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Em Observação">Em Observação</option>
            <option value="Transferido">Transferido</option>
            <option value="Afastado">Afastado</option>
            <option value="Falecido">Falecido</option>
          </select>

          {/* Neighborhood Filter */}
          <select
            value={neighborhoodFilter}
            onChange={e => setNeighborhoodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">Todos os Bairros (Sapiranga)</option>
            <option value="Centro">Centro</option>
            <option value="Amaral Ribeiro">Amaral Ribeiro</option>
            <option value="São Luiz">São Luiz</option>
            <option value="Santa Fé">Santa Fé</option>
            <option value="Sete de Setembro">Sete de Setembro</option>
            <option value="Oeste">Oeste</option>
          </select>

          {/* Birthday Month */}
          <select
            value={birthdayMonthFilter}
            onChange={e => setBirthdayMonthFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">Todos os Meses de Aniversário</option>
            <option value="01">01 - Janeiro</option>
            <option value="02">02 - Fevereiro</option>
            <option value="03">03 - Março</option>
            <option value="04">04 - Abril</option>
            <option value="05">05 - Maio</option>
            <option value="06">06 - Junho</option>
            <option value="07">07 - Julho</option>
            <option value="08">08 - Agosto (Mês Atual)</option>
            <option value="09">09 - Setembro</option>
            <option value="10">10 - Outubro</option>
            <option value="11">11 - Novembro</option>
            <option value="12">12 - Dezembro</option>
          </select>

          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || neighborhoodFilter !== 'all' || birthdayMonthFilter !== 'all') && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline px-1 py-1"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        <span className="text-slate-500 font-bold text-xs">
          {filteredMembers.length} de {members.length} membros
        </span>
      </div>

      {/* Members View: Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(m => (
            <div
              key={m.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-all group"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xl font-bold text-slate-600">{m.fullName.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-amber-700 font-bold">{m.code}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        m.status === 'Ativo' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">{m.fullName}</h3>
                    <div className="inline-block bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded mt-1 border border-blue-200">
                      {m.role}
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 space-y-1 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">CPF:</span>
                    <span className="font-mono font-semibold text-slate-800">{maskCpf(m.cpf)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Aniversário:</span>
                    <span className="font-semibold text-slate-800">{m.birthDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Bairro:</span>
                    <span className="font-semibold text-slate-800">{m.address.neighborhood} - Sapiranga</span>
                  </div>
                  {m.ministries && m.ministries.length > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                      <span className="text-slate-400 font-medium">Ministérios:</span>
                      <span className="truncate max-w-[150px] text-amber-800 font-bold">{m.ministries.join(', ')}</span>
                    </div>
                  )}
                  {m.documents && m.documents.length > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] text-blue-700 font-semibold">
                      <span>Documentos Anexados:</span>
                      <span>{m.documents.length} doc(s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Bar */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                {/* WhatsApp Link */}
                <a
                  href={`https://wa.me/55${m.phone.replace(/\D/g, '')}?text=A%20paz%20do%20Senhor%20${encodeURIComponent(m.preferredName || m.fullName)}!%20Mensagem%20da%20IBNS%20Sapiranga.`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors border border-emerald-200 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenCard(m)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 border border-amber-200 transition-colors"
                    title="Emitir Carteirinha Digital de Membro"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                    <span>Carteirinha</span>
                  </button>

                  <button
                    onClick={() => handleEdit(m)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 border border-slate-300 transition-colors"
                    title="Editar Cadastro do Membro"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setMemberToDelete(m)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 border border-rose-200 transition-colors"
                    title="Excluir Cadastro do Membro"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span className="sr-only sm:not-sr-only">Excluir</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Members View: Table */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Membro</th>
                  <th className="py-3 px-4">Cargo / Ministério</th>
                  <th className="py-3 px-4">CPF / Contato</th>
                  <th className="py-3 px-4">Bairro (Sapiranga)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700">
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            m.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.fullName}</p>
                          <span className="font-mono text-[10px] text-amber-700">{m.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                        {m.role}
                      </span>
                      {m.ministries && m.ministries.length > 0 && (
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                          {m.ministries.join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono text-slate-800 font-medium">{maskCpf(m.cpf)}</p>
                      <p className="text-slate-500 text-[11px]">{m.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium">{m.address.neighborhood}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        m.status === 'Ativo' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenCard(m)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors"
                          title="Emitir Carteirinha"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors"
                          title="Editar Cadastro"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setMemberToDelete(m)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors"
                          title="Excluir Cadastro"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Excluir Cadastro de Membro</h3>
                <p className="text-xs text-slate-500">Confirmação de segurança da secretaria IBNS</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <p className="text-slate-500 font-medium">Você está prestes a excluir o membro:</p>
              <p className="text-sm font-bold text-slate-900">{memberToDelete.fullName}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 font-mono">
                <span>Código: {memberToDelete.code}</span>
                <span>•</span>
                <span>Cargo: {memberToDelete.role}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta ação removerá o registro e os documentos associados deste membro da base de dados local. Os lançamentos contábeis anteriores serão preservados no histórico.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Membro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        memberToEdit={memberToEdit}
      />

      <MemberCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        member={memberForCard}
      />

    </div>
  );
};
