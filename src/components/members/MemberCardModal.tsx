import React, { useRef } from 'react';
import { X, Printer, Download, QrCode, ShieldCheck, Phone, Mail, MapPin, Calendar, Award } from 'lucide-react';
import { Member } from '../../types';

interface MemberCardModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  member,
  isOpen,
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Credencial Eclesiástica
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Carteira Digital de Membro IBNS
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body / Visual Badge */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          
          <div 
            ref={cardRef}
            className="w-full max-w-sm rounded-2xl p-5 bg-white border-2 border-amber-400 text-slate-800 shadow-md relative overflow-hidden print:border-black print:text-black"
          >
            {/* Header of the Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-base shadow-xs">
                  ✝
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider leading-none">
                    Igreja Batista Nacional
                  </p>
                  <p className="text-xs font-extrabold text-slate-900 leading-tight">
                    SAPIRANGA - RS
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-300">
                {member.code}
              </span>
            </div>

            {/* Member Photo & Basic Details */}
            <div className="flex items-center gap-4 my-4">
              <div className="w-20 h-24 rounded-xl bg-slate-100 border-2 border-amber-300 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-400">{member.fullName.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-black text-slate-900 leading-tight">{member.fullName}</h4>
                <div className="inline-block bg-amber-500 text-slate-950 text-[11px] font-extrabold px-2 py-0.5 rounded shadow-2xs">
                  {member.role.toUpperCase()}
                </div>
                <p className="text-[10px] text-slate-600 font-medium">CPF: {member.cpf}</p>
                <p className="text-[10px] text-slate-500">Nascimento: {member.birthDate}</p>
              </div>
            </div>

            {/* Sub details: Baptism & Membership */}
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Data de Batismo:</span>
                <span className="font-bold text-slate-800">{member.baptismDate || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Admissão Membresia:</span>
                <span className="font-bold text-slate-800">{member.membershipDate || '2023'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Ministérios Atuantes:</span>
                <span className="font-medium text-amber-800">
                  {member.ministries && member.ministries.length > 0 ? member.ministries.join(', ') : 'Geral'}
                </span>
              </div>
            </div>

            {/* Footer with QR Code & Pastor Signature Line */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-600">
              <div>
                <p className="font-bold text-slate-800">Pr. Marcos Oliveira</p>
                <p className="text-[8px] text-slate-500">Pastor Presidente - IBNS Sapiranga</p>
              </div>
              
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <QrCode className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center max-w-sm">
            Carteirinha válida em todo território eclesiástico para identificação e participação em convenções batistas.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Carteirinha</span>
          </button>
        </div>

      </div>
    </div>
  );
};
