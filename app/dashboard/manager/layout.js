"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ManagerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    console.log('Session data:', session);
    console.log('Session user role:', session?.user?.role);
    console.log('Role check result:', session?.user?.role === 'MANAGER');
    if (!session || session.user.role !== 'MANAGER') {
      console.log('Redirecting to /clock. Role:', session?.user?.role);
      router.push('/clock');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session || session.user.role !== 'MANAGER') {
    return null; // Prevent rendering until redirect
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>
        <nav>
          <ul>
            <li className="mb-4">
              <Link href="/dashboard/manager" className="block p-2 rounded hover:bg-blue-700 transition">
                Shift Monitoring
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/dashboard/manager/analytics" className="block p-2 rounded hover:bg-blue-700 transition">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/clock" className="block p-2 rounded hover:bg-blue-700 transition">
                Clock In/Out
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Welcome, {session.user.name}</h1>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}