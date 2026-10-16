import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  BarChart2
} from 'lucide-react';
import { SurveyItem } from '../types';
import { api } from '../api';

interface SurveysViewProps {
  surveys: SurveyItem[];
  onRefresh: () => void;
}

export const SurveysView: React.FC<SurveysViewProps> = ({ surveys, onRefresh }) => {
  const activeSurvey = surveys[0];
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<{ score: number; qualified: boolean } | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const handleSelectOption = (questionId: string, score: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleEvaluate = async () => {
    if (!activeSurvey) return;
    setEvaluating(true);

    const totalScore = Object.values(selectedAnswers).reduce((a, b) => a + b, 0);
    try {
      const res = await api.submitSurvey(activeSurvey.id, {
        score: totalScore,
        answers: selectedAnswers
      });
      setTestResult({ score: totalScore, qualified: res.qualified });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Encuestas y Cuestionarios de Calificación
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Lógica Condicional & Scoring
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Perfila prospectos automáticamente, filtra según sus respuestas y califica leads antes de agendar.
          </p>
        </div>
      </div>

      {activeSurvey && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Survey Info Card */}
          <div className="lg:col-span-4 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                Cuestionario Activo
              </span>
              <h2 className="text-sm font-bold text-white">{activeSurvey.name}</h2>
              <p className="text-xs text-gray-400 mt-1">
                Filtra prospectos asignando puntos por cada respuesta.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Umbral de Calificación:</span>
                <span className="text-emerald-400 font-bold">{activeSurvey.qualificationThreshold} puntos</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Respuestas Evaluadas:</span>
                <span className="text-indigo-400 font-bold">{activeSurvey.submissionsCount}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Preguntas Configuradas:</span>
                <span className="text-white font-semibold">{activeSurvey.questions.length}</span>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
                  testResult.qualified
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {testResult.qualified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{testResult.qualified ? '¡Lead Altamente Calificado!' : 'Lead No Calificado (Bajo Umbral)'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Puntuación obtenida: <strong>{testResult.score} pts</strong> (Mínimo: {activeSurvey.qualificationThreshold} pts).
                  {testResult.qualified
                    ? ' Se redirige automáticamente al agendamiento con asesor comercial.'
                    : ' Se redirige a material educativo gratuito de nutrición.'}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Question Flow */}
          <div className="lg:col-span-8 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-sm text-white">Evaluador Interactivo en Tiempo Real</h3>
              <span className="text-xs text-gray-400">Selecciona las respuestas para probar el cálculo</span>
            </div>

            <div className="space-y-6">
              {activeSurvey.questions.map((q, qIdx) => (
                <div key={q.id} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center font-mono">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-xs font-semibold text-white">{q.question}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    {q.options?.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[q.id] === opt.score;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.score)}
                          className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                              : 'bg-gray-950/60 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className="text-[10px] font-mono text-indigo-400 font-bold ml-2">
                            +{opt.score} pts
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                type="button"
                disabled={evaluating || Object.keys(selectedAnswers).length === 0}
                onClick={handleEvaluate}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2"
              >
                <span>{evaluating ? 'Calculando...' : 'Evaluar Calificación del Prospecto'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
