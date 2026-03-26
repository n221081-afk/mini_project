import { useState, useEffect } from 'react';
import { getAll, generate, downloadPayslip } from '../services/payrollService';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function PayrollPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canGenerate = ['admin', 'hr', 'hr_manager'].includes(user?.role);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAll({ month, page, limit: ITEMS_PER_PAGE });
        const arr = res.data?.data ?? [];
        setData(Array.isArray(arr) ? arr : []);
        setTotal(res.data?.total ?? 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch payroll records');
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [month, page]);

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    setGenerating(true);
    try {
      await generate(month);
      setSuccess('Payroll generated successfully.');
      const res = await getAll({ month });
      const arr = res.data?.data ?? [];
      setData(Array.isArray(arr) ? arr : []);
      setTotal(arr.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Payroll generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id, employeeCode) => {
    try {
      const res = await downloadPayslip(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${employeeCode || 'employee'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Payslip download failed');
    }
  };

  const columns = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'month', label: 'Month' },
    { key: 'basic_salary', label: 'Basic', render: (r) => `₹${(r.basic_salary ?? 0).toLocaleString()}` },
    { key: 'hra', label: 'HRA', render: (r) => `₹${(r.hra ?? 0).toLocaleString()}` },
    { key: 'net_salary', label: 'Net Salary', render: (r) => `₹${(r.net_salary ?? 0).toLocaleString()}` },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => handleDownload(r._id, r.employee_code)}
          className="text-primary-600 hover:underline text-sm"
        >
          Download Payslip
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-header">Payroll</h1>
        <div className="flex gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(1); }}
            className="input-field max-w-[180px]"
          />
          {canGenerate && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Payroll'}
            </button>
          )}
        </div>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <Table columns={columns} data={data} keyField="_id" emptyMessage={!canGenerate ? "No payroll record available for you yet" : "No payroll records"} />
            <Pagination page={page} totalPages={Math.ceil(total / ITEMS_PER_PAGE)} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
