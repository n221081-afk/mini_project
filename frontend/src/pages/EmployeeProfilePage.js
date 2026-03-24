import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getById } from '../services/employeeService';
import { getAll as getPerformanceReviews } from '../services/performanceService';
import { useAuth } from '../context/AuthContext';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [employeeRes, reviewRes] = await Promise.all([
          getById(id),
          getPerformanceReviews({ employee_id: id }).catch(() => ({ data: { data: [] } })),
        ]);
        setEmployee(employeeRes.data);
        setReviews(reviewRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee profile');
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <div className="py-12 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!employee) return <div className="py-12 text-center">Employee not found. <Link to="/employees" className="text-primary-600">Back to list</Link></div>;
  if (user?.role === 'employee' && user?.employee_id && user.employee_id !== id) {
    return <div className="py-12 text-center text-red-600">Access denied for this profile.</div>;
  }
  const latestRating = reviews[0]?.rating;

  const fields = [
    { label: 'Employee ID', value: employee.employee_code },
    { label: 'First Name', value: employee.first_name },
    { label: 'Last Name', value: employee.last_name },
    { label: 'Email', value: employee.email },
    { label: 'Phone', value: employee.phone },
    { label: 'Address', value: employee.address },
    { label: 'Department', value: employee.department_name },
    { label: 'Job Title', value: employee.designation },
    { label: 'Join Date', value: employee.join_date },
    { label: 'Salary', value: employee.salary ? `₹${Number(employee.salary).toLocaleString()}` : '' },
    { label: 'Role', value: employee.role || 'employee' },
    { label: 'Performance Rating', value: latestRating ? `${latestRating}/5` : 'N/A' },
    { label: 'Latest Review', value: reviews[0]?.comments || 'N/A' },
    { label: 'Status', value: employee.status },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link to="/employees" className="text-gray-500 hover:text-gray-700">← Back</Link>
        <h1 className="page-header">Employee Profile</h1>
      </div>
      <div className="card p-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">
            {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{employee.first_name} {employee.last_name}</h2>
            <p className="text-gray-500">{employee.designation}</p>
            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
              employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {employee.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            f.value && (
              <div key={f.label}>
                <label className="block text-sm text-gray-500">{f.label}</label>
                <p className="font-medium">{f.value}</p>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
