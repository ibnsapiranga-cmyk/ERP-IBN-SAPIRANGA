import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  UserCheck, 
  Music, 
  Mic, 
  Sliders, 
  Sparkles,
  Ticket,
  Calendar,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { ChurchEvent } from '../../types';
import { db } from '../../services/db';

export const EventsModule: React.FC = () => {
  const [events, setEvents] = useState<ChurchEvent[]>(db.getEvents());
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ChurchEvent | null>(null);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);

  const [eventFormData, setEventFormData] = useState<Partial<ChurchEvent>>({
    title: '',
    type: 'Culto Especial',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    time: '19:30',
    location: 'Templo Sede IBNS - Sapiranga',
    description: '',
    isPaid: false,
    capacity: 200,
    enrolledCount: 0,
    status: 'Agendado',
    volunteerTeams: []
  });

  const [newTeamRole, setNewTeamRole] = useState({
    teamName: 'Equipe de Louvor',
    leader: 'Pr. Marcos Oliveira',
    volunteerName: ''
  });

  useEffect(() => {
    return db.subscribe(() => {
      const evs = db.getEvents();
      setEvents(evs);
      if (!selectedEventId && evs.length > 0) setSelectedEventId(evs[0].id);
    });
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleOpenNewEvent = () => {
    setEventToEdit(null);
    setEventFormData({
      title: '',
      type: 'Culto Especial',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      time: '19:30',
      location: 'Templo Sede IBNS - Sapiranga',
      description: '',
      isPaid: false,
      capacity: 200,
      enrolledCount: 0,
      status: 'Agendado',
      volunteerTeams: []
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: ChurchEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEventToEdit(ev);
    setEventFormData({
      title: ev.title,
      type: ev.type,
      startDate: ev.startDate,
      endDate: ev.endDate,
      time: ev.time,
      location: ev.location,
      description: ev.description,
      isPaid: ev.isPaid,
      capacity: ev.capacity,
      enrolledCount: ev.enrolledCount,
      status: ev.status,
      volunteerTeams: ev.volunteerTeams
    });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Deseja realmente excluir o evento "${title}"?`)) {
      db.deleteEvent(id);
      if (selectedEventId === id) {
        const remaining = events.filter(ev => ev.id !== id);
        setSelectedEventId(remaining[0]?.id || '');
      }
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title) return;
    
    if (eventToEdit) {
      db.saveEvent({
        ...eventToEdit,
        ...eventFormData,
        id: eventToEdit.id
      } as ChurchEvent);
    } else {
      db.saveEvent({
        ...eventFormData,
        id: `evt-${Date.now()}`,
        volunteerTeams: [
          {
            teamName: 'Equipe de Louvor',
            leader: 'Pr. Marcos Oliveira',
            volunteers: ['Pr. Marcos (Voz)', 'Levita Mateus (Teclado)']
          },
          {
            teamName: 'Mídia & Recepção',
            leader: 'Diác. Paulo Silva',
            volunteers: ['Diác. Paulo (Som)', 'Irmã Ana (Recepção)']
          }
        ]
      } as ChurchEvent);
    }

    setIsEventModalOpen(false);
  };

  const handleAddVolunteerToTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !newTeamRole.volunteerName.trim()) return;

    const teams = [...(selectedEvent.volunteerTeams || [])];
    let team = teams.find(t => t.teamName.toLowerCase().includes(newTeamRole.teamName.toLowerCase()));
    
    if (!team) {
      team = {
        teamName: newTeamRole.teamName,
        leader: newTeamRole.leader,
        volunteers: []
      };
      teams.push(team);
    }

    team.volunteers.push(newTeamRole.volunteerName.trim());

    db.saveEvent({
      ...selectedEvent,
      volunteerTeams: teams
    });

    setIsScaleModalOpen(false);
    setNewTeamRole({ teamName: 'Equipe de Louvor', leader: 'Pr. Marcos Oliveira', volunteerName: '' });
  };

  const handleRemoveVolunteer = (teamIdx: number, volunteerIdx: number) => {
    if (!selectedEvent) return;
    const teams = [...(selectedEvent.volunteerTeams || [])];
    if (!teams[teamIdx]) return;

    teams[teamIdx].volunteers.splice(volunteerIdx, 1);
    db.saveEvent({
      ...selectedEvent,
      volunteerTeams: teams
    });
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Módulo 6
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Eventos Eclesiásticos, Conferências & Escalas de Culto
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento de cultos, retiros, vigílias e escalas de voluntários para Louvor, Som, Multimídia e Recepção.
          </p>
        </div>

        <button
          onClick={handleOpenNewEvent}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Evento</span>
        </button>
      </div>

      {/* Grid of Events & Active Scale View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Events List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Próximos Eventos & Cultos ({events.length})
          </h3>

          <div className="space-y-2.5">
            {events.map(ev => {
              const isSelected = selectedEvent?.id === ev.id;
              const totalVols = ev.volunteerTeams?.reduce((s, t) => s + t.volunteers.length, 0) || 0;

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative group ${
                    isSelected 
                      ? 'bg-amber-50/50 border-amber-400 shadow-xs ring-1 ring-amber-300' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {ev.type}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditEvent(ev, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        title="Editar Evento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteEvent(ev.id, ev.title, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                  
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.startDate} às {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Voluntários escalados:</span>
                    <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      {totalVols} voluntários
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Event Details & Scale */}
        {selectedEvent && (
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              
              {/* Event Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                      {selectedEvent.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedEvent.startDate} às {selectedEvent.time}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">{selectedEvent.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedEvent.description}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={(e) => handleOpenEditEvent(selectedEvent, e)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-300"
                    title="Editar Informações do Evento"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setIsScaleModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Escalar Voluntário</span>
                  </button>
                </div>
              </div>

              {/* Roster / Volunteer Teams */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Escalas de Serviço & Ministérios Atuantes</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedEvent.volunteerTeams?.map((team, tIdx) => (
                    <div key={tIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-bold text-slate-900 text-xs">{team.teamName}</span>
                        <span className="text-[10px] text-slate-500">Líder: {team.leader}</span>
                      </div>

                      <div className="space-y-1.5">
                        {team.volunteers.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-1">Nenhum voluntário escalado ainda.</p>
                        ) : (
                          team.volunteers.map((vol, vIdx) => (
                            <div key={vIdx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 group">
                              <span className="font-bold text-slate-800">{vol}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-emerald-700 font-semibold">Confirmado ✓</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVolunteer(tIdx, vIdx)}
                                  className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                                  title="Remover da Escala"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* New / Edit Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {eventToEdit ? 'Editar Evento / Culto' : 'Cadastrar Evento / Culto'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Agenda e Liturgia IBNS Sapiranga</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEventModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título do Evento:</label>
                <input
                  type="text"
                  required
                  value={eventFormData.title}
                  onChange={e => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Culto da Família & Santa Ceia"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo:</label>
                  <select
                    value={eventFormData.type}
                    onChange={e => setEventFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="Culto Especial">Culto Especial</option>
                    <option value="Santa Ceia">Santa Ceia</option>
                    <option value="Conferência">Conferência</option>
                    <option value="Congresso">Congresso</option>
                    <option value="Retiro Espiritual">Retiro Espiritual</option>
                    <option value="Batismo Coletivo">Batismo Coletivo</option>
                    <option value="Vigília">Vigília</option>
                    <option value="EBF / Infantil">EBF / Infantil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data:</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.startDate}
                    onChange={e => setEventFormData(prev => ({ ...prev, startDate: e.target.value, endDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Horário:</label>
                  <input
                    type="time"
                    required
                    value={eventFormData.time}
                    onChange={e => setEventFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Local:</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.location}
                    onChange={e => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Templo Sede IBNS Sapiranga"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descrição / Objetivos:</label>
                <textarea
                  rows={2}
                  value={eventFormData.description}
                  onChange={e => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes sobre a liturgia, preletor convidado ou tema..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {eventToEdit ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      handleDeleteEvent(eventToEdit.id, eventToEdit.title, e);
                      setIsEventModalOpen(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 transition-colors border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{eventToEdit ? 'Salvar Alterações' : 'Salvar Evento'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scale Volunteer Modal */}
      {isScaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Escalar Voluntário para este Evento</h4>
                  <p className="text-[11px] text-slate-500">{selectedEvent?.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsScaleModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVolunteerToTeam} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Departamento / Equipe:</label>
                <select
                  value={newTeamRole.teamName}
                  onChange={e => setNewTeamRole(prev => ({ ...prev, teamName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="Equipe de Louvor">Equipe de Louvor</option>
                  <option value="Mídia e Multimídia">Mídia e Multimídia</option>
                  <option value="Mesa de Som e Áudio">Mesa de Som e Áudio</option>
                  <option value="Recepção e Portaria">Recepção e Portaria</option>
                  <option value="Intercessão e Oração">Intercessão e Oração</option>
                  <option value="Ministério Infantil">Ministério Infantil / Berçário</option>
                  <option value="Segurança e Apoio">Segurança e Apoio</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Voluntário / Função:</label>
                <input
                  type="text"
                  required
                  value={newTeamRole.volunteerName}
                  onChange={e => setNewTeamRole(prev => ({ ...prev, volunteerName: e.target.value }))}
                  placeholder="Ex: Levita Mateus (Teclado), Diác. Paulo (Som)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScaleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Adicionar à Escala</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
