
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PasswordRecoveryForm } from '../PasswordRecoveryForm';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockOnBack = jest.fn();

describe('PasswordRecoveryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders password recovery form correctly', () => {
    render(<PasswordRecoveryForm onBack={mockOnBack} />);
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
  });

  it('shows error when student ID is empty', async () => {
    render(<PasswordRecoveryForm onBack={mockOnBack} />);
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
    });
  });

  it('calls Supabase function on form submission', async () => {
    const mockInvoke = jest.fn().mockResolvedValue({
      data: { email: 'test@example.com' },
      error: null,
    });
    (supabase.functions.invoke as jest.Mock) = mockInvoke;

    render(<PasswordRecoveryForm onBack={mockOnBack} />);
    
    const studentIdInput = screen.getByLabelText(/student id/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    
    fireEvent.change(studentIdInput, { target: { value: 'STU001' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('forgot-password', {
        body: { studentId: 'STU001' }
      });
    });
  });

  it('shows success message after successful submission', async () => {
    const mockInvoke = jest.fn().mockResolvedValue({
      data: { email: 'te**@example.com' },
      error: null,
    });
    (supabase.functions.invoke as jest.Mock) = mockInvoke;

    render(<PasswordRecoveryForm onBack={mockOnBack} />);
    
    const studentIdInput = screen.getByLabelText(/student id/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    
    fireEvent.change(studentIdInput, { target: { value: 'STU001' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email Sent')).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', () => {
    render(<PasswordRecoveryForm onBack={mockOnBack} />);
    
    const backButton = screen.getByRole('button', { name: /back to login/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });
});
