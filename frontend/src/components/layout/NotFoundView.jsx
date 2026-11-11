import React from 'react';
import { AlertOctagon, Terminal, ArrowLeft, Home, RefreshCw, Activity } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import Footer from './Footer';

export default function NotFoundView({ onReset }) {
  const { setActiveTab } = useThemeAndProject();

  const handleReturn = () => {
    if (typeof window !== 'undefined') {
      if (window.history?.pushState) {
        window.history.pushState({}, '', '/');
      }
      try {
        window.dispatchEvent(new Event('popstate'));
      } catch {
        // ignore in non-browser envs
      }
    }
    setActiveTab('overview');
    if (onReset) {
      onReset();
    }
  };

  const currentPath = typeof window !== 'undefined' ? (window.location.pathname || '/unknown') : '/unknown';

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] dark:bg-[#0B0E14] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0A1128] font-sans antialiased p-4 sm:p-6">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto pb-4 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#2A303C]">
        <button
          type="button"
          onClick={handleReturn}
          className="flex items-center gap-2 text-xs font-mono hover:opacity-85 transition-opacity cursor-pointer"
          title="Return to DevPulse Overview"
        >
          <div className="w-6 h-6 rounded-md bg-[#0A1128] dark:bg-[#181C24] border border-[#2A303C] flex items-center justify-center text-[#D4AF37]">
            <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">DevPulse</span>
          <span className="text-[#64748B]">/</span>
          <span className="text-[#E63946] font-semibold">404</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse"></span>
          <span>Route Error 404</span>
        </div>
      </header>

      {/* Center 404 Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="max-w-md w-full bg-white dark:bg-[#181C24] rounded-xl border border-[#E2E8F0] dark:border-[#2A303C] p-6 shadow-xl text-center space-y-4">
          {/* Terminal Header Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mx-auto shadow-md">
            <AlertOctagon className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-semibold">
              HTTP 404 — Route Unmapped
            </span>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-2 font-sans">
              Pipeline Route Not Found
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans mt-1 leading-relaxed">
              The requested pipeline view or navigation state does not exist in the DevPulse cluster catalog.
            </p>
          </div>

          {/* Terminal Diagnostics Excerpt */}
          <div className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] font-mono text-[11px] text-left text-[#64748B] dark:text-[#94A3B8] space-y-1">
            <p className="text-[#D4AF37]">$ devpulse --route-lookup {currentPath}</p>
            <p className="text-[#E63946]">[ERR] Route handler returned status 404</p>
            <p className="text-[10px] text-[#64748B]">Action: Redirect execution flow to overview dashboard.</p>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleReturn}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Overview Dashboard</span>
            </button>
          </div>
        </div>
      </main>

      {/* Universal Footer */}
      <div className="max-w-4xl w-full mx-auto">
        <Footer simple={true} />
      </div>
    </div>
  );
}
