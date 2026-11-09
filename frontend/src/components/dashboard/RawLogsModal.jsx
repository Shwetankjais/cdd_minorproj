import React, { useState } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function RawLogsModal() {
  const { logsModal, closeLogsModal } = useThemeAndProject();
  const [copied, setCopied] = useState(false);

  if (!logsModal.isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(logsModal.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#070D1F]/70 backdrop-blur-sm transition-opacity"
        onClick={closeLogsModal}
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#1C1E24] rounded-2xl shadow-2xl border border-[#323742] text-[#F8FAFC] overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#23272F] border-b border-[#323742] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#0A1128] text-[#D4AF37] border border-[#323742]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm text-[#F8FAFC]">
                {logsModal.title || 'Pipeline Execution Logs'}
              </h3>
              <p className="text-[10px] text-[#94A3B8] font-sans">Raw stdout & stderr logs from runner container</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1C1E24] hover:bg-[#23272F] text-[#F8FAFC] transition-colors border border-[#323742]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Logs'}</span>
            </button>
            <button
              onClick={closeLogsModal}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C1E24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Terminal Body */}
        <div className="p-5 font-mono text-xs overflow-y-auto bg-[#0A1128] text-[#F8FAFC] leading-relaxed selection:bg-[#D4AF37] selection:text-[#0A1128]">
          <pre className="whitespace-pre-wrap break-all">{logsModal.content}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-[#23272F] border-t border-[#323742] flex justify-between items-center text-[11px] text-[#94A3B8]">
          <span>Encoding: UTF-8 • ANSI 256 Color</span>
          <span className="text-emerald-400 font-mono">Process Exit Code: 0</span>
        </div>
      </div>
    </div>
  );
}
