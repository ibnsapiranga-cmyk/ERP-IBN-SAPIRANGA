import React from 'react';
import { X, Printer, Tag, Download, QrCode } from 'lucide-react';
import { ChurchAsset } from '../../types';

interface AssetLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: ChurchAsset | null;
  assetsList?: ChurchAsset[];
}

export const AssetLabelModal: React.FC<AssetLabelModalProps> = ({
  isOpen,
  onClose,
  asset,
  assetsList
}) => {
  if (!isOpen) return null;

  const itemsToPrint = asset ? [asset] : (assetsList || []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Etiquetas Patrimoniais (Plaquetas com QR Code)
              </h2>
              <p className="text-xs text-slate-500">
                Plaquetas oficiais de identificação e inventário físico da IBNS Sapiranga
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Plaquetas</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Labels Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 print:bg-white print:p-0">
          
          <div className="max-w-2xl mx-auto space-y-4">
            
            <div className="text-xs text-slate-500 print:hidden text-center pb-2">
              Visualização de impressão: {itemsToPrint.length} plaqueta(s) pronta(s) para papel adesivo ou sulfite.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
              {itemsToPrint.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-sm flex flex-col justify-between print:border-black print:shadow-none break-inside-avoid"
                  style={{ minHeight: '140px' }}
                >
                  {/* Church Header Banner */}
                  <div className="border-b-2 border-slate-900 pb-2 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xs">
                        ✝
                      </div>
                      <div>
                        <div className="font-black text-[11px] uppercase tracking-wider text-slate-950 leading-none">
                          IBNS SAPIRANGA
                        </div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase">
                          PATRIMÔNIO ECLESIÁSTICO
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-slate-950 tracking-tight">
                        {item.code}
                      </div>
                    </div>
                  </div>

                  {/* Body with QR Code and Details */}
                  <div className="flex items-center gap-3">
                    {/* Simulated High-Res QR Code */}
                    <div className="w-16 h-16 bg-white border border-slate-300 p-1 rounded-lg shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                        {/* Position Markers */}
                        <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                        <rect x="5" y="5" width="20" height="20" fill="white" />
                        <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                        <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                        <rect x="75" y="5" width="20" height="20" fill="white" />
                        <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                        <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                        <rect x="5" y="75" width="20" height="20" fill="white" />
                        <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                        {/* Data Matrix Dots */}
                        <rect x="36" y="8" width="6" height="6" fill="currentColor" />
                        <rect x="48" y="12" width="6" height="6" fill="currentColor" />
                        <rect x="42" y="22" width="6" height="6" fill="currentColor" />
                        <rect x="56" y="24" width="6" height="6" fill="currentColor" />
                        <rect x="12" y="42" width="6" height="6" fill="currentColor" />
                        <rect x="22" y="50" width="6" height="6" fill="currentColor" />
                        <rect x="38" y="40" width="8" height="8" fill="currentColor" />
                        <rect x="52" y="44" width="6" height="6" fill="currentColor" />
                        <rect x="42" y="56" width="6" height="6" fill="currentColor" />
                        <rect x="68" y="52" width="6" height="6" fill="currentColor" />
                        <rect x="84" y="42" width="6" height="6" fill="currentColor" />
                        <rect x="40" y="72" width="6" height="6" fill="currentColor" />
                        <rect x="56" y="76" width="6" height="6" fill="currentColor" />
                        <rect x="70" y="82" width="8" height="8" fill="currentColor" />
                        <rect x="86" y="72" width="6" height="6" fill="currentColor" />
                      </svg>
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-extrabold text-xs text-slate-900 truncate leading-tight">
                        {item.name}
                      </div>
                      {item.brandModel && (
                        <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                          {item.brandModel}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-800 font-bold mt-1">
                        Setor: <span className="font-medium text-slate-600">{item.location}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                        NÃO REMOVER ESTA PLAQUETA
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
