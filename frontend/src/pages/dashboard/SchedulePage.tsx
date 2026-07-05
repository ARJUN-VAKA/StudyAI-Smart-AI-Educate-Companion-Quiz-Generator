import React, { useState } from 'react';
import api from '@/lib/api';
import { useMaterialStore, useScheduleStore } from '@/store';
import { HiSparkles, HiClock, HiLightningBolt, HiCheckCircle, HiInformationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const priorityConfig = {
  high: { label: 'High', class: 'badge-danger' },
  medium: { label: 'Medium', class: 'badge-warning' },
  low: { label: 'Low', class: 'badge-success' },
};

const SchedulePage: React.FC = () => {
  const { selectedMaterialId, selectedMaterialTitle } = useMaterialStore();
  const { schedule, setSchedule } = useScheduleStore();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const generate = async () => {
    if (!selectedMaterialId) { toast.error('Please select a material first.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/schedule/generate', { material_id: selectedMaterialId });
      setSchedule(data.schedule || []);
      setCompleted(new Set());
      toast.success('7-day study plan generated!');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to generate schedule.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (key: string) => {
    setCompleted(c => {
      const s = new Set(c);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  };

  const totalTasks = schedule.reduce((a, d) => a + d.tasks.length, 0);
  const completedCount = completed.size;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Study Schedule</h1>
        <p className="text-sm text-[#64748B] mt-1">Generate a personalized 7-day study plan from your material.</p>
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

      <div className="flex items-center gap-3">
        <button onClick={generate} disabled={loading || !selectedMaterialId} className="btn-primary">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </span>
          ) : <><HiSparkles className="w-4 h-4" /> {schedule.length ? 'Regenerate Plan' : 'Generate 7-Day Plan'}</>}
        </button>
        {totalTasks > 0 && (
          <span className="text-sm text-[#64748B]">{completedCount}/{totalTasks} tasks completed</span>
        )}
      </div>

      {loading && !schedule.length && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse space-y-2">
              <div className="skeleton h-4 w-1/4 rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-[#0F172A]">Overall Progress</span>
            <span className="text-primary font-semibold">{Math.round((completedCount / totalTasks) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${(completedCount / totalTasks) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Schedule grid */}
      {schedule.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedule.map((day) => (
            <div key={day.day} className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm">{day.day}</p>
                  {day.date && <p className="text-xs text-[#94A3B8]">{day.date}</p>}
                </div>
                <span className="text-xs text-[#64748B]">{day.tasks.length} tasks</span>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {day.tasks.map((task, ti) => {
                  const key = `${day.day}-${ti}`;
                  const done = completed.has(key);
                  const priority = priorityConfig[task.priority] || priorityConfig.medium;
                  return (
                    <div key={ti}
                      className={`px-4 py-3.5 cursor-pointer hover:bg-[#F8FAFC] transition-colors ${done ? 'opacity-60' : ''}`}
                      onClick={() => toggleTask(key)}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors ${done ? 'bg-success border-success' : 'border-[#CBD5E1]'}`}>
                          {done && <HiCheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`badge ${priority.class}`}>{priority.label}</span>
                            <p className={`text-sm font-medium text-[#0F172A] ${done ? 'line-through' : ''}`}>{task.topic}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                            {task.time && (
                              <span className="flex items-center gap-1">
                                <HiClock className="w-3 h-3" /> {task.time}
                              </span>
                            )}
                            {task.duration && (
                              <span className="flex items-center gap-1">
                                <HiLightningBolt className="w-3 h-3" /> {task.duration}
                              </span>
                            )}
                          </div>
                          {task.tip && <p className="text-xs text-[#64748B] mt-1.5 italic">💡 {task.tip}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
