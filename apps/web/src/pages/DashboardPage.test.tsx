import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import * as authContext from '../context/AuthContext';

describe('DashboardPage Component', () => {
  const fakeUser = {
    id: 'usr_test_123',
    email: 'charlie@kivo.test',
    displayName: 'Charlie Engineer',
  };

  it('renders user details and status indicator', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: fakeUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refetchUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'KIVO' })).toBeInTheDocument();
    expect(screen.getByTestId('app-status')).toHaveTextContent('Status: Initialized');
    expect(screen.getAllByText('Charlie Engineer').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('charlie@kivo.test')).toBeInTheDocument();
    expect(screen.getByText('usr_test_123')).toBeInTheDocument();
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

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
