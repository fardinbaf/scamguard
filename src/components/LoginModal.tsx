
import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login({ identifier, password });
      if (user && user.isVerified) {
        onClose(); // Successfully logged in and verified
      } else if (user && !user.isVerified) {
        setError('Your account is not verified. Please complete the signup & verification process.');
        // Do not close modal, user needs to take action or try signup flow.
      } else if (user && user.isBanned) { // This case should be handled by login service returning null ideally.
        setError('This account is banned.');
      }
      else {
        setError('Login failed. Please check your credentials or if your account is banned.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIdentifier('');
    setPassword('');
    setError('');
    onClose();
  }

  const handleSwitch = () => {
    handleClose(); // Reset and close current modal
    onSwitchToSignUp(); // Open the other modal
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Login to ScamGuard">
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
    </Modal>
  );
};

export default LoginModal;