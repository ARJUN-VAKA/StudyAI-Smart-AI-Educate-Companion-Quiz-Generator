import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import api from '@/lib/api';
import { HiUpload, HiDocumentText, HiViewGrid, HiClipboardList, HiCalendar, HiChartBar, HiArrowRight } from 'react-icons/hi';

interface RecentMaterial {
  id: string;
  title: string;
  type: string;
  createdAt: string;
}

interface QuizResult {
  id: string;
  score: number;
  total: number;
  topic: string;
  createdAt: Date;
}

const quickActions = [
  { label: 'Upload Material', to: '/dashboard/upload', icon: HiUpload, color: 'bg-primary/10 text-primary' },
  { label: 'Generate Summary', to: '/dashboard/summary', icon: HiDocumentText, color: 'bg-accent/10 text-accent' },
  { label: 'Study Flashcards', to: '/dashboard/flashcards', icon: HiViewGrid, color: 'bg-green-100 text-green-600' },
  { label: 'Take a Quiz', to: '/dashboard/quiz', icon: HiClipboardList, color: 'bg-amber-100 text-amber-600' },
  { label: 'View Schedule', to: '/dashboard/schedule', icon: HiCalendar, color: 'bg-purple-100 text-purple-600' },
  { label: 'Analytics', to: '/dashboard/analytics', icon: HiChartBar, color: 'bg-rose-100 text-rose-600' },
];

const DashboardHome: React.FC = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState<RecentMaterial[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  // Refresh whenever user revisits the page
  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      // Fetch materials from backend (uses admin SDK, bypasses Firestore security rules)
      try {
        const response = await api.get(`/upload/materials?userId=${encodeURIComponent(user.uid)}`);
        const mats = response?.data?.materials;
        setMaterials(Array.isArray(mats) ? mats : []);
      } catch (err) {
        console.error('Failed to load materials from backend:', err);
        setMaterials([]);
      }

      // Fetch quiz results from Firestore
      try {
        const qq = query(
          collection(db, 'quiz_results'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const qs = await getDocs(qq);
        setQuizResults(qs.docs.map(d => ({ id: d.id, ...d.data() } as QuizResult)));
      } catch {
        setQuizResults([]);
      }

      setLoading(false);
    };
    fetchData();
  }, [user?.uid, refreshKey]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          Good morning, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Here's an overview of your study activity.
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="card p-4 flex flex-col items-center gap-2.5 text-center hover:shadow-lg transition-shadow duration-200 group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium group-hover:text-primary transition-colors" style={{ color: 'var(--text-main)' }}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <section className="card">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Recent Uploads</h2>
            <Link to="/dashboard/upload" className="text-xs text-primary hover:underline flex items-center gap-1">
              Upload new <HiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div style={{ borderColor: 'var(--border-color)' }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))
            ) : materials.length === 0 ? (
              <div className="empty-state py-10">
                <HiUpload className="w-8 h-8 mb-2" style={{ color: 'var(--text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No uploads yet.</p>
                <Link to="/dashboard/upload" className="text-xs text-primary mt-1 hover:underline">
                  Upload your first material
                </Link>
              </div>
            ) : (
              materials.slice(0, 5).map((m, i) => (
                <div
                  key={m.id}
                  className="px-5 py-3.5 flex items-center gap-3"
                  style={i < materials.length - 1 ? { borderBottom: '1px solid var(--border-color)' } : {}}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HiDocumentText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                      {m.title}
                    </p>
                    <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                      {m.type || 'document'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Quiz Results */}
        <section className="card">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Recent Quiz Results</h2>
            <Link to="/dashboard/analytics" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <HiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))
            ) : quizResults.length === 0 ? (
              <div className="empty-state py-10">
                <HiClipboardList className="w-8 h-8 mb-2" style={{ color: 'var(--text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No quizzes taken yet.</p>
                <Link to="/dashboard/quiz" className="text-xs text-primary mt-1 hover:underline">
                  Take your first quiz
                </Link>
              </div>
            ) : (
              quizResults.map((r, i) => {
                const pct = Math.round((r.score / r.total) * 100);
                const colorClass = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600';
                const bgClass = pct >= 80 ? 'bg-green-100' : pct >= 60 ? 'bg-amber-100' : 'bg-red-100';
                return (
                  <div
                    key={r.id}
                    className="px-5 py-3.5 flex items-center gap-3"
                    style={i < quizResults.length - 1 ? { borderBottom: '1px solid var(--border-color)' } : {}}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bgClass}`}>
                      <span className={`text-xs font-bold ${colorClass}`}>{pct}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                        {r.topic || 'Quiz'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.score}/{r.total} correct
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardHome;
