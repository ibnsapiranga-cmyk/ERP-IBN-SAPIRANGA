import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Cake, 
  AlertCircle, 
  DollarSign, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { db } from '../../services/db';
import { Member, FinancialTransaction, ChurchEvent } from '../../types';

interface AgendaModuleProps {
  hideSensitiveData: boolean;
}

export const AgendaModule: React.FC<AgendaModuleProps> = ({ hideSensitiveData }) => {
  const [members, setMembers] = useState<Member[]>(db.getMembers());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(db.getTransactions());
  const [events, setEvents] = useState<ChurchEvent[]>(db.getEvents());

  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | 'birthdays' | 'bills' | 'events'>('all');

  useEffect(() => {
    return db.subscribe(() => {
      setMembers(db.getMembers());
      setTransactions(db.getTransactions());
      setEvents(db.getEvents());
    });
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const currentMonthStr = String(currentMonth + 1).padStart(2, '0');

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Birthdays in this month
  const monthBirthdays = members
    .filter(m => {
      const parts = m.birthDate?.split('-');
      return parts && parts[1] === currentMonthStr;
    })
    .map(m => {
      const day = parseInt(m.birthDate.split('-')[2]) || 1;
      return {
        id: `bday-${m.id}`,
        day,
        type: 'birthday' as const,
        title: `Aniversário: ${m.fullName}`,
        subtitle: `${m.role} • ${m.phone}`,
        phone: m.phone,
        data: m
      };
    });

  // Bills in this month
  const monthBills = transactions
    .filter(t => t.type === 'saida' && (t.dueDate.startsWith(`${currentYear}-${currentMonthStr}`) || t.date.startsWith(`${currentYear}-${currentMonthStr}`)))
    .map(t => {
      const datePart = t.dueDate || t.date;
      const day = parseInt(datePart.split('-')[2]) || 1;
      return {
        id: `bill-${t.id}`,
        day,
        type: 'bill' as const,
        title: `Conta: ${t.description}`,
        subtitle: `R$ ${t.amount.toFixed(2)} • Status: ${t.status.toUpperCase()}`,
        amount: t.amount,
        status: t.status,
        data: t
      };
    });

  // Events in this month
  const monthEvents = events
    .filter(e => e.startDate.startsWith(`${currentYear}-${currentMonthStr}`))
    .map(e => {
      const day = parseInt(e.startDate.split('-')[2]) || 1;
      return {
        id: `event-${e.id}`,
        day,
        type: 'event' as const,
        title: e.title,
        subtitle: `${e.time} - ${e.location}`,
        data: e
      };
    });

  // Combine & sort items
  let allItems = [...monthBirthdays, ...monthBills, ...monthEvents];
  if (filterType === 'birthdays') allItems = [...monthBirthdays];
  if (filterType === 'bills') allItems = [...monthBills];
  if (filterType === 'events') allItems = [...monthEvents];

  allItems.sort((a, b) => a.day - b.day);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

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
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Módulo 7
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Agenda Geral & Calendário Unificado IBNS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visão consolidada de aniversariantes, contas e compromissos ministeriais em um só lugar.
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-xs">
          <button onClick={prevMonth} className="p-1 text-slate-500 hover:text-slate-900 rounded transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-900 text-xs px-2">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-1 text-slate-500 hover:text-slate-900 rounded transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            filterType === 'all' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Todos ({monthBirthdays.length + monthBills.length + monthEvents.length})
        </button>

        <button
          onClick={() => setFilterType('birthdays')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            filterType === 'birthdays' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cake className="w-3.5 h-3.5" />
          <span>Aniversariantes ({monthBirthdays.length})</span>
        </button>

        <button
          onClick={() => setFilterType('bills')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            filterType === 'bills' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Contas & Vencimentos ({monthBills.length})</span>
        </button>

        <button
          onClick={() => setFilterType('events')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            filterType === 'events' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Cultos & Eventos ({monthEvents.length})</span>
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {allItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-xs">
            Nenhum compromisso, aniversário ou conta agendada para {monthNames[currentMonth]} com os filtros atuais.
          </div>
        ) : (
          allItems.map(item => (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all hover:border-slate-300 ${
                item.type === 'birthday' 
                  ? 'border-purple-200 hover:border-purple-300' 
                  : item.type === 'bill'
                  ? 'border-rose-200 hover:border-rose-300'
                  : 'border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Day Badge */}
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">
                    {monthNames[currentMonth].substring(0, 3)}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 leading-tight">
                    {item.day}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    {item.type === 'birthday' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Cake className="w-3 h-3" /> Aniversário
                      </span>
                    )}
                    {item.type === 'bill' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Vencimento de Conta
                      </span>
                    )}
                    {item.type === 'event' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> Culto / Evento
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                </div>
              </div>

              {/* Action */}
              <div className="self-end sm:self-auto">
                {item.type === 'birthday' && item.phone && (
                  <a
                    href={`https://wa.me/55${item.phone.replace(/\D/g, '')}?text=Parabéns%20pelo%20seu%20aniversário!%20A%20IBNS%20Sapiranga%20abençoa%20sua%20vida.`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Parabenizar no WhatsApp</span>
                  </a>
                )}
                {item.type === 'bill' && (
                  <span className="text-sm font-extrabold text-rose-700">
                    {formatCurrency(item.amount || 0)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
