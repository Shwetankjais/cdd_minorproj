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

  // 2. Responsive Mobile / Narrow Sidebar State (Requirement #3)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // 3. Project Selection State
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

  // 4. Live Pipeline Summary & KPI Statistics State
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

  // 5. Live Pipeline Runs State
  const [runs, setRuns] = useState(mockPipelineRuns);
  const [selectedRun, setSelectedRun] = useState(mockPipelineRuns[0]);
  const [runsLoading, setRunsLoading] = useState(false);

  const fetchRuns = useCallback(async (projectId, status = 'All', search = '') => {
    setRunsLoading(true);
    try {
      const data = await api.getPipelineRuns({ project: projectId, status, search });
      if (Array.isArray(data) && data.length > 0) {
        setRuns(data);
        // Default selectedRun to the first run if none selected or if project switched
        setSelectedRun((prev) => {
          const match = data.find((r) => r.id === prev?.id || r.rawId === prev?.rawId);
          return match || data[0];
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

  // 6. Source Control / Git Drawer state
  const [isGitDrawerOpen, setIsGitDrawerOpen] = useState(false);
  const toggleGitDrawer = useCallback(() => {
    setIsGitDrawerOpen((prev) => !prev);
  }, []);

  // 7. Raw Logs Modal State
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

  // 8. Live Simulation State connected to POST /api/pipeline/simulate & GET /api/pipeline/live
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
    if (p < 80) return { role: 'QA Testing Team', task: 'Pytest & Vitest Suites', range: '50–80%' };
    return { role: 'CD Release Team', task: 'Docker & Production Rollout', range: '80–100%' };
  }, []);

  // Trigger live simulation on backend and poll /api/pipeline/live
  const startSimulation = useCallback(async () => {
    if (simulationPollRef.current) clearInterval(simulationPollRef.current);

    setIsSimulating(true);
    setSimPercent(0);
    setSimStage('build');
    setSimAlert({
      level: 'info',
      message: `Triggering live pipeline simulation on ${activeProject?.displayName || 'project'}.`,
      team: 'Dev Team',
      nextTeam: 'CI Team',
    });

    try {
      await api.triggerSimulation(activeProject?.id, 1.0);
    } catch {
      // continue with client progression if offline
    }

    let pollCount = 0;
    simulationPollRef.current = setInterval(async () => {
      pollCount++;
      try {
        const liveStatus = await api.getLivePipelineStatus(activeProject?.id);

        if (liveStatus) {
          const currentP = Math.min(100, liveStatus.percent);
          setSimPercent(currentP);

          if (currentP < 25) setSimStage('build');
          else if (currentP < 50) setSimStage('test');
          else if (currentP < 80) setSimStage('docker');
          else setSimStage('deploy');

          if (liveStatus.handoffAlert) {
            setSimAlert(liveStatus.handoffAlert);
          } else if (currentP >= 75 && currentP < 85) {
            setSimAlert({
              level: 'warning',
              message: 'Heads-Up Role Handoff: QA Testing is at 78% passing. CD Release Team standby for Docker container packaging and rollout!',
              team: 'QA Testing Team',
              nextTeam: 'CD Release Team',
              isPreHandoff: true,
            });
          }

          if (liveStatus.isFinished || currentP >= 100 || pollCount > 30) {
            clearInterval(simulationPollRef.current);
            setIsSimulating(false);
            setSimPercent(100);
            setSimStage('deploy');
            setSimAlert({
              level: 'success',
              message: 'Pipeline Execution Completed! All stages passed. Version deployed to Production.',
              team: 'CD Release Team',
              nextTeam: 'All Systems Operational',
              isPreHandoff: false,
            });

            // Refetch summary & runs so new run appears immediately
            fetchSummary(activeProject?.id);
            fetchRuns(activeProject?.id);
          }
        }
      } catch {
        // Stop on error
        clearInterval(simulationPollRef.current);
        setIsSimulating(false);
        setSimPercent(100);
      }
    }, 1000);
  }, [activeProject, fetchSummary, fetchRuns]);

  const resetSimulation = useCallback(() => {
    if (simulationPollRef.current) clearInterval(simulationPollRef.current);
    setIsSimulating(false);
    setSimPercent(100);
    setSimStage('deploy');
    setSimAlert(null);
  }, []);

  return (
    <ThemeAndProjectContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
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
