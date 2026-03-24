import api from './api';

export const employeesByDepartment = () =>
  api.get('/reports/employees-by-department');
export const monthlyAttendance = (month) =>
  api.get('/reports/monthly-attendance', { params: { month } });
export const leaveReport = (params) =>
  api.get('/reports/leave-report', { params });
export const payrollSummary = (month) =>
  api.get('/reports/payroll-summary', { params: { month } });
export const departmentPayroll = (month) =>
  api.get('/reports/department-payroll', { params: { month } });
export const exportReport = (reportType, format = 'csv', params) =>
  api.get('/reports/export', {
    params: {
      format,
      report_type:
        reportType === 'dept'
          ? 'employees_by_dept'
          : reportType === 'attendance'
          ? 'monthly_attendance'
          : reportType === 'leave'
          ? 'leave_report'
          : reportType === 'payroll'
          ? 'payroll_summary'
          : reportType,
      ...params,
    },
    responseType: 'blob',
  });
