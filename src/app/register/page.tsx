'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCaptcha();
  }, []);

  async function fetchCaptcha() {
    setIsLoadingCaptcha(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/captcha', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to load CAPTCHA');
      }
      const data = await res.json();
      setCaptchaSvg(data.svg);
    } catch {
      setErrorMessage('Could not load CAPTCHA image. Please refresh.');
    } finally {
      setIsLoadingCaptcha(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          captcha: captchaInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please check details.');
        fetchCaptcha();
        setCaptchaInput('');
        return;
      }

      setSuccessMessage('Registration successful! Redirecting to login...');
      
      setUsername('');
      setPassword('');
      setCaptchaInput('');

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
      fetchCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card-container">
      <div className="glass-card">
        <h1 className="card-title">Create Account</h1>
        <p className="card-subtitle">Self-registration for the secure registry portal</p>

        {errorMessage && (
          <div className="alert alert-error" role="alert" id="error-alert">
            <span>⚠️</span>
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert" id="success-alert">
            <span>✓</span>
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              className="form-input"
              type="text"
              id="username"
              required
              autoComplete="username"
              placeholder="Min 3 characters, alphanumeric"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                autoComplete="new-password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                className="password-toggle-btn"
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="captcha">Security CAPTCHA</label>
            <div className="captcha-container">
              <div className="captcha-image-wrapper">
                {isLoadingCaptcha ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading...</span>
                ) : captchaSvg ? (
                  <span dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--error)' }}>Failed to load</span>
                )}
              </div>
              <button
                className="btn-refresh-captcha"
                type="button"
                aria-label="Refresh Captcha"
                onClick={fetchCaptcha}
                disabled={isSubmitting || isLoadingCaptcha}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              </button>
            </div>
            <input
              style={{ marginTop: '0.75rem' }}
              className="form-input"
              type="text"
              id="captcha"
              required
              placeholder="Enter the code shown above"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-indigo)', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
