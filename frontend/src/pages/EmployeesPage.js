import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { getAll, applySalaryHike, terminateEmployee } from '../services/employeeService';
import { getAll as getDepartments } from '../services/departmentService';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function EmployeesPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getDepartments()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data;
        if (list?.length) setDepartments(list);
      })
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: ITEMS_PER_PAGE };
        if (search) params.search = search;
        if (deptFilter) params.department_id = deptFilter;
        const res = await getAll(params);
        setData(res.data?.data || []);
        setTotal(res.data?.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employees');
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, search, deptFilter]);

  const refresh = async () => {
    const params = { page, limit: ITEMS_PER_PAGE };
    if (search) params.search = search;
    if (deptFilter) params.department_id = deptFilter;
    const res = await getAll(params);
    setData(res.data?.data || []);
    setTotal(res.data?.total || 0);
  };

  const handleSalaryHike = async (id) => {
    const input = window.prompt('Enter hike amount');
    const amount = Number(input || 0);
    if (!amount || amount <= 0) return;
    try {
      await applySalaryHike(id, amount);
      setSuccess('Salary hike applied successfully.');
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply salary hike');
    }
  };

  const handleTerminate = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this employee?')) return;
    try {
      await terminateEmployee(id);
      setSuccess('Employee terminated successfully.');
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to terminate employee');
    }
  };

  const columns = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'department_name', label: 'Department' },
    { key: 'designation', label: 'Job Title' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.status === 'active'
              ? 'bg-primary-100 text-primary-700'
              : row.status === 'on_leave'
              ? 'bg-primary-50 text-primary-600'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link to={`/employees/${row.id}`} className="text-primary-600 hover:underline text-sm">View</Link>
          {(user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_manager') && (
            <button onClick={() => handleSalaryHike(row.id)} className="text-amber-600 hover:underline text-sm">Salary Hike</button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => handleTerminate(row.id)} className="text-red-600 hover:underline text-sm">Terminate</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-header">Employees</h1>
        <Link to="/employees/add" className="btn-primary inline-flex items-center justify-center w-fit">
          + Add Employee
        </Link>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search employees by name, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          {(search || deptFilter) && (
            <button
              onClick={() => { setSearch(''); setDeptFilter(''); setPage(1); }}
              className="text-sm font-medium text-red-500 hover:text-red-700 transition flex items-center gap-1 mt-2 sm:mt-0"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <Table columns={columns} data={data} keyField="id" />
            <Pagination
              page={page}
              totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
