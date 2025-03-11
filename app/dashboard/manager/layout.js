// "use client";
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useEffect } from 'react';

// export default function ManagerLayout({ children }) {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === 'loading') return;
//     console.log('Session data:', session);
//     console.log('Session user role:', session?.user?.role);
//     console.log('Role check result:', session?.user?.role === 'MANAGER');
//     if (!session || session.user.role !== 'MANAGER') {
//       console.log('Redirecting to /clock. Role:', session?.user?.role);
//       router.push('/clock');
//     }
//   }, [session, status, router]);

//   if (status === 'loading') {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   if (!session || session.user.role !== 'MANAGER') {
//     return null; // Prevent rendering until redirect
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-64 bg-blue-800 text-white p-4 shadow-lg">
//         <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>
//         <nav>
//           <ul>
//             <li className="mb-4">
//               <Link href="/dashboard/manager" className="block p-2 rounded hover:bg-blue-700 transition">
//                 Shift Monitoring
//               </Link>
//             </li>
//             <li className="mb-4">
//               <Link href="/dashboard/manager/analytics" className="block p-2 rounded hover:bg-blue-700 transition">
//                 Analytics
//               </Link>
//             </li>
//             <li>
//               <Link href="/clock" className="block p-2 rounded hover:bg-blue-700 transition">
//                 Clock In/Out
//               </Link>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-3xl font-semibold text-gray-800">Welcome, {session.user.name}</h1>
//             <button
//               onClick={() => router.push('/api/auth/signout')}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//             >
//               Sign Out
//             </button>
//           </div>
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }


"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // shadcn/ui Button component
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react"; // Icons for hamburger menu

export default function ManagerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle

  // Role-based access check
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "MANAGER") {
      router.push("/clock");
    }
  }, [session, status, router]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session || session.user.role !== "MANAGER") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0 md:w-64 md:flex md:flex-col md:shadow-lg`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-blue-700">
          <h2 className="text-2xl font-bold">Manager Dashboard</h2>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard/manager">
                <span className="block p-2 rounded hover:bg-blue-700 transition-colors duration-200">
                  Shift Monitoring
                </span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/manager/analytics">
                <span className="block p-2 rounded hover:bg-blue-700 transition-colors duration-200">
                  Analytics
                </span>
              </Link>
            </li>
            <li>
              <Link href="/clock">
                <span className="block p-2 rounded hover:bg-blue-700 transition-colors duration-200">
                  Clock In/Out
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer (Optional) */}
        <div className="p-4 border-t border-blue-700">
          <p className="text-sm">© 2025 Healthcare App</p>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Hamburger Menu (visible on mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <h1 className="text-xl font-semibold text-gray-800 ml-2">
              Welcome, {session.user.name}
            </h1>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
          >
            Sign Out
          </Button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
}