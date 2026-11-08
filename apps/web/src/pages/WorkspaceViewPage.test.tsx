import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceViewPage } from './WorkspaceViewPage';
import { apiClient } from '../lib/api';

describe('WorkspaceViewPage Component', () => {
  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  const fakeWorkspace = {
    id: 'ws_789',
    name: 'Gotham City Lab',
    slug: 'gotham-lab',
    status: 'ACTIVE',
    role: 'OWNER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders workspace profile and settings for owner', async () => {
    vi.spyOn(apiClient.workspaces, 'getBySlug').mockResolvedValue({
      status: 'success',
      data: { workspace: fakeWorkspace },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/workspaces/gotham-lab']}>
          <Routes>
            <Route path="/workspaces/:workspaceSlug" element={<WorkspaceViewPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Gotham City Lab' }),
      ).toBeInTheDocument();
      expect(screen.getByText('/gotham-lab')).toBeInTheDocument();
      expect(screen.getAllByText('OWNER').length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByRole('heading', { name: /workspace profile settings/i }),
      ).toBeInTheDocument();
    });
  });

  it('updates workspace name when saved by owner', async () => {
    vi.spyOn(apiClient.workspaces, 'getBySlug').mockResolvedValue({
      status: 'success',
      data: { workspace: fakeWorkspace },
    });

    const mockUpdate = vi.spyOn(apiClient.workspaces, 'update').mockResolvedValue({
      status: 'success',
      data: {
        workspace: {
          ...fakeWorkspace,
          name: 'Wayne Manor Lab',
        },
      },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/workspaces/gotham-lab']}>
          <Routes>
            <Route path="/workspaces/:workspaceSlug" element={<WorkspaceViewPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Gotham City Lab' }),
      ).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/workspace name/i);
    fireEvent.change(input, { target: { value: 'Wayne Manor Lab' } });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('gotham-lab', { name: 'Wayne Manor Lab' });
      expect(screen.getByRole('status')).toHaveTextContent(/updated successfully/i);
    });
  });

  it('renders error state when user has no access (403)', async () => {
    vi.spyOn(apiClient.workspaces, 'getBySlug').mockRejectedValue(
      new Error('You do not have access to this workspace.'),
    );

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/workspaces/restricted-lab']}>
          <Routes>
            <Route path="/workspaces/:workspaceSlug" element={<WorkspaceViewPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/do not have access/i);
      expect(screen.getByRole('link', { name: /return to dashboard/i })).toBeInTheDocument();
    });
  });
});
