"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// You can replace these with actual icons from a library like lucide-react
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const AdminHeader = () => {
  const { signOut, user } = useAuth();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          {/* Placeholder để giữ bố cục */}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="View notifications"
          >
            <BellIcon className="h-6 w-6" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <div>
              <button
                type="button"
                className="flex rounded-full bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6324eb] focus:ring-offset-2 border border-gray-100 p-0.5"
                id="user-menu-button"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                  {user?.profile?.avatar_url ? (
                    <Image
                      className="h-full w-full object-cover"
                      src={user.profile.avatar_url}
                      alt="User avatar"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="font-bold text-xs text-[#6324eb] uppercase">
                      {user?.profile?.full_name?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {isDropdownOpen && (
              <div
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-50 overflow-hidden"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex={-1}
              >
                <Link
                  href="/admin-dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/system-setting"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-bold border-t border-gray-50 mt-1"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
