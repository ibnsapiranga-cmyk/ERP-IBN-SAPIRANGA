import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Wrench, 
  Handshake, 
  Trash2, 
  Edit3, 
  Archive, 
  QrCode, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  MapPin,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { db } from '../../services/db';
import { 
  ChurchAsset, 
  AssetCategory, 
  AssetLocation, 
  AssetCondition 
} from '../../types';
import { AssetFormModal } from './AssetFormModal';
import { AssetLabelModal } from './AssetLabelModal';
import { AssetLoanModal } from './AssetLoanModal';
import { AssetMaintenanceModal } from './AssetMaintenanceModal';

interface AssetsModuleProps {
  hideSensitiveData?: boolean;
}

export const AssetsModule: React.FC<AssetsModuleProps> = ({
  hideSensitiveData = false
}) => {
  const [assets, setAssets] = useState<ChurchAsset[]>(db.getAssets());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedLocation, setSelectedLocation] = useState<string>('todos');
  const [selectedCondition, setSelectedCondition] = useState<string>('todos');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<ChurchAsset | null>(null);

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [assetForLabel, setAssetForLabel] = useState<ChurchAsset | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [assetForLoan, setAssetForLoan] = useState<ChurchAsset | null>(null);

  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [assetForMaint, setAssetForMaint] = useState<ChurchAsset | null>(null);

  useEffect(() => {
    return db.subscribe(() => {
      setAssets(db.getAssets());
    });
  }, []);

  const handleCreateNew = () => {
    setAssetToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (asset: ChurchAsset) => {
    setAssetToEdit(asset);
    setIsFormOpen(true);
  };

  const handleDelete = (asset: ChurchAsset) => {
    if (confirm(`Tem certeza que deseja excluir o bem tombado "${asset.code} - ${asset.name}"? Esta ação removerá o registro do patrimônio.`)) {
      db.deleteAsset(asset.id);
    }
  };

  const handleWriteOff = (asset: ChurchAsset) => {
    const reason = prompt(`Informe a justificativa da baixa patrimonial para o bem ${asset.code} (Ex: Descarte por dano irreparável, Venda autorizada, Doação):`);
    if (reason && reason.trim()) {
      db.writeOffAsset(asset.id, reason.trim());
    }
  };

  const handleOpenLabelsBatch = () => {
    setAssetForLabel(null);
    setIsLabelModalOpen(true);
  };

  const handleOpenLabelSingle = (asset: ChurchAsset) => {
    setAssetForLabel(asset);
    setIsLabelModalOpen(true);
  };

  const handleOpenLoan = (asset: ChurchAsset) => {
    setAssetForLoan(asset);
    setIsLoanModalOpen(true);
  };

  const handleOpenMaintenance = (asset: ChurchAsset) => {
    setAssetForMaint(asset);
    setIsMaintModalOpen(true);
  };

  const handleExportCsv = () => {
    if (assets.length === 0) {
      alert('Nenhum bem cadastrado para exportação.');
      return;
    }

    const headers = ['Plaqueta', 'Nome', 'Categoria', 'Localizacao', 'Estado', 'Valor_Aquisicao', 'Valor_Atual', 'Data_Compra', 'Fornecedor', 'Responsavel', 'Status'];
    const rows = assets.map(a => [
      a.code,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.category}"`,
      `"${a.location}"`,
      `"${a.condition}"`,
      a.acquisitionValue.toFixed(2),
      (a.currentEstimatedValue || a.acquisitionValue).toFixed(2),
      a.acquisitionDate,
      `"${a.supplier || ''}"`,
      `"${a.responsiblePerson}"`,
      a.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventario_Patrimonio_IBNS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered assets
  const filteredAssets = assets.filter(item => {
    const matchSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brandModel && item.brandModel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.responsiblePerson && item.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    const matchLocation = selectedLocation === 'todos' || item.location === selectedLocation;
    const matchCondition = selectedCondition === 'todos' || item.condition === selectedCondition;

    return matchSearch && matchCategory && matchLocation && matchCondition;
  });

  // Calculate KPIs
  const totalItems = assets.length;
  const totalValue = assets.reduce((s, a) => s + (a.currentEstimatedValue || a.acquisitionValue || 0), 0);
  const itemsInMaintenance = assets.filter(a => a.condition === 'Necessita Manutenção' || a.status === 'em_manutencao').length;
  const itemsLoaned = assets.filter(a => a.status === 'emprestado').length;

  const getConditionBadge = (cond: AssetCondition) => {
    switch (cond) {
      case 'Excelente':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Bom':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Regular':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Necessita Manutenção':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Danificado / Inoperante':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Baixado / Descartado':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
              Módulo de Patrimônio
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Gestão de Patrimônio & Inventário de Bens
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de tombamento, plaquetas com QR Code, termo de cautela/empréstimos e histórico de manutenções da IBNS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={assets.length === 0}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenLabelsBatch}
            disabled={assets.length === 0}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Imprimir Etiquetas</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tombar Novo Bem</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Itens</span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalItems}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Plaquetas tombadas no ERP
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Patrimônio Avaliado</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {hideSensitiveData ? 'R$ ••••••' : `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Valor residual total estimado
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Em Manutenção</span>
            <Wrench className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600">
            {itemsInMaintenance}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Necessitam de reparo ou revisão
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Empréstimos / Cautela</span>
            <Handshake className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {itemsLoaned}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Bens sob custódia temporária
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar plaqueta, nome, marca..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="Instrumentos & Som">Instrumentos & Som</option>
              <option value="Áudio & Vídeo / Transmissão">Áudio & Vídeo / Transmissão</option>
              <option value="Iluminação & Elétrica">Iluminação & Elétrica</option>
              <option value="Mobiliário & Decoração">Mobiliário & Decoração</option>
              <option value="Informática & TI">Informática & TI</option>
              <option value="Eletrodomésticos & Climatização">Eletrodomésticos & Climatização</option>
              <option value="Veículos & Transporte">Veículos & Transporte</option>
              <option value="Imóveis & Terrenos">Imóveis & Terrenos</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="todos">Todos os Setores / Locais</option>
              <option value="Templo Principal / Nave">Templo Principal / Nave</option>
              <option value="Altar / Púlpito">Altar / Púlpito</option>
              <option value="Cabine de Som & Mídia">Cabine de Som & Mídia</option>
              <option value="Galpão Kids / Salas EBD">Galpão Kids / Salas EBD</option>
              <option value="Gabinete Pastoral">Gabinete Pastoral</option>
              <option value="Secretaria & Tesouraria">Secretaria & Tesouraria</option>
              <option value="Cozinha / Salão Social">Cozinha / Salão Social</option>
              <option value="Berçário">Berçário</option>
              <option value="Anexo / Garagem">Anexo / Garagem</option>
              <option value="Área Externa">Área Externa</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={e => setSelectedCondition(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="todos">Todos os Estados</option>
              <option value="Excelente">Excelente</option>
              <option value="Bom">Bom</option>
              <option value="Regular">Regular</option>
              <option value="Necessita Manutenção">Necessita Manutenção</option>
              <option value="Danificado / Inoperante">Danificado / Inoperante</option>
              <option value="Baixado / Descartado">Baixado / Descartado</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table / Empty State */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        
        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Tag className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-slate-900">
                Nenhum bem patrimonial localizado
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {assets.length === 0 
                  ? 'O inventário de patrimônio da igreja está limpo e zerado. Você já pode iniciar os cadastros reais dos equipamentos e bens da IBNS.' 
                  : 'Nenhum item correspondeu aos filtros aplicados.'}
              </p>
            </div>
            <div>
              <button
                onClick={handleCreateNew}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tombar Primeiro Bem da Igreja</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Plaqueta</th>
                  <th className="py-3 px-4">Descrição do Bem</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Setor / Local</th>
                  <th className="py-3 px-4">Conservação</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Custodiante</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Plaqueta com QR code badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
                          {item.code}
                        </span>
                        {item.status === 'emprestado' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Emprestado
                          </span>
                        )}
                        {item.status === 'baixado' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Baixado
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Descrição e Foto */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {item.photoUrl ? (
                          <img 
                            src={item.photoUrl} 
                            alt={item.name} 
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                            ✝
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">
                            {item.name}
                          </span>
                          {item.brandModel && (
                            <span className="text-[10px] text-slate-500 truncate block">
                              {item.brandModel}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {item.category}
                    </td>

                    {/* Localização */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </td>

                    {/* Estado de Conservação */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getConditionBadge(item.condition)}`}>
                        {item.condition}
                      </span>
                    </td>

                    {/* Valor Estimado */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {hideSensitiveData ? 'R$ ••••••' : `R$ ${(item.currentEstimatedValue || item.acquisitionValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </td>

                    {/* Responsável */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      {item.responsiblePerson}
                    </td>

                    {/* Botões de Ação */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Imprimir Etiqueta */}
                        <button
                          onClick={() => handleOpenLabelSingle(item)}
                          title="Imprimir Plaqueta com QR Code"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Empréstimo / Cautela */}
                        <button
                          onClick={() => handleOpenLoan(item)}
                          title="Termo de Cautela / Empréstimo"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                        </button>

                        {/* Manutenção */}
                        <button
                          onClick={() => handleOpenMaintenance(item)}
                          title="Registrar Manutenção"
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleEdit(item)}
                          title="Editar Bem"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Baixa Patrimonial */}
                        {item.status !== 'baixado' && (
                          <button
                            onClick={() => handleWriteOff(item)}
                            title="Registrar Baixa Patrimonial"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Excluir */}
                        <button
                          onClick={() => handleDelete(item)}
                          title="Excluir Registro"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

      </div>

      {/* Modals */}
      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        assetToEdit={assetToEdit}
      />

      <AssetLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        asset={assetForLabel}
        assetsList={assets}
      />

      {assetForLoan && (
        <AssetLoanModal
          isOpen={isLoanModalOpen}
          onClose={() => {
            setIsLoanModalOpen(false);
            setAssetForLoan(null);
          }}
          asset={assetForLoan}
        />
      )}

      {assetForMaint && (
        <AssetMaintenanceModal
          isOpen={isMaintModalOpen}
          onClose={() => {
            setIsMaintModalOpen(false);
            setAssetForMaint(null);
          }}
          asset={assetForMaint}
        />
      )}

    </div>
  );
};
