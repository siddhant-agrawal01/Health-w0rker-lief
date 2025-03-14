"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { request } from "graphql-request";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (!session || session.user.role !== "CARE_WORKER") {
      router.push("/clock"); // Redirect if not a care worker
    } else {
      const fetchShifts = async () => {
        setLoading(true);
        try {
          const query = `
            query ($userId: String!) {
              shifts(where: { userId: $userId }) {
                id
                startTime
                endTime
                latitude
                longitude
                note
              }
            }
          `;
          const variables = { userId: session.user.id };
          const data = await request(GRAPHQL_ENDPOINT, query, variables);
          setShifts(data.shifts);
          setError(null);
        } catch (err) {
          setError("Failed to fetch shift history. Please try again.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchShifts(); // Call the function inside useEffect
    }
  }, [session, status, router]); // These are all stable dependencies

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Prevent rendering before redirect for non-care workers
  if (!session || session.user.role !== "CARE_WORKER") {
    return null;
  }

  // Render the shift history page
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Navigation bar */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <button
          onClick={() => router.push("/clock")}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          Back to Clock
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Shift History</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {shifts.length === 0 ? (
          <p className="text-gray-600">No shift history available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Clock-In Time
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Clock-Out Time
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Location
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-4 border-b">
                      {new Date(shift.startTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {shift.endTime
                        ? new Date(shift.endTime).toLocaleString()
                        : "Active"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {shift.latitude.toFixed(4)}, {shift.longitude.toFixed(4)}
                    </td>
                    <td className="py-2 px-4 border-b">{shift.note || "-"}</td>
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
