import { Link, useLocation } from 'react-router-dom';

const pathLabels = {
  '': 'Dashboard',
  employees: 'Employees',
  add: 'Add Employee',
  departments: 'Departments',
  attendance: 'Attendance',
  leave: 'Leaves',
  payroll: 'Payroll',
  recruitment: 'Recruitment',
  performance: 'Performance',
  reports: 'Reports',
  settings: 'Settings',
};

export default function Breadcrumbs({ customLabel }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) {
    return (
      <nav className="text-sm text-gray-500 mb-4">
        <span className="font-medium text-primary-600">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
      <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
      {pathnames.map((segment, i) => {
        const path = '/' + pathnames.slice(0, i + 1).join('/');
        const label = customLabel ?? pathLabels[segment] ?? segment.replace(/-/g, ' ');
        const isLast = i === pathnames.length - 1;
        const isId = /^[a-f0-9-]{24}$|^\d+$/.test(segment);
        const displayLabel = isId ? 'Profile' : label;

        return (
          <span key={path} className="flex items-center gap-1">
            <span className="text-gray-300">/</span>
            {isLast ? (
              <span className="font-medium text-dark">{displayLabel}</span>
            ) : (
              <Link to={path} className="hover:text-primary-600 transition-colors capitalize">
                {displayLabel}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
