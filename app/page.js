"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiClock,
  FiMapPin,
  FiBarChart2,
  FiUsers,
  FiShield,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/clock");
    }
  }, [status, router]);

  // Handle navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FiClock className="text-blue-500 text-xl animate-spin" />
          </div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiClock className="text-blue-600 text-2xl mr-2" />
              <span className="text-xl font-bold text-slate-800">
                HealthShift
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-slate-600 hover:text-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
                Smart Shift Management for Healthcare Heroes
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Streamline attendance tracking with our location-based clock-in
                system specifically designed for healthcare organizations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/auth/signin"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Start Tracking Time
                </Link>
                <a
                  href="#features"
                  className="bg-white text-blue-600 border border-blue-200 hover:border-blue-300 px-6 py-3 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-blue-50 rounded-full filter blur-2xl opacity-70"></div>
              <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-green-50 rounded-full filter blur-3xl opacity-70"></div>

              <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiUser className="text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-slate-500">Welcome</p>
                      <p className="font-medium text-slate-800">
                        Sarah Johnson
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Active Shift
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl mb-4">
                  <p className="text-slate-600 text-sm mb-1">
                    Current Location
                  </p>
                  <div className="flex items-center">
                    <FiMapPin className="text-blue-500 mr-2" />
                    <p className="font-medium">General Hospital North Wing</p>
                  </div>
                </div>
                <div className="font-mono text-center text-3xl font-bold text-slate-700 my-6">
                  04:27:13
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled
                    className="bg-slate-200 text-slate-500 py-2 rounded-lg"
                  >
                    Clock In
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">
                    Clock Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-16 md:py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800">
              Built for Healthcare Professionals
            </h2>
            <p className="mt-4 text-slate-600 max-w-3xl mx-auto">
              Our platform is designed to meet the unique needs of healthcare
              organizations, ensuring staff are where they need to be when they
              need to be there.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FiMapPin className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Location-Based Clock-In
              </h3>
              <p className="text-slate-600">
                Ensure staff are physically present at your healthcare facility
                before they can clock in, with customizable perimeter settings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FiBarChart2 className="text-green-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Real-Time Analytics
              </h3>
              <p className="text-slate-600">
                View comprehensive reports on staff hours, attendance patterns,
                and other key metrics to optimize workforce management.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Role-Based Access
              </h3>
              <p className="text-slate-600">
                Different user roles for managers and care workers ensure
                everyone has the right level of access and functionality.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <FiClock className="text-amber-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Shift Monitoring
              </h3>
              <p className="text-slate-600">
                Track active shifts in real-time, including start times,
                durations, and locations of your healthcare staff.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiShield className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Secure Authentication
              </h3>
              <p className="text-slate-600">
                Multiple sign-in options with secure authentication to ensure
                only authorized staff can access the system.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <FiCheck className="text-teal-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Simple User Experience
              </h3>
              <p className="text-slate-600">
                Intuitive interface designed specifically for healthcare workers
                to clock in and out with minimal effort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Ready to streamline your healthcare workforce?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join hundreds of healthcare facilities already using our platform to
            manage their staff shifts efficiently.
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started Now <FiChevronRight className="inline ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <FiClock className="text-blue-400 text-2xl mr-2" />
                <span className="text-xl font-bold">HealthShift</span>
              </div>
              <p className="mt-4 text-slate-300">
                Smart shift management for healthcare organizations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-white transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-white transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-white transition"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Link
                    href="/auth/signin"
                    className="text-slate-300 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-slate-300">
                Have questions about our platform? <br />
                Email us at{" "}
                <a
                  href="mailto:info@healthshift.com"
                  className="text-blue-400 hover:text-blue-300"
                >
                  info@healthshift.com
                </a>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>
              © {new Date().getFullYear()} HealthShift. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper component
function FiUser({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
