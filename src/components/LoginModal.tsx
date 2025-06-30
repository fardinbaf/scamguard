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
      const user = await login({ identifier, password });
      if (user) {
        onClose();
      } else {
        // The error should be thrown by the service and caught below
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error(err);
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
      // Show the same message whether user exists or not to prevent email enumeration
      setSuccessMessage(`If an account exists for ${identifier}, a password reset email has been sent.`);
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
    handleClose(); // Reset and close current modal
    onSwitchToSignUp(); // Open the other modal
  }
  
  const renderLoginView = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
      <div>
        <label htmlFor="login-identifier" className="block text-sm font-medium text-gray-700">
          Email or Phone Number
        </label>
        <input
          type="text"
          id="login-identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <div className="flex justify-between">
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
           <button type="button" onClick={() => setView('forgotPassword')} className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </button>
        </div>
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
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? <LoadingSpinner /> : 'Login'}
      </button>
      <p className="text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <button type="button" onClick={handleSwitch} className="font-medium text-blue-600 hover:text-blue-500">
          Sign Up
        </button>
      </p>
    </form>
  );

  const renderForgotPasswordView = () => (
     <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">Enter your identifier and we'll send you a (simulated) link to reset your password.</p>
        {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm bg-green-100 p-2 rounded">{successMessage}</p>}
        <div>
          <label htmlFor="forgot-identifier" className="block text-sm font-medium text-gray-700">
            Email or Phone Number
          </label>
          <input
            type="text"
            id="forgot-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner /> : 'Send Reset Link'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Remember your password?{' '}
          <button type="button" onClick={() => { setError(''); setView('login');}} className="font-medium text-blue-600 hover:text-blue-500">
            Back to Login
          </button>
        </p>
     </form>
  );


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={view === 'login' ? 'Login to ScamGuard' : 'Reset Password'}>
      {view === 'login' ? renderLoginView() : renderForgotPasswordView()}
    </Modal>
  );
};

export default LoginModal;
