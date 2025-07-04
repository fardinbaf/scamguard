import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { requestPasswordReset } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

type View = 'login' | 'forgotPassword';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [view, setView] = useState<View>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const authData = await login({ identifier, password });
      
      if (authData.user && authData.session) {
        // Successful login with an active session
        handleClose(); 
      } else if (authData.user && !authData.session) {
        // This case handles users who have signed up but not confirmed their email yet.
        setError('Please check your email and verify your account before logging in.');
      } else {
        // Fallback for other unexpected cases where login doesn't throw but returns no user.
        setError('Login failed. An unexpected error occurred.');
      }
    } catch (err: any) {
      // This will catch errors like "Invalid login credentials" thrown by the service.
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await requestPasswordReset(identifier);
      setSuccessMessage(`If an account exists for ${identifier}, a password reset link has been sent.`);
      setIdentifier('');
    } catch (err: any) {
       setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIdentifier('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setView('login');
    onClose();
  }

  const handleSwitch = () => {
    handleClose();
    onSwitchToSignUp();
  }
  
  const renderLoginView = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
      <div>
        <label htmlFor="login-identifier" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="login-identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="email"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex items-center justify-between">
         <div /> 
         <button type="button" onClick={() => { setView('forgotPassword'); setError(''); setSuccessMessage(''); }} className="text-sm text-blue-600 hover:text-blue-500">
            Forgot password?
          </button>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? <LoadingSpinner /> : 'Login'}
      </button>
      <p className="text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <button type="button" onClick={handleSwitch} className="font-medium text-green-600 hover:text-green-500">
          Sign up
        </button>
      </p>
    </form>
  );

  const renderForgotPasswordView = () => (
    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p>
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
      {successMessage && <p className="text-green-600 text-sm bg-green-100 p-2 rounded">{successMessage}</p>}
      {!successMessage && (
        <div>
          <label htmlFor="forgot-identifier" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="forgot-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      )}
      <div className="flex items-center justify-between mt-4">
        <button type="button" onClick={() => setView('login')} className="text-sm text-blue-600 hover:text-blue-500">
          &larr; Back to login
        </button>
        {!successMessage && (
            <button
                type="submit"
                disabled={isLoading}
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {isLoading ? <LoadingSpinner /> : 'Send Reset Link'}
            </button>
        )}
      </div>
    </form>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={view === 'login' ? 'Login to ScamGuard' : 'Reset Password'}>
      {view === 'login' ? renderLoginView() : renderForgotPasswordView()}
    </Modal>
  );
};

export default LoginModal;