import React, { useState } from 'react';
import {
  Star,
  Award,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Share2,
  TrendingUp,
  Send
} from 'lucide-react';
import { ReviewItem } from '../types';
import { api } from '../api';

interface ReputationViewProps {
  reviews: ReviewItem[];
  onRefresh: () => void;
}

export const ReputationView: React.FC<ReputationViewProps> = ({ reviews, onRefresh }) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [draftingReply, setDraftingReply] = useState(false);

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  const handleAiDraftReply = async (review: ReviewItem) => {
    setDraftingReply(true);
    try {
      const res = await api.assistDraft(
        'Redactar respuesta de agradecimiento profesional y cálida para una reseña de 5 estrellas de un cliente satisfecho',
        `Reseña de ${review.author}: "${review.content}"`,
        'cálido'
      );
      if (res && res.draft) {
        setReplyText(res.draft);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDraftingReply(false);
    }
  };

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      await api.replyReview(reviewId, replyText);
      setActiveReplyId(null);
      setReplyText('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Reputación Online y Reseñas de Clientes
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" />
              {avgRating} de 5 Estrellas
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Control de reputación centralizado en Google Reviews, Trustpilot y Facebook con respuesta asistida por IA.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(rev => (
          <div
            key={rev.id}
            className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{rev.author}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="capitalize text-indigo-400 font-semibold">{rev.platform}</span>
                    <span>•</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-200 leading-relaxed italic bg-gray-950/60 p-3.5 rounded-xl border border-gray-800">
              "{rev.content}"
            </p>

            {/* Existing Reply */}
            {rev.reply && (
              <div className="pl-4 border-l-2 border-indigo-500 text-xs space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold block">Respuesta Oficial del Negocio:</span>
                <p className="text-gray-300">{rev.reply}</p>
              </div>
            )}

            {/* Action Bar */}
            {!rev.reply && (
              <div className="pt-2">
                {activeReplyId === rev.id ? (
                  <div className="space-y-3 p-3 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Escribir Respuesta Pública:</span>
                      <button
                        type="button"
                        disabled={draftingReply}
                        onClick={() => handleAiDraftReply(rev)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>{draftingReply ? 'Redactando...' : 'Generar Respuesta con IA'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Gracias por tu valoración..."
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white resize-none"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSendReply(rev.id)}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md"
                      >
                        <Send className="w-3 h-3" /> Publicar Respuesta
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveReplyId(rev.id);
                      setReplyText('');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Responder a esta reseña</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
