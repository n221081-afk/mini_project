import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { create } from '../services/employeeService';
import { getAll } from '../services/departmentService';
import { departments } from '../data/dummyData';

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [deptList, setDeptList] = useState(departments);
  const [form, setForm] = useState({
    employee_code: `EMP${String(Math.floor(Math.random() * 9000) + 1000)}`,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    department_id: '',
    designation: '',
    join_date: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active',
    create_user_account: false,
    password: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await getAll();
        if (res.data?.length) setDeptList(Array.isArray(res.data) ? res.data : res.data.data || departments);
      } catch {}
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await create(
        { ...form, department_id: form.department_id || deptList[0]?.id },
        photo
      );
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/employees" className="text-gray-500 hover:text-gray-700">← Back</Link>
        <h1 className="page-header">Add Employee</h1>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
            <input name="employee_code" value={form.employee_code} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select name="department_id" value={form.department_id} onChange={handleChange} className="input-field" required>
              <option value="">Select</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input name="designation" value={form.designation} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
            <input name="join_date" type="date" value={form.join_date} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <input name="salary" type="number" value={form.salary} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="input-field" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" name="create_user_account" checked={form.create_user_account} onChange={handleChange} />
            <label>Create user account for login</label>
          </div>
          {form.create_user_account && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" />
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">Add Employee</button>
          <Link to="/employees" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
