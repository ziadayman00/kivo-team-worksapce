import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateWorkspacePage } from './CreateWorkspacePage';
import { apiClient } from '../lib/api';

describe('CreateWorkspacePage Component', () => {
  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  it('renders workspace creation form with name input and slug preview', () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <CreateWorkspacePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: /create a new workspace/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/workspace name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create workspace/i })).toBeInTheDocument();
  });

  it('submits workspace creation successfully', async () => {
    const mockCreate = vi.spyOn(apiClient.workspaces, 'create').mockResolvedValue({
      status: 'success',
      data: {
        workspace: {
          id: 'ws_new',
          name: 'Acme Space',
          slug: 'acme-space',
          status: 'ACTIVE',
          role: 'OWNER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <CreateWorkspacePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/workspace name/i), {
      target: { value: 'Acme Space' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create workspace/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Acme Space',
        slug: 'acme-space',
      });
    });
  });

  it('displays error alert when creation fails', async () => {
    vi.spyOn(apiClient.workspaces, 'create').mockRejectedValue(
      new Error('Workspace slug is already in use.'),
    );

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <CreateWorkspacePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/workspace name/i), {
      target: { value: 'Acme Space' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create workspace/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/already in use/i);
    });
  });
});
