export const departments = [
  { id: '1', name: 'Engineering', code: 'ENG' },
  { id: '2', name: 'HR', code: 'HR' },
  { id: '3', name: 'Finance', code: 'FIN' },
  { id: '4', name: 'Marketing', code: 'MKT' },
  { id: '5', name: 'Operations', code: 'OPS' },
];

export const employees = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  employee_code: `EMP${String(i + 1).padStart(4, '0')}`,
  first_name: ['John', 'Jane', 'Robert', 'Emily', 'Michael', 'Sarah'][i % 6],
  last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][i % 6],
  email: `emp${i + 1}@enterprisehr.com`,
  phone: `9876543${String(i + 1).padStart(3, '0')}`,
  department_id: String((i % 5) + 1),
  department_name: departments[i % 5].name,
  designation: ['Software Engineer', 'HR Manager', 'Accountant', 'Marketing Executive', 'Operations Manager'][i % 5],
  join_date: `2023-${String((i % 12) + 1).padStart(2, '0')}-01`,
  salary: 30000 + Math.floor(Math.random() * 50000),
  status: i < 28 ? 'active' : i === 28 ? 'on_leave' : 'terminated',
  address: `${100 + i} Main St, City`,
}));

const _attBase = [];
for (let i = 0; i < 2; i++) {
  const base = new Date();
  base.setMonth(base.getMonth() - i);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  for (let d = 1; d <= 20; d++) {
    const date = `${year}-${month}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, base.getMonth(), d).getDay();
    if (dow !== 0 && dow !== 6) {
      employees.slice(0, 20).forEach((emp) => {
        _attBase.push({
          id: `${emp.id}-${date}`,
          employee_id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          employee_code: emp.employee_code,
          department_name: emp.department_name,
          date,
          status: Math.random() > 0.15 ? 'present' : 'absent',
          clock_in: '09:00:00',
          clock_out: '18:00:00',
        });
      });
    }
  }
}
export const attendanceRecords = _attBase;

export const payrollRecords = [];
['2025-01', '2025-02'].forEach((month) => {
  employees.forEach((emp) => {
    const basic = emp.salary;
    const hra = Math.round(basic * 0.2);
    const pf = Math.round(basic * 0.12);
    const net = basic + hra - pf;
    payrollRecords.push({
      id: `${emp.id}-${month}`,
      employee_id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      employee_code: emp.employee_code,
      month,
      basic_salary: basic,
      hra,
      net_salary: net,
      status: 'processed',
    });
  });
});

export const leaveRequests = [
  { id: '1', employee_id: '1', employee_code: 'EMP0001', first_name: 'John', last_name: 'Smith', leave_type: 'sick_leave', start_date: '2025-03-05', end_date: '2025-03-06', reason: 'Fever', status: 'pending' },
  { id: '2', employee_id: '2', employee_code: 'EMP0002', first_name: 'Jane', last_name: 'Johnson', leave_type: 'casual_leave', start_date: '2025-03-10', end_date: '2025-03-11', reason: 'Personal', status: 'approved' },
  { id: '3', employee_id: '3', employee_code: 'EMP0003', first_name: 'Robert', last_name: 'Williams', leave_type: 'paid_leave', start_date: '2025-03-15', end_date: '2025-03-17', reason: 'Vacation', status: 'pending' },
  { id: '4', employee_id: '4', employee_code: 'EMP0004', first_name: 'Emily', last_name: 'Brown', leave_type: 'work_from_home', start_date: '2025-03-20', end_date: '2025-03-20', reason: 'WFH', status: 'rejected' },
];

export const recruitmentJobs = [
  { id: '1', job_title: 'Software Engineer', candidate_name: 'Alice', candidate_email: 'alice@email.com', stage: 'interview_scheduled', status: 'active' },
  { id: '2', job_title: 'HR Associate', candidate_name: 'Bob', candidate_email: 'bob@email.com', stage: 'application_received', status: 'active' },
  { id: '3', job_title: 'Financial Analyst', candidate_name: 'Charlie', candidate_email: 'charlie@email.com', stage: 'selected', status: 'active' },
  { id: '4', job_title: 'Software Engineer', candidate_name: 'Diana', candidate_email: 'diana@email.com', stage: 'rejected', status: 'inactive' },
];

export const performanceReviews = employees.slice(0, 15).map((emp, i) => ({
  id: String(i + 1),
  employee_id: emp.id,
  employee_name: `${emp.first_name} ${emp.last_name}`,
  employee_code: emp.employee_code,
  review_date: '2025-01-15',
  rating: 3 + (i % 3),
  comments: 'Good performance',
}));
