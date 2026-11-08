import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders login screen when user session is not authenticated', async () => {
    // Mock fetch for /api/v1/auth/me to return 401 unauthorized
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Unauthorized' }),
    } as Response);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to kivo/i })).toBeInTheDocument();
    });
  });
});
