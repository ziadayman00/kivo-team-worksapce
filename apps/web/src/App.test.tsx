import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders KIVO heading and initialized status', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /kivo/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('app-status')).toHaveTextContent('Status: Initialized');
  });
});
