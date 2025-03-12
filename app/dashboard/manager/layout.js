"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X, BarChart2, Clock, Users, Home, LogOut } from "lucide-react";

export default function ManagerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Role-based access check
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "MANAGER") {
      router.push("/clock");
    }
  }, [session, status, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard/manager", icon: <Home size={20} /> },
    {
      name: "Shift Monitoring",
      href: "/dashboard/manager",
      icon: <Users size={20} />,
    },
    {
      name: "Analytics",
      href: "/dashboard/manager/analytics",
      icon: <BarChart2 size={20} />,
    },
    { name: "Clock In/Out", href: "/clock", icon: <Clock size={20} /> },
  ];

  const isActive = (path) => {
    if (path === "/dashboard/manager" && pathname === "/dashboard/manager") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/dashboard/manager";
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "MANAGER") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-bold text-blue-600">Health Manager</h2>
          </div>

          {/* Close button for mobile */}
          <button
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4  border-t">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              <span className="text-red-500">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                className="p-2 rounded-md md:hidden"
                onClick={toggleSidebar}
              >
                <Menu size={24} />
              </button>
              <h1 className="hidden md:block text-lg font-medium text-gray-800 ml-2">
                {pathname.includes("analytics")
                  ? "Analytics Dashboard"
                  : "Shift Monitoring"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
}
