import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';

// Mock the auth context
const mockSignIn = jest.fn();
const mockToggleSignup = jest.fn();

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByLabelText, getByRole, getByText } = render(
      <MemoryRouter>
        <LoginForm onToggleSignup={mockToggleSignup} />
      </MemoryRouter>
    );
    
    expect(getByLabelText(/student id/i)).toBeInTheDocument();
    expect(getByLabelText(/password/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('calls toggle function when create account link is clicked', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <LoginForm onToggleSignup={mockToggleSignup} />
      </MemoryRouter>
    );
    
    const createAccountButton = getByRole('button', { name: /create account/i });
    createAccountButton.click();
    
    expect(mockToggleSignup).toHaveBeenCalled();
  });

  it('renders form fields with correct attributes', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <LoginForm onToggleSignup={mockToggleSignup} />
      </MemoryRouter>
    );
    
    const studentIdInput = getByLabelText(/student id/i);
    const passwordInput = getByLabelText(/password/i);
    
    expect(studentIdInput).toHaveAttribute('type', 'text');
    expect(studentIdInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('renders submit button with correct text', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <LoginForm onToggleSignup={mockToggleSignup} />
      </MemoryRouter>
    );
    
    const submitButton = getByRole('button', { name: /sign in/i });
    expect(submitButton).toHaveTextContent('Sign In');
  });
}); 