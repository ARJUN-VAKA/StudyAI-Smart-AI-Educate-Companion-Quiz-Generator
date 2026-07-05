import React, { useState } from 'react';
import api from '@/lib/api';
import { useMaterialStore } from '@/store';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import { HiSparkles, HiCheckCircle, HiXCircle, HiInformationCircle, HiChevronRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

type QuizType = 'mcq' | 'true_false' | 'short_answer';
type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'setup' | 'quiz' | 'results';

interface QuizQuestion {
  id: number;
  type: QuizType;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizResult {
  question: QuizQuestion;
  userAnswer: string;
  correct: boolean;
}

const QuizPage: React.FC = () => {
  const { user } = useAuthStore();
  const { selectedMaterialId, selectedMaterialTitle } = useMaterialStore();
  const [phase, setPhase] = useState<Phase>('setup');
  const [config, setConfig] = useState<{ count: number; type: QuizType; difficulty: Difficulty }>({
    count: 10, type: 'mcq', difficulty: 'medium',
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const generateQuiz = async () => {
    if (!selectedMaterialId) { toast.error('Please select a material first.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/generate', {
        material_id: selectedMaterialId,
        question_count: config.count,
        quiz_type: config.type,
        difficulty: config.difficulty,
      });
      setQuestions(data.questions || []);
      setAnswers({});
      setCurrentIdx(0);
      setPhase('quiz');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    const evaluated: QuizResult[] = questions.map(q => ({
      question: q,
      userAnswer: answers[q.id] || '',
      correct: (answers[q.id] || '').trim().toLowerCase() === q.correct_answer.trim().toLowerCase(),
    }));
    setResults(evaluated);
    setPhase('results');

    const score = evaluated.filter(r => r.correct).length;
    const weakTopics = evaluated.filter(r => !r.correct).map(r => r.question.question.slice(0, 60));

    if (user) {
      try {
        await addDoc(collection(db, 'quiz_results'), {
          userId: user.uid,
          materialId: selectedMaterialId,
          topic: selectedMaterialTitle || 'Quiz',
          score, total: questions.length,
          weakTopics,
          createdAt: serverTimestamp(),
        });
      } catch { /* non-critical */ }
    }
  };

  const score = results.filter(r => r.correct).length;
  const pct = results.length ? Math.round((score / results.length) * 100) : 0;

  if (phase === 'setup') {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Quiz Generator</h1>
          <p className="text-sm text-[#64748B] mt-1">Configure and generate an AI quiz from your material.</p>
        </div>

        {!selectedMaterialTitle ? (
          <div className="alert alert-info">
            <HiInformationCircle className="w-4 h-4 flex-shrink-0" />
            <span>No material selected. <a href="/dashboard/upload" className="underline font-medium">Upload one first.</a></span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
            <HiInformationCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-primary font-medium">Material: {selectedMaterialTitle}</span>
          </div>
        )}

        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Question Type</label>
            <div className="grid grid-cols-3 gap-2">
              {([['mcq', 'Multiple Choice'], ['true_false', 'True / False'], ['short_answer', 'Short Answer']] as [QuizType, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setConfig(c => ({ ...c, type: val }))}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${config.type === val ? 'bg-primary text-white border-primary' : 'border-[#E2E8F0] text-[#64748B] hover:border-primary/40 hover:text-primary'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Number of Questions</label>
            <div className="flex items-center gap-3">
              {[5, 10, 15, 20].map(n => (
                <button key={n} onClick={() => setConfig(c => ({ ...c, count: n }))}
                  className={`w-12 h-10 rounded-lg text-sm font-medium border transition-all ${config.count === n ? 'bg-primary text-white border-primary' : 'border-[#E2E8F0] text-[#64748B] hover:border-primary/40 hover:text-primary'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Difficulty</label>
            <div className="flex items-center gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-all ${config.difficulty === d ? 'bg-primary text-white border-primary' : 'border-[#E2E8F0] text-[#64748B] hover:border-primary/40 hover:text-primary'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={generateQuiz} disabled={loading || !selectedMaterialId} className="btn-primary w-full py-3">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Quiz...
            </span>
          ) : <><HiSparkles className="w-4 h-4" /> Generate Quiz</>}
        </button>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = questions[currentIdx];
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0F172A]">Quiz</h1>
          <span className="text-sm text-[#64748B]">{currentIdx + 1} / {questions.length}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="card p-6 space-y-5">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{currentIdx + 1}</span>
            <p className="text-[#0F172A] font-medium leading-relaxed">{q.question}</p>
          </div>

          {q.type === 'mcq' && q.options && (
            <div className="space-y-2.5 ml-10">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${answers[q.id] === opt ? 'bg-primary/10 border-primary text-primary font-medium' : 'border-[#E2E8F0] text-[#374151] hover:border-primary/40 hover:bg-[#F8FAFC]'}`}>
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'true_false' && (
            <div className="flex gap-3 ml-10">
              {['True', 'False'].map(opt => (
                <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${answers[q.id] === opt ? 'bg-primary text-white border-primary' : 'border-[#E2E8F0] text-[#374151] hover:border-primary/40'}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'short_answer' && (
            <div className="ml-10">
              <textarea
                className="input-field min-h-[100px] resize-none"
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentIdx(i => Math.max(i - 1, 0))} disabled={currentIdx === 0}
            className="btn-secondary disabled:opacity-40">← Previous</button>
          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(i => i + 1)} className="btn-primary">
              Next <HiChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submitQuiz} className="btn-primary bg-success hover:bg-green-600 border-success">
              Submit Quiz ✓
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Quiz Results</h1>
        <p className="text-sm text-[#64748B] mt-1">Review your answers and explanations.</p>
      </div>

      {/* Score card */}
      <div className="card p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 80 ? 'bg-green-100' : pct >= 60 ? 'bg-amber-100' : 'bg-red-100'}`}>
          <span className={`text-2xl font-bold ${pct >= 80 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-danger'}`}>{pct}%</span>
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">{pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Work!' : 'Keep Practicing!'}</h2>
        <p className="text-[#64748B] text-sm">{score} out of {results.length} correct</p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={() => setPhase('setup')} className="btn-secondary">Try Again</button>
          <a href="/dashboard/analytics" className="btn-primary">View Analytics</a>
        </div>
      </div>

      {/* Answer review */}
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className={`card p-5 border-l-4 ${r.correct ? 'border-l-success' : 'border-l-danger'}`}>
            <div className="flex items-start gap-3">
              {r.correct ? <HiCheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" /> : <HiXCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0F172A] mb-2">{r.question.question}</p>
                {!r.correct && (
                  <>
                    <p className="text-xs text-danger mb-1">Your answer: {r.userAnswer || 'Not answered'}</p>
                    <p className="text-xs text-success mb-2">Correct: {r.question.correct_answer}</p>
                  </>
                )}
                {r.question.explanation && (
                  <p className="text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg p-2.5 mt-2">{r.question.explanation}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;
