import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './LandingPage';
import { AuthContext } from '../context/AuthContext';

describe('LandingPage Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderLandingPage = (authenticated = false) => {
    const mockAuthContext = {
      user: authenticated
        ? { id: 'usr_1', email: 'test@kivo.test', displayName: 'Test User' }
        : null,
      isLoading: false,
      isAuthenticated: Boolean(authenticated),
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      refetchUser: async () => {},
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContext}>
          <MemoryRouter initialEntries={['/']}>
            <LandingPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
  };

  it('renders hero headline, call to action, and visual badge', () => {
    renderLandingPage(false);

    expect(
      screen.getByRole('heading', { level: 1, name: /the team operating system/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /get started/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/kivo 1.0 modular monolith released/i)).toBeInTheDocument();
  });

  it('renders Bento Grid capabilities section', () => {
    renderLandingPage(false);

    expect(screen.getByText(/architecture meets craft/i)).toBeInTheDocument();
    expect(screen.getByText(/cycle-driven sprint & project velocity/i)).toBeInTheDocument();
    expect(screen.getByText(/provable tenant isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/real-time transactional outbox engine/i)).toBeInTheDocument();
  });

  it('allows interacting with the sandbox playground tabs', () => {
    renderLandingPage(false);

    // Initial state shows Live Sprint Board
    expect(screen.getByText(/interactive cycle board/i)).toBeInTheDocument();

    // Switch to contextual thread
    const threadTab = screen.getByRole('button', { name: /2. contextual thread/i });
    fireEvent.click(threadTab);
    expect(screen.getByText(/anchored thread: ticket #kiv-101/i)).toBeInTheDocument();

    // Switch to tenant switcher
    const tenantTab = screen.getByRole('button', { name: /3. tenant context switcher/i });
    fireEvent.click(tenantTab);
    expect(screen.getByText(/zero-latency tenant switcher/i)).toBeInTheDocument();
  });

  it('expands FAQ accordion item on click', () => {
    renderLandingPage(false);

    const faqButton = screen.getByRole('button', {
      name: /why a modular monolith instead of microservices/i,
    });
    fireEvent.click(faqButton);

    expect(
      screen.getByText(/microservices introduce severe distributed systems tax/i),
    ).toBeInTheDocument();
  });

  it('displays "Launch App" when user is authenticated in Navbar', () => {
    renderLandingPage(true);

    expect(screen.getAllByRole('link', { name: /launch app/i }).length).toBeGreaterThanOrEqual(1);
  });
});
