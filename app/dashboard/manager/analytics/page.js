"use client";
import { useState, useEffect, useMemo } from "react";
import { request } from "graphql-request";
import {
  BarChart3,
  Clock,
  Users,
  Calendar,
  Loader2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [dailyStats, setDailyStats] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "totalHours",
    direction: "desc",
  });
  const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.setDate(today.getDate() - 7))
        .toISOString()
        .split("T")[0];
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

      const dailyStatsData = await request(
        GRAPHQL_ENDPOINT,
        dailyStatsQuery,
        variables
      );
      const weeklyReportData = await request(
        GRAPHQL_ENDPOINT,
        weeklyReportQuery,
        variables
      );

      // Sort data by date for visualization
      const sortedDailyStats = [...dailyStatsData.dailyStats].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setDailyStats(sortedDailyStats);
      setWeeklyReport(weeklyReportData.weeklyReport);
      setError(null);
    } catch (err) {
      setError("Failed to fetch analytics data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get statistics summaries
  const getStatSummaries = () => {
    if (dailyStats.length === 0)
      return { avgHours: 0, totalStaff: 0, maxDay: "N/A" };

    const totalAvgHours = dailyStats.reduce(
      (sum, day) => sum + day.averageHours,
      0
    );
    const avgHours = totalAvgHours / dailyStats.length;

    const totalStaff = dailyStats.reduce(
      (max, day) => Math.max(max, day.staffCount),
      0
    );

    let maxDay = dailyStats[0];
    dailyStats.forEach((day) => {
      if (day.averageHours > maxDay.averageHours) maxDay = day;
    });

    return {
      avgHours: avgHours.toFixed(1),
      totalStaff,
      maxDay: maxDay.date
        ? new Date(maxDay.date).toLocaleDateString("en-US", { weekday: "long" })
        : "N/A",
    };
  };

  // Handle sorting for the table
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to weekly report data
  const sortedWeeklyReport = useMemo(() => {
    let sortableItems = [...weeklyReport];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [weeklyReport, sortConfig]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const stats = getStatSummaries();

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Staff Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Performance overview for the last 7 days
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={`mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={48} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Statistics summary */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Clock size={24} className="text-blue-600" />
              <div className="ml-4">
                <p className="text-gray-500">Average Hours</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.avgHours}h
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Users size={24} className="text-green-600" />
              <div className="ml-4">
                <p className="text-gray-500">Total Staff</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.totalStaff}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Calendar size={24} className="text-purple-600" />
              <div className="ml-4">
                <p className="text-gray-500">Busiest Day</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.maxDay}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Statistics */}
      {!loading && !error && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Daily Statistics (Last 7 Days)
          </h2>
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
                  <p className="text-sm text-gray-600">
                    {formatDate(stat.date)}
                  </p>
                  <p className="text-lg font-bold text-blue-800">
                    Avg Hours: {stat.averageHours.toFixed(2)}h
                  </p>
                  <p className="text-sm text-gray-600">
                    Staff Count: {stat.staffCount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly Reports */}
      {!loading && !error && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Weekly Reports (Last 7 Days)
          </h2>
          {weeklyReport.length === 0 ? (
            <p className="text-gray-600">No weekly reports available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      className="py-2 px-4 border-b text-left text-gray-600 cursor-pointer"
                      onClick={() => requestSort("userId")}
                    >
                      User ID{" "}
                      {sortConfig.key === "userId" &&
                        (sortConfig.direction === "asc" ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        ))}
                    </th>
                    <th
                      className="py-2 px-4 border-b text-left text-gray-600 cursor-pointer"
                      onClick={() => requestSort("totalHours")}
                    >
                      Total Hours{" "}
                      {sortConfig.key === "totalHours" &&
                        (sortConfig.direction === "asc" ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        ))}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWeeklyReport.map((report, index) => (
                    <tr
                      key={report.userId}
                      className="hover:bg-gray-50 transition-colors duration-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="py-2 px-4 border-b">{report.userId}</td>
                      <td className="py-2 px-4 border-b">
                        {report.totalHours.toFixed(2)}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
