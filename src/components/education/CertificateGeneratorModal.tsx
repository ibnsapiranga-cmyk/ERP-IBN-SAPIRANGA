import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Printer, Award, CheckCircle2, Sparkles } from 'lucide-react';
import { Course, CourseEnrollment, Member } from '../../types';

interface CertificateGeneratorModalProps {
  course: Course | null;
  enrollment: CourseEnrollment | null;
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateGeneratorModal: React.FC<CertificateGeneratorModalProps> = ({
  course,
  enrollment,
  member,
  isOpen,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [studentName, setStudentName] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [workloadHours, setWorkloadHours] = useState(20);
  const [completionDate, setCompletionDate] = useState('');
  const [pastorName, setPastorName] = useState('Pr. Marcos Oliveira');
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    if (member) setStudentName(member.fullName);
    if (course) {
      setCourseTitle(course.title);
      setWorkloadHours(course.workloadHours);
      setTeacherName(course.instructor);
    }
    if (enrollment) {
      setCompletionDate(enrollment.completionDate || new Date().toISOString().split('T')[0]);
    } else {
      setCompletionDate(new Date().toISOString().split('T')[0]);
    }
  }, [course, enrollment, member]);

  useEffect(() => {
    if (isOpen) {
      drawCertificate();
    }
  }, [isOpen, studentName, courseTitle, workloadHours, completionDate, pastorName, teacherName]);

  if (!isOpen) return null;

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 850;
    canvas.width = width;
    canvas.height = height;

    // Background - Elegant parchment/gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a'); // slate-900
    bgGradient.addColorStop(0.5, '#1e293b'); // slate-800
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Borders
    ctx.strokeStyle = '#f59e0b'; // amber-500
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, width - 84, height - 84);

    // Corner Ornaments
    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, y, 16, 16);
    };
    drawCorner(42, 42);
    drawCorner(width - 58, 42);
    drawCorner(42, height - 58);
    drawCorner(width - 58, height - 58);

    // Church Header
    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('IGREJA BATISTA NACIONAL EM SAPIRANGA', width / 2, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText('DEPARTAMENTO DE EDUCAÇÃO CRISTÃ & DISCIPULADO BÍBLICO', width / 2, 140);

    // Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText('CERTIFICADO DE CONCLUSÃO', width / 2, 230);

    // Golden Accent Line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 260);
    ctx.lineTo(width / 2 + 200, 260);
    ctx.stroke();

    // Body Text 1
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px sans-serif';
    ctx.fillText('Certificamos para os devidos fins que o(a) irmão(ã)', width / 2, 320);

    // Student Name
    ctx.fillStyle = '#fbbf24'; // amber-400
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText(studentName.toUpperCase() || 'NOME DO ALUNO', width / 2, 380);

    // Body Text 2
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px sans-serif';
    ctx.fillText('concluiu com êxito e dedicação os estudos ministeriais do curso', width / 2, 440);

    // Course Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText(`"${courseTitle || 'Nome do Curso'}"`, width / 2, 500);

    // Details: Workload and date
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `Com carga horária de ${workloadHours} horas de estudos bíblicos, concluído em ${new Date(completionDate + 'T00:00:00').toLocaleDateString('pt-BR')}.`,
      width / 2,
      560
    );

    // Bible Verse
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('"Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar." (2 Tm 2:15)', width / 2, 630);

    // Signatures
    // Left: Teacher
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(180, 750);
    ctx.lineTo(480, 750);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(teacherName || 'Instrutor(a) do Curso', 330, 775);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Professor(a) / Facilitador(a)', 330, 795);

    // Right: Pastor President
    ctx.beginPath();
    ctx.moveTo(720, 750);
    ctx.lineTo(1020, 750);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(pastorName, 870, 775);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Pastor Presidente - IBNS Sapiranga', 870, 795);
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificado_IBNS_${studentName.replace(/\s+/g, '_')}_${courseTitle.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>Certificado - IBNS Sapiranga</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
            <img src="${dataUrl}" style="max-width:100%;height:auto;" />
            <script>window.onload = function() { window.print(); };</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                Gerador de Certificados Dinâmicos
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Certificado Oficial IBNS Sapiranga
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Inputs for on-the-fly dynamic customizations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nome do Aluno:</label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nome do Curso:</label>
              <input
                type="text"
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Carga Horária (Horas):</label>
              <input
                type="number"
                value={workloadHours}
                onChange={e => setWorkloadHours(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          {/* Canvas Live Preview */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-center overflow-x-auto shadow-inner">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-xl shadow-2xl border border-amber-500/30"
              style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Imagem em Alta (.PNG)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
