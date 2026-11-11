import React, { useState, useEffect } from 'react';
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
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import Footer from '../layout/Footer';
import api from '../../services/api';

export default function AuthLoginView() {
  const { login } = useThemeAndProject();

  // Inputs are blank by default so visitors connect their OWN account
  const [githubUsername, setGithubUsername] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubProfile, setGithubProfile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamRoles = [
    { id: 'Developer', label: 'Developer', desc: 'Source Code & Local Push (0–25%)' },
    { id: 'CI Build Team', label: 'CI Build Team', desc: 'Compiler & Runner (25–50%)' },
    { id: 'QA Testing Team', label: 'QA Testing Team', desc: 'Vitest & Pytest (50–80%)' },
    { id: 'CD Release Team', label: 'CD Release Team', desc: 'Docker & Kubernetes (80–100%)' },
  ];

  // Verify GitHub username as user types with debounce
  useEffect(() => {
    const clean = githubUsername.trim().replace(/^@/, '');
    if (!clean) {
      setGithubProfile(null);
      setErrorMsg(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifying(true);
      setErrorMsg(null);
      try {
        const profile = await api.verifyGithubUser(clean);
        if (profile?.notFound) {
          setGithubProfile(null);
          setErrorMsg(`GitHub user "@${clean}" not found. Please check spelling.`);
        } else if (profile && profile.login) {
          setGithubProfile(profile);
          setErrorMsg(null);
          // Auto-suggest name if empty
          if (!name.trim() && profile.name) {
            setName(profile.name);
          }
          // Auto-suggest repo if empty
          if (!githubRepo.trim()) {
            setGithubRepo(`${profile.login}/portfolio`);
          }
        }
      } catch {
        // network issue, proceed gracefully
      } finally {
        setIsVerifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [githubUsername]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanUser = githubUsername.trim().replace(/^@/, '');

    if (!cleanUser) {
      setErrorMsg('Please enter your GitHub username to connect your account.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Validate with GitHub if not yet verified
      let activeProfile = githubProfile;
      if (!activeProfile || activeProfile.login?.toLowerCase() !== cleanUser.toLowerCase()) {
        const verified = await api.verifyGithubUser(cleanUser);
        if (verified?.notFound) {
          setErrorMsg(`GitHub user "@${cleanUser}" not found. Please enter a valid GitHub account.`);
          setIsSubmitting(false);
          return;
        }
        if (verified) {
          activeProfile = verified;
          setGithubProfile(verified);
        }
      }

      const userPayload = {
        email: email.trim() || `${cleanUser}@devpulse.io`,
        name: name.trim() || activeProfile?.name || cleanUser,
        role: role || 'Developer',
        github_username: cleanUser,
        github_token: githubToken.trim() || undefined,
        githubRepo: githubRepo.trim() || `${cleanUser}/portfolio`,
        avatar_url: activeProfile?.avatar_url || `https://github.com/${cleanUser}.png`,
      };

      await login(userPayload);
    } catch {
      setErrorMsg('Failed to initialize session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoEvaluatorLogin = () => {
    login({
      email: 'shwetank@devpulse.io',
      name: 'Shwetank Jaiswal',
      role: 'Developer',
      github_username: 'Shwetankjais',
      githubRepo: 'Shwetankjais/cdd_minorproj',
      avatar: 'DP',
      avatar_url: 'https://github.com/Shwetankjais.png',
    });
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#0B0E14] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0A1128] font-sans antialiased py-2 px-2 sm:px-6">
      {/* Top Navigation Bar */}
      <header className="px-5 py-3 border-b border-[#2A303C] bg-[#0B0E14] flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            setGithubUsername('');
            setGithubProfile(null);
          }}
          className="flex items-center gap-2 text-xs font-mono hover:opacity-80 transition-opacity text-left cursor-pointer"
          title="Reset DevPulse Gateway"
        >
          <div className="w-6 h-6 rounded-md bg-[#181C24] border border-[#2A303C] flex items-center justify-center text-[#D4AF37]">
            <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-[#F8FAFC]">DevPulse</span>
          <span className="text-[#64748B]">/</span>
          <span className="text-[#D4AF37]">connect</span>
        </button>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181C24] border border-[#2A303C] text-[#94A3B8] font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cluster Online</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#2A303C]">
            <span className="font-mono text-[11px] text-[#94A3B8] hidden sm:inline">Vercel Ready v1.4</span>
          </div>
        </div>
      </header>

      {/* Main Terminal Frame */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex items-center">
        <div className="w-full bg-[#181C24] rounded-xl border border-[#2A303C] shadow-2xl shadow-black/50 overflow-hidden">
          {/* Terminal Title Bar */}
          <div className="px-4 py-2.5 bg-[#0B0E14] border-b border-[#2A303C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="ml-2 font-mono text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#D4AF37]" />
                developer@devpulse: ~
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#64748B]">DevPulse Gateway v1.4 • Multi-User Onboarding</div>
          </div>

          {/* Terminal Interior Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Typography & Onboarding Form */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-0.5">
                <p className="font-mono text-[11px] text-[#64748B]"># visual ci/cd pipeline monitoring & telemetry</p>
                <p className="font-mono text-[11px] text-[#D4AF37]">developer@devpulse:~$ ./devpulse --connect-account</p>
              </div>

              {/* Bold Typography */}
              <div className="leading-none tracking-tight select-none">
                <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">BUILD.</h1>
                <h1 className="text-3xl sm:text-5xl font-black text-[#D4AF37] tracking-tight">TEST.</h1>
                <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">DEPLOY.</h1>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed max-w-lg">
                Connect your personal GitHub account to monitor real-time build workflows, test results, and cross-team role handoff telemetry across your repositories.
              </p>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs flex items-center gap-2 font-sans">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Verified GitHub Card */}
              {githubProfile && (
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-emerald-500/40 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={githubProfile.avatar_url}
                      alt={githubProfile.login}
                      width="40"
                      height="40"
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 rounded-lg border border-emerald-500/50 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#F8FAFC] font-sans">
                          {githubProfile.name || githubProfile.login}
                        </span>
                        <span className="text-[10px] font-mono text-[#D4AF37]">@{githubProfile.login}</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-sans flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Verified GitHub Account • {githubProfile.public_repos || 0} public repos</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    OK
                  </span>
                </div>
              )}

              {/* Login & Role Selection Form */}
              <form onSubmit={handleLogin} className="space-y-3 pt-1">
                {/* GitHub Username (Primary Field) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-sans font-semibold text-[#94A3B8] uppercase tracking-wider">
                      GitHub Username <span className="text-[#E63946]">*</span>
                    </label>
                    {isVerifying && (
                      <span className="text-[10px] font-mono text-[#D4AF37] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> verifying...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Github className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g., your-github-username"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0E14] border border-[#2A303C] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-sans font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name (optional)"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0E14] border border-[#2A303C] text-xs font-sans text-[#F8FAFC] focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com (optional)"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0E14] border border-[#2A303C] text-xs font-sans text-[#F8FAFC] focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                </div>

                {/* Optional GitHub Token / PAT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-sans font-semibold text-[#94A3B8] uppercase tracking-wider">
                      GitHub Personal Access Token (PAT)
                    </label>
                    <span className="text-[10px] font-mono text-[#64748B]">optional</span>
                  </div>
                  <input
                    type="password"
                    autoComplete="off"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx (for private repos & git push)"
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E14] border border-[#2A303C] text-xs font-mono text-[#F8FAFC] focus:border-[#D4AF37] outline-none"
                  />
                </div>

                {/* Team Role Pill Selector */}
                <div>
                  <label className="block text-[10px] font-sans font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
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
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1E232E] border-[#D4AF37] text-[#F8FAFC] shadow-sm'
                              : 'bg-[#0B0E14] border-[#2A303C] text-[#94A3B8] hover:border-[#D4AF37]/40'
                          }`}
                        >
                          <p className="font-semibold text-xs truncate font-sans">{r.label}</p>
                          <p className="text-[10px] font-mono text-[#64748B] mt-0.5 truncate">{r.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-sans font-semibold bg-[#D4AF37] text-[#0A1128] hover:bg-[#C5A059] transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting GitHub...</span>
                      </>
                    ) : (
                      <>
                        <span>$ connect --github</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoEvaluatorLogin}
                    className="px-3.5 py-2.5 rounded-lg text-xs font-sans font-medium bg-[#14171F] hover:bg-[#1E232E] border border-[#2A303C] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Quick Demo Connect
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMethodology(true)}
                    className="px-3 py-2 rounded-lg text-xs font-mono font-medium text-[#64748B] hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    man methodology
                  </button>
                </div>

                {/* Subtle Demo Evaluator Button for College Viva */}
                <div className="pt-2 border-t border-[#2A303C]/60 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>College Examination Viva?</span>
                  <button
                    type="button"
                    onClick={handleDemoEvaluatorLogin}
                    className="text-[#D4AF37] hover:underline font-mono text-[11px] cursor-pointer"
                  >
                    Demo Evaluator Login (Shwetankjais) →
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Boot Terminal Card */}
            <div className="lg:col-span-5 bg-[#0B0E14] rounded-xl border border-[#2A303C] p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A303C] text-[11px] text-[#64748B]">
                <span>devpulse - telemetry status</span>
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
                  <span className="text-[#94A3B8]">Started api-gateway.service</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">[ OK ]</span>
                  <span className="text-[#94A3B8]">Started telemetry-stream.service</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[#2A303C]">
                  {githubProfile ? (
                    <>
                      <span className="text-emerald-500 font-bold">[ OK ]</span>
                      <span className="text-[#F8FAFC]">Connected @{githubProfile.login}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#D4AF37] font-bold">[ WAIT ]</span>
                      <span className="text-[#F8FAFC]">Waiting for GitHub username_</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#181C24] border border-[#2A303C] space-y-1 text-[11px]">
                <p className="text-[#64748B]">Dynamic Account Scoping:</p>
                <p className="text-[#D4AF37] font-bold truncate">
                  {githubProfile ? `https://github.com/${githubProfile.login}` : 'Connect any public GitHub profile'}
                </p>
                <p className="text-[#64748B] pt-1">
                  Repositories, commits, and pipeline metrics will automatically load for the connected user.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 bg-[#070D1F]/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181C24] border border-[#2A303C] rounded-xl max-w-lg w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#2A303C]">
              <h3 className="font-bold text-sm text-[#F8FAFC] font-sans">DevPulse Architecture & Methodology</h3>
              <button
                type="button"
                onClick={() => setShowMethodology(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#94A3B8] space-y-2 leading-relaxed font-sans">
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

      {/* Universal Responsive Footer */}
      <div className="max-w-5xl w-full mx-auto px-4 mt-auto">
        <Footer simple={true} />
      </div>
    </div>
  );
}
