import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon } from './Icons';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const handleSwitchToLogin = () => {
    handleCloseModal();
    onSwitchToLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const result = await signup({ identifier, password });
      
      if (result.user) {
        setSuccessMessage("Signup successful! If email confirmation is enabled on this project, please check your inbox to verify your account.");
        // Automatically close the modal after a delay for better UX
        setTimeout(() => {
            handleCloseModal();
        }, 3000);
      } else {
        setError("Sign up failed. This email might already be in use or another error occurred.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Create ScamGuard Account">
      {successMessage ? (
        <div className="flex flex-col items-center text-center space-y-2 text-green-800 bg-green-100 p-4 rounded-md">
          <CheckCircleIcon className="w-12 h-12 text-green-500" />
          <p className="font-bold text-lg">Success!</p>
          <p className="text-sm">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
          
          <fieldset disabled={isLoading}>
              <div className="space-y-4">
                  <div>
                    <label htmlFor="signup-identifier" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="signup-identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoComplete="email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                      Password (min. 6 characters)
                    </label>
                    <input
                      type="password"
                      id="signup-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6} 
                      required
                      autoComplete="new-password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="signup-confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
              </div>
          </fieldset>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner /> : 'Sign Up'}
          </button>
          
          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <button type="button" onClick={handleSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500" disabled={isLoading}>
              Login
            </button>
          </p>
        </form>
      )}
    </Modal>
  );
};

export default SignUpModal;