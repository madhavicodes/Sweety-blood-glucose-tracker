import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Activity, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import ErrorAlert from '../components/ErrorAlert';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const errors = {};
    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be between 2 and 100 characters.';
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one letter and one number.';
    }
    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setClientErrors({});

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setServerError(getErrorMessage(err));
      const fieldErrs = getFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) {
        setClientErrors(fieldErrs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 mb-3">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Your Account</h2>
          <p className="mt-1.5 text-sm text-slate-500">Start logging your blood glucose readings today</p>
        </div>

        <ErrorAlert message={serverError} onClose={() => setServerError('')} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (clientErrors.name) setClientErrors({ ...clientErrors, name: null });
              }}
              placeholder="Jane Doe"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                clientErrors.name
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
              }`}
            />
            {clientErrors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                {clientErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (clientErrors.email) setClientErrors({ ...clientErrors, email: null });
              }}
              placeholder="jane@example.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                clientErrors.email
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
              }`}
            />
            {clientErrors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                {clientErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (clientErrors.password) setClientErrors({ ...clientErrors, password: null });
              }}
              placeholder="At least 8 characters (letter + number)"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                clientErrors.password
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
              }`}
            />
            {clientErrors.password ? (
              <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                {clientErrors.password}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Must be 8–72 characters with at least one letter and one number.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

