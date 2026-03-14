import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Name</label>
          <p className="text-lg font-medium">{user?.name || 'User'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="text-lg">{user?.email || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Role</label>
          <p className="text-lg capitalize">{user?.role || 'Employee'}</p>
        </div>
      </div>
    </div>
  );
}
