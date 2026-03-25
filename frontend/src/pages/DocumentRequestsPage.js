import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { create, getAll, accept, reject, downloadDocument } from '../services/documentRequestService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function DocumentRequestsPage() {
  const { user } = useAuth();
  const isHR = ['admin', 'hr', 'hr_manager'].includes(user?.role);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ request_type: 'Document Bundle', subject: '', message: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAll();
      setRequests(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      toast.error('Failed to load document requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await create(form);
      toast.success('Document automatically generated and accepted!');
      setShowApply(false);
      setForm({ request_type: 'Document Bundle', subject: '', message: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await accept(id);
      toast.success('Request accepted');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (id) => {
    try {
      await reject(id);
      toast.success('Request rejected');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleDownload = async (id) => {
    try {
      toast.success('Generating document...');
      const res = await downloadDocument(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Document_Request_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  const columns = [
    { key: 'request_type', label: 'Type' },
    { key: 'subject', label: 'Subject' },
    ...(isHR ? [{ key: 'employee_name', label: 'Employee' }] : []),
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        r.status === 'accepted' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
      }`}>
        {r.status.toUpperCase()}
      </span>
    ) },
    { key: 'createdAt', label: 'Requested On', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (r) => {
      if (r.status === 'pending' && isHR) {
        return (
          <div className="flex gap-2">
            <button onClick={() => handleAccept(r._id)} className="text-green-600 hover:underline text-sm font-semibold">Accept</button>
            <button onClick={() => handleReject(r._id)} className="text-red-600 hover:underline text-sm font-semibold">Reject</button>
          </div>
        );
      }
      if (r.status === 'accepted') {
        return (
          <button onClick={() => handleDownload(r._id)} className="text-primary-600 hover:underline text-sm font-semibold">
            Download PDF
          </button>
        );
      }
      return <span className="text-gray-400 text-sm">-</span>;
    }}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-header">Document Requests</h1>
        {!isHR && (
          <button onClick={() => setShowApply(true)} className="btn-primary w-fit">
            Request Document
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading requests...</div>
        ) : (
          <Table columns={columns} data={requests} keyField="_id" emptyMessage="No document requests found" />
        )}
      </div>

      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title="Request Official Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Document Type</label>
            <select className="input-field" value={form.request_type} onChange={e => setForm({...form, request_type: e.target.value})}>
              <option value="Document Bundle">Document Bundle</option>
              <option value="Experience Letter">Experience Letter</option>
              <option value="Relieving Letter">Relieving Letter</option>
              <option value="Salary Certificate">Salary Certificate</option>
              <option value="NOC">NOC (No Objection Certificate)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Subject / Reason</label>
            <input type="text" required className="input-field" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. For visa purpose" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Additional Details</label>
            <textarea className="input-field" rows="3" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Any specific details you want included..."></textarea>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={submitLoading} className="btn-primary flex-1">
              {submitLoading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setShowApply(false)} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
