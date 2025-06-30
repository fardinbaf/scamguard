import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

type SignUpStep = "details" | "verify";

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, verify, login } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignUpStep>("details");
  const [pendingVerificationIdentifier, setPendingVerificationIdentifier] = useState<string | null>(null);

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setError('');
    setCurrentStep("details");
    setPendingVerificationIdentifier(null);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const handleSwitchToLogin = () => {
    handleCloseModal();
    onSwitchToLogin();
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const userSignedUp = await signup({ identifier, password });
      if (userSignedUp) {
        setPendingVerificationIdentifier(userSignedUp.identifier);
        setCurrentStep("verify");
      } else {
        // This path might not be hit if service throws an error
        setError('Sign up failed. This identifier might already be in use.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingVerificationIdentifier) {
        setError("An error occurred. Please try signing up again.");
        setCurrentStep("details");
        return;
    }
    if (!verificationCode.trim()) {
        setError("Please enter the verification code.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
        const verifiedUser = await verify(pendingVerificationIdentifier, verificationCode);
        if (verifiedUser) {
           // Auto-login after verification
           await login({ identifier: verifiedUser.identifier, password });
           handleCloseModal();
        } else {
            setError("Verification failed. Please check the code.");
        }
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred during verification.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title={currentStep === "details" ? "Create ScamGuard Account" : "Verify Your Account"}>
      {currentStep === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
          <div>
            <label htmlFor="signup-identifier" className="block text-sm font-medium text-gray-700">
              Email or Phone Number
            </label>
            <input
              type="text"
              id="signup-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
              Password (min. 8 characters)
            </label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8} 
              required
              autoComplete="new-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner /> : 'Sign Up'}
          </button>
          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <button type="button" onClick={handleSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500">
              Login
            </button>
          </p>
        </form>
      )}

      {currentStep === "verify" && (
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md mb-4" role="alert">
              <p className="font-bold">Sign-up Submitted!</p>
              <p className="text-sm">A (simulated) verification code has been sent to <span className="font-medium">{pendingVerificationIdentifier}</span>. Check your browser's developer console (for the backend server) for the code and enter it below.</p>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
            <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                Verification Code
                </label>
                <input
                type="text"
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {isLoading ? <LoadingSpinner /> : 'Verify Account'}
            </button>
            <p className="text-sm text-center text-gray-600">
                Didn't receive a code?{' '}
                <button type="button" onClick={() => { setError(''); setCurrentStep("details");}} className="font-medium text-blue-600 hover:text-blue-500">
                 Try signup again
                </button>
            </p>
        </form>
      )}
    </Modal>
  );
};

export default SignUpModal;
