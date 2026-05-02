import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATIC_EMAIL = 'admin@gmail.com';
const STATIC_PASSWORD = 'ad@12345';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (
      form.email === STATIC_EMAIL &&
      form.password === STATIC_PASSWORD
    ) {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/home');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-7 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">INDUS ADMIN PANEL</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-600">Sign in to manage website content</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition shadow-sm"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500 text-center">
          Demo credentials: <code>admin@gmail.com</code> / <code>ad@12345</code>
        </p>
      </div>
    </div>
  );
};

export default Login;
