import { useState, useEffect } from 'react';
import { getAll, create, updateStage, remove } from '../services/recruitmentService';
import Table from '../components/Table';
import Modal from '../components/Modal';

const STAGES = ['application_received', 'interview_scheduled', 'selected', 'rejected'];

const initialFormState = { 
  job_title: '', 
  candidate_name: '', 
  candidate_email: '', 
  notes: '' 
};

export default function RecruitmentPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAll();
        setData(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (error) {
        console.error('Fetch recruitment failed', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshKey]);

  const handleStageChange = async (id, stage) => {
    try {
      await updateStage(id, stage);
      setSuccess('Stage updated successfully.');
      setRefreshKey(k => k + 1);
    } catch (error) {
      setError('Failed to update stage');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await create(form);
      setSuccess('Candidate added successfully.');
      setShowForm(false);
      setForm(initialFormState);
      setRefreshKey(k => k + 1);
    } catch (error) {
      setError('Failed to add candidate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await remove(id);
      setSuccess('Candidate deleted successfully.');
      setRefreshKey((k) => k + 1);
    } catch {
      setError('Failed to delete candidate');
    }
  };

  const columns = [
    { key: 'job_title', label: 'Job Title' },
    { key: 'candidate_name', label: 'Candidate' },
    { key: 'candidate_email', label: 'Email' },
    {
      key: 'stage',
      label: 'Stage',
      render: (r) => (
        <select
          value={r.stage}
          onChange={(e) => handleStageChange(r._id || r.id, e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      ),
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (r) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          r.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {r.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button onClick={() => handleDelete(r._id || r.id)} className="text-red-600 hover:underline text-sm">
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-header">Recruitment</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary w-fit px-6">
          + Add Candidate
        </button>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading recruitment records...
          </div>
        ) : (
          <Table columns={columns} data={data} keyField="_id" emptyMessage="No recruitment records found" />
        )}
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title="Add New Candidate"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Candidate Name</label>
              <input 
                required 
                type="text" 
                value={form.candidate_name} 
                onChange={e => setForm({...form, candidate_name: e.target.value})} 
                className="input-field" 
                placeholder="John Doe" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Candidate Email</label>
              <input 
                required 
                type="email" 
                value={form.candidate_email} 
                onChange={e => setForm({...form, candidate_email: e.target.value})} 
                className="input-field" 
                placeholder="john@example.com" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Job Title</label>
            <input 
              required 
              type="text" 
              value={form.job_title} 
              onChange={e => setForm({...form, job_title: e.target.value})} 
              className="input-field" 
              placeholder="Senior Frontend Developer" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})} 
              className="input-field" 
              rows="3" 
              placeholder="Brief notes about the candidate's background or interview status..." 
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="submit" className="btn-primary flex-1">Create Candidate</button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
