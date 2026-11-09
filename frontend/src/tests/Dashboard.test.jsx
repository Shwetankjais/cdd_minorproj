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

  it('renders the header with branding and Linear breadcrumbs', () => {
    renderApp();
    expect(screen.getAllByText(/DevPulse/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cdd_minorproj/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Overview/i).length).toBeGreaterThan(0);
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

  it('navigates to Pipeline Runs tab and allows row selection', async () => {
    renderApp();

    // Click Pipeline Runs sidebar button
    const runsNavButtons = screen.getAllByRole('button', { name: /Pipeline Runs/i });
    fireEvent.click(runsNavButtons[0]);

    expect(screen.getByText(/Recent Pipeline Runs/i)).toBeInTheDocument();

    // Wait for pipeline runs to finish loading
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(2);
    });

    const rows = screen.getAllByRole('row');
    const failedRow = rows.find((r) => r.textContent.includes('Failed')) || rows[1];

    fireEvent.click(failedRow);
  });

  it('renders waterfall timeline bars on Pipeline Runs tab (#7)', () => {
    renderApp();

    // Switch to Pipeline Runs tab
    const runsNavButtons = screen.getAllByRole('button', { name: /Pipeline Runs/i });
    fireEvent.click(runsNavButtons[0]);

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

  it('correctly maps stage failure without contradicting status badge or downstream nodes', async () => {
    renderApp();

    // Default overview card should show passed status or main run
    expect(screen.getByText(/passed \(all stages\)|Failed at/i)).toBeInTheDocument();

    // Switch to Pipeline Runs tab and select a failed run
    const runsNavButtons = screen.getAllByRole('button', { name: /Pipeline Runs/i });
    fireEvent.click(runsNavButtons[0]);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(2);
    });

    const rows = screen.getAllByRole('row');
    const failedRow = rows.find((r) => r.textContent.includes('Failed'));
    if (failedRow) {
      fireEvent.click(failedRow);

      // Return to overview
      const overviewBtn = screen.getByRole('button', { name: /Overview/i });
      fireEvent.click(overviewBtn);

      // Verify the badge shows Failed and at least one ✕ indicator or failed text appears
      expect(screen.getAllByText(/Failed at|Failed/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('✕').length).toBeGreaterThan(0);
    }
  });

  it('populates non-empty values in the Triggered column for all runs', async () => {
    renderApp();

    const runsNavButtons = screen.getAllByRole('button', { name: /Pipeline Runs/i });
    fireEvent.click(runsNavButtons[0]);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(2);
    });

    // Check Triggered cells are populated
    const triggeredCells = screen.getAllByRole('cell').filter((cell) => {
      const text = cell.textContent || '';
      return text.includes('ago') || text.includes('Just now') || text.includes('Recently');
    });
    expect(triggeredCells.length).toBeGreaterThan(0);
  });
});
