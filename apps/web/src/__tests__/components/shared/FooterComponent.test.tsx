import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FooterComponent } from '../../../components/shared/FooterComponent';

describe('FooterComponent', () => {
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <FooterComponent />
      </MemoryRouter>,
    );

  it('renders newsletter section', () => {
    renderComponent();
    expect(
      screen.getByText('Stay updated with new releases'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /subscribe/i }),
    ).toBeInTheDocument();
  });

  it('renders main link sections', () => {
    renderComponent();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders expected links', () => {
    renderComponent();

    // Explore
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Books' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Categories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();

    // Support
    expect(
      screen.getByRole('link', { name: 'Help Center' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'FAQ' })).toBeInTheDocument();

    // Account
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Create Account' }),
    ).toBeInTheDocument();
  });

  it('renders default social links', () => {
    renderComponent();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
  });

  it('renders default footer text from settings', () => {
    renderComponent();
    expect(
      screen.getByText('© 2026 Folio. All rights reserved.'),
    ).toBeInTheDocument();
  });
});
