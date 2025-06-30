import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, updateUserRole, updateUserBanStatus, deleteUser } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import { DESIGNATED_ADMIN_EMAIL } from '../constants';
import { TrashIcon } from '../components/Icons';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, currentUser, isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate, authLoading, fetchUsers]);

  const handleRoleChange = async (userId: string, newIsAdmin: boolean) => {
    try {
      const updatedUser = await updateUserRole(userId, newIsAdmin);
      if (updatedUser) {
        setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? updatedUser : u)));
        if (currentUser?.id === userId && currentUser.isAdmin !== newIsAdmin) {
          alert("Your own admin role has been changed. The auth state will refresh.");
          refreshUser();
        }
      }
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      alert(err.message || 'Error updating user role.');
      fetchUsers(); // Re-fetch to revert optimistic UI
    }
  };

  const handleBanChange = async (userId: string, newIsBanned: boolean) => {
    try {
      const updatedUser = await updateUserBanStatus(userId, newIsBanned);
      if (updatedUser) {
        setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? updatedUser : u)));
      }
    } catch (err: any) {
      console.error('Failed to update user ban status:', err);
      alert(err.message || 'Error updating user ban status.');
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string, userIdentifier: string) => {
    if (window.confirm(`Are you sure you want to delete the user "${userIdentifier}"? This action cannot be undone.`)) {
      try {
        await deleteUser(userId);
        alert(`User ${userIdentifier} deleted successfully.`);
        fetchUsers();
      } catch (err: any) {
        console.error('Failed to delete user:', err);
        alert(err.message || 'An error occurred while deleting the user.');
      }
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">User Management</h1>
      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No users found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Admin?</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Banned?</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.identifier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={(e) => handleRoleChange(user.id, e.target.checked)}
                      disabled={user.identifier.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={!!user.isBanned}
                      onChange={(e) => handleBanChange(user.id, e.target.checked)}
                      disabled={currentUser?.id === user.id || user.identifier.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()}
                      className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {user.isBanned ? (
                        <span className="text-red-500 font-semibold">Banned</span>
                     ) : user.isVerified ? (
                        <span className="text-green-500 font-semibold">Verified</span>
                     ) : (
                        <span className="text-yellow-500 font-semibold">Unverified</span>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.identifier)}
                      disabled={currentUser?.id === user.id || user.identifier.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      title={`Delete user ${user.identifier}`}
                    >
                      <TrashIcon className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
