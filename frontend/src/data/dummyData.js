const now = new Date();
const currentYear = now.getFullYear();
const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
const prevMonthStr = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0');
const prevMonthYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;

export const departments = [
  { id: '1', name: 'Engineering', code: 'ENG' },
  { id: '2', name: 'HR', code: 'HR' },
  { id: '3', name: 'Finance', code: 'FIN' },
  { id: '4', name: 'Marketing', code: 'MKT' },
  { id: '5', name: 'Operations', code: 'OPS' },
  { id: '6', name: 'Sales', code: 'SLS' }
];

export const employees = Array.from({ length: 42 }, (_, i) => ({
  id: String(i + 1),
  employee_code: `EMP${String(i + 1).padStart(4, '0')}`,
  first_name: ['John', 'Jane', 'Robert', 'Emily', 'Michael', 'Sarah', 'William', 'Jessica', 'David', 'Laura'][i % 10],
  last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][i % 10],
  email: `emp${i + 1}@enterprisehr.com`,
  phone: `9876543${String(i + 1).padStart(3, '0')}`,
  department_id: String((i % 6) + 1),
  department_name: departments[i % 6].name,
  designation: ['Software Engineer', 'HR Manager', 'Accountant', 'Marketing Executive', 'Operations Manager', 'Sales Rep', 'Senior Developer', 'Team Lead'][i % 8],
  join_date: `2023-${String((i % 12) + 1).padStart(2, '0')}-01`,
  salary: 30000 + Math.floor(Math.random() * 50000),
  status: i < 38 ? 'active' : i === 38 ? 'on_leave' : 'terminated',
  address: `${100 + i} Main St, City`,
}));

const _attBase = [];
for (let i = 0; i < 2; i++) {
  const base = new Date();
  base.setMonth(base.getMonth() - i);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  for (let d = 1; d <= 22; d++) {
    const date = `${year}-${month}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, base.getMonth(), d).getDay();
    if (dow !== 0 && dow !== 6) {
      employees.slice(0, 38).forEach((emp) => {
        _attBase.push({
          id: `${emp.id}-${date}`,
          employee_id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          employee_code: emp.employee_code,
          department_name: emp.department_name,
          date,
          status: Math.random() > 0.08 ? 'present' : Math.random() > 0.5 ? 'absent' : 'half_day',
          clock_in: '09:00:00',
          clock_out: '18:00:00',
        });
      });
    }
  }
}
export const attendanceRecords = _attBase;

export const payrollRecords = [];
[`${prevMonthYear}-${prevMonthStr}`, `${currentYear}-${currentMonthStr}`].forEach((month) => {
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
  ...Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1),
    employee_id: String(i + 1),
    employee_code: employees[i].employee_code,
    first_name: employees[i].first_name,
    last_name: employees[i].last_name,
    leave_type: ['sick_leave', 'casual_leave', 'paid_leave', 'work_from_home'][i % 4],
    start_date: `${currentYear}-${currentMonthStr}-${String((i * 3 + 5) % 28).padStart(2, '0')}`,
    end_date: `${currentYear}-${currentMonthStr}-${String((i * 3 + 6) % 28).padStart(2, '0')}`,
    reason: ['Fever', 'Personal Works', 'Vacation', 'Out of station', 'Doctor Appointment'][i % 5],
    status: ['pending', 'approved', 'rejected', 'pending'][i % 4]
  }))
];

export const recruitmentJobs = [
  { id: '1', job_title: 'Senior Frontend Developer', candidate_name: 'Alice Johnson', candidate_email: 'alice@email.com', stage: 'interview_scheduled', status: 'active' },
  { id: '2', job_title: 'HR Associate', candidate_name: 'Bob Smith', candidate_email: 'bob@email.com', stage: 'application_received', status: 'active' },
  { id: '3', job_title: 'Financial Analyst', candidate_name: 'Charlie Davis', candidate_email: 'charlie@email.com', stage: 'selected', status: 'active' },
  { id: '4', job_title: 'Backend Node.js Eng', candidate_name: 'Diana Reed', candidate_email: 'diana@email.com', stage: 'rejected', status: 'inactive' },
  { id: '5', job_title: 'Product Manager', candidate_name: 'Evan Wright', candidate_email: 'evan@email.com', stage: 'interview_scheduled', status: 'active' },
  { id: '6', job_title: 'DevOps Engineer', candidate_name: 'Fiona Gallagher', candidate_email: 'fiona@email.com', stage: 'application_received', status: 'active' }
];

export const performanceReviews = employees.slice(0, 25).map((emp, i) => ({
  id: String(i + 1),
  employee_id: emp.id,
  employee_name: `${emp.first_name} ${emp.last_name}`,
  employee_code: emp.employee_code,
  review_date: `${currentYear}-${prevMonthStr}-15`,
  rating: 3 + (i % 3), // Results in ratings of 3, 4, and 5
  comments: ['Consistently meets expectations.', 'Exceeds all delivery metrics!', 'Needs improvement in team communication.', 'Outstanding leadership skills.', 'Solid core performance.'][i % 5],
}));
