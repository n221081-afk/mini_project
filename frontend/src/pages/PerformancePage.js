import { useState, useEffect } from 'react';
import { getAll, create } from '../services/performanceService';
import Table from '../components/Table';
import { BarChart } from '../components/Charts';
import { useAuth } from '../context/AuthContext';
import { getAll as getEmployees } from '../services/employeeService';

export default function PerformancePage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ employee_id: '', rating: 3, comments: '' });
  const canAssign = ['admin', 'hr', 'hr_manager'].includes(user?.role);

  const loadData = async () => {
    const [reviewsRes, employeesRes] = await Promise.all([
      getAll(),
      canAssign ? getEmployees({ page: 1, limit: 200 }) : Promise.resolve({ data: { data: [] } }),
    ]);
    setData(reviewsRes.data?.data ?? []);
    setEmployees(employeesRes.data?.data ?? []);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        await loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load performance data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await create({
        employee_id: form.employee_id,
        rating: Number(form.rating),
        comments: form.comments,
        review_date: new Date().toISOString().slice(0, 10),
      });
      setSuccess('Performance rating assigned successfully.');
      setForm({ employee_id: '', rating: 3, comments: '' });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign rating');
    }
  };

  const columns = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'review_date', label: 'Review Date' },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <span className="flex items-center gap-1">
          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
        </span>
      ),
    },
    { key: 'comments', label: 'Comments' },
  ];

  const topData = [...data].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const chartData = {
    labels: topData.map((r) => r.employee_code),
    datasets: [
      {
        label: 'Rating',
        data: topData.map((r) => r.rating),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="page-header">Performance</h1>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
      {canAssign && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Assign Rating</h2>
          <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <select className="input-field" value={form.employee_id} onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))} required>
              <option value="">Select Employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.employee_code} - {e.first_name} {e.last_name}</option>)}
            </select>
            <input type="number" min="1" max="5" className="input-field" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} required />
            <input className="input-field" placeholder="Comments" value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} />
            <button className="btn-primary" type="submit">Assign</button>
          </form>
        </div>
      )}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Ratings (Top 8)</h2>
        <BarChart data={chartData} height={250} />
      </div>
      <div className="card overflow-hidden">
        <h2 className="px-4 py-3 text-lg font-semibold border-b">Employee Reviews</h2>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <Table columns={columns} data={data} keyField="_id" emptyMessage="No performance reviews" />
        )}
      </div>
    </div>
  );
}
