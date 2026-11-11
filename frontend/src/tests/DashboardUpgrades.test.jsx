import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { ThemeAndProjectProvider } from '../context/ThemeAndProjectContext';

function renderApp() {
  return render(
    <ThemeAndProjectProvider>
      <App />
    </ThemeAndProjectProvider>
  );
}

describe('DevPulse Upgrades: Auth Gate, Workspace Hub & AI Copilot', () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState({}, '', '/');
    }
  });

  it('renders the AI Copilot toggle button and opens the copilot sidebar', () => {
    renderApp();
    const copilotBtn = screen.getByLabelText(/Toggle DevPulse Copilot/i);
    expect(copilotBtn).toBeInTheDocument();

    fireEvent.click(copilotBtn);

    // AI Copilot should now be open
    expect(screen.getAllByText(/DevPulse Copilot/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Good to see you/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate Live Pipeline \(0-100%\)/i)).toBeInTheDocument();
  });

  it('navigates to Workspaces & Repo Hub view', () => {
    renderApp();
    const workspaceNavBtn = screen.getAllByRole('button', { name: /Workspaces/i })[0];
    fireEvent.click(workspaceNavBtn);

    expect(screen.getByText(/DevPulse Collaborative Workspace Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Folder/i)).toBeInTheDocument();
    expect(screen.getByText(/Clone Repository/i)).toBeInTheDocument();
    expect(screen.getAllByText(/cdd_minor/i).length).toBeGreaterThan(0);
  });

  it('supports logout to AuthLoginView and quick demo reconnect', async () => {
    renderApp();

    // Open user profile dropdown
    const profileBtn = screen.getByLabelText(/User profile menu/i);
    fireEvent.click(profileBtn);

    // Click Switch User / Logout
    const logoutBtn = screen.getByText(/Switch User \/ Logout/i);
    fireEvent.click(logoutBtn);

    // AuthLoginView should be visible after logout finishes
    await waitFor(() => {
      expect(screen.getByText('BUILD.')).toBeInTheDocument();
      expect(screen.getByText(/Quick Demo Connect/i)).toBeInTheDocument();
    });

    // Quick Connect back to dashboard
    const quickConnectBtn = screen.getByText(/Quick Demo Connect/i);
    fireEvent.click(quickConnectBtn);

    // Dashboard should be back
    await waitFor(() => {
      expect(screen.getAllByText(/cdd_minorproj/i).length).toBeGreaterThan(0);
    });
  });

  it('renders dynamic GitHub login gate with blank inputs and demo evaluator option', async () => {
    // Explicitly simulate logged out state
    localStorage.setItem('devpulse_logged_out', 'true');
    renderApp();

    expect(screen.getByText('BUILD.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your-github-username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo Evaluator Login \(Shwetankjais\)/i)).toBeInTheDocument();

    // Fill in a custom friend's username
    const usernameInput = screen.getByPlaceholderText(/your-github-username/i);
    fireEvent.change(usernameInput, { target: { value: 'octocat' } });
    expect(usernameInput.value).toBe('octocat');

    // Click connect
    const connectBtn = screen.getByRole('button', { name: /\$ connect --github/i });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      const session = localStorage.getItem('devpulse_auth_session');
      expect(session).toBeTruthy();
    });
  });

  it('strictly isolates repositories without cross-account leakage for non-Shwetank accounts', async () => {
    const { api } = await import('../services/api');

    // Test a non-author account (e.g. friend or octocat)
    const octocatProjects = await api.getProjects('octocat');
    expect(Array.isArray(octocatProjects)).toBe(true);

    // Ensure octocat's repository list contains ZERO occurrences of Shwetankjais repos
    const hasShwetankLeak = octocatProjects.some(
      (p) => (p.id || '').includes('Shwetankjais') || (p.lastAuthor || '').includes('Shwetank')
    );
    expect(hasShwetankLeak).toBe(false);

    // Ensure no fabricated mock repos like DevOps_Lab or AirScope_Delhi leak to octocat
    const hasFabricatedLeak = octocatProjects.some(
      (p) => (p.displayName === 'DevOps_Lab' && p.id?.startsWith('octocat/')) ||
             (p.displayName === 'AirScope_Delhi' && p.id?.startsWith('octocat/'))
    );
    expect(hasFabricatedLeak).toBe(false);
  });

  it('stores session_token and uses it for Authorization Bearer', async () => {
    const { api, getAuthHeaders } = await import('../services/api');

    localStorage.setItem('devpulse_session_token', 'real-backend-session-token-xyz');
    const headers = getAuthHeaders();
    expect(headers['Authorization']).toBe('Bearer real-backend-session-token-xyz');
  });

  it('renders application footer with 2026 copyright, tel link, and mailto link', () => {
    renderApp();

    expect(screen.getByText(/© 2026 DevPulse • Shwetank Jaiswal/i)).toBeInTheDocument();
    const telLink = screen.getByRole('link', { name: /\+91 98765 43210/i });
    expect(telLink).toHaveAttribute('href', 'tel:+919876543210');

    const mailLink = screen.getByRole('link', { name: /shwetankjaiswal@nie\.ac\.in/i });
    expect(mailLink).toHaveAttribute('href', 'mailto:shwetankjaiswal@nie.ac.in');
  });

  it('renders NotFoundView when mounted on an unknown path (e.g. /random-path)', () => {
    window.history.pushState({}, '', '/random-path');
    renderApp();

    expect(screen.getByText(/Pipeline Route Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTP 404 — Route Unmapped/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Overview Dashboard/i })).toBeInTheDocument();
  });

  it('resets path to / and sets active view to Overview when clicking Return to Overview Dashboard', () => {
    window.history.pushState({}, '', '/unrecognized-pipeline-slug');
    renderApp();

    expect(screen.getByText(/Pipeline Route Not Found/i)).toBeInTheDocument();

    const returnBtn = screen.getByRole('button', { name: /Return to Overview Dashboard/i });
    fireEvent.click(returnBtn);

    // Verify URL path is reset to '/'
    expect(window.location.pathname).toBe('/');

    // Verify Overview dashboard is now displayed
    expect(screen.getByText(/Total Builds/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Welcome to DevPulse/i).length).toBeGreaterThan(0);
  });
});
