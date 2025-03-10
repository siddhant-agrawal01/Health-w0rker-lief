// app/auth/signin/page.js
'use client';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid username or password. Please try again.');
    } else if (errorParam) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError('Invalid username or password. Please try again.');
    } else {
      window.location.href = '/clock';
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    await signIn('google', { callbackUrl: '/clock' });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="mb-4 p-2 border rounded w-full"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-4 p-2 border rounded w-full"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full">
            Sign In with Credentials
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  );
}