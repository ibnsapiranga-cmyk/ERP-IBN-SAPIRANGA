import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Building2, 
  Lock, 
  Eye, 
  EyeOff,
  Database
} from 'lucide-react';
import { db } from '../../services/db';
import { AuditLog } from '../../types';

interface SettingsModuleProps {
  hideSensitiveData: boolean;
  onTogglePrivacy: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  hideSensitiveData,
  onTogglePrivacy
}) => {
  const [logs, setLogs] = useState<AuditLog[]>(db.getAuditLogs());
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  useEffect(() => {
    return db.subscribe(() => {
      setLogs(db.getAuditLogs());
    });
  }, []);

  const handleDownloadBackup = () => {
    const jsonStr = db.exportFullBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Completo_IBNS_Sapiranga_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 4000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('ATENÇÃO: A restauração substituirá os dados atuais pelo arquivo selecionado. Deseja continuar?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = db.importFullBackupJson(text);
      if (success) {
        setRestoreSuccess(true);
        setTimeout(() => setRestoreSuccess(false), 4000);
      } else {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (confirm('Deseja resetar o sistema para os dados de demonstração oficiais da IBNS Sapiranga?')) {
      db.resetToFactory();
      alert('Dados restaurados com sucesso para os dados iniciais.');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
              Segurança & Governança
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Configurações, Backup & Trilha de Auditoria
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de integridade, cópias de segurança locais em JSON, controle de privacidade e logs de auditoria da IBNS.
          </p>
        </div>
      </div>

      {/* Church Identification Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Dados Institucionais da Igreja</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Razão Social / Nome:</span>
            <span className="font-bold text-slate-900">Igreja Batista Nacional em Sapiranga</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">CNPJ:</span>
            <span className="font-mono text-slate-700 font-semibold">00.000.000/0001-00</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Pastor Presidente:</span>
            <span className="font-bold text-amber-800">Pr. Marcos Oliveira</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 sm:col-span-2">
            <span className="text-slate-400 font-medium block">Endereço do Templo Sede:</span>
            <span className="text-slate-800 font-medium">Rua São Pedro, Sapiranga - RS, CEP 93800-000</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Cidade / Estado:</span>
            <span className="text-slate-800 font-medium">Sapiranga / Rio Grande do Sul</span>
          </div>
        </div>
      </div>

      {/* Backup & Data Persistence Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Backup Completo & Restauração de Dados</span>
        </h3>

        <p className="text-xs text-slate-600">
          Faça o download do banco de dados completo (incluindo todos os lançamentos financeiros, comprovantes, membros, cursos, famílias e escalas) para salvaguarda em local seguro.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Fazer Download do Backup Completo (.JSON)</span>
          </button>

          <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 cursor-pointer flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Restaurar Backup (.JSON)</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>

          <button
            onClick={handleResetSeed}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resetar Dados para Amostra Inicial</span>
          </button>
        </div>

        {backupSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Backup gerado e baixado com sucesso!</span>
          </div>
        )}

        {restoreSuccess && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center gap-2 text-blue-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Banco de dados restaurado com sucesso!</span>
          </div>
        )}
      </div>

      {/* Security and Privacy Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-slate-900">Modo de Privacidade & Proteção de Telas</h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Oculta valores financeiros em R$ e CPFs de membros na tela para apresentações públicas ou projeções em cultos.
          </p>
        </div>

        <button
          onClick={onTogglePrivacy}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto ${
            hideSensitiveData 
              ? 'bg-amber-500 text-slate-950 shadow-xs' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          {hideSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{hideSensitiveData ? 'Privacidade ATIVA' : 'Privacidade INATIVA'}</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Trilha de Auditoria & Logs de Ações</span>
          </h3>
          <span className="text-[11px] text-slate-400">{logs.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Data e Hora</th>
                <th className="py-2.5 px-3">Usuário</th>
                <th className="py-2.5 px-3">Módulo</th>
                <th className="py-2.5 px-3">Ação</th>
                <th className="py-2.5 px-3">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{log.userName}</td>
                  <td className="py-2.5 px-3 text-amber-850 font-bold">{log.module}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
