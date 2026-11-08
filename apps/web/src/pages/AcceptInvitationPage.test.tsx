import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AcceptInvitationPage } from './AcceptInvitationPage';
import { apiClient } from '../lib/api';

describe('AcceptInvitationPage Component', () => {
  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  const fakeInvitation = {
    id: 'inv_123',
    email: 'bruce@wayne.com',
    role: 'ADMIN',
    workspace: {
      id: 'ws_789',
      name: 'Gotham City Lab',
      slug: 'gotham-lab',
    },
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  it('renders invalid invitation view when query fails', async () => {
    vi.spyOn(apiClient.auth, 'me').mockRejectedValue(new Error('Unauthorized'));
    vi.spyOn(apiClient.invitations, 'getByToken').mockRejectedValue(
      new Error('Invitation not found.'),
    );

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/invite/invalid-token']}>
          <Routes>
            <Route path="/invite/:token" element={<AcceptInvitationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired invitation/i)).toBeInTheDocument();
      expect(screen.getByText(/invitation not found/i)).toBeInTheDocument();
    });
  });

  it('prompts sign in when user is unauthenticated', async () => {
    vi.spyOn(apiClient.auth, 'me').mockRejectedValue(new Error('Unauthorized'));
    vi.spyOn(apiClient.invitations, 'getByToken').mockResolvedValue({
      status: 'success',
      data: { invitation: fakeInvitation },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/invite/valid-token-123']}>
          <Routes>
            <Route path="/invite/:token" element={<AcceptInvitationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/workspace invitation/i)).toBeInTheDocument();
      expect(screen.getByText('Gotham City Lab')).toBeInTheDocument();
      expect(screen.getByText(/sign in to accept/i)).toBeInTheDocument();
    });
  });

  it('shows email mismatch alert when authenticated user email does not match invitation', async () => {
    vi.spyOn(apiClient.auth, 'me').mockResolvedValue({
      status: 'success',
      data: {
        account: {
          id: 'usr_clark',
          email: 'clark@dailyplanet.com',
          displayName: 'Clark Kent',
        },
      },
    });
    vi.spyOn(apiClient.invitations, 'getByToken').mockResolvedValue({
      status: 'success',
      data: { invitation: fakeInvitation },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/invite/valid-token-123']}>
          <Routes>
            <Route path="/invite/:token" element={<AcceptInvitationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/email mismatch/i)).toBeInTheDocument();
      expect(screen.getByText(/clark@dailyplanet.com/i)).toBeInTheDocument();
    });
  });

  it('allows accepting invitation when authenticated with matching email', async () => {
    vi.spyOn(apiClient.auth, 'me').mockResolvedValue({
      status: 'success',
      data: {
        account: {
          id: 'usr_bruce',
          email: 'bruce@wayne.com',
          displayName: 'Bruce Wayne',
        },
      },
    });
    vi.spyOn(apiClient.invitations, 'getByToken').mockResolvedValue({
      status: 'success',
      data: { invitation: fakeInvitation },
    });
    const mockAccept = vi.spyOn(apiClient.invitations, 'accept').mockResolvedValue({
      status: 'success',
      data: {
        workspace: fakeInvitation.workspace,
        role: 'ADMIN',
      },
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/invite/valid-token-123']}>
          <Routes>
            <Route path="/invite/:token" element={<AcceptInvitationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/signed in as bruce@wayne.com/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /accept & join workspace/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /accept & join workspace/i }));

    await waitFor(() => {
      expect(mockAccept).toHaveBeenCalledWith('valid-token-123');
    });
  });
});
