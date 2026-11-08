import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from './DashboardPage';
import * as authContext from '../context/AuthContext';
import { apiClient } from '../lib/api';

describe('DashboardPage Component', () => {
  const fakeUser = {
    id: 'usr_test_123',
    email: 'charlie@kivo.test',
    displayName: 'Charlie Engineer',
  };

  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

  it('renders user details and status indicator', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: fakeUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refetchUser: vi.fn(),
    });

    vi.spyOn(apiClient.workspaces, 'list').mockResolvedValue({
      status: 'success',
      data: {
        workspaces: [
          {
            id: 'ws_alpha',
            name: 'Alpha Team',
            slug: 'alpha-team',
            status: 'ACTIVE',
            role: 'OWNER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'KIVO' })).toBeInTheDocument();
    expect(screen.getByTestId('app-status')).toHaveTextContent('Status: Initialized');
    expect(screen.getAllByText('Charlie Engineer').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('charlie@kivo.test')).toBeInTheDocument();
    expect(screen.getByText('usr_test_123')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
      expect(screen.getByText('/alpha-team')).toBeInTheDocument();
    });
  });

  it('handles logout action when clicked', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: fakeUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refetchUser: vi.fn(),
    });

    vi.spyOn(apiClient.workspaces, 'list').mockResolvedValue({
      status: 'success',
      data: { workspaces: [] },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
