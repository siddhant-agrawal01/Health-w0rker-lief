// app/page.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/[auth]/[...nextauth]/route"; // Import authOptions
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Healthcare Shift App</h1>
          <div className="space-x-4">
            {/* NextAuth.js doesn't distinguish signup/login routes; both go to signin */}
            <a href="/auth/signin">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Sign Up
              </button>
            </a>
            <a href="/auth/signin">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Log In
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Healthcare Shift App</h1>
        <h2 className="text-xl mb-2">Welcome, {session.user.name}!</h2>
        <Link href="/clock">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
            Go to Clock
          </button>
        </Link>
        <Link href="/api/auth/signout">
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Log Out
          </button>
        </Link>
      </div>
    </div>
  );
}
