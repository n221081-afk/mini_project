import { useState, useEffect } from 'react';
import { getAll, updateStage } from '../services/recruitmentService';
import { recruitmentJobs } from '../data/dummyData';
import Table from '../components/Table';

const STAGES = ['application_received', 'interview_scheduled', 'selected', 'rejected'];

export default function RecruitmentPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAll();
        setData(Array.isArray(res.data) ? res.data : res.data?.data ?? recruitmentJobs);
      } catch {
        setData(recruitmentJobs);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStageChange = async (id, stage) => {
    try {
      await updateStage(id, stage);
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, stage } : r)));
    } catch {
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, stage } : r)));
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
          onChange={(e) => handleStageChange(r.id, e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      ),
    },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-header">Recruitment</h1>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <Table columns={columns} data={data} keyField="id" emptyMessage="No recruitment records" />
        )}
      </div>
    </div>
  );
}
