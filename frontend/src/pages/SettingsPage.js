import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getProfile } from '../services/employeeService';
import { getAll as getPerformance } from '../services/performanceService';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [latestReview, setLatestReview] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, perfRes] = await Promise.all([
          getProfile().catch(() => ({ data: null })),
          getPerformance().catch(() => ({ data: { data: [] } })),
        ]);
        setProfile(profileRes.data || null);
        setLatestReview((perfRes.data?.data || [])[0] || null);
      } catch {
        setProfile(null);
        setLatestReview(null);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-[70vh] flex items-start justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="page-header text-center">Profile Settings</h1>
        <div className="card p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div>
              <label className="block text-sm font-medium text-gray-500">Department</label>
              <p className="text-lg">{profile?.department_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Salary</label>
              <p className="text-lg">{profile?.salary ? `₹${Number(profile.salary).toLocaleString()}` : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Performance Rating</label>
              <p className="text-lg">{latestReview?.rating ? `${latestReview.rating}/5` : 'N/A'}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Latest Review</label>
            <p className="text-lg">{latestReview?.comments || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
