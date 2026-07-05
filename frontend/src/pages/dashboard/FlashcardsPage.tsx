import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useMaterialStore } from '@/store';
import {
  HiSparkles, HiChevronLeft, HiChevronRight, HiRefresh,
  HiCheckCircle, HiXCircle, HiInformationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyColors = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-danger',
};

const FlashcardsPage: React.FC = () => {
  const { selectedMaterialId, selectedMaterialTitle } = useMaterialStore();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());

  const generate = async () => {
    if (!selectedMaterialId) { toast.error('Please select a material first.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/flashcards/generate', { material_id: selectedMaterialId });
      setCards(data.flashcards || []);
      setIndex(0);
      setFlipped(false);
      setKnown(new Set());
      setUnknown(new Set());
      toast.success(`${(data.flashcards || []).length} flashcards generated!`);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to generate flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const shuffle = () => {
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
  };

  const next = () => { setIndex(i => Math.min(i + 1, cards.length - 1)); setFlipped(false); };
  const prev = () => { setIndex(i => Math.max(i - 1, 0)); setFlipped(false); };

  const markKnown = () => {
    setKnown(k => new Set([...k, cards[index].id]));
    setUnknown(u => { const s = new Set(u); s.delete(cards[index].id); return s; });
    if (index < cards.length - 1) next();
  };
  const markUnknown = () => {
    setUnknown(u => new Set([...u, cards[index].id]));
    setKnown(k => { const s = new Set(k); s.delete(cards[index].id); return s; });
    if (index < cards.length - 1) next();
  };

  const card = cards[index];
  const isKnown = card ? known.has(card.id) : false;
  const isUnknown = card ? unknown.has(card.id) : false;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Flashcards</h1>
        <p className="text-sm text-[#64748B] mt-1">Review key concepts with AI-generated flashcards.</p>
      </div>

      {selectedMaterialTitle ? (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <HiInformationCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm text-primary font-medium">Material: {selectedMaterialTitle}</span>
        </div>
      ) : (
        <div className="alert alert-info">
          <HiInformationCircle className="w-4 h-4 flex-shrink-0" />
          <span>No material selected. <a href="/dashboard/upload" className="underline font-medium">Upload one first.</a></span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={generate} disabled={loading || !selectedMaterialId} className="btn-primary">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </span>
          ) : <><HiSparkles className="w-4 h-4" /> {cards.length ? 'Regenerate' : 'Generate Flashcards'}</>}
        </button>
        {cards.length > 0 && (
          <button onClick={shuffle} className="btn-secondary">
            <HiRefresh className="w-4 h-4" /> Shuffle
          </button>
        )}
      </div>

      {loading && !cards.length && (
        <div className="card p-10 text-center space-y-3 animate-pulse">
          <div className="skeleton h-6 w-3/4 rounded mx-auto" />
          <div className="skeleton h-4 w-1/2 rounded mx-auto" />
        </div>
      )}

      {cards.length > 0 && card && (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>{index + 1} of {cards.length}</span>
            <div className="flex items-center gap-3">
              <span className="text-success font-medium">✓ {known.size} known</span>
              <span className="text-danger font-medium">✗ {unknown.size} unknown</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
          </div>

          {/* Card */}
          <div className="perspective-1000" style={{ perspective: '1000px' }}>
            <motion.div
              onClick={() => setFlipped(f => !f)}
              style={{ transformStyle: 'preserve-3d', cursor: 'pointer' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="relative w-full"
            >
              {/* Front */}
              <div
                className="card p-8 min-h-[220px] flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`badge ${difficultyColors[card.difficulty]}`}>{card.difficulty}</span>
                  {card.topic && <span className="badge badge-primary">{card.topic}</span>}
                </div>
                <p className="text-[#0F172A] font-semibold text-lg">{card.question}</p>
                <p className="text-xs text-[#94A3B8] mt-4">Click to reveal answer</p>
              </div>

              {/* Back */}
              <div
                className="card p-8 min-h-[220px] flex flex-col items-center justify-center text-center absolute inset-0 bg-primary/5 border-primary/30"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Answer</p>
                <p className="text-[#0F172A] text-base leading-relaxed">{card.answer}</p>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button onClick={prev} disabled={index === 0} className="btn-secondary disabled:opacity-40">
              <HiChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex gap-2">
              <button
                onClick={markKnown}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isKnown ? 'bg-green-100 border-green-300 text-success' : 'border-[#E2E8F0] text-[#64748B] hover:bg-green-50 hover:text-success hover:border-green-200'}`}
              >
                <HiCheckCircle className="w-4 h-4" /> Known
              </button>
              <button
                onClick={markUnknown}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isUnknown ? 'bg-red-100 border-red-300 text-danger' : 'border-[#E2E8F0] text-[#64748B] hover:bg-red-50 hover:text-danger hover:border-red-200'}`}
              >
                <HiXCircle className="w-4 h-4" /> Unknown
              </button>
            </div>
            <button onClick={next} disabled={index === cards.length - 1} className="btn-secondary disabled:opacity-40">
              Next <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlashcardsPage;
