import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { employees, departments as dummyDepts } from '../data/dummyData';
import { getAll } from '../services/employeeService';
import { getAll as getDepartments } from '../services/departmentService';

const ITEMS_PER_PAGE = 10;

export default function EmployeesPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState(dummyDepts);
  const [loading, setLoading] = useState(true);
  const [useDummy, setUseDummy] = useState(false);

  useEffect(() => {
    getDepartments()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data;
        if (list?.length) setDepartments(list);
      })
      .catch(() => {});
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
      } catch {
        const filtered = employees.filter((e) => {
          const matchSearch = !search || `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase());
          const matchDept = !deptFilter || e.department_id === deptFilter;
          return matchSearch && matchDept;
        });
        setData(filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE));
        setTotal(filtered.length);
        setUseDummy(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, search, deptFilter]);

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
              ? 'bg-green-100 text-green-800'
              : row.status === 'on_leave'
              ? 'bg-amber-100 text-amber-800'
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
        <Link
          to={`/employees/${row.id}`}
          className="text-primary-600 hover:underline text-sm"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Link to="/employees/add" className="btn-primary inline-flex items-center justify-center w-fit">
          + Add Employee
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field max-w-xs"
        />
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="input-field max-w-xs"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
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
