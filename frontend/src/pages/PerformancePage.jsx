import { useState, useEffect } from 'react';
import { getAll } from '../services/performanceService';
import { performanceReviews } from '../data/dummyData';
import Table from '../components/Table';
import { BarChart } from '../components/Charts';

export default function PerformancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAll();
        setData(Array.isArray(res.data) ? res.data : res.data?.data ?? performanceReviews);
      } catch {
        setData(performanceReviews);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const columns = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'employee_name', label: 'Name' },
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

  const chartData = {
    labels: data.slice(0, 8).map((r) => r.employee_code),
    datasets: [
      {
        label: 'Rating',
        data: data.slice(0, 8).map((r) => r.rating),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="page-header">Performance</h1>
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Ratings (Top 8)</h2>
        <BarChart data={chartData} height={250} />
      </div>
      <div className="card overflow-hidden">
        <h2 className="px-4 py-3 text-lg font-semibold border-b">Employee Reviews</h2>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <Table columns={columns} data={data} keyField="id" emptyMessage="No performance reviews" />
        )}
      </div>
    </div>
  );
}
