import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { mockProjects, mockPipelineRuns, mockSummary } from '../services/mockData';

const ThemeAndProjectContext = createContext(null);

export function ThemeAndProjectProvider({ children }) {
  // 1. Theme State (Default to Dark Mode for enterprise CI/CD monitoring)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('devpulse-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="color-scheme"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      if (meta) meta.content = 'dark';
      localStorage.setItem('devpulse-theme', 'dark');
    } else {
      root.classList.remove('dark');
      if (meta) meta.content = 'light';
      localStorage.setItem('devpulse-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // 2. Authentication & User Session State (Upgrade 1)
  const DEFAULT_USER = {
    name: 'Shwetank Jaiswal',
    email: 'shwetank@devpulse.io',
    role: 'Developer',
    githubConnected: true,
    githubRepo: 'Shwetankjais/cdd_minorproj',
    avatar: 'DP',
  };

  const [user, setUser] = useState(() => {
    try {
      if (localStorage.getItem('devpulse_logged_out') === 'true') {
        return null;
      }
      const saved = localStorage.getItem('devpulse_user');
      if (saved) return JSON.parse(saved);
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const isAuthenticated = Boolean(user);

  const login = useCallback(async ({ email, name, role, githubRepo }) => {
    try {
      const res = await api.login({ email, name, role, githubRepo });
      const loggedInUser = res?.user || {
        email: email || 'shwetank@devpulse.io',
        name: name || 'Shwetank Jaiswal',
        role: role || 'Developer',
        githubConnected: true,
        githubRepo: githubRepo || 'Shwetankjais/cdd_minorproj',
        avatar: 'DP',
      };
      setUser(loggedInUser);
      localStorage.setItem('devpulse_user', JSON.stringify(loggedInUser));
      localStorage.removeItem('devpulse_logged_out');
      return loggedInUser;
    } catch {
      const fallbackUser = {
        email: email || 'shwetank@devpulse.io',
        name: name || 'Shwetank Jaiswal',
        role: role || 'Developer',
        githubConnected: true,
        githubRepo: githubRepo || 'Shwetankjais/cdd_minorproj',
        avatar: 'DP',
      };
      setUser(fallbackUser);
      localStorage.setItem('devpulse_user', JSON.stringify(fallbackUser));
      localStorage.removeItem('devpulse_logged_out');
      return fallbackUser;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // offline fallback
    }
    setUser(null);
    localStorage.removeItem('devpulse_user');
    localStorage.setItem('devpulse_logged_out', 'true');
  }, []);

  const toggleGithubConnection = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, githubConnected: !prev.githubConnected };
      localStorage.setItem('devpulse_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 3. Collaborative Workspaces State (Upgrade 2)
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  useEffect(() => {
    api.getWorkspaces().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setWorkspaces(list);
        setActiveWorkspace(list[0]);
      }
    });
  }, []);

  const openWorkspace = useCallback(async (path) => {
    const res = await api.openWorkspace(path);
    if (res) {
      setWorkspaces((prev) => {
        const existing = prev.find((w) => w.path === res.path || w.id === res.id);
        if (existing) return prev;
        return [res, ...prev];
      });
      setActiveWorkspace(res);
    }
    return res;
  }, []);

  const cloneWorkspace = useCallback(async (params) => {
    const res = await api.cloneWorkspace(params);
    if (res) {
      setWorkspaces((prev) => [res, ...prev]);
      setActiveWorkspace(res);
    }
    return res;
  }, []);

  // 4. View Switching State without long vertical scrolling (Upgrade 3)
  const [activeTab, setActiveTab] = useState('overview');

  // 5. Right-Column AI Agent Copilot State (Upgrade 4)
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const toggleAiCopilot = useCallback(() => setIsAiCopilotOpen((prev) => !prev), []);
  const closeAiCopilot = useCallback(() => setIsAiCopilotOpen(false), []);
  const openAiCopilot = useCallback(() => setIsAiCopilotOpen(true), []);

  // 6. Responsive Mobile / Narrow Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // 7. Project Selection State
  const [projects, setProjects] = useState(mockProjects);
  const [activeProject, setActiveProject] = useState(mockProjects[0]);

  // Load live projects from FastAPI
  useEffect(() => {
    api.getProjects().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
        const current = data.find((p) => p.isCurrent) || data[0];
        setActiveProject(current);
      }
    });
  }, []);

  // 8. Live Pipeline Summary & KPI Statistics State
  const [summaryData, setSummaryData] = useState(mockSummary);

  const fetchSummary = useCallback(async (projectId) => {
    try {
      const data = await api.getPipelineSummary(projectId);
      if (data) setSummaryData(data);
    } catch {
      // keep previous
    }
  }, []);

  useEffect(() => {
    if (activeProject?.id) {
      fetchSummary(activeProject.id);
    }
  }, [activeProject, fetchSummary]);

  // 9. Live Pipeline Runs State
  const [runs, setRuns] = useState(mockPipelineRuns);
  const [selectedRun, setSelectedRun] = useState(mockPipelineRuns[0]);
  const [runsLoading, setRunsLoading] = useState(false);

  const fetchRuns = useCallback(async (projectId, status = 'All', search = '') => {
    setRunsLoading(true);
    try {
      const data = await api.getPipelineRuns({ project: projectId, status, search });
      if (Array.isArray(data) && data.length > 0) {
        setRuns(data);
        setSelectedRun((prev) => {
          // If the user already manually selected a specific run (not initial mock), preserve it
          if (prev && prev.id && prev.id !== '#1287') {
            const match = data.find((r) => r.id === prev.id || r.rawId === prev.rawId);
            if (match) return match;
          }
          // Default Overview card to latest main branch run (preferring Passed), or latest main, or first run
          const mainPassed = data.find((r) => r.branch === 'main' && (r.status === 'Passed' || r.status === 'success'));
          const mainRun = data.find((r) => r.branch === 'main');
          return mainPassed || mainRun || data[0];
        });
      }
    } catch {
      // keep previous
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeProject?.id) {
      fetchRuns(activeProject.id);
    }
  }, [activeProject, fetchRuns]);

  // Enrich selectedRun with live error-summary from backend when failure occurs
  const selectRunAndFetchError = useCallback(
    async (run) => {
      setSelectedRun(run);
      if (run.status.includes('Failed')) {
        try {
          const errorDetails = await api.getErrorSummary(run.rawId || run.id, activeProject?.id);
          if (errorDetails && errorDetails.failedStage !== 'None') {
            setSelectedRun((prev) => ({
              ...prev,
              errorSummary: errorDetails,
            }));
          }
        } catch {
          // keep local fallback error summary
        }
      }
    },
    [activeProject]
  );

  // 10. Source Control / Git Drawer state
  const [isGitDrawerOpen, setIsGitDrawerOpen] = useState(false);
  const toggleGitDrawer = useCallback(() => {
    setIsGitDrawerOpen((prev) => !prev);
  }, []);

  // 11. Raw Logs Modal State
  const [logsModal, setLogsModal] = useState({
    isOpen: false,
    title: '',
    content: '',
  });

  const openLogsModal = useCallback((title, content) => {
    setLogsModal({ isOpen: true, title, content });
  }, []);

  const closeLogsModal = useCallback(() => {
    setLogsModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 12. Live Simulation State connected to POST /api/pipeline/simulate & GET /api/pipeline/live
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPercent, setSimPercent] = useState(100);
  const [simStage, setSimStage] = useState('deploy');
  const [simAlert, setSimAlert] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'QA Testing Handover Ready',
      message: 'Run completed Build stage cleanly. QA Pytest / Vitest suites triggered.',
      time: '2m ago',
      read: false,
      team: 'QA Testing Team',
    },
    {
      id: 'n-2',
      title: 'CD Release Verification',
      message: 'Docker container v1.4.0 verified and passed health checks.',
      time: '12m ago',
      read: true,
      team: 'CD Release Team',
    },
  ]);

  const simulationPollRef = useRef(null);

  const getRoleTeamForPercent = useCallback((p) => {
    if (p < 25) return { role: 'Dev Team', task: 'Source Push & Validation', range: '0–25%' };
    if (p < 50) return { role: 'CI Team', task: 'Build & Compilation', range: '25–50%' };
    if (p < 80) return { role: 'QA Testing Team', task: 'Automated Vitest & Pytest', range: '50–80%' };
    return { role: 'CD Release Team', task: 'Docker & Cluster Deployment', range: '80–100%' };
  }, []);

  const startSimulation = useCallback(async () => {
    setIsSimulating(true);
    setSimPercent(5);
    setSimStage('build');
    setSimAlert({
      level: 'info',
      team: 'Dev Team',
      nextTeam: 'CI Team',
      message: 'Developer pushed commits to GitHub. Initializing compiler environment.',
      isPreHandoff: false,
    });

    try {
      await api.simulatePipeline(activeProject?.id);
    } catch {
      // proceed with local simulator fallback
    }

    if (simulationPollRef.current) clearInterval(simulationPollRef.current);

    simulationPollRef.current = setInterval(async () => {
      try {
        const live = await api.getLivePipelineStatus();
        if (live && typeof live.progress === 'number' && live.progress > 0) {
          setSimPercent(live.progress);
          setSimStage(live.current_stage || 'build');

          if (live.handoff_alert) {
            setSimAlert({
              level: 'warning',
              team: live.handoff_alert.from_team,
              nextTeam: live.handoff_alert.to_team,
              message: live.handoff_alert.message,
              isPreHandoff: true,
            });
          }

          if (live.progress >= 100) {
            clearInterval(simulationPollRef.current);
            simulationPollRef.current = null;
            setIsSimulating(false);
            setSimAlert({
              level: 'success',
              team: 'CD Release Team',
              nextTeam: 'Production',
              message: 'Pipeline completed! All tests passed and Docker containers deployed successfully.',
              isPreHandoff: false,
            });
            fetchSummary(activeProject?.id);
            fetchRuns(activeProject?.id);
          }
          return;
        }
      } catch {
        // fallback to smooth timer
      }

      setSimPercent((prev) => {
        const next = prev + 5;
        if (next < 25) {
          setSimStage('build');
          setSimAlert({
            level: 'info',
            team: 'Dev Team',
            nextTeam: 'CI Team',
            message: 'Source committed and checked out. Compiling dependencies.',
            isPreHandoff: false,
          });
        } else if (next < 50) {
          setSimStage('test');
          if (next >= 40) {
            setSimAlert({
              level: 'warning',
              team: 'CI Team',
              nextTeam: 'QA Testing Team',
              message: 'Heads-up: CI Build is 80% finished. QA Testing Team please prepare Vitest suites!',
              isPreHandoff: true,
            });
          } else {
            setSimAlert({
              level: 'info',
              team: 'CI Team',
              nextTeam: 'QA Testing Team',
              message: 'Build successful. Running linter and compiler checks.',
              isPreHandoff: false,
            });
          }
        } else if (next < 80) {
          setSimStage('docker');
          if (next >= 75) {
            setSimAlert({
              level: 'warning',
              team: 'QA Testing Team',
              nextTeam: 'CD Release Team',
              message: 'Heads-up: QA Pytest suites are wrapping up at 80%. CD Release Team ready Docker staging!',
              isPreHandoff: true,
            });
          } else {
            setSimAlert({
              level: 'info',
              team: 'QA Testing Team',
              nextTeam: 'CD Release Team',
              message: 'All 112 unit & integration tests executing in parallel.',
              isPreHandoff: false,
            });
          }
        } else if (next < 100) {
          setSimStage('deploy');
          setSimAlert({
            level: 'info',
            team: 'CD Release Team',
            nextTeam: 'Production',
            message: 'Building Docker container image and preparing blue-green deployment.',
            isPreHandoff: false,
          });
        } else {
          clearInterval(simulationPollRef.current);
          simulationPollRef.current = null;
          setIsSimulating(false);
          setSimAlert({
            level: 'success',
            team: 'CD Release Team',
            nextTeam: 'Production Cluster',
            message: 'Pipeline finished with 100% success! Docker container live in production.',
            isPreHandoff: false,
          });
          fetchSummary(activeProject?.id);
          fetchRuns(activeProject?.id);
          return 100;
        }
        return next;
      });
    }, 1000);
  }, [activeProject, fetchSummary, fetchRuns]);

  const resetSimulation = useCallback(() => {
    if (simulationPollRef.current) {
      clearInterval(simulationPollRef.current);
      simulationPollRef.current = null;
    }
    setIsSimulating(false);
    setSimPercent(100);
    setSimStage('deploy');
    setSimAlert(null);
  }, []);

  useEffect(() => {
    return () => {
      if (simulationPollRef.current) clearInterval(simulationPollRef.current);
    };
  }, []);

  return (
    <ThemeAndProjectContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
        user,
        isAuthenticated,
        login,
        logout,
        toggleGithubConnection,
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        openWorkspace,
        cloneWorkspace,
        activeTab,
        setActiveTab,
        isAiCopilotOpen,
        toggleAiCopilot,
        closeAiCopilot,
        openAiCopilot,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        closeSidebar,
        projects,
        activeProject,
        setActiveProject,
        summaryData,
        fetchSummary,
        runs,
        setRuns,
        runsLoading,
        fetchRuns,
        selectedRun,
        setSelectedRun: selectRunAndFetchError,
        isGitDrawerOpen,
        setIsGitDrawerOpen,
        toggleGitDrawer,
        logsModal,
        openLogsModal,
        closeLogsModal,
        isSimulating,
        simPercent,
        simStage,
        simAlert,
        startSimulation,
        resetSimulation,
        getRoleTeamForPercent,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ThemeAndProjectContext.Provider>
  );
}

export function useThemeAndProject() {
  const context = useContext(ThemeAndProjectContext);
  if (!context) {
    throw new Error('useThemeAndProject must be used within a ThemeAndProjectProvider');
  }
  return context;
}
