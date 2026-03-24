import { useState, useEffect } from 'react';
import { getAll, apply, approve, reject, getStats } from '../services/leaveService';
import Table from '../components/Table';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const LEAVE_TYPES = { sick_leave: 'Sick', casual_leave: 'Casual', paid_leave: 'Paid', work_from_home: 'WFH' };

export default function LeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({
    leave_type: 'casual_leave',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadLeaves = async () => {
    const [res, st] = await Promise.all([getAll(), getStats().catch(() => ({ data: { data: [] } }))]);
    const leaveData = res.data?.data || [];
    setLeaves(leaveData);
    const rawStats = st.data?.data || [];
    if (Array.isArray(rawStats)) {
      const pending = rawStats.filter((s) => s.status === 'pending').reduce((a, s) => a + (s.count || 0), 0);
      const approved = rawStats.filter((s) => s.status === 'approved').reduce((a, s) => a + (s.count || 0), 0);
      const rejected = rawStats.filter((s) => s.status === 'rejected').reduce((a, s) => a + (s.count || 0), 0);
      setStats({ pending, approved, rejected });
    } else {
      setStats({ pending: 0, approved: 0, rejected: 0 });
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setPageLoading(true);
      try {
        await loadLeaves();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load leaves');
      } finally {
        setPageLoading(false);
      }
    };
    fetch();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apply(form);
      setShowApply(false);
      setForm({ leave_type: 'casual_leave', start_date: '', end_date: '', reason: '' });
      toast.success('Leave request submitted');
      await loadLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Leave apply failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setError('');
    setSuccess('');
    try {
      await approve(id);
      toast.success('Leave approved');
      await loadLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve failed');
    }
  };

  const handleReject = async (id) => {
    setError('');
    setSuccess('');
    try {
      await reject(id);
      toast.success('Leave rejected');
      await loadLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject failed');
    }
  };

  const columns = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'first_name', label: 'Name' },
    { key: 'leave_type', label: 'Type', render: (r) => LEAVE_TYPES[r.leave_type] || r.leave_type },
    { key: 'start_date', label: 'Start', render: (r) => (r.start_date ? new Date(r.start_date).toLocaleDateString() : '') },
    { key: 'end_date', label: 'End', render: (r) => (r.end_date ? new Date(r.end_date).toLocaleDateString() : '') },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    ...(user?.role === 'admin' || user?.role === 'hr_manager' || user?.role === 'hr'
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (r) =>
              r.status === 'pending' ? (
                <span className="flex gap-2">
                  <button onClick={() => handleApprove(r._id)} className="text-green-600 hover:underline text-sm">Approve</button>
                  <button onClick={() => handleReject(r._id)} className="text-red-600 hover:underline text-sm">Reject</button>
                </span>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-header">Leave Management</h1>
        <button onClick={() => setShowApply(true)} className="btn-primary w-fit">
          Apply Leave
        </button>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold">{stats.pending ?? 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-primary-600">{stats.approved ?? 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected ?? 0}</p>
          </div>
        </div>
      )}
      <Modal 
        isOpen={showApply} 
        onClose={() => setShowApply(false)} 
        title="Apply for Leave"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Leave Type</label>
            <select
              value={form.leave_type}
              onChange={(e) => setForm((f) => ({ ...f, leave_type: e.target.value }))}
              className="input-field"
            >
              {Object.entries(LEAVE_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className="input-field" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} className="input-field" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className="input-field" rows={3} placeholder="Please provide a brief reason for your leave request..." />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setShowApply(false)} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </Modal>
      <div className="card overflow-hidden">
        <h2 className="px-4 py-3 text-lg font-semibold border-b">Leave History</h2>
        {pageLoading ? (
          <div className="py-8 text-center text-gray-500">Loading leave requests...</div>
        ) : (
          <Table columns={columns} data={leaves} keyField="_id" emptyMessage="No leave requests" />
        )}
      </div>
    </div>
  );
}
