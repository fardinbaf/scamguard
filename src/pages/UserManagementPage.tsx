import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, updateUserRole, updateUserBanStatus } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

// This should ideally be imported if authService exports it, or from a shared constants file.
// For now, ensuring consistency with the value in authService.ts
const DESIGNATED_ADMIN_EMAIL_CHECK = 'fardinbd@mail.com'; 

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users.');
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
    const user = users.find(u => u.id === userId);
    // Use the consistent DESIGNATED_ADMIN_EMAIL_CHECK for comparison
    if (user && user.identifier.toLowerCase() === DESIGNATED_ADMIN_EMAIL_CHECK.toLowerCase() && !newIsAdmin) {
      alert(`Cannot remove admin role from the designated admin (${DESIGNATED_ADMIN_EMAIL_CHECK}).`);
      return;
    }

    try {
      const updatedUser = await updateUserRole(userId, newIsAdmin);
      if (updatedUser) {
        setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? updatedUser : u)));
        if (currentUser?.id === userId && currentUser.isAdmin !== newIsAdmin) {
            alert("Your admin role has been changed. The application might behave differently based on your new role.");
        }
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert('Error updating user role.');
    }
  };

  const handleBanChange = async (userId: string, newIsBanned: boolean) => {
    const user = users.find(u => u.id === userId);
    // Use the consistent DESIGNATED_ADMIN_EMAIL_CHECK for comparison
     if (user && user.identifier.toLowerCase() === DESIGNATED_ADMIN_EMAIL_CHECK.toLowerCase() && newIsBanned) {
      alert(`Cannot ban the designated admin (${DESIGNATED_ADMIN_EMAIL_CHECK}).`);
      return;
    }
    if (currentUser?.id === userId && newIsBanned) {
      alert("Admins cannot ban themselves.");
      return;
    }
    try {
      const updatedUser = await updateUserBanStatus(userId, newIsBanned);
      if (updatedUser) {
        setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? updatedUser : u)));
      }
    } catch (err) {
      console.error('Failed to update user ban status:', err);
      alert('Error updating user ban status.');
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!currentUser || !isAdmin) {
    return <div className="text-center p-8">Access Denied. You must be an administrator to view this page.</div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">User Management</h1>
      {users.length === 0 && !isLoading ? (
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
                      disabled={user.identifier.toLowerCase() === DESIGNATED_ADMIN_EMAIL_CHECK.toLowerCase()}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      aria-label={`Set admin status for ${user.identifier}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={!!user.isBanned}
                      onChange={(e) => handleBanChange(user.id, e.target.checked)}
                      disabled={currentUser?.id === user.id || user.identifier.toLowerCase() === DESIGNATED_ADMIN_EMAIL_CHECK.toLowerCase()}
                      className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                       aria-label={`Set ban status for ${user.identifier}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {user.isBanned ? (
                        <span className="text-red-500 font-semibold">Banned</span>
                     ) : (
                        <span className="text-green-500 font-semibold">Active</span>
                     )}
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