import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  User, 
  FileText, 
  Trash2, 
  Check, 
  Camera, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Award,
  ShieldCheck
} from 'lucide-react';
import { Member, MemberRole, MemberStatus, MemberDocument } from '../../types';
import { db } from '../../services/db';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit
}) => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [gender, setGender] = useState<'Masculino' | 'Feminino'>('Masculino');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [maritalStatus, setMaritalStatus] = useState<any>('Solteiro(a)');
  const [spouseName, setSpouseName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address in Sapiranga
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('Centro');
  const [city, setCity] = useState('Sapiranga');
  const [state, setState] = useState('RS');
  const [zipCode, setZipCode] = useState('93800-000');

  const [role, setRole] = useState<MemberRole>('Membro Comum');
  const [status, setStatus] = useState<MemberStatus>('Ativo');
  const [ministriesText, setMinistriesText] = useState('Geral');
  const [baptismDate, setBaptismDate] = useState('');
  const [membershipDate, setMembershipDate] = useState(new Date().toISOString().split('T')[0]);
  const [profession, setProfession] = useState('');
  const [talentsText, setTalentsText] = useState('');
  const [notes, setNotes] = useState('');
  
  const [photoUrl, setPhotoUrl] = useState('');
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  
  // Document adder state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<any>('Certidão de Casamento');

  // Sync state whenever memberToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (memberToEdit) {
        setFullName(memberToEdit.fullName || '');
        setPreferredName(memberToEdit.preferredName || '');
        setCpf(memberToEdit.cpf || '');
        setRg(memberToEdit.rg || '');
        setGender(memberToEdit.gender || 'Masculino');
        setBirthDate(memberToEdit.birthDate || '1990-01-01');
        setMaritalStatus(memberToEdit.maritalStatus || 'Solteiro(a)');
        setSpouseName(memberToEdit.spouseName || '');
        setWeddingDate(memberToEdit.weddingDate || '');
        setEmail(memberToEdit.email || '');
        setPhone(memberToEdit.phone || '');
        setStreet(memberToEdit.address?.street || '');
        setNumber(memberToEdit.address?.number || '');
        setComplement(memberToEdit.address?.complement || '');
        setNeighborhood(memberToEdit.address?.neighborhood || 'Centro');
        setCity(memberToEdit.address?.city || 'Sapiranga');
        setState(memberToEdit.address?.state || 'RS');
        setZipCode(memberToEdit.address?.zipCode || '93800-000');
        setRole(memberToEdit.role || 'Membro Comum');
        setStatus(memberToEdit.status || 'Ativo');
        setMinistriesText((memberToEdit.ministries || []).join(', '));
        setBaptismDate(memberToEdit.baptismDate || '');
        setMembershipDate(memberToEdit.membershipDate || new Date().toISOString().split('T')[0]);
        setProfession(memberToEdit.profession || '');
        setTalentsText((memberToEdit.talentsAndGifts || []).join(', '));
        setNotes(memberToEdit.notes || '');
        setPhotoUrl(memberToEdit.photoUrl || '');
        setDocuments(memberToEdit.documents || []);
      } else {
        // Reset for new member
        setFullName('');
        setPreferredName('');
        setCpf('');
        setRg('');
        setGender('Masculino');
        setBirthDate('1990-01-01');
        setMaritalStatus('Solteiro(a)');
        setSpouseName('');
        setWeddingDate('');
        setEmail('');
        setPhone('');
        setStreet('');
        setNumber('');
        setComplement('');
        setNeighborhood('Centro');
        setCity('Sapiranga');
        setState('RS');
        setZipCode('93800-000');
        setRole('Membro Comum');
        setStatus('Ativo');
        setMinistriesText('Geral');
        setBaptismDate('');
        setMembershipDate(new Date().toISOString().split('T')[0]);
        setProfession('');
        setTalentsText('');
        setNotes('');
        setPhotoUrl('');
        setDocuments([]);
      }
      setDocTitle('');
      setDocType('Certidão de Casamento');
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newDoc: MemberDocument = {
        id: `doc-${Date.now()}`,
        title: docTitle || file.name,
        type: docType,
        fileName: file.name,
        fileData: ev.target?.result as string,
        uploadedAt: new Date().toISOString()
      };
      setDocuments(prev => [...prev, newDoc]);
      setDocTitle('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !cpf.trim()) {
      alert('Nome completo e CPF são obrigatórios.');
      return;
    }

    const member: Member = {
      id: memberToEdit?.id || `mem-${Date.now()}`,
      code: memberToEdit?.code || '',
      fullName,
      preferredName: preferredName || undefined,
      cpf,
      rg: rg || undefined,
      gender,
      birthDate,
      maritalStatus,
      spouseName: maritalStatus === 'Casado(a)' ? spouseName : undefined,
      weddingDate: maritalStatus === 'Casado(a)' ? weddingDate : undefined,
      email,
      phone,
      address: {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode
      },
      role,
      status,
      ministries: ministriesText.split(',').map(m => m.trim()).filter(Boolean),
      baptismDate: baptismDate || undefined,
      membershipDate,
      profession: profession || undefined,
      talentsAndGifts: talentsText.split(',').map(t => t.trim()).filter(Boolean),
      photoUrl: photoUrl || undefined,
      documents,
      notes: notes || undefined,
      createdAt: memberToEdit?.createdAt || new Date().toISOString()
    };

    db.saveMember(member);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
              Módulo 2 • Cadastro de Membros
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              {memberToEdit ? `Editar Membro: ${memberToEdit.fullName}` : 'Novo Cadastro de Membro IBNS'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Photo & Basic Identification */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="relative group">
              <div className="w-24 h-28 rounded-xl bg-white border-2 border-slate-300 overflow-hidden flex items-center justify-center shadow-2xs">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-1 right-1 bg-amber-500 hover:bg-amber-400 text-slate-950 p-1.5 rounded-lg cursor-pointer shadow-xs transition-colors" title="Subir Foto">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome Social / Como Gosta de ser Chamado</label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={e => setPreferredName(e.target.value)}
                    placeholder="Ex: Pr. João, Diác. Silva"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">RG</label>
                  <input
                    type="text"
                    value={rg}
                    onChange={e => setRg(e.target.value)}
                    placeholder="1098472910"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sexo</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Marital Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Data de Nascimento (Aniversário)</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Estado Civil</label>
              <select
                value={maritalStatus}
                onChange={e => setMaritalStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>
            {maritalStatus === 'Casado(a)' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Cônjuge</label>
                <input
                  type="text"
                  value={spouseName}
                  onChange={e => setSpouseName(e.target.value)}
                  placeholder="Nome do esposo(a)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Contact & Sapiranga Address */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
              Contato & Endereço em Sapiranga/RS
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(51) 99999-9999"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="membro@email.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Logradouro / Rua</label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Ex: Rua São Pedro"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Número</label>
                <input
                  type="text"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="120"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bairro (Sapiranga)</label>
                <select
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="Centro">Centro</option>
                  <option value="Amaral Ribeiro">Amaral Ribeiro</option>
                  <option value="São Luiz">São Luiz</option>
                  <option value="Santa Fé">Santa Fé</option>
                  <option value="Sete de Setembro">Sete de Setembro</option>
                  <option value="Oeste">Oeste</option>
                  <option value="Centenário">Centenário</option>
                  <option value="Vila Irma">Vila Irma</option>
                  <option value="Zona Rural">Zona Rural</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ecclesiastical Roles & Ministries */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
              Dados Eclesiásticos & Cargo Ministerial
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cargo / Tipo de Membro *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as MemberRole)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="Membro Comum">Membro Comum</option>
                  <option value="Obreiro(a)">Obreiro(a)</option>
                  <option value="Pastor(a)">Pastor(a)</option>
                  <option value="Diácono">Diácono</option>
                  <option value="Diaconisa">Diaconisa</option>
                  <option value="Evangelista">Evangelista</option>
                  <option value="Presbítero">Presbítero</option>
                  <option value="Líder de Ministério">Líder de Ministério</option>
                  <option value="Congregado / Visitante Frequente">Congregado / Visitante Frequente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as MemberStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em Observação">Em Observação</option>
                  <option value="Transferido">Transferido</option>
                  <option value="Afastado">Afastado</option>
                  <option value="Falecido">Falecido</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Data de Batismo</label>
                <input
                  type="date"
                  value={baptismDate}
                  onChange={e => setBaptismDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ministérios em que Atua (separar por vírgula)</label>
                <input
                  type="text"
                  value={ministriesText}
                  onChange={e => setMinistriesText(e.target.value)}
                  placeholder="Ex: Louvor, Recepção, Ação Social, Infantil"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dons & Talentos (separar por vírgula)</label>
                <input
                  type="text"
                  value={talentsText}
                  onChange={e => setTalentsText(e.target.value)}
                  placeholder="Ex: Violão, Pregação, Aconselhamento, Artesanato"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Upload de Documentos (Certidão de Casamento, Certificados de Cursos, RG, Transferência) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Documentos Anexados (Certidão de Casamento, Certificados, CNH)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Tipo de Documento</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                >
                  <option value="Certidão de Casamento">Certidão de Casamento</option>
                  <option value="Certificado de Curso">Certificado de Curso</option>
                  <option value="Certidão de Batismo">Certidão de Batismo</option>
                  <option value="RG / CNH">RG / CNH</option>
                  <option value="Carta de Transferência">Carta de Transferência</option>
                  <option value="Outro">Outro Documento</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Título do Documento</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Ex: Certidão Casamento Civil"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div className="flex items-end">
                <label className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Subir Documento</span>
                  <input type="file" onChange={handleDocUpload} className="hidden" />
                </label>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <p className="text-[11px] font-semibold text-slate-600">Documentos Salvos ({documents.length}):</p>
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                        <p className="text-[10px] text-slate-500">{doc.type} • {doc.fileName}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Cadastro de Membro</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
