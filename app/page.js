import { auth0 } from '@/lib/auth0';

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Healthcare Shift App</h1>
          <div className="space-x-4">
            <a href="/auth/login?screen_hint=signup">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Sign Up
              </button>
            </a>
            <a href="/auth/login">
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
        <a href="/auth/logout">
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Log Out
          </button>
        </a>
      </div>
    </div>
  );
}