import React, { useState, useEffect } from 'react';
import { Course, CourseType } from '../../types';
import { db } from '../../services/db';
import { X, BookOpen, Check, Trash2 } from 'lucide-react';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({ 
  isOpen, 
  onClose,
  courseToEdit 
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CourseType>('Discipulado');
  const [workloadHours, setWorkloadHours] = useState(20);
  const [instructorName, setInstructorName] = useState('Pr. Marcos Oliveira');
  const [targetAudience, setTargetAudience] = useState('Novos Convertidos e Membros');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (courseToEdit) {
        setTitle(courseToEdit.title || '');
        setType(courseToEdit.type || 'Discipulado');
        setWorkloadHours(courseToEdit.workloadHours || 20);
        setInstructorName(courseToEdit.instructorName || 'Pr. Marcos Oliveira');
        setTargetAudience(courseToEdit.targetAudience || 'Novos Convertidos e Membros');
        setDescription(courseToEdit.description || '');
      } else {
        setTitle('');
        setType('Discipulado');
        setWorkloadHours(20);
        setInstructorName('Pr. Marcos Oliveira');
        setTargetAudience('Novos Convertidos e Membros');
        setDescription('');
      }
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const course: Course = {
      id: courseToEdit?.id || `crs-${Date.now()}`,
      title: title.trim(),
      type: type,
      workloadHours: Number(workloadHours) || 1,
      instructorName: instructorName.trim(),
      targetAudience: targetAudience.trim(),
      description: description.trim(),
      lessons: courseToEdit?.lessons || [
        { id: '1', title: 'Módulo 1: Fundamentos e Introdução' },
        { id: '2', title: 'Módulo 2: Vida Cristã Prática' }
      ]
    };

    db.saveCourse(course);
    onClose();
  };

  const handleDelete = () => {
    if (courseToEdit && confirm(`Deseja realmente excluir a turma "${courseToEdit.title}"?`)) {
      db.deleteCourse(courseToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 space-y-4 text-xs shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {courseToEdit ? 'Editar Turma / Curso Bíblico' : 'Criar Nova Turma / Curso Bíblico'}
              </h3>
              <p className="text-[11px] text-slate-500">Educação Cristã & Discipulado IBNS</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Título do Curso / Turma:</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Discipulado Nível 1 - Primeiros Passos"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Categoria / Tipo:</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as CourseType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
              >
                <option value="Discipulado">Discipulado</option>
                <option value="Escola Bíblica Dominical (EBD)">Escola Bíblica Dominical (EBD)</option>
                <option value="Curso de Membresia">Curso de Membresia</option>
                <option value="Curso de Batismo">Curso de Batismo</option>
                <option value="Curso de Diáconos">Curso de Diáconos</option>
                <option value="Curso de Obreiros e Liderança">Curso de Obreiros e Liderança</option>
                <option value="Teologia Básica">Teologia Básica</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Carga Horária (horas):</label>
              <input
                type="number"
                required
                min="1"
                value={workloadHours}
                onChange={e => setWorkloadHours(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Professor / Instrutor Titular:</label>
            <input
              type="text"
              required
              value={instructorName}
              onChange={e => setInstructorName(e.target.value)}
              placeholder="Ex: Pr. Marcos Oliveira"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Público-Alvo:</label>
            <input
              type="text"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="Ex: Novos convertidos, liderança, obreiros, toda a membresia"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ementa / Descrição do Conteúdo:</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva os objetivos espirituais e teológicos desta turma..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {courseToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 transition-colors border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Turma</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{courseToEdit ? 'Salvar Alterações' : 'Criar Turma'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
