'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function AuthButtons() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? (
    <div>
      <p>Welcome, {user.name}!</p>
      <a href="/api/auth/logout" className="text-blue-500">Logout</a>
    </div>
  ) : (
    <a href="/api/auth/login" className="text-blue-500">Login</a>
  );
}