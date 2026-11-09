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
  const { login } = useThemeAndProject();

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
    <div className="min-h-screen bg-[#0B0E14] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0A1128] font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="px-5 py-3 border-b border-[#262930] bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="w-5 h-5 rounded-md bg-[#14171F] border border-[#262930] flex items-center justify-center text-[#D4AF37]">
            <Activity className="w-3 h-3 stroke-[2.2]" />
          </div>
          <span className="font-semibold text-[#F8FAFC]">devpulse</span>
          <span className="text-[#64748B]">/</span>
          <span className="text-[#D4AF37]">auth</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#14171F] border border-[#262930] text-[#94A3B8] font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Cluster Online</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#262930]">
            <span className="w-5 h-5 rounded-md bg-[#D4AF37] text-[#0A1128] font-mono font-bold text-[10px] flex items-center justify-center">
              D
            </span>
            <span className="font-mono text-[11px] text-[#94A3B8] hidden sm:inline">developer@devpulse</span>
          </div>
        </div>
      </header>

      {/* Main Terminal Frame */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex items-center">
        <div className="w-full bg-[#14171F] rounded-lg border border-[#262930] overflow-hidden">
          {/* Terminal Title Bar */}
          <div className="px-4 py-2 bg-[#0B0E14] border-b border-[#262930] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="ml-2 font-mono text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#D4AF37]" />
                developer@devpulse: ~
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#64748B]">DevPulse Gateway v1.4</div>
          </div>

          {/* Terminal Interior Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Typography & Onboarding Form */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-0.5">
                <p className="font-mono text-[11px] text-[#64748B]"># collaborative development & devops project</p>
                <p className="font-mono text-[11px] text-[#D4AF37]">developer@devpulse:~$ ./devpulse --login</p>
              </div>

              {/* Bold Typography */}
              <div className="leading-none tracking-tight select-none">
                <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">BUILD.</h1>
                <h1 className="text-3xl sm:text-5xl font-black text-[#D4AF37] tracking-tight">TEST.</h1>
                <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">DEPLOY.</h1>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed max-w-lg">
                <strong>DevPulse</strong>: Visual CI/CD Pipeline Monitoring Dashboard. Centralized platform turning
                build, test, and deployment telemetry into live pipeline status, execution history, and role-based handoff alerts.
              </p>

              {/* Login & Role Selection Form */}
              <form onSubmit={handleLogin} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@devpulse.io"
                      className="w-full px-2.5 py-1.5 rounded-md bg-[#0B0E14] border border-[#262930] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-2.5 py-1.5 rounded-md bg-[#0B0E14] border border-[#262930] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                </div>

                {/* Team Role Pill Selector */}
                <div>
                  <label className="block text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                    Select Your CI/CD Role (Cross-Team Handoff)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {teamRoles.map((r) => {
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`p-2 rounded-md border text-left transition-colors ${
                            isSelected
                              ? 'bg-[#1A1E29] border-[#D4AF37] text-[#F8FAFC]'
                              : 'bg-[#0B0E14] border-[#262930] text-[#94A3B8] hover:border-[#D4AF37]/40'
                          }`}
                        >
                          <p className="font-semibold text-xs truncate">{r.label}</p>
                          <p className="text-[10px] font-mono text-[#64748B] mt-0.5 truncate">{r.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GitHub Repository Target */}
                <div>
                  <label className="block text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                    Target GitHub Repository
                  </label>
                  <div className="relative">
                    <Github className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="owner/repository"
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-[#0B0E14] border border-[#262930] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-semibold bg-[#D4AF37] text-[#0A1128] hover:bg-[#C5A059] transition-colors cursor-pointer"
                  >
                    <span>$ connect --github</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoConnect}
                    className="px-3 py-2 rounded-md text-xs font-mono font-medium bg-[#14171F] hover:bg-[#1A1E29] border border-[#262930] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                  >
                    Quick Demo Connect
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMethodology(true)}
                    className="px-3 py-2 rounded-md text-xs font-mono font-medium text-[#64748B] hover:text-[#D4AF37] transition-colors"
                  >
                    man methodology
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Boot Terminal Card */}
            <div className="lg:col-span-5 bg-[#0B0E14] rounded-md border border-[#262930] p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#262930] text-[11px] text-[#64748B]">
                <span>devpulse - starting services</span>
                <span className="text-emerald-500 font-bold">READY</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">[ OK ]</span>
                  <span className="text-[#94A3B8]">Started git-flow.service</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">[ OK ]</span>
                  <span className="text-[#94A3B8]">Started github-actions.service</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">[ OK ]</span>
                  <span className="text-[#94A3B8]">Started fastapi.service (:8000)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">[ OK ]</span>
                  <span className="text-[#94A3B8]">Started postgresql.service (:5432)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">[ OK ]</span>
                  <span className="text-[#94A3B8]">Started docker-compose.service</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[#262930]">
                  <span className="text-[#D4AF37] font-bold">[ WAIT ]</span>
                  <span className="text-[#F8FAFC]">Waiting for repository login_</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#14171F] border border-[#262930] space-y-1 text-[10px]">
                <p className="text-[#64748B]">Active Repository Target:</p>
                <p className="text-[#D4AF37] font-bold truncate">https://github.com/Shwetankjais/cdd_minorproj</p>
                <p className="text-[#64748B] pt-1">4-Team Handoff Matrix Active: Dev → CI → QA → CD</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 bg-[#070D1F]/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#14171F] border border-[#262930] rounded-md max-w-lg w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#262930]">
              <h3 className="font-semibold text-xs text-[#F8FAFC] font-mono">DevPulse Architecture & Methodology</h3>
              <button onClick={() => setShowMethodology(false)}>
                <X className="w-4 h-4 text-[#94A3B8]" />
              </button>
            </div>
            <div className="text-xs text-[#94A3B8] space-y-2 leading-relaxed">
              <p>
                DevPulse orchestrates a continuous monitoring workflow across four engineering teams:
              </p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
                <li><strong>Developer (0–25%):</strong> Commits and pushes branch updates to GitHub.</li>
                <li><strong>CI Build Team (25–50%):</strong> Compiles dependencies, runs linters and compiler gates.</li>
                <li><strong>QA Testing Team (50–80%):</strong> Executes unit and integration test suites via Vitest and Pytest.</li>
                <li><strong>CD Release Team (80–100%):</strong> Builds container images, evaluates blue-green deployment, and pushes to production.</li>
              </ul>
              <p className="text-[11px] text-[#64748B]">
                At the 80% mark, an automated pre-notification alert notifies downstream release engineers before the deployment phase commences.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
