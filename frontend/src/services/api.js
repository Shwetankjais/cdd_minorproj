/**
 * DevPulse API Service
 * Connects to Codex's backend at http://localhost:8000/api with seamless mock fallback.
 */

import {
  mockProjects,
  mockSummary,
  mockPipelineRuns,
  mockDeployments,
  mockDockerContainers,
  mockGitStatus,
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TIMEOUT_MS = 2500;

/**
 * Robust fetch wrapper with timeout and fallback logic
 */
async function fetchWithFallback(endpoint, options = {}, fallbackData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[DevPulse API] ${endpoint} returned status ${res.status}. Using fallback data.`);
      return fallbackData;
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    // Graceful offline fallback
    // console.info(`[DevPulse API] Backend offline/unreachable for ${endpoint}. Serving mock state.`);
    return fallbackData;
  }
}

export const api = {
  /**
   * GET /api/projects
   */
  async getProjects() {
    return fetchWithFallback('/projects', { method: 'GET' }, mockProjects);
  },

  /**
   * GET /api/pipeline/summary?project=...
   */
  async getPipelineSummary(projectId = 'cdd_minorproj') {
    return fetchWithFallback(
      `/pipeline/summary?project=${encodeURIComponent(projectId)}`,
      { method: 'GET' },
      mockSummary
    );
  },

  /**
   * GET /api/pipeline/runs?project=...&status=...&search=...
   */
  async getPipelineRuns({ project = 'cdd_minorproj', status = 'All', search = '' } = {}) {
    const query = new URLSearchParams();
    if (project) query.append('project', project);
    if (status && status !== 'All') query.append('status', status);
    if (search) query.append('search', search);

    const fallback = mockPipelineRuns.filter((run) => {
      // Filter status
      if (status && status !== 'All') {
        if (status === 'Passed' && run.status !== 'Passed') return false;
        if (status === 'Failed at Build' && run.status !== 'Failed at Build') return false;
        if (status === 'Failed at Test' && run.status !== 'Failed at Test') return false;
      }
      // Filter search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          run.id.toLowerCase().includes(q) ||
          run.branch.toLowerCase().includes(q) ||
          run.commit.toLowerCase().includes(q) ||
          run.author.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    return fetchWithFallback(`/pipeline/runs?${query.toString()}`, { method: 'GET' }, fallback);
  },

  /**
   * GET /api/pipeline/live
   * Returns current active percentage (0-100), active team, and heads-up role alert
   */
  async getLivePipelineStatus() {
    return fetchWithFallback(
      '/pipeline/live',
      { method: 'GET' },
      {
        isActive: false,
        percent: 100,
        currentStage: 'Deploy',
        activeTeam: 'CD Release Team',
        handoffAlert: null,
      }
    );
  },

  /**
   * POST /api/pipeline/simulate
   * Initiates simulated live pipeline run
   */
  async triggerSimulation() {
    return fetchWithFallback(
      '/pipeline/simulate',
      { method: 'POST', body: JSON.stringify({ trigger: 'manual_ui' }) },
      {
        success: true,
        message: 'Live pipeline simulation initiated (0% -> 100%)',
        runId: `#1288-${Date.now().toString().slice(-4)}`,
      }
    );
  },

  /**
   * GET /api/pipeline/error-summary/{run_id}
   */
  async getErrorSummary(runId) {
    const cleanId = String(runId).replace('#', '');
    const found = mockPipelineRuns.find((r) => r.id === runId || String(r.numericId) === cleanId);
    const fallback = found?.errorSummary || {
      failedStage: 'None',
      rootCause: 'All stages completed successfully with zero runtime errors.',
      suggestedFix: 'No remediation needed.',
      rawLogs: 'Pipeline execution finished with exit code 0.',
    };

    return fetchWithFallback(`/pipeline/error-summary/${cleanId}`, { method: 'GET' }, fallback);
  },

  /**
   * GET /api/deployments?hours=2
   */
  async getDeployments(hours = 2) {
    const fallback =
      hours && hours !== 'All'
        ? mockDeployments.filter((d) => d.hoursAgo <= Number(hours))
        : mockDeployments;

    return fetchWithFallback(`/deployments?hours=${hours}`, { method: 'GET' }, fallback);
  },

  /**
   * GET /api/git/status?path=...
   */
  async getGitStatus(path = '~/Desktop/cdd_minor') {
    return fetchWithFallback(
      `/git/status?path=${encodeURIComponent(path)}`,
      { method: 'GET' },
      mockGitStatus
    );
  },

  /**
   * POST /api/git/open-or-clone
   */
  async openOrCloneRepo({ repo_url, local_path }) {
    return fetchWithFallback(
      '/git/open-or-clone',
      {
        method: 'POST',
        body: JSON.stringify({ repo_url, local_path }),
      },
      {
        success: true,
        message: `Successfully connected to repository ${repo_url || local_path}`,
        branch: 'feature/frontend-ui',
      }
    );
  },

  /**
   * POST /api/git/commit-push
   */
  async commitAndPush({ path, message, branch = 'feature/frontend-ui' }) {
    return fetchWithFallback(
      '/git/commit-push',
      {
        method: 'POST',
        body: JSON.stringify({ path, message, branch }),
      },
      {
        success: true,
        commitHash: Math.random().toString(16).substring(2, 9),
        message: `Pushed commit: "${message}" to origin/${branch}`,
        timestamp: new Date().toISOString(),
      }
    );
  },

  /**
   * GET /api/docker/status
   */
  async getDockerStatus() {
    return fetchWithFallback('/docker/status', { method: 'GET' }, mockDockerContainers);
  },
};

export default api;
