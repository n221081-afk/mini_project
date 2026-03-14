import { useState, useEffect } from 'react';
import Table from '../components/Table';
import { departments } from '../data/dummyData';
import { getAll } from '../services/departmentService';

export default function DepartmentsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAll();
        setData(Array.isArray(res.data) ? res.data : res.data?.data || departments);
      } catch {
        setData(departments);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Department Name' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-header">Departments</h1>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <Table columns={columns} data={data} keyField="id" emptyMessage="No departments" />
        )}
      </div>
    </div>
  );
}
