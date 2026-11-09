import React, { useState } from 'react';
import {
  Activity,
  Terminal,
  CheckCircle2,
  GitBranch,
  Github,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  X,
  Server,
  Layers,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function AuthLoginView() {
  const { login, isDark } = useThemeAndProject();

  const [email, setEmail] = useState('shwetank@devpulse.io');
  const [name, setName] = useState('Shwetank Jaiswal');
  const [role, setRole] = useState('Developer');
  const [githubRepo, setGithubRepo] = useState('Shwetankjais/cdd_minorproj');
  const [showMethodology, setShowMethodology] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamRoles = [
    { id: 'Developer', label: 'Developer', desc: 'Source Code & Local Push (0–25%)' },
    { id: 'CI Build Team', label: 'CI Build Team', desc: 'Compiler & Runner (25–50%)' },
    { id: 'QA Testing Team', label: 'QA Testing Team', desc: 'Vitest & Pytest (50–80%)' },
    { id: 'CD Release Team', label: 'CD Release Team', desc: 'Docker & Kubernetes (80–100%)' },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, name, role, githubRepo });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoConnect = () => {
    setEmail('shwetank@devpulse.io');
    setName('Shwetank Jaiswal');
    setRole('Developer');
    setGithubRepo('Shwetankjais/cdd_minorproj');
    login({
      email: 'shwetank@devpulse.io',
      name: 'Shwetank Jaiswal',
      role: 'Developer',
      githubRepo: 'Shwetankjais/cdd_minorproj',
    });
  };

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0A1128] font-sans antialiased">
      {/* Top Navigation Bar from Screenshot 1 */}
      <header className="px-6 py-4 border-b border-[#323742] bg-[#0A1128]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="w-6 h-6 rounded-lg bg-[#1C1E24] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[#F8FAFC]">devpulse</span>
          <span className="text-[#94A3B8]">/</span>
          <span className="text-[#D4AF37] font-semibold">auth & onboarding</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1E24] border border-[#323742] text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cluster Online</span>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-[#323742]">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0A1128] font-bold text-[10px] flex items-center justify-center">
              D
            </span>
            <span className="font-mono text-[11px] text-[#94A3B8] hidden sm:inline">developer@devpulse</span>
          </div>
        </div>
      </header>

      {/* Main Terminal Frame (from Screenshot 1) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex items-center">
        <div className="w-full bg-[#0A1128] rounded-2xl border border-[#323742] shadow-2xl overflow-hidden">
          {/* Terminal Title Bar with macOS dots */}
          <div className="px-5 py-3 bg-[#0D1B2A] border-b border-[#323742] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E63946]"></span>
              <span className="w-3 h-3 rounded-full bg-[#D4AF37]"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="ml-3 font-mono text-xs text-[#94A3B8] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#D4AF37]" />
                developer@devpulse: ~
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#94A3B8]">DevPulse Gateway v1.4</div>
          </div>

          {/* Terminal Interior Grid */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Typography & Onboarding Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <p className="font-mono text-xs text-[#94A3B8]"># collaborative development & devops project</p>
                <p className="font-mono text-xs text-[#D4AF37]">developer@devpulse:~$ ./devpulse --login</p>
              </div>

              {/* Bold Typography from Screenshot 1 */}
              <div className="leading-none tracking-tight select-none">
                <h1 className="text-4xl sm:text-6xl font-black text-[#F8FAFC] tracking-tight">BUILD.</h1>
                <h1 className="text-4xl sm:text-6xl font-black text-[#D4AF37] tracking-tight">TEST.</h1>
                <h1 className="text-4xl sm:text-6xl font-black text-[#F8FAFC] tracking-tight">DEPLOY.</h1>
              </div>

              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl">
                <strong>DevPulse</strong>: Visual CI/CD Pipeline Monitoring Dashboard. A centralized platform that turns
                complex build, test, and deployment logs into real-time pipeline status, execution history, statistics,
                and role-based handoff alerts.
              </p>

              {/* Login & Role Selection Form */}
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@devpulse.io"
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1E24] border border-[#323742] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1E24] border border-[#323742] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none"
                    />
                  </div>
                </div>

                {/* Team Role Pill Selector */}
                <div>
                  <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1.5">
                    Select Your CI/CD Role (Cross-Team Handoff)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {teamRoles.map((r) => {
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-[#1C1E24] border-[#D4AF37] ring-1 ring-[#D4AF37] text-[#F8FAFC] shadow-md'
                              : 'bg-[#0D1B2A] border-[#323742] text-[#94A3B8] hover:border-[#D4AF37]/40'
                          }`}
                        >
                          <p className="font-bold text-xs truncate">{r.label}</p>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5 truncate">{r.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GitHub Repository Target */}
                <div>
                  <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                    Target GitHub Repository
                  </label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="owner/repository"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1C1E24] border border-[#323742] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons from Screenshot 1 */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
                  >
                    <span>$ connect --github</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoConnect}
                    className="px-4 py-2.5 rounded-xl bg-[#1C1E24] hover:bg-[#23272F] border border-[#323742] text-xs font-mono text-[#F8FAFC] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Quick Demo Connect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMethodology(true)}
                    className="px-3 py-2 text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] underline decoration-[#323742] transition-colors"
                  >
                    man methodology
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Boot Terminal Card from Screenshot 1 */}
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-[#1C1E24] border border-[#323742] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#323742]">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-mono text-xs font-bold text-[#F8FAFC]">devpulse - starting services</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>

                <div className="font-mono text-xs space-y-2 text-[#94A3B8] leading-relaxed">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">[ OK ]</span>
                    <span>Started git-flow.service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">[ OK ]</span>
                    <span>Started github-actions.service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">[ OK ]</span>
                    <span>Started fastapi.service (:8000)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">[ OK ]</span>
                    <span>Started postgresql.service (:5432)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">[ OK ]</span>
                    <span>Started docker-compose.service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">[ READY ]</span>
                    <span className="text-[#F8FAFC]">Authenticated & linked to GitHub</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#323742] space-y-2">
                  <p className="text-[11px] font-mono text-[#D4AF37]">
                    run: connect --github
                  </p>
                  <p className="text-[10px] text-[#94A3B8]">
                    Target Repo: <span className="font-mono text-[#F8FAFC]">https://github.com/{githubRepo}</span>
                  </p>
                </div>

                {/* Team Handoff Architecture Badge */}
                <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#323742] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <p className="font-bold text-[#F8FAFC] text-[11px]">4-Team Pipeline Lifecycle</p>
                      <p className="text-[10px] text-[#94A3B8]">Dev → CI → QA → CD (80% Handoff)</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 z-50 bg-[#070D1F]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1C1E24] border border-[#323742] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#323742]">
              <h3 className="font-bold text-sm text-[#F8FAFC] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                DevPulse CI/CD Methodology
              </h3>
              <button
                onClick={() => setShowMethodology(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#94A3B8] space-y-3 leading-relaxed">
              <p>
                <strong>Cross-Team Handoff Mechanism:</strong> DevPulse monitors multi-stage automated pipelines and triggers
                predictive pre-alerts at 75–80% stage completion so QA and Release teams know exactly when to stage their environments.
              </p>
              <p>
                <strong>Stack:</strong> React 18 frontend with Recharts analytics, FastAPI Python backend, Docker Compose, PostgreSQL 15, and real-time Git sync.
              </p>
            </div>
            <button
              onClick={() => setShowMethodology(false)}
              className="w-full py-2 rounded-xl bg-[#D4AF37] text-[#0A1128] font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#323742] bg-[#0A1128]/80 text-center text-xs text-[#94A3B8] font-mono">
        DevPulse Visual CI/CD Monitoring • Connected to GitHub Repository: Shwetankjais/cdd_minorproj
      </footer>
    </div>
  );
}

