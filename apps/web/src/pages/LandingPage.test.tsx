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
          <MemoryRouter initialEntries={['/landing']}>
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
    expect(
      screen.getAllByRole('link', { name: /initialize workspace/i }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/system architecture specification/i)).toBeInTheDocument();
  });

  it('renders Numbered Showcase editorial sections (01, 02, 03)', () => {
    renderLandingPage(false);

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText(/sprint velocity driven by provable math/i)).toBeInTheDocument();

    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText(/conversations anchored directly to code/i)).toBeInTheDocument();

    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText(/provable multi-tenant boundary isolation/i)).toBeInTheDocument();
  });

  it('renders Rhythm Shift Manifesto and boundary rules', () => {
    renderLandingPage(false);

    expect(screen.getByText(/the way teams build software is fractured/i)).toBeInTheDocument();
    expect(screen.getByText(/kivo strictly bounded monolith/i)).toBeInTheDocument();
    expect(screen.getByText(/no cross-module internals/i)).toBeInTheDocument();
    expect(screen.getByText(/no cross-persistence access/i)).toBeInTheDocument();
  });

  it('renders Telemetry Ticker and metrics', () => {
    renderLandingPage(false);

    expect(screen.getByText(/system telemetry & verification/i)).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('38/38')).toBeInTheDocument();
  });

  it('renders Comparison Matrix and ROI Calculator', () => {
    renderLandingPage(false);

    expect(screen.getByText(/stop paying the fragmentation tax/i)).toBeInTheDocument();
    expect(screen.getByText(/calculate your team's reclaimed velocity/i)).toBeInTheDocument();
  });

  it('allows switching files and running boundary verification in Code Studio', () => {
    renderLandingPage(false);

    expect(screen.getByText(/inspect the concrete engineering/i)).toBeInTheDocument();
    const serviceTab = screen.getByRole('button', { name: /workspace\.service\.ts/i });
    fireEvent.click(serviceTab);

    expect(screen.getByText(/acceptinvitation/i)).toBeInTheDocument();

    const verifyBtn = screen.getByRole('button', { name: /verify boundaries/i });
    fireEvent.click(verifyBtn);
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
