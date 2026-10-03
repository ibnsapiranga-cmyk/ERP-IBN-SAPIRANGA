import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Award, 
  BookOpen, 
  UserCheck, 
  Clock, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Edit2, 
  Trash2,
  Users
} from 'lucide-react';
import { Course, CourseEnrollment, Member } from '../../types';
import { db } from '../../services/db';
import { CourseFormModal } from './CourseFormModal';
import { CertificateGeneratorModal } from './CertificateGeneratorModal';

export const EducationModule: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(db.getCourses());
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>(db.getEnrollments());
  const [members, setMembers] = useState<Member[]>(db.getMembers());
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certData, setCertData] = useState<{ course: Course | null; enrollment: CourseEnrollment | null; member: Member | null }>({
    course: null,
    enrollment: null,
    member: null
  });

  // Quick enroll state
  const [isQuickEnrollOpen, setIsQuickEnrollOpen] = useState(false);
  const [enrollMemberId, setEnrollMemberId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');

  useEffect(() => {
    return db.subscribe(() => {
      setCourses(db.getCourses());
      setEnrollments(db.getEnrollments());
      setMembers(db.getMembers());
    });
  }, []);

  const handleOpenCertificate = (enr: CourseEnrollment) => {
    const course = courses.find(c => c.id === enr.courseId) || null;
    const member = members.find(m => m.id === enr.memberId) || null;
    setCertData({
      course,
      enrollment: enr,
      member
    });
    setIsCertModalOpen(true);
  };

  const handleToggleEnrollmentStatus = (enr: CourseEnrollment) => {
    const nextStatus = enr.status === 'Concluído' ? 'Em Andamento' : 'Concluído';
    db.saveEnrollment({
      ...enr,
      status: nextStatus,
      completionDate: nextStatus === 'Concluído' ? new Date().toISOString().split('T')[0] : undefined
    });
  };

  const handleQuickEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollMemberId || !enrollCourseId) {
      alert('Selecione o membro e o curso.');
      return;
    }
    const mem = members.find(m => m.id === enrollMemberId);
    const crs = courses.find(c => c.id === enrollCourseId);
    if (!mem || !crs) return;

    db.saveEnrollment({
      id: `enr-${Date.now()}`,
      courseId: crs.id,
      memberId: mem.id,
      memberName: mem.fullName,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Em Andamento',
      progressPercentage: 10,
      attendanceCount: 1,
      totalClasses: 12,
      certificateIssued: false
    });

    setIsQuickEnrollOpen(false);
    setEnrollMemberId('');
  };

  const filteredEnrollments = enrollments.filter(e => {
    if (selectedCourseId !== 'all' && e.courseId !== selectedCourseId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = e.memberName.toLowerCase().includes(term);
      if (!matchName) return false;
    }
    return true;
  });

  const totalGraduated = enrollments.filter(e => e.status === 'Concluído').length;
  const activeStudents = enrollments.filter(e => e.status === 'Em Andamento').length;

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
              Módulo 3
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Educação Cristã, EBD & Discipulado IBNS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de turmas de discipulado, escola bíblica dominical, notas, frequências e emissão instantânea de certificados em PDF/Imagem.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsQuickEnrollOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-slate-200 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-purple-600" />
            <span>Matricular Aluno</span>
          </button>

          <button
            onClick={() => {
              setCourseToEdit(null);
              setIsCourseModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Curso</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Cursos e Treinamentos</span>
          <span className="text-xl font-extrabold text-slate-900">{courses.length} turmas</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Alunos Atualmente Cursando</span>
          <span className="text-xl font-extrabold text-purple-700">{activeStudents} alunos</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Certificados Emitidos / Formados</span>
          <span className="text-xl font-extrabold text-amber-800">{totalGraduated} formados</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Média de Assiduidade</span>
          <span className="text-xl font-extrabold text-emerald-700">94.8%</span>
        </div>
      </div>

      {/* Courses List Carousel/Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Cursos e Turmas em Aberto na IBNS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map(crs => {
            const enrolledInCourse = enrollments.filter(e => e.courseId === crs.id);

            return (
              <div
                key={crs.id}
                className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {crs.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      crs.status === 'Em Andamento' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {crs.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{crs.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{crs.description}</p>

                  <div className="my-3 space-y-1 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Instrutor:</span>
                      <span className="font-semibold text-slate-900">{crs.instructorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Carga Horária:</span>
                      <span className="font-semibold text-slate-800">{crs.workloadHours} horas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Alunos Matriculados:</span>
                      <span className="font-bold text-purple-700">{enrolledInCourse.length} inscritos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCourseId(selectedCourseId === crs.id ? 'all' : crs.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      selectedCourseId === crs.id ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {selectedCourseId === crs.id ? 'Exibindo Alunos' : 'Filtrar Alunos'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCourseToEdit(crs);
                        setIsCourseModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-purple-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                      title="Editar Curso / Turma"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a turma "${crs.title}"?`)) {
                          db.deleteCourse(crs.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors border border-rose-200"
                      title="Excluir Turma"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enrollments & Certificate Issuance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-3 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Alunos Matriculados & Emissão de Certificados</h3>
              <p className="text-slate-500 text-xs">
                {selectedCourseId !== 'all' ? `Filtrando por: ${courses.find(c => c.id === selectedCourseId)?.title}` : 'Todos os cursos'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCourseId !== 'all' && (
              <button
                onClick={() => setSelectedCourseId('all')}
                className="text-purple-600 hover:underline text-xs font-semibold"
              >
                Limpar Filtro
              </button>
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno..."
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nome do Aluno</th>
                <th className="py-3 px-4">Curso</th>
                <th className="py-3 px-4">Data Matrícula</th>
                <th className="py-3 px-4">Frequência</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação / Certificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                    Nenhum aluno encontrado para este curso.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map(enr => {
                  const crs = courses.find(c => c.id === enr.courseId);

                  return (
                    <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {enr.memberName}
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {crs?.title || 'Curso'}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {enr.startDate}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700">
                          {enr.attendanceCount ? Math.round((enr.attendanceCount / (enr.totalClasses || 1)) * 100) : 100}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleEnrollmentStatus(enr)}
                          title="Clique para alternar entre Cursando e Concluído"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                            enr.status === 'Concluído'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {enr.status.toUpperCase()}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenCertificate(enr)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Emitir Certificado</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Enroll Modal */}
      {isQuickEnrollOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">Matricular Membro em um Curso</h4>
              <button onClick={() => setIsQuickEnrollOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickEnroll} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Selecione o Membro:</label>
                <select
                  required
                  value={enrollMemberId}
                  onChange={e => setEnrollMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                >
                  <option value="">-- Escolha o Membro --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Selecione o Curso / Turma:</label>
                <select
                  required
                  value={enrollCourseId}
                  onChange={e => setEnrollCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                >
                  <option value="">-- Escolha o Curso --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.instructorName})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickEnrollOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Confirmar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courseToEdit={courseToEdit}
      />

      <CertificateGeneratorModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        course={certData.course}
        enrollment={certData.enrollment}
        member={certData.member}
      />

    </div>
  );
};
