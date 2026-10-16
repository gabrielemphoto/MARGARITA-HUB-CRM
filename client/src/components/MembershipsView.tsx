import React, { useState } from 'react';
import {
  GraduationCap,
  Play,
  Users,
  Clock,
  Plus,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Course } from '../types';

interface MembershipsViewProps {
  courses: Course[];
}

export const MembershipsView: React.FC<MembershipsViewProps> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0] || null);
  const [expandedModule, setExpandedModule] = useState<string>('mod-1');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Membresías, Cursos y Formación (LMS)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Campus de Alumnos
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Aloja tus cursos, estructura módulos con videos protegidos y gestiona el acceso automático post-compra.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Curso / Membresía</span>
        </button>
      </div>

      {selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Course Summary Card */}
          <div className="lg:col-span-4 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="rounded-xl overflow-hidden aspect-video bg-gray-950 border border-gray-800 relative">
              <img
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                ${selectedCourse.price} USD
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-white mb-1">{selectedCourse.title}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">{selectedCourse.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Alumnos Matriculados:</span>
                <span className="text-emerald-400 font-bold">{selectedCourse.studentsCount}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total Módulos:</span>
                <span className="text-white font-semibold">{selectedCourse.modules.length}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Lecciones de Video:</span>
                <span className="text-indigo-400 font-bold">
                  {selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Curriculum Modules */}
          <div className="lg:col-span-8 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white">Estructura del Programa y Lecciones</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Añadir Módulo
              </button>
            </div>

            <div className="space-y-3">
              {selectedCourse.modules.map(mod => {
                const isExpanded = expandedModule === mod.id;
                return (
                  <div key={mod.id} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-950">
                    <button
                      onClick={() => setExpandedModule(isExpanded ? '' : mod.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-900/40 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-xs text-white">{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{mod.lessons.length} lecciones</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 space-y-2 border-t border-gray-800/60">
                        {mod.lessons.map(les => (
                          <div
                            key={les.id}
                            className="p-3 rounded-lg bg-gray-900/60 border border-gray-800/80 flex items-center justify-between text-xs hover:border-gray-700 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                <Play className="w-3 h-3 fill-current" />
                              </div>
                              <span className="text-gray-200 font-medium">{les.title}</span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{les.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
