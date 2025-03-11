// "use client";
// import { useState, useEffect } from 'react';
// import { request } from 'graphql-request';

// export default function AnalyticsDashboard() {
//   const [dailyStats, setDailyStats] = useState([]);
//   const [weeklyReport, setWeeklyReport] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchAnalytics = async () => {
//     setLoading(true);
//     try {
//       const today = new Date();
//       const startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
//       const endDate = new Date().toISOString().split('T')[0];

//       const dailyStatsQuery = `
//         query ($startDate: String!, $endDate: String!) {
//           dailyStats(startDate: $startDate, endDate: $endDate) {
//             date
//             averageHours
//             staffCount
//           }
//         }
//       `;

//       const weeklyReportQuery = `
//         query ($startDate: String!, $endDate: String!) {
//           weeklyReport(startDate: $startDate, endDate: $endDate) {
//             userId
//             totalHours
//           }
//         }
//       `;

//       const variables = { startDate, endDate };

//       const dailyStatsData = await request('http://localhost:3000/api/graphql', dailyStatsQuery, variables);
//       const weeklyReportData = await request('http://localhost:3000/api/graphql', weeklyReportQuery, variables);

//       setDailyStats(dailyStatsData.dailyStats);
//       setWeeklyReport(weeklyReportData.weeklyReport);
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch analytics data. Please try again.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnalytics();
//   }, []);

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg">
//       <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analytics Dashboard</h2>

//       {loading && <p className="text-gray-600">Loading...</p>}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Daily Statistics */}
//       <div className="mb-8">
//         <h3 className="text-xl font-semibold text-gray-700 mb-2">Daily Statistics (Last 7 Days)</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {dailyStats.map((stat) => (
//             <div key={stat.date} className="p-4 bg-blue-100 rounded-lg shadow">
//               <p className="text-sm text-gray-600">{stat.date}</p>
//               <p className="text-lg font-bold text-blue-800">Avg Hours: {stat.averageHours.toFixed(2)}h</p>
//               <p className="text-sm text-gray-600">Staff Count: {stat.staffCount}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Weekly Reports */}
//       <div>
//         <h3 className="text-xl font-semibold text-gray-700 mb-2">Weekly Reports (Last 7 Days)</h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-2 px-4 border-b text-left text-gray-600">User ID</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-600">Total Hours</th>
//               </tr>
//             </thead>
//             <tbody>
//               {weeklyReport.map((report) => (
//                 <tr key={report.userId} className="hover:bg-gray-50 transition">
//                   <td className="py-2 px-4 border-b">{report.userId}</td>
//                   <td className="py-2 px-4 border-b">{report.totalHours.toFixed(2)}h</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";
import { useState, useEffect } from "react";
import { request } from "graphql-request";

export default function AnalyticsDashboard() {
  const [dailyStats, setDailyStats] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      const dailyStatsQuery = `
        query ($startDate: String!, $endDate: String!) {
          dailyStats(startDate: $startDate, endDate: $endDate) {
            date
            averageHours
            staffCount
          }
        }
      `;

      const weeklyReportQuery = `
        query ($startDate: String!, $endDate: String!) {
          weeklyReport(startDate: $startDate, endDate: $endDate) {
            userId
            totalHours
          }
        }
      `;

      const variables = { startDate, endDate };

      const dailyStatsData = await request("http://localhost:3000/api/graphql", dailyStatsQuery, variables);
      const weeklyReportData = await request("http://localhost:3000/api/graphql", weeklyReportQuery, variables);

      setDailyStats(dailyStatsData.dailyStats);
      setWeeklyReport(weeklyReportData.weeklyReport);
      setError(null);
    } catch (err) {
      setError("Failed to fetch analytics data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analytics Dashboard</h2>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Daily Statistics */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Daily Statistics (Last 7 Days)</h3>
        {dailyStats.length === 0 ? (
          <p className="text-gray-600">No daily statistics available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyStats.map((stat, index) => (
              <div
                key={stat.date}
                className="p-4 bg-blue-100 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-sm text-gray-600">{stat.date}</p>
                <p className="text-lg font-bold text-blue-800">Avg Hours: {stat.averageHours.toFixed(2)}h</p>
                <p className="text-sm text-gray-600">Staff Count: {stat.staffCount}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Reports */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Weekly Reports (Last 7 Days)</h3>
        {weeklyReport.length === 0 ? (
          <p className="text-gray-600">No weekly reports available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left text-gray-600">User ID</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {weeklyReport.map((report, index) => (
                  <tr
                    key={report.userId}
                    className="hover:bg-gray-50 transition-colors duration-200 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className="py-2 px-4 border-b">{report.userId}</td>
                    <td className="py-2 px-4 border-b">{report.totalHours.toFixed(2)}h</td>
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