import { useState, useEffect } from 'react';
import { getAll, generate, downloadPayslip } from '../services/payrollService';
import { payrollRecords } from '../data/dummyData';
import Table from '../components/Table';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function PayrollPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAll({ month, page, limit: ITEMS_PER_PAGE });
        const arr = res.data?.data ?? res.data;
        setData(Array.isArray(arr) ? arr : []);
        setTotal(res.data?.total ?? arr?.length ?? 0);
      } catch {
        const filtered = payrollRecords.filter((r) => r.month === month);
        setData(filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE));
        setTotal(filtered.length);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [month, page]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generate(month);
      const res = await getAll({ month });
      const arr = res.data?.data ?? res.data;
      setData(Array.isArray(arr) ? arr : []);
    } catch {
      setData(payrollRecords.filter((r) => r.month === month));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await downloadPayslip(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Payslip download (demo - backend required)');
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
          onClick={() => handleDownload(r.id)}
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
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Payroll'}
          </button>
        </div>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <Table columns={columns} data={data} keyField="id" emptyMessage="No payroll records" />
            <Pagination page={page} totalPages={Math.ceil(total / ITEMS_PER_PAGE)} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
