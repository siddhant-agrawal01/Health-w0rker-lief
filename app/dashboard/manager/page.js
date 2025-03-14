"use client";
import { useState, useEffect } from "react";
import { request } from "graphql-request";
import { RefreshCw, MapPin, Clock, User } from "lucide-react";

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
      const data = await request( GRAPHQL_ENDPOINT, query);
      setActiveShifts(data.activeShifts);
      setError(null);
    } catch (err) {
      setError("Failed to fetch active shifts. Please try again.");
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

  // Format date to display in a user-friendly way
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Active";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Format location for display
  const formatLocation = (lat, lng) => {
    if (!lat || !lng) return "-";
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Active Shifts
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor healthcare workers currently on duty
          </p>
        </div>
        <button
          onClick={fetchActiveShifts}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={`mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Shifts</p>
              <p className="text-2xl font-semibold">
                {activeShifts.filter((s) => !s.endTime).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <User size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Staff Today</p>
              <p className="text-2xl font-semibold">{activeShifts.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Clock size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Shifts</p>
              <p className="text-2xl font-semibold">
                {activeShifts.filter((s) => s.endTime).length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Shifts table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Shift Details</h2>
        </div>

        {activeShifts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <Clock size={24} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No active shifts
            </h3>
            <p className="mt-2 text-gray-500">
              There are currently no healthcare workers on shift.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Staff</th>
                  <th className="px-6 py-3">Clock-In</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Clock-Out</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {activeShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {shift.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {shift.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {shift.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(shift.startTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={16} className="mr-1" />
                        <span>
                          {formatLocation(shift.latitude, shift.longitude)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shift.endTime ? formatDateTime(shift.endTime) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          shift.endTime
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {shift.endTime ? "Completed" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
