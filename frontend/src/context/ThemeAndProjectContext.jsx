import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { mockProjects, mockPipelineRuns } from '../services/mockData';

const ThemeAndProjectContext = createContext(null);

export function ThemeAndProjectProvider({ children }) {
  // 1. Theme State (Default to Dark Mode as per enterprise CI/CD dashboard)
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

  // 2. Project State
  const [projects, setProjects] = useState(mockProjects);
  const [activeProject, setActiveProject] = useState(mockProjects[0]);

  useEffect(() => {
    api.getProjects().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
        const current = data.find((p) => p.isCurrent) || data[0];
        setActiveProject(current);
      }
    });
  }, []);

  // 3. Selected Run State (for dynamic row clicking)
  const [runs, setRuns] = useState(mockPipelineRuns);
  const [selectedRun, setSelectedRun] = useState(mockPipelineRuns[0]);

  // 4. Source Control / Git Drawer state
  const [isGitDrawerOpen, setIsGitDrawerOpen] = useState(false);
  const toggleGitDrawer = useCallback(() => {
    setIsGitDrawerOpen((prev) => !prev);
  }, []);

  // 5. Raw Logs Modal State
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

  // 6. Live Simulation State (0% -> 100% with Role Handoff Pre-Notifications)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPercent, setSimPercent] = useState(100); // 100% completed by default
  const [simStage, setSimStage] = useState('deploy'); // 'build', 'test', 'docker', 'deploy'
  const [simAlert, setSimAlert] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'QA Testing Handover Ready',
      message: 'Run #1287 completed Build stage cleanly. QA test suites triggered.',
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

  const simulationIntervalRef = useRef(null);

  // Helper to determine active team by percentage
  const getRoleTeamForPercent = useCallback((p) => {
    if (p < 25) return { role: 'Dev Team', task: 'Source Push & Validation', range: '0–25%' };
    if (p < 50) return { role: 'CI Team', task: 'Build & Compilation', range: '25–50%' };
    if (p < 80) return { role: 'QA Testing Team', task: 'Pytest & Vitest Suites', range: '50–80%' };
    return { role: 'CD Release Team', task: 'Docker & Production Rollout', range: '80–100%' };
  }, []);

  const startSimulation = useCallback(() => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

    setIsSimulating(true);
    setSimPercent(0);
    setSimStage('build');
    setSimAlert({
      level: 'info',
      message: 'Dev Team pushed commit 121fac2 to origin/main. Initiating CI pipeline.',
      team: 'Dev Team',
      nextTeam: 'CI Team',
    });

    let currentP = 0;
    simulationIntervalRef.current = setInterval(() => {
      currentP += 2;

      if (currentP <= 100) {
        setSimPercent(currentP);

        // Update active stage
        if (currentP < 25) {
          setSimStage('build');
        } else if (currentP < 50) {
          setSimStage('test');
        } else if (currentP < 80) {
          setSimStage('docker');
        } else {
          setSimStage('deploy');
        }

        // Pre-notification alerts at >= 75-80% thresholds
        if (currentP >= 42 && currentP <= 48) {
          setSimAlert({
            level: 'warning',
            message: 'Heads-Up Role Handoff: CI Team build is at 45% (wrapping up). QA Testing Team, prepare Pytest/Vitest suites!',
            team: 'CI Team',
            nextTeam: 'QA Testing Team',
            isPreHandoff: true,
          });
        } else if (currentP >= 74 && currentP <= 80) {
          setSimAlert({
            level: 'warning',
            message: 'Heads-Up Role Handoff: QA Testing is at 78% passing. CD Release Team standby for Docker container packaging and k8s canary rollout!',
            team: 'QA Testing Team',
            nextTeam: 'CD Release Team',
            isPreHandoff: true,
          });
        } else if (currentP === 100) {
          setSimAlert({
            level: 'success',
            message: 'Pipeline Execution Completed! All stages passed. Version v1.4.1 deployed to Production.',
            team: 'CD Release Team',
            nextTeam: 'All Systems Operational',
            isPreHandoff: false,
          });

          // Add a fresh notification
          setNotifications((prev) => [
            {
              id: `sim-${Date.now()}`,
              title: 'Live Pipeline Simulation Completed',
              message: 'Live run reached 100% with all automated checks passing.',
              time: 'Just now',
              read: false,
              team: 'CD Release Team',
            },
            ...prev,
          ]);

          setIsSimulating(false);
          clearInterval(simulationIntervalRef.current);
        }
      }
    }, 180); // ~9 seconds for smooth full simulation
  }, []);

  const resetSimulation = useCallback(() => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
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
        projects,
        activeProject,
        setActiveProject,
        runs,
        setRuns,
        selectedRun,
        setSelectedRun,
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

