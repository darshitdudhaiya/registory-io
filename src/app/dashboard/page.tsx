'use client';

import { useState, useEffect, useRef } from 'react';
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

interface AttachmentInfo {
  filename: string;
  mimeType: string;
  size: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [attachment, setAttachment] = useState<AttachmentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [dragActive, setDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setAttachment(data.attachment);
        
        if (data.user?.profileDetails?.isSubmitted) {
          const details = data.user.profileDetails;
          setFullName(details.fullName || '');
          setAddress(details.address || '');
          setEmail(details.email || '');
          setMobile(details.mobile || '');
          
          if (details.dob) {
            const dateObj = new Date(details.dob);
            const formattedDate = dateObj.toISOString().split('T')[0];
            setDob(formattedDate);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg('');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload JPG, PNG, or PDF files.');
      setSelectedFile(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMsg(`File is too large. Max size is 5MB. Selected file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('dob', dob);
      formData.append('email', email);
      formData.append('mobile', mobile);
      formData.append('address', address);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/details', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit profile details.');
        return;
      }

      setSuccessMsg('Personal details and attachment saved successfully!');
      setSelectedFile(null);
      setIsEditMode(false);
      await fetchProfile();
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>Loading registry details...</h2>
        </div>
      </div>
    );
  }

  const profile = user?.profileDetails;
  const hasSubmitted = profile?.isSubmitted && !isEditMode;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 3rem', maxWidth: '100%', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Registry Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Hello, <strong style={{ color: 'var(--text-primary)' }}>{user?.username}</strong>. Manage your registration documents here.
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

        {hasSubmitted ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
            <div className="glass-card" style={{ maxWidth: 'none', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.4rem' }}>Personal Profile Details</h2>
                <button className="btn-secondary" style={{ minHeight: '38px', padding: '0.25rem 1rem' }} onClick={() => setIsEditMode(true)}>
                  Edit Details
                </button>
              </div>

              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FULL NAME</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{profile?.fullName}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DATE OF BIRTH</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>
                    {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EMAIL ADDRESS</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{profile?.email}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MOBILE NUMBER</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{profile?.mobile}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RESIDENTIAL ADDRESS</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{profile?.address}</div>
                </div>

                {attachment && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>SUPPORTING DOCUMENT</div>
                    <div className="file-preview-card" style={{ marginTop: 0 }}>
                      <div className="file-preview-info">
                        <div className="file-preview-name">{attachment.filename}</div>
                        <div className="file-preview-size">{formatBytes(attachment.size)} | {attachment.mimeType}</div>
                      </div>
                      <div style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>Stored Securely</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card" style={{ maxWidth: 'none', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Documents
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Download your official registry sheets filled with your details below.
              </p>

              <div className="doc-grid">
                <div className="doc-download-card">
                  <div className="doc-download-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <div className="doc-download-title">PDF Document</div>
                  <a href="/api/documents/pdf" download className="doc-download-button">
                    Download
                  </a>
                </div>

                <div className="doc-download-card">
                  <div className="doc-download-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <div className="doc-download-title">Word Document</div>
                  <a href="/api/documents/docx" download className="doc-download-button">
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ maxWidth: 'none', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              {isEditMode ? 'Update Personal Details' : 'Verify Personal Profile details'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Please fill in your basic details and upload a supporting document (JPG, PNG, PDF) under 5MB.
            </p>

            <form onSubmit={handleFormSubmit} className="form-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    id="fullName"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dob">Date of Birth</label>
                  <input
                    className="form-input"
                    type="date"
                    id="dob"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    id="email"
                    required
                    autoComplete="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mobile">Mobile Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    id="mobile"
                    required
                    autoComplete="tel"
                    placeholder="e.g. +1 555-0199 or 10-digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="address">Residential Address</label>
                  <textarea
                    className="form-textarea"
                    id="address"
                    required
                    autoComplete="street-address"
                    placeholder="Enter your complete street and mailing address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <span className="form-label">Supporting Document Attachment</span>
                  
                  <div
                    className={`file-dropzone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="file-upload"
                      className="visually-hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                    <div className="file-dropzone-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p className="file-dropzone-text">
                      Drag & drop your file here, or <strong style={{ color: 'var(--accent-indigo)' }}>browse files</strong>
                    </p>
                    <span className="file-dropzone-constraints">
                      Supports JPG, PNG, PDF formats under 5MB
                    </span>
                  </div>

                  {selectedFile ? (
                    <div className="file-preview-card">
                      <div className="file-preview-info">
                        <div className="file-preview-name">{selectedFile.name}</div>
                        <div className="file-preview-size">{formatBytes(selectedFile.size)}</div>
                      </div>
                      <button className="btn-remove-file" onClick={removeFile} title="Remove File" disabled={isSubmitting}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  ) : attachment && isEditMode ? (
                    <div className="file-preview-card">
                      <div className="file-preview-info">
                        <div className="file-preview-name">{attachment.filename} (Stored)</div>
                        <div className="file-preview-size">{formatBytes(attachment.size)}</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Will keep current file if none selected</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-muted)', paddingTop: '1.5rem' }}>
                {isEditMode && (
                  <button
                    className="btn-secondary"
                    type="button"
                    style={{ minWidth: '120px' }}
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedFile(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className="btn-primary"
                  type="submit"
                  style={{ width: 'auto', minWidth: '180px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Details...' : isEditMode ? 'Update Profile' : 'Submit Registration'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
