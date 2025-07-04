import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, updateUserRole, updateUserBanStatus } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
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
          alert("Your own admin role has been changed. The application will refresh your permissions.");
          await refreshUser();
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

  // Deleting a user from auth.users is a privileged operation and not recommended from the client.
  // Banning is the preferred, non-destructive alternative.
  // The trash icon can be repurposed or a backend Edge Function can be created for actual deletion.
  // For this implementation, we will alert that this action is not available.
  const handleDeleteUser = (userIdentifier: string) => {
     alert(`For security, user deletion must be performed directly in the Supabase dashboard (Authentication -> Users). The recommended action is to ban the user "${userIdentifier}".`);
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
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
        <p className="font-bold">Admin Note</p>
        <p>You can grant or revoke admin privileges and ban users. For security, you cannot ban or demote yourself. Deleting users must be done from the Supabase dashboard.</p>
      </div>
      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No users found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier (Email)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Admin?</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Banned?</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={user.id === currentUser?.id ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.identifier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={(e) => handleRoleChange(user.id, e.target.checked)}
                      disabled={currentUser?.id === user.id}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={currentUser?.id === user.id ? "Cannot change your own admin status" : "Toggle admin status"}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={!!user.isBanned}
                      onChange={(e) => handleBanChange(user.id, e.target.checked)}
                      disabled={currentUser?.id === user.id}
                      className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={currentUser?.id === user.id ? "Cannot ban yourself" : "Toggle ban status"}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteUser(user.identifier)}
                      disabled={currentUser?.id === user.id}
                      className="text-gray-400 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      title={`Delete user ${user.identifier} (disabled)`}
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
