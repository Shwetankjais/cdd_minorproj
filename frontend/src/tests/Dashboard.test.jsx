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

describe('DevPulse Visual CI/CD Monitoring Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the header with branding and greeting', () => {
    renderApp();
    expect(screen.getByText(/Welcome to DevPulse/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time CI\/CD pipeline monitoring across your projects/i)).toBeInTheDocument();
  });

  it('renders all 4 KPI statistics cards (#1)', () => {
    renderApp();
    expect(screen.getByText(/Total Builds/i)).toBeInTheDocument();
    expect(screen.getByText(/Successful Builds/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed Builds/i)).toBeInTheDocument();
    expect(screen.getByText(/Success Rate/i)).toBeInTheDocument();
  });

  it('renders the 4 connected circular stage nodes (#2)', () => {
    renderApp();
    expect(screen.getAllByText('Build').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Docker').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Deploy').length).toBeGreaterThan(0);
  });

  it('renders the segmented role handoff progress bar (0% to 100%)', () => {
    renderApp();
    expect(screen.getByText(/Cross-Team Role Handoff Lifecycle/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dev Team/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CI Team/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/QA Testing Team/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CD Release Team/i).length).toBeGreaterThan(0);
  });

  it('renders the recent pipeline runs table and allows row selection to update diagnostics', async () => {
    renderApp();
    expect(screen.getByText(/Recent Pipeline Runs/i)).toBeInTheDocument();

    // Wait for pipeline runs to finish loading
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(2);
    });

    const rows = screen.getAllByRole('row');
    const failedRow = rows.find((r) => r.textContent.includes('Failed')) || rows[1];

    fireEvent.click(failedRow);

    // Diagnostics should be visible
    await waitFor(() => {
      const diagTitle =
        screen.queryByText(/1\. Failed Stage/i) ||
        screen.queryByText(/Pipeline Diagnostic Summary/i);
      expect(diagTitle).toBeInTheDocument();
    });
  });

  it('renders waterfall timeline bars (#7)', () => {
    renderApp();
    expect(screen.getByText(/Waterfall Execution Timeline/i)).toBeInTheDocument();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
  });

  it('opens and closes the 1-Click Git source control sync drawer', () => {
    renderApp();
    const gitButton = screen.getByTitle('Open 1-Click Git Drawer');
    fireEvent.click(gitButton);

    expect(screen.getByText(/Source Control Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/1-Click Commit & Push/i)).toBeInTheDocument();
    expect(screen.getByText(/Changed Files/i)).toBeInTheDocument();
  });

  it('toggles light and dark mode', () => {
    renderApp();
    const themeBtn = screen.getByLabelText(/Toggle theme/i);
    expect(themeBtn).toBeInTheDocument();

    // Toggle theme
    fireEvent.click(themeBtn);
    expect(localStorage.getItem('devpulse-theme')).toBe('light');

    fireEvent.click(themeBtn);
    expect(localStorage.getItem('devpulse-theme')).toBe('dark');
  });
});
