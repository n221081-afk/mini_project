import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-dark"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-base">E</span>
          </div>
          <span className="text-lg font-bold">
            <span className="text-primary-600">Enterprise</span>
            <span className="text-dark">HR</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setDropdown(!dropdown)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:inline font-medium text-dark">{user?.name || 'User'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2">
              <Link
                to="/settings"
                className="block px-4 py-2.5 text-sm text-dark hover:bg-gray-50"
                onClick={() => setDropdown(false)}
              >
                Profile Settings
              </Link>
              <button
                onClick={() => { setDropdown(false); handleLogout(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
