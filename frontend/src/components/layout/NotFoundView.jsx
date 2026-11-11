import React from 'react';
import { AlertOctagon, Terminal, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function NotFoundView() {
  const { setActiveTab } = useThemeAndProject();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
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
          <p className="text-[#D4AF37]">$ devpulse --route-lookup</p>
          <p className="text-[#E63946]">[ERR] Route handler returned status 404</p>
          <p className="text-[10px] text-[#64748B]">Action: Redirect execution flow to overview dashboard.</p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Overview Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
