import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Tag, 
  MapPin, 
  Layers, 
  DollarSign, 
  Calendar, 
  User, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { db } from '../../services/db';
import { 
  ChurchAsset, 
  AssetCategory, 
  AssetLocation, 
  AssetCondition 
} from '../../types';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: ChurchAsset | null;
  onSuccess?: () => void;
}

const CATEGORIES: AssetCategory[] = [
  'Instrumentos & Som',
  'Áudio & Vídeo / Transmissão',
  'Iluminação & Elétrica',
  'Mobiliário & Decoração',
  'Informática & TI',
  'Eletrodomésticos & Climatização',
  'Veículos & Transporte',
  'Imóveis & Terrenos',
  'Outros'
];

const LOCATIONS: AssetLocation[] = [
  'Templo Principal / Nave',
  'Altar / Púlpito',
  'Cabine de Som & Mídia',
  'Galpão Kids / Salas EBD',
  'Gabinete Pastoral',
  'Secretaria & Tesouraria',
  'Cozinha / Salão Social',
  'Berçário',
  'Anexo / Garagem',
  'Área Externa'
];

const CONDITIONS: AssetCondition[] = [
  'Excelente',
  'Bom',
  'Regular',
  'Necessita Manutenção',
  'Danificado / Inoperante',
  'Baixado / Descartado'
];

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  assetToEdit,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Instrumentos & Som');
  const [location, setLocation] = useState<AssetLocation>('Templo Principal / Nave');
  const [condition, setCondition] = useState<AssetCondition>('Excelente');
  const [acquisitionValue, setAcquisitionValue] = useState<string>('0');
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState<string>('0');
  const [acquisitionDate, setAcquisitionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [documentNumber, setDocumentNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setCode(assetToEdit.code);
      setCategory(assetToEdit.category);
      setLocation(assetToEdit.location);
      setCondition(assetToEdit.condition);
      setAcquisitionValue(String(assetToEdit.acquisitionValue));
      setCurrentEstimatedValue(String(assetToEdit.currentEstimatedValue || assetToEdit.acquisitionValue));
      setAcquisitionDate(assetToEdit.acquisitionDate || new Date().toISOString().split('T')[0]);
      setDocumentNumber(assetToEdit.documentNumber || '');
      setSupplier(assetToEdit.supplier || '');
      setResponsiblePerson(assetToEdit.responsiblePerson || '');
      setBrandModel(assetToEdit.brandModel || '');
      setSerialNumber(assetToEdit.serialNumber || '');
      setPhotoUrl(assetToEdit.photoUrl || '');
      setNotes(assetToEdit.notes || '');
    } else {
      const allAssets = db.getAssets();
      const nextNum = allAssets.length + 1;
      setCode(`PAT-${String(nextNum).padStart(4, '0')}`);
      setName('');
      setCategory('Instrumentos & Som');
      setLocation('Templo Principal / Nave');
      setCondition('Excelente');
      setAcquisitionValue('');
      setCurrentEstimatedValue('');
      setAcquisitionDate(new Date().toISOString().split('T')[0]);
      setDocumentNumber('');
      setSupplier('');
      setResponsiblePerson('');
      setBrandModel('');
      setSerialNumber('');
      setPhotoUrl('');
      setNotes('');
    }
  }, [assetToEdit, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome do bem patrimonial.');
      return;
    }

    const acqVal = parseFloat(acquisitionValue.replace(/\./g, '').replace(',', '.')) || 0;
    const curVal = currentEstimatedValue ? parseFloat(currentEstimatedValue.replace(/\./g, '').replace(',', '.')) || acqVal : acqVal;

    const assetData: ChurchAsset = {
      id: assetToEdit ? assetToEdit.id : `ast-${Date.now()}`,
      code: code || `PAT-${String(db.getAssets().length + 1).padStart(4, '0')}`,
      name: name.trim(),
      category,
      location,
      condition,
      acquisitionValue: acqVal,
      currentEstimatedValue: curVal,
      acquisitionDate,
      documentNumber: documentNumber.trim() || undefined,
      supplier: supplier.trim() || undefined,
      responsiblePerson: responsiblePerson.trim() || 'Igreja Batista Nacional Sapiranga',
      brandModel: brandModel.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      photoUrl: photoUrl || undefined,
      notes: notes.trim() || undefined,
      status: assetToEdit ? assetToEdit.status : 'ativo',
      maintenanceHistory: assetToEdit?.maintenanceHistory || [],
      loansHistory: assetToEdit?.loansHistory || [],
      createdAt: assetToEdit ? assetToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.saveAsset(assetData);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                {assetToEdit ? 'Editar Bem Patrimonial' : 'Novo Cadastro de Patrimônio'}
              </h2>
              <p className="text-xs text-slate-500">
                Plaqueta e inventário de bens móveis e imóveis da IBNS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Plaqueta de Tombamento */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Plaqueta / Código *
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: PAT-0001"
                className="w-full font-mono font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Nome do Bem */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Descrição do Bem / Equipamento *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Mesa de Som Digital Behringer X32"
                className="w-full font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Categoria */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as AssetCategory)}
                className="w-full font-semibold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Setor / Localização */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Localização / Setor *
              </label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value as AssetLocation)}
                className="w-full font-semibold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Estado de Conservação */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estado de Conservação *
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as AssetCondition)}
                className="w-full font-semibold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Marca e Modelo */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Marca / Modelo
              </label>
              <input
                type="text"
                value={brandModel}
                onChange={e => setBrandModel(e.target.value)}
                placeholder="Ex: Behringer X32 Compact"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Número de Série */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Número de Série
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="Ex: SN-98234-X"
                className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Responsável / Guardião */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Responsável / Custodiante
              </label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={e => setResponsiblePerson(e.target.value)}
                placeholder="Ex: Ministério de Louvor"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Valor de Aquisição */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Valor de Aquisição (R$)
              </label>
              <input
                type="text"
                value={acquisitionValue}
                onChange={e => setAcquisitionValue(e.target.value)}
                placeholder="0,00"
                className="w-full font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Valor Atual Estimado */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Valor Atual Residual (R$)
              </label>
              <input
                type="text"
                value={currentEstimatedValue}
                onChange={e => setCurrentEstimatedValue(e.target.value)}
                placeholder="0,00"
                className="w-full font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Data de Aquisição */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Data de Aquisição
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={e => setAcquisitionDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nota Fiscal / Documento */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nota Fiscal / Recibo
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
                placeholder="Ex: NF-e 44821"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Fornecedor */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fornecedor / Loja
              </label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="Ex: Loja Áudio Profissional RS"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Foto do Bem */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Foto do Bem Patrimonial
            </label>
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 relative">
                  <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-0 right-0 bg-rose-600 text-white rounded-bl p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 flex flex-col items-center justify-center text-slate-400 hover:text-amber-600 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-[9px] mt-0.5">Upload</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
              <div className="text-[11px] text-slate-500">
                Adicione uma imagem nítida para identificação visual rápida na leitura do QR Code.
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Observações Adicionais / Garantia
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Garantia estendida até 2028. Manter guardado no case rígido."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{assetToEdit ? 'Salvar Alterações' : 'Tobar Bem'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
