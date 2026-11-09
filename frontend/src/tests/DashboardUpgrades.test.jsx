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
    const workspaceNavBtn = screen.getByRole('button', { name: /Workspaces/i });
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
      expect(screen.getByText(/cdd_minorproj/i)).toBeInTheDocument();
    });
  });
});
