import React, { useState } from 'react';
import { X, Sparkles, Globe, CheckCircle2 } from 'lucide-react';
import { WebApp } from './types';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateApp: (url: string) => Promise<WebApp>;
  sessionId: string;
}

const AddAppModal: React.FC<AddAppModalProps> = ({
  isOpen,
  onClose,
  onCreateApp,
  sessionId,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setStep('analyzing');
    setError(null);

    try {
      const newApp = await onCreateApp(url);
      setStep('complete');

      setTimeout(() => {
        handleClose();
      }, 900);
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
      setStep('idle');
    }
  };

  const handleClose = () => { // add data base
    setUrl('');
    setStep('idle');
    setIsLoading(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

      <div className="relative bg-[#1a1c2e] border border-white/10 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#151725]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={20} />
            เพิ่ม Web App ใหม่
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'idle' || error ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  วางลิงค์ Web App (URL)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  </div>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
                  />
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  ระบบจะวิเคราะห์เว็บและสร้างคำบรรยายอัตโนมัติ
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-3">
                  <X size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !url}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform hover:scale-[1.02]"
              >
                Start Magic <Sparkles size={18} />
              </button>
            </form>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              {step === 'analyzing' && (
                <>
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <div className="relative w-20 h-20 bg-black/40 border border-cyan-500/30 rounded-full flex items-center justify-center">
                      <Globe className="text-cyan-400 animate-spin" size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing Data Stream...</h3>
                  <p className="text-gray-400 text-sm">กำลังถอดรหัสข้อมูลเว็บไซต์และบริบท</p>
                </>
              )}

              {step === 'complete' && (
                <>
                  <div className="mb-8 p-4 rounded-full text-green-400 bg-green-400/10 border border-green-400/20">
                    <CheckCircle2 size={48} className="animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                  <p className="text-gray-400 text-sm">Tada! แอปของคุณพร้อมใช้งานแล้ว</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAppModal;
