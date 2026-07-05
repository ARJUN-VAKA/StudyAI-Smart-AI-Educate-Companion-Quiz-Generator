import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/lib/api';
import { useMaterialStore } from '@/store';
import { HiSparkles, HiDocumentDuplicate, HiDownload, HiRefresh, HiInformationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SummaryPage: React.FC = () => {
  const { selectedMaterialId, selectedMaterialTitle } = useMaterialStore();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!selectedMaterialId) {
      toast.error('Please upload or select a material first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/summary/generate', { material_id: selectedMaterialId });
      setSummary(data.summary || data.content || '');
      toast.success('Summary generated!');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to generate summary.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary);
    toast.success('Copied to clipboard!');
  };

  const download = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMaterialTitle || 'summary'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">AI Summary</h1>
        <p className="text-sm text-[#64748B] mt-1">Generate a structured summary of your study material.</p>
      </div>

      {/* Material indicator */}
      {selectedMaterialTitle ? (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <HiInformationCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm text-primary font-medium">Material: {selectedMaterialTitle}</span>
        </div>
      ) : (
        <div className="alert alert-info">
          <HiInformationCircle className="w-4 h-4 flex-shrink-0" />
          <span>No material selected. <a href="/dashboard/upload" className="underline font-medium">Upload a material</a> first.</span>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={loading || !selectedMaterialId}
        className="btn-primary"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          <>
            <HiSparkles className="w-4 h-4" />
            {summary ? 'Regenerate Summary' : 'Generate Summary'}
          </>
        )}
      </button>

      {error && <div className="alert alert-error"><span>{error}</span></div>}

      {/* Loading skeleton */}
      {loading && !summary && (
        <div className="card p-6 space-y-4 animate-pulse">
          {[80, 60, 90, 50, 70, 65, 75].map((w, i) => (
            <div key={i} className={`skeleton h-3.5 rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Summary content */}
      {summary && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <span className="text-sm font-semibold text-[#0F172A]">Summary</span>
            <div className="flex items-center gap-2">
              <button onClick={copyToClipboard} className="btn-ghost text-xs py-1.5 px-3">
                <HiDocumentDuplicate className="w-3.5 h-3.5" /> Copy
              </button>
              <button onClick={download} className="btn-ghost text-xs py-1.5 px-3">
                <HiDownload className="w-3.5 h-3.5" /> Download
              </button>
              <button onClick={generate} disabled={loading} className="btn-ghost text-xs py-1.5 px-3">
                <HiRefresh className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>
          </div>
          <div className="p-6 prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-[#0F172A] prose-p:text-[#374151] prose-li:text-[#374151] prose-strong:text-[#0F172A]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryPage;
