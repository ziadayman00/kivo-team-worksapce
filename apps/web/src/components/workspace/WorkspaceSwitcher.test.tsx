import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { WorkspaceSwitcher, WorkspaceItem } from './WorkspaceSwitcher';

describe('WorkspaceSwitcher Component', () => {
  const mockWorkspaces: WorkspaceItem[] = [
    { id: 'ws_1', name: 'Alpha Squad', slug: 'alpha-squad', role: 'OWNER' },
    { id: 'ws_2', name: 'Beta Lab', slug: 'beta-lab', role: 'ADMIN' },
    { id: 'ws_3', name: 'Gamma Ops', slug: 'gamma-ops', role: 'MEMBER' },
  ];

  it('renders active workspace name and role badge', () => {
    render(
      <MemoryRouter>
        <WorkspaceSwitcher
          currentWorkspaceSlug="alpha-squad"
          accessibleWorkspaces={mockWorkspaces}
          currentRole="OWNER"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Alpha Squad')).toBeInTheDocument();
    expect(screen.getByText('OWNER')).toBeInTheDocument();
  });

  it('toggles dropdown menu on click and displays accessible workspaces', () => {
    render(
      <MemoryRouter>
        <WorkspaceSwitcher
          currentWorkspaceSlug="alpha-squad"
          accessibleWorkspaces={mockWorkspaces}
        />
      </MemoryRouter>,
    );

    const triggerBtn = screen.getByRole('button', { name: /switch workspace/i });
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(triggerBtn);
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');

    // Dropdown list visible
    expect(screen.getByText('Accessible Workspaces')).toBeInTheDocument();
    expect(screen.getByText('Beta Lab')).toBeInTheDocument();
    expect(screen.getByText('Gamma Ops')).toBeInTheDocument();
    expect(screen.getByText(/create new workspace/i)).toBeInTheDocument();
  });

  it('navigates to target workspace on click', () => {
    render(
      <MemoryRouter initialEntries={['/workspaces/alpha-squad']}>
        <Routes>
          <Route
            path="/workspaces/:slug"
            element={
              <WorkspaceSwitcher
                currentWorkspaceSlug="alpha-squad"
                accessibleWorkspaces={mockWorkspaces}
              />
            }
          />
          <Route path="/workspaces/beta-lab" element={<div>Navigated to Beta Lab</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /switch workspace/i }));

    const betaOption = screen.getByRole('menuitem', { name: /beta lab/i });
    fireEvent.click(betaOption);

    expect(screen.getByText('Navigated to Beta Lab')).toBeInTheDocument();
  });

  it('closes dropdown when Escape key is pressed', () => {
    render(
      <MemoryRouter>
        <WorkspaceSwitcher
          currentWorkspaceSlug="alpha-squad"
          accessibleWorkspaces={mockWorkspaces}
        />
      </MemoryRouter>,
    );

    const triggerBtn = screen.getByRole('button', { name: /switch workspace/i });
    fireEvent.click(triggerBtn);
    expect(screen.getByText('Accessible Workspaces')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Accessible Workspaces')).not.toBeInTheDocument();
  });
});
