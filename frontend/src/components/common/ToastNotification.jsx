import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function ToastNotification() {
  const { toast, hideToast } = useThemeAndProject();

  useEffect(() => {
    if (toast?.autoDismiss !== false && toast?.id) {
      const timer = setTimeout(() => {
        hideToast();
      }, toast?.duration || 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast || !toast.message) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <aside
      aria-label="System notification"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full px-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div
        className={`p-3.5 rounded-xl border shadow-2xl flex items-start justify-between gap-3 ${
          isSuccess
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40 backdrop-blur-md'
            : isError
            ? 'bg-[#1E1116] border-[#E63946]/50 text-[#F8FAFC] shadow-[#E63946]/20 backdrop-blur-md'
            : 'bg-[#1C1E24] border-[#D4AF37]/50 text-[#F8FAFC] shadow-black/50 backdrop-blur-md'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 flex-shrink-0">
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.2]" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4 text-[#E63946] stroke-[2.2]" />
            ) : (
              <Info className="w-4 h-4 text-[#D4AF37] stroke-[2.2]" />
            )}
          </div>
          <div className="min-w-0 text-left">
            {toast.title && (
              <h4 className="font-bold text-xs font-sans tracking-tight mb-0.5">
                {toast.title}
              </h4>
            )}
            <p className="text-xs font-sans leading-relaxed break-words opacity-95">
              {toast.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={hideToast}
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

