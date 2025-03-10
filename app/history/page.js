// app/history/page.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/[auth]/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-blue-300">
        <p className="text-gray-600">Please log in to view your shift history.</p>
      </div>
    );
  }

  const shifts = await prisma.shift.findMany({
    where: {
      userId: session.user.id,
      endTime: { not: null },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      latitude: true,
      longitude: true,
      note: true,
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 py-8">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shift History</h1>
        {shifts.length === 0 ? (
          <p className="text-gray-600">No past shifts found.</p>
        ) : (
          <ul className="space-y-4">
            {shifts.map((shift) => (
              <li key={shift.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <p className="text-gray-700 font-semibold">Shift ID: {shift.id}</p>
                <p className="text-gray-600">Start: {new Date(shift.startTime).toLocaleString()}</p>
                <p className="text-gray-600">End: {new Date(shift.endTime).toLocaleString()}</p>
                <p className="text-gray-600">
                  Location: {shift.latitude.toString()}, {shift.longitude.toString()}
                </p>
                <p className="text-gray-600">Note: {shift.note || 'None'}</p>
              </li>
            ))}
          </ul>
        )}
        <a href="/clock">
          <button className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
            Back to Clock
          </button>
        </a>
      </div>
    </div>
  );
}