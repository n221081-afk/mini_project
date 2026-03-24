import { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getAll } from '../services/departmentService';
import { getAll as getEmployees } from '../services/employeeService';

export default function DepartmentsPage() {
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [deptRes, employeeRes] = await Promise.all([getAll(), getEmployees({ page: 1, limit: 500 })]);
        setData(Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || []);
        setEmployees(employeeRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load departments');
        setData([]);
        setEmployees([]);
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
  const employeeColumns = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'department_name', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-header">Departments</h1>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <Table columns={columns} data={data} keyField="id" emptyMessage="No departments" />
        )}
      </div>
      <div className="card overflow-hidden">
        <h2 className="px-4 py-3 text-lg font-semibold border-b">All Employees</h2>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <Table columns={employeeColumns} data={employees} keyField="id" emptyMessage="No employees found" />
        )}
      </div>
    </div>
  );
}
