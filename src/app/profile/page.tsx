'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';

interface ProfileDetails {
  fullName: string;
  dob: string | null;
  email: string;
  mobile: string;
  address: string;
  isSubmitted: boolean;
}

interface UserSession {
  id: string;
  username: string;
  profileDetails: ProfileDetails;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to change password.');
        return;
      }

      setSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>Loading profile...</h2>
        </div>
      </div>
    );
  }

  const details = user?.profileDetails;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 3rem', maxWidth: '100%', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Profile Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            View account metadata details and change your account password.
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span>
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" role="alert">
            <span>✓</span>
            <div>{successMsg}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div className="glass-card" style={{ maxWidth: 'none', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              Account Metadata
            </h2>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>USERNAME</div>
                <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{user?.username}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGISTRY STATUS</div>
                <div style={{ fontSize: '1.1rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {details?.isSubmitted ? (
                    <>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      <span>Verified Submission</span>
                    </>
                  ) : (
                    <>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
                      <span>Pending Details Submission</span>
                    </>
                  )}
                </div>
              </div>

              {details?.isSubmitted && (
                <>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGISTERED FULL NAME</div>
                    <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{details.fullName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONTACT EMAIL</div>
                    <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{details.email}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ maxWidth: 'none', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              Update Security Password
            </h2>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="current-password">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  id="current-password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  id="new-password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  id="confirm-password"
                  required
                  placeholder="Retype new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
              </div>

              <button className="btn-primary" type="submit" style={{ marginTop: '0.75rem' }} disabled={isChangingPassword}>
                {isChangingPassword ? 'Updating Password...' : 'Save Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
