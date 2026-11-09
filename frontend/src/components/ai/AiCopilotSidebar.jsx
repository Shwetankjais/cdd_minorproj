import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Play,
  RotateCcw,
  GitCommit,
  Activity,
  Layers,
  ChevronDown,
  Terminal,
  Bot,
  User,
  Plus,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import { api } from '../../services/api';

export default function AiCopilotSidebar() {
  const {
    isAiCopilotOpen,
    closeAiCopilot,
    user,
    activeProject,
    startSimulation,
    resetSimulation,
    isSimulating,
    simPercent,
    setActiveTab,
    toggleGitDrawer,
  } = useThemeAndProject();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Gemini 3.8 Flash High');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const chatScrollRef = useRef(null);

  // Auto-scroll when new messages appear
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickActionChips = [
    {
      label: '⚡ Simulate Live Pipeline (0-100%)',
      prompt: 'Simulate a live pipeline run from 0% to 100% across Dev, CI, QA, and CD teams.',
    },
    {
      label: '🔍 Check Modified Git Files',
      prompt: 'Inspect modified and untracked git files in our repository.',
    },
    {
      label: '🩺 Explain Latest Build Failure',
      prompt: 'Explain the root cause of the latest build failure in run #1286.',
    },
    {
      label: '🐳 Inspect Docker Containers',
      prompt: 'Inspect the health and ports of our Docker containers.',
    },
    {
      label: '🤝 Check 80% Team Handoff Status',
      prompt: 'Explain how the 80% pre-notification team handoff works for CD release.',
    },
  ];

  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputMessage).trim();
    if (!text) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await api.sendAgentMessage(text, {
        project: activeProject?.id,
        userRole: user?.role,
        userName: user?.name,
      });

      const copilotMsg = {
        id: response.id || 'copilot-' + Date.now(),
        sender: 'copilot',
        text: response.text || response.response,
        timestamp: response.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
        actionBadge: response.actionBadge,
      };

      setMessages((prev) => [...prev, copilotMsg]);

      // Automatically execute requested dashboard side-effects
      if (response.action) {
        if (response.action.type === 'SIMULATE_PIPELINE') {
          startSimulation();
        } else if (response.action.type === 'NAVIGATE' && response.action.tab) {
          setActiveTab(response.action.tab);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'copilot',
          text: "I'm having trouble connecting to the backend agent service right now, but I've noted your request.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExecuteAction = (action) => {
    if (!action) return;
    if (action.type === 'SIMULATE_PIPELINE') {
      startSimulation();
    } else if (action.type === 'NAVIGATE' && action.tab) {
      setActiveTab(action.tab);
    }
  };

  if (!isAiCopilotOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 bg-[#0A1128] dark:bg-[#0D1B2A] text-[#F8FAFC] border-l border-[#323742] shadow-2xl flex flex-col justify-between transition-all duration-200 select-none"
      aria-label="DevPulse AI Copilot"
    >
      {/* 1. Header with Antigravity / DevPulse Identity */}
      <div className="p-4 border-b border-[#323742] bg-[#0A1128] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1C1E24] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-md shadow-[#D4AF37]/10">
            <Sparkles className="w-4 h-4 fill-[#D4AF37]/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#F8FAFC]">DevPulse Copilot</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                Agent v2.4
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8]">Autonomous CI/CD Diagnostics</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C1E24] transition-colors"
              title="Clear conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={closeAiCopilot}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C1E24] transition-colors"
            title="Close Copilot"
            aria-label="Close Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Middle Body: Screenshot 3 Welcome Greeting & Conversation Stream */}
      <div
        ref={chatScrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans scroll-smooth"
      >
        {messages.length === 0 ? (
          // Empty State matching Screenshot 3
          <div className="h-full flex flex-col justify-center items-center text-center py-6 px-2 space-y-6">
            {/* Elegant Antigravity / DevPulse Chevron Logo */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1C1E24] to-[#0A1128] border border-[#D4AF37]/30 flex items-center justify-center shadow-lg shadow-[#000000]/60">
              <svg
                className="w-7 h-7 text-[#D4AF37]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3L2 19h5l5-9 5 9h5L12 3z" />
              </svg>
            </div>

            {/* Typography: "Good to see you, Shwetank. What's next?" */}
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                Good to see you, {user?.name ? user.name.split(' ')[0] : 'Shwetank'}.
              </h2>
              <p className="text-sm font-medium text-[#94A3B8] mt-1">What's next?</p>
            </div>

            {/* Quick Action Chips */}
            <div className="w-full space-y-2 pt-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-1">
                Suggested Actions
              </p>
              {quickActionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-[#1C1E24]/80 hover:bg-[#1C1E24] border border-[#323742] hover:border-[#D4AF37]/50 text-[#F8FAFC] text-[11px] font-medium transition-all flex items-center justify-between group shadow-sm"
                >
                  <span className="truncate mr-2">{chip.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Active Conversation Messages
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] px-1">
                  <span>{isUser ? user?.name || 'You' : 'DevPulse Agent'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[92%] leading-relaxed ${
                    isUser
                      ? 'bg-[#D4AF37] text-[#0A1128] font-medium rounded-tr-none shadow-md'
                      : 'bg-[#1C1E24] text-[#F8FAFC] border border-[#323742] rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.text}</p>

                  {/* Structured Action Pill & Trigger Button */}
                  {msg.actionBadge && (
                    <div className="mt-2.5 pt-2 border-t border-[#323742] flex items-center justify-between flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {msg.actionBadge}
                      </span>

                      {msg.action?.type === 'SIMULATE_PIPELINE' && (
                        <button
                          onClick={() => handleExecuteAction(msg.action)}
                          className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#D4AF37] text-[#0A1128] hover:bg-[#C5A059] flex items-center gap-1 shadow-sm"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Run Again</span>
                        </button>
                      )}

                      {msg.action?.type === 'NAVIGATE' && msg.action.tab === 'source-control' && (
                        <button
                          onClick={toggleGitDrawer}
                          className="px-2 py-1 rounded-md text-[10px] font-medium bg-[#0D1B2A] text-[#D4AF37] hover:bg-[#0A1128] border border-[#D4AF37]/40 flex items-center gap-1"
                        >
                          <GitCommit className="w-2.5 h-2.5" />
                          <span>Open Drawer</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-[#94A3B8] p-2 bg-[#1C1E24]/60 rounded-xl border border-[#323742] w-fit">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce delay-100"></span>
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce delay-200"></span>
            <span className="text-[10px] font-mono text-[#94A3B8]">Analyzing pipeline state...</span>
          </div>
        )}
      </div>

      {/* 3. Bottom Input Bar matching Screenshot 3 */}
      <div className="p-3 border-t border-[#323742] bg-[#0A1128] space-y-2">
        {/* Project Context Line from Screenshot 3 ("No Project ⌄") */}
        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] px-1">
          <button
            onClick={() => setActiveTab('workspaces')}
            className="flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
          >
            <span className="font-mono text-[#D4AF37]">
              {activeProject?.displayName || 'cdd_minor'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isSimulating && (
            <span className="text-[10px] font-mono text-[#F59E0B] flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
              Live: {simPercent}%
            </span>
          )}
        </div>

        {/* Input Container Box from Screenshot 3 */}
        <div className="rounded-xl border border-[#323742] bg-[#1C1E24] p-2 focus-within:border-[#D4AF37] transition-all shadow-inner">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, @ to mention, / for actions..."
            rows={2}
            className="w-full bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none resize-none font-sans"
          />

          {/* Bottom Toolbar inside the box: [+] [Model Picker ⌃] [→] */}
          <div className="flex items-center justify-between pt-1 border-t border-[#323742]/50 mt-1">
            <div className="flex items-center gap-1.5">
              {/* Plus button for template actions */}
              <button
                onClick={() =>
                  handleSendMessage(
                    'Summarize current pipeline health, failure rates, and next required team actions.'
                  )
                }
                className="p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#323742] transition-colors"
                title="Summarize pipeline health"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Model Pill from Screenshot 3 */}
              <div className="relative">
                <button
                  onClick={() => setShowModelPicker((prev) => !prev)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#323742] transition-colors"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                  <span>{selectedModel}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {showModelPicker && (
                  <div className="absolute bottom-6 left-0 w-44 bg-[#23272F] border border-[#323742] rounded-lg shadow-xl p-1 z-50">
                    {['Gemini 3.8 Flash High', 'Gemini 3.8 Pro Live', 'Local Fast Heuristic'].map(
                      (m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedModel(m);
                            setShowModelPicker(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] ${
                            selectedModel === m
                              ? 'bg-[#1C1E24] text-[#D4AF37] font-semibold'
                              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                          }`}
                        >
                          {m}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Send Arrow Button from Screenshot 3 */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className={`p-1.5 rounded-lg transition-all ${
                inputMessage.trim()
                  ? 'bg-[#D4AF37] text-[#0A1128] hover:bg-[#C5A059] shadow-sm'
                  : 'bg-[#323742] text-[#64748B] cursor-not-allowed'
              }`}
              aria-label="Send message to Copilot"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
