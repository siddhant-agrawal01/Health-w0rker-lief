"use client";
import { useState, useEffect } from 'react';
import { request } from 'graphql-request';

export default function ShiftMonitoringDashboard() {
  const [activeShifts, setActiveShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveShifts = async () => {
    setLoading(true);
    try {
      const query = `
        query {
          activeShifts {
            id
            user {
              name
              email
            }
            startTime
            endTime
            latitude
            longitude
          }
        }
      `;
      const data = await request('http://localhost:3000/api/graphql', query);
      setActiveShifts(data.activeShifts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch active shifts. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveShifts();
    const interval = setInterval(fetchActiveShifts, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Active Shifts</h2>
        <button
          onClick={fetchActiveShifts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {activeShifts.length === 0 ? (
        <p className="text-gray-600">No active shifts at the moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b text-left text-gray-600">Staff Name</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Clock-In Time</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Clock-In Location</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Clock-Out Time</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Clock-Out Location</th>
              </tr>
            </thead>
            <tbody>
              {activeShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50 transition">
                  <td className="py-2 px-4 border-b">{shift.user.name}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(shift.startTime).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {shift.latitude.toFixed(4)}, {shift.longitude.toFixed(4)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {shift.endTime ? new Date(shift.endTime).toLocaleString() : 'Active'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {shift.endTime ? `${shift.latitude.toFixed(4)}, ${shift.longitude.toFixed(4)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}