import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Play,
  RotateCcw,
  GitCommit,
  ChevronDown,
  Terminal,
  Bot,
  User,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickActionChips = [
    {
      label: 'Simulate Live Pipeline (0-100%)',
      prompt: 'Simulate a live pipeline run from 0% to 100% across Dev, CI, QA, and CD teams.',
    },
    {
      label: 'Inspect Modified Git Files',
      prompt: 'Inspect modified and untracked git files in our repository.',
    },
    {
      label: 'Explain Latest Build Failure',
      prompt: 'Explain the root cause of the latest build failure in run #1286.',
    },
    {
      label: 'Inspect Docker Containers',
      prompt: 'Inspect the health and ports of our Docker containers.',
    },
    {
      label: 'Check 80% Team Handoff Status',
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
          text: "Agent service temporarily unreachable. Offline diagnostics active.",
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
      className="fixed inset-y-0 right-0 z-40 w-80 sm:w-88 bg-white dark:bg-[#0B0E14] text-[#0F172A] dark:text-[#F8FAFC] border-l border-[#E2E8F0] dark:border-[#262930] shadow-xl flex flex-col justify-between transition-colors select-none"
      aria-label="DevPulse AI Copilot"
    >
      {/* Header */}
      <div className="p-3 border-b border-[#E2E8F0] dark:border-[#262930] bg-white dark:bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#FAF8F5] dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs">DevPulse Copilot</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded border border-[#E2E8F0] dark:border-[#262930] text-[#64748B] dark:text-[#94A3B8]">
                v2.4
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
              title="Clear chat"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={closeAiCopilot}
            className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
            title="Close Copilot"
            aria-label="Close Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Stream */}
      <div
        ref={chatScrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 text-xs font-sans"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center py-6 px-2 space-y-4">
            <div className="w-10 h-10 rounded-md bg-[#FAF8F5] dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#D4AF37]" />
            </div>

            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Good to see you, {user?.name ? user.name.split(' ')[0] : (user?.github_username || 'Developer')}.
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5">What would you like to inspect?</p>
            </div>

            {/* Quick Action Chips */}
            <div className="w-full space-y-1.5 pt-1 text-left">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] dark:text-[#64748B] px-1">
                Suggested Actions
              </p>
              {quickActionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="w-full text-left px-2.5 py-2 rounded-md bg-[#FAF8F5] dark:bg-[#14171F] hover:bg-[#E2E8F0]/50 dark:hover:bg-[#1A1E29] border border-[#E2E8F0] dark:border-[#262930] hover:border-[#D4AF37]/50 text-[#0F172A] dark:text-[#F8FAFC] text-[11px] font-mono transition-colors flex items-center justify-between group"
                >
                  <span className="truncate mr-2">{chip.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#94A3B8] group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] px-1">
                  <span>{isUser ? user?.name || 'You' : 'Copilot'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-2.5 rounded-md max-w-[92%] leading-relaxed ${
                    isUser
                      ? 'bg-[#D4AF37] text-[#0A1128] font-medium'
                      : 'bg-[#FAF8F5] dark:bg-[#14171F] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#262930]'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs font-mono">{msg.text}</p>

                  {msg.actionBadge && (
                    <div className="mt-2 pt-1.5 border-t border-[#E2E8F0] dark:border-[#262930] flex items-center justify-between flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {msg.actionBadge}
                      </span>

                      {msg.action?.type === 'SIMULATE_PIPELINE' && (
                        <button
                          onClick={() => handleExecuteAction(msg.action)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#D4AF37] text-[#0A1128]"
                        >
                          Run Again
                        </button>
                      )}

                      {msg.action?.type === 'NAVIGATE' && msg.action.tab === 'source-control' && (
                        <button
                          onClick={toggleGitDrawer}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-[#D4AF37]/50 text-[#D4AF37]"
                        >
                          Open Drawer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="p-2 rounded-md bg-[#FAF8F5] dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            Analyzing state...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-2.5 border-t border-[#E2E8F0] dark:border-[#262930] bg-white dark:bg-[#0B0E14] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] px-1">
          <span className="truncate">{activeProject?.displayName || 'cdd_minor'}</span>
          {isSimulating && <span className="text-[#F59E0B]">live: {simPercent}%</span>}
        </div>

        <div className="rounded-md border border-[#E2E8F0] dark:border-[#262930] bg-[#FAF8F5] dark:bg-[#14171F] p-1.5 focus-within:border-[#D4AF37] transition-colors">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, / for actions..."
            rows={2}
            className="w-full bg-transparent text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] dark:border-[#262930]/60 mt-1">
            <button
              onClick={() => handleSendMessage('Summarize pipeline health and pass rate.')}
              className="p-1 rounded text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              title="Quick summary"
            >
              <Plus className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className={`p-1 rounded transition-colors ${
                inputMessage.trim()
                  ? 'bg-[#D4AF37] text-[#0A1128]'
                  : 'text-[#64748B] cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
