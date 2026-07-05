import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

interface QuizResult {
  score: number;
  total: number;
  topic: string;
  weakTopics: string[];
  createdAt: { toDate: () => Date };
}

const tooltipOptions = {
  backgroundColor: '#fff',
  titleColor: '#0F172A',
  bodyColor: '#64748B',
  borderColor: '#E2E8F0',
  borderWidth: 1,
  padding: 10,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  cornerRadius: 8,
};

const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const q = query(
          collection(db, 'quiz_results'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const fetchedResults = snap.docs.map(d => d.data() as QuizResult);
        // Sort ascending by createdAt in JS to avoid Firestore composite index requirement
        fetchedResults.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.()?.getTime?.() || 0;
          const timeB = b.createdAt?.toDate?.()?.getTime?.() || 0;
          return timeA - timeB;
        });
        setResults(fetchedResults);
      } catch (err) { 
        console.error('Failed to load analytics:', err);
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const labels = results.map((r, i) => `Quiz ${i + 1}`);
  const scores = results.map(r => Math.round((r.score / r.total) * 100));
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Weak topics frequency
  const weakMap: Record<string, number> = {};
  results.forEach(r => (r.weakTopics || []).forEach(t => { weakMap[t] = (weakMap[t] || 0) + 1; }));
  const weakEntries = Object.entries(weakMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Topics distribution
  const topicMap: Record<string, number> = {};
  results.forEach(r => { if (r.topic) topicMap[r.topic] = (topicMap[r.topic] || 0) + 1; });
  const topicEntries = Object.entries(topicMap).slice(0, 6);

  const colorPalette = ['#4F46E5', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

  const statCards = [
    { label: 'Quizzes Taken', value: results.length, suffix: '' },
    { label: 'Average Score', value: avgScore, suffix: '%' },
    { label: 'Best Score', value: scores.length ? Math.max(...scores) : 0, suffix: '%' },
    { label: 'Weak Topics', value: Object.keys(weakMap).length, suffix: '' },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
          <p className="text-sm text-[#64748B] mt-1">Track your quiz scores and study progress.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
        <p className="text-sm text-[#64748B] mt-1">Track your quiz scores and identify areas for improvement.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-[#0F172A]">{s.value}<span className="text-lg text-[#64748B]">{s.suffix}</span></p>
          </div>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#94A3B8] text-sm">No quiz data yet. Take a quiz to start seeing analytics.</p>
          <a href="/dashboard/quiz" className="btn-primary mt-4 inline-flex">Take a Quiz</a>
        </div>
      ) : (
        <>
          {/* Score Trend */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Score Trend</h2>
            <div className="h-60">
              <Line
                data={{
                  labels,
                  datasets: [{
                    label: 'Score (%)',
                    data: scores,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79,70,229,0.06)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4F46E5',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: tooltipOptions },
                  scales: {
                    y: { min: 0, max: 100, grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 11 } } },
                    x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } } },
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Topics */}
            {weakEntries.length > 0 && (
              <div className="card p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Weak Topics</h2>
                <div className="h-52">
                  <Bar
                    data={{
                      labels: weakEntries.map(([t]) => t.length > 20 ? t.slice(0, 20) + '…' : t),
                      datasets: [{
                        label: 'Wrong answers',
                        data: weakEntries.map(([, c]) => c),
                        backgroundColor: 'rgba(239,68,68,0.15)',
                        borderColor: '#EF4444',
                        borderWidth: 1.5,
                        borderRadius: 5,
                      }],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
                      plugins: { legend: { display: false }, tooltip: tooltipOptions },
                      scales: {
                        x: { grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 11 } } },
                        y: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Topic Distribution */}
            {topicEntries.length > 0 && (
              <div className="card p-6">
                <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Quiz Topics</h2>
                <div className="h-52 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: topicEntries.map(([t]) => t),
                      datasets: [{
                        data: topicEntries.map(([, c]) => c),
                        backgroundColor: colorPalette,
                        borderWidth: 0,
                        hoverOffset: 6,
                      }],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      cutout: '65%',
                      plugins: {
                        legend: { position: 'right', labels: { color: '#64748B', font: { size: 11 }, padding: 12, usePointStyle: true } },
                        tooltip: tooltipOptions,
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recent results table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-sm font-semibold text-[#0F172A]">Recent Quiz Results</h2>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {[...results].reverse().slice(0, 8).map((r, i) => {
                const pct = Math.round((r.score / r.total) * 100);
                return (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${pct >= 80 ? 'bg-green-100 text-success' : pct >= 60 ? 'bg-amber-100 text-warning' : 'bg-red-100 text-danger'}`}>
                      {pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{r.topic || 'Quiz'}</p>
                      <p className="text-xs text-[#94A3B8]">{r.score}/{r.total} correct</p>
                    </div>
                    <div className="w-28 hidden sm:block">
                      <div className="progress-bar">
                        <div className={`progress-bar-fill ${pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
