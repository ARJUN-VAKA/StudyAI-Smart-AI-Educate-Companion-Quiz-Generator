import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HiHome,
  HiUpload,
  HiDocumentText,
  HiViewGrid,
  HiClipboardList,
  HiCalendar,
  HiChartBar,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
  HiAcademicCap,
  HiBell,
  HiSearch,
  HiMoon,
  HiSun,
  HiClock,
} from 'react-icons/hi';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { useScheduleStore, Task } from '@/store';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: HiHome, end: true },
  { to: '/dashboard/upload', label: 'Upload', icon: HiUpload },
  { to: '/dashboard/summary', label: 'Summary', icon: HiDocumentText },
  { to: '/dashboard/flashcards', label: 'Flashcards', icon: HiViewGrid },
  { to: '/dashboard/quiz', label: 'Quiz', icon: HiClipboardList },
  { to: '/dashboard/schedule', label: 'Schedule', icon: HiCalendar },
  { to: '/dashboard/analytics', label: 'Analytics', icon: HiChartBar },
  { to: '/dashboard/settings', label: 'Settings', icon: HiCog },
];

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { schedule } = useScheduleStore();
  const notifRef = useRef<HTMLDivElement>(null);

  const upcomingTasks: Task[] = React.useMemo(() => {
    try {
      return Array.isArray(schedule)
        ? schedule.flatMap(day => Array.isArray(day?.tasks) ? day.tasks : []).slice(0, 5)
        : [];
    } catch {
      return [];
    }
  }, [schedule]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border-color)]">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <HiAcademicCap className="text-white w-5 h-5" />
        </div>
        <span className="text-[15px] font-bold" style={{ color: 'var(--text-main)' }}>StudyAI</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-[var(--border-color)] space-y-0.5">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
        >
          <HiLogout className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Logout</span>
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>{displayName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}>
        <SidebarContent />
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 z-50 shadow-xl" style={{ background: 'var(--bg-card)' }}>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md"
              style={{ color: 'var(--text-muted)' }}
            >
              <HiX className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ─── Main content ─── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 flex-shrink-0" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md"
            style={{ color: 'var(--text-muted)' }}
          >
            <HiMenu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search materials..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-input)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <HiSun className="w-5 h-5 text-amber-400" />
                : <HiMoon className="w-5 h-5" />
              }
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(prev => !prev)}
                className="p-2 rounded-lg relative transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title="Notifications"
              >
                <HiBell className="w-5 h-5" />
                {upcomingTasks.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl z-[999] overflow-hidden"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-hover)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                      📚 Study Schedule
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {upcomingTasks.length > 0 ? (
                      upcomingTasks.map((task, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 transition-colors"
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                        >
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                            {task.topic}
                          </p>
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <HiClock className="w-3 h-3" />
                            {task.time || 'Upcoming'} · {task.duration || ''}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          No tasks yet. Generate a schedule first!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-1">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ background: 'var(--bg-page)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
