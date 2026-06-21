'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <nav className="navbar">
      <Link href="/dashboard" className="nav-logo">
        REGISTRY.IO
      </Link>
      <ul className="nav-links">
        <li>
          <Link
            href="/dashboard"
            className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}
          >
            Profile
          </Link>
        </li>
        <li>
          <button
            className="btn-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Leaving...' : 'Logout'}
          </button>
        </li>
      </ul>
    </nav>
  );
}
