import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore, useMaterialStore } from '@/store';
import api from '@/lib/api';
import { HiUpload, HiDocumentText, HiX, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ACCEPTED = '.pdf,.docx,.txt';
const MAX_SIZE_MB = 50;

const UploadPage: React.FC = () => {
  const { user } = useAuthStore();
  const { setSelectedMaterial } = useMaterialStore();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      toast.error('Only PDF, DOCX, and TXT files are supported.');
      return false;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must be under ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleUpload = async () => {
    if (!user) return;
    if (activeTab === 'file' && !file) { toast.error('Please select a file.'); return; }
    if (activeTab === 'text' && !pastedText.trim()) { toast.error('Please enter some text.'); return; }

    setUploading(true);
    setDone(false);
    setProgress(0);

    try {
      let response;
      const formData = new FormData();
      formData.append('userId', user.uid);

      if (activeTab === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('text', pastedText);
      }

      response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 0, // No timeout for file uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      });

      if (!response.data || !response.data.material_id) {
        throw new Error('Upload failed on server.');
      }

      setSelectedMaterial(response.data.material_id, response.data.title);
      setDone(true);
      toast.success('Material uploaded successfully!');
    } catch (err: unknown) {
      // The api interceptor already converts errors to plain Error objects with a .message string
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPastedText('');
    setDone(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Upload Study Material</h1>
        <p className="text-sm text-[#64748B] mt-1">Upload a file or paste text to start generating AI study tools.</p>
      </div>

      {done ? (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <HiCheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Upload Complete!</h2>
          <p className="text-sm text-[#64748B] mb-6">Your material is ready. You can now generate summaries, flashcards, and quizzes.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={reset} className="btn-secondary">Upload Another</button>
            <a href="/dashboard/summary" className="btn-primary">Generate Summary →</a>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border border-[#E2E8F0] rounded-lg p-1 bg-white w-fit">
            {(['file', 'text'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
                {tab === 'file' ? 'Upload File' : 'Paste Text'}
              </button>
            ))}
          </div>

          {activeTab === 'file' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`card border-2 border-dashed cursor-pointer p-10 text-center transition-all duration-150 ${dragOver ? 'border-primary bg-primary/5' : file ? 'border-success bg-green-50' : 'border-[#E2E8F0] hover:border-primary/50 hover:bg-[#F8FAFC]'}`}
            >
              <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleFileChange} />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <HiDocumentText className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A] text-sm">{file.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-danger mt-1">
                    <HiX className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HiUpload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A] text-sm">Drop your file here, or <span className="text-primary">browse</span></p>
                    <p className="text-xs text-[#94A3B8] mt-1">Supports PDF, DOCX, TXT — Max {MAX_SIZE_MB}MB</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-4">
              <label className="label">Paste your study material</label>
              <textarea
                className="input-field min-h-[220px] resize-y"
                placeholder="Paste your notes, textbook content, or any study material here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
              <p className="text-xs text-[#94A3B8] mt-2">{pastedText.length} characters</p>
            </div>
          )}

          {uploading && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-[#64748B] font-medium">Uploading...</span>
                <span className="text-primary font-semibold">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || (activeTab === 'file' ? !file : !pastedText.trim())}
            className="btn-primary w-full py-3"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              <>
                <HiUpload className="w-4 h-4" />
                {activeTab === 'file' ? 'Upload File' : 'Submit Text'}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default UploadPage;
