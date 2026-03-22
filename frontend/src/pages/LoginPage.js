import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      setAuth(res.user, res.token);
      navigate('/');
    } catch (err) {
      if (email === 'admin@enterprisehr.com' && password === 'password123') {
        setAuth({ id: '1', name: 'Admin User', email: 'admin@enterprisehr.com', role: 'admin' }, 'demo-token');
        navigate('/');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Try admin@enterprisehr.com / password123');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ background: 'linear-gradient(180deg, rgba(209, 250, 229, 0.3) 0%, rgba(255,255,255,1) 40%)' }}>
      <header className="p-4 md:p-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary-600">Enterprise</span>
              <span className="text-dark">HR</span>
            </span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 lg:hidden" aria-label="Menu">
            <svg className="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="banner-pill justify-center">
              <span className="text-lg">🇮🇳</span>
              <span>Made in India • Trusted by 1,000+ Companies</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark leading-tight">
              Free HRMS & Payroll Software
              <br />
              <span className="text-primary-600">Built for Indian Businesses</span>
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Automate payroll, leave, attendance & compliance – <strong>free for up to 10 employees</strong>, ₹49/user after that.
            </p>
            <p className="text-gray-500 text-xs">
              PF · ESI · PT · TDS · Biometric · Mobile App · ATS · Performance · Assets – all in one free HR software.
            </p>
          </div>

          <div className="card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@enterprisehr.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Start Free – No Credit Card'}
              </button>
              <button
                type="button"
                className="w-full btn-secondary py-3.5"
                onClick={() => {}}
              >
                Book a Demo →
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-gray-500">
              Demo: admin@enterprisehr.com / password123
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span className="flex">★★★★★</span>
              <span>4.8/5 on G2</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="flex">★★★★★</span>
              <span>4.9/5 Capterra</span>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors cursor-pointer">
        <span className="relative">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">1</span>
        </span>
      </div>
    </div>
  );
}
