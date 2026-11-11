import React from 'react';
import { Activity, Phone, Mail, ExternalLink, ShieldCheck, Github } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function Footer({ simple = false }) {
  const { setActiveTab } = useThemeAndProject();
  const currentYear = 2026;

  return (
    <footer className="mt-6 pt-4 pb-2 border-t border-[#E2E8F0] dark:border-[#2A303C]/80 text-[#64748B] dark:text-[#94A3B8] text-xs font-sans select-none">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* Left: Branding & Copyright */}
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>DevPulse</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
              v1.4
            </span>
            <span className="text-[#E2E8F0] dark:text-[#2A303C]">•</span>
            <span className="text-[11px] font-mono flex items-center gap-1 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              FastAPI :8000 (Live)
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            © {currentYear} DevPulse • Shwetank Jaiswal • Department of CSE, NIE Mysuru. All rights reserved.
          </p>
        </div>

        {/* Center / Right: Quick Navigation & External Links */}
        {!simple && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('workspaces')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Workspaces
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('runs')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Pipeline Runs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('deployments')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Docker Telemetry
            </button>
            <a
              href="https://github.com/Shwetankjais/cdd_minorproj#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              Docs <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}

        {/* Right: Clickable Support Contacts (tel & mailto) */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-[11px] font-mono">
          <a
            href="tel:+919876543210"
            className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[#0F172A] dark:text-[#F8FAFC]"
            title="Call Support Hotline"
          >
            <Phone className="w-3 h-3 text-[#D4AF37]" />
            <span>+91 98765 43210</span>
          </a>
          <span className="text-[#E2E8F0] dark:text-[#2A303C] hidden sm:inline">•</span>
          <a
            href="mailto:shwetankjaiswal@nie.ac.in"
            className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[#0F172A] dark:text-[#F8FAFC]"
            title="Email Engineering Support"
          >
            <Mail className="w-3 h-3 text-[#D4AF37]" />
            <span>shwetankjaiswal@nie.ac.in</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
