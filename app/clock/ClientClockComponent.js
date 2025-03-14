// app/clock/ClientClockComponent.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { request } from "graphql-request";
import { toast } from "sonner";
import {
  FiClock,
  FiLogIn,
  FiLogOut,
  FiMap,
  FiUser,
  FiClipboard,
  FiCheckCircle,
  FiAlertCircle,
  FiPower,
  FiChevronRight,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";

export default function ClientClockComponent() {
  const { data: session, status } = useSession();
  const [location, setLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState("");
  const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const handleGeolocation = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      setLocation({ latitude, longitude, accuracy });
      setError(null);
      setLocationPermissionGranted(true);
    };

    const handleGeolocationError = (err) => {
      console.error("Geolocation Error:", err);
      let message = "Geolocation failed. Please enable location permissions.";
      if (err.code === 1) message = "Location access denied by user.";
      else if (err.code === 2) message = "Location unavailable.";
      else if (err.code === 3) message = "Location request timed out.";
      setError(message);
      setLocationPermissionGranted(false);
    };

    const watchId = navigator.geolocation.watchPosition(
      handleGeolocation,
      handleGeolocationError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  const checkActiveShift = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const query = `
        query ($where: ShiftWhereInput!) {
          shifts(where: $where) {
            id
            startTime
          }
        }
      `;
      const variables = { where: { userId: session.user.id, endTime: null } };
      const { shifts } = await request(
        GRAPHQL_ENDPOINT,
        query,
        variables
      );
      if (shifts.length > 0) {
        setActiveShiftId(shifts[0].id);
        setStartTime(shifts[0].startTime);
      } else {
        setActiveShiftId(null);
        setStartTime(null);
      }
    } catch (err) {
      console.error("Check active shift error:", err);
      setError("Failed to check active shift.");
    }
  }, [session]);
  useEffect(() => {
    if (session?.user?.id) checkActiveShift();
  }, [session, checkActiveShift]);
  
 

  useEffect(() => {
    if (!activeShiftId || !startTime) {
      setShiftDuration("");
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.floor((new Date() - new Date(startTime)) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setShiftDuration(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShiftId, startTime]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // const checkActiveShift = useCallback(async () => {
  //   if (!session?.user?.id) return;
  //   try {
  //     const query = `
  //       query ($where: ShiftWhereInput!) {
  //         shifts(where: $where) {
  //           id
  //           startTime
  //         }
  //       }
  //     `;
  //     const variables = { where: { userId: session.user.id, endTime: null } };
  //     const { shifts } = await request(
  //       "http://localhost:3000/api/graphql",
  //       query,
  //       variables
  //     );
  //     if (shifts.length > 0) {
  //       setActiveShiftId(shifts[0].id);
  //       setStartTime(shifts[0].startTime);
  //     } else {
  //       setActiveShiftId(null);
  //       setStartTime(null);
  //     }
  //   } catch (err) {
  //     console.error("Check active shift error:", err);
  //     setError("Failed to check active shift.");
  //   }
  // }, [session]);

  const handleClockIn = async (e) => {
    e.preventDefault(); // Ensure triggered by button
    if (!session) {
      setError("Please log in first.");
      return;
    }
    if (!locationPermissionGranted || !location) {
      setError("Location not available. Please enable permissions.");
      return;
    }
    if (activeShiftId) {
      setError("You are already clocked in.");
      return;
    }

    setLoading(true);
    try {
      // Verify user exists
      const userQuery = `
        query ($id: String!) {
          user(id: $id) {
            id
            name
          }
        }
      `;
      const userResult = await request(
        GRAPHQL_ENDPOINT,
        userQuery,
        { id: session.user.id }
      );
      if (!userResult.user) {
        setError("User not found in database. Please contact support.");
        setLoading(false);
        return;
      }

      // Check hospital proximity
      const hospitalQuery = `
        query {
          hospitals {
            id
            latitude
            longitude
            radius
          }
        }
      `;
      const { hospitals } = await request(
        GRAPHQL_ENDPOINT,
        hospitalQuery
      );
      if (!hospitals?.length) {
        setError("No hospitals configured.");
        setLoading(false);
        return;
      }

      const withinPerimeter = hospitals.some((hospital) => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(hospital.latitude),
          parseFloat(hospital.longitude)
        );
        return distance <= hospital.radius;
      });

      if (!withinPerimeter) {
        setError("You are not within any hospital’s radius.");
        setLoading(false);
        return;
      }

      // Create shift
      const mutation = `
        mutation ($userId: String!, $startTime: DateTime!, $latitude: Float!, $longitude: Float!, $note: String) {
          createShift(userId: $userId, startTime: $startTime, latitude: $latitude, longitude: $longitude, note: $note) {
            id
            startTime
          }
        }
      `;
      const variables = {
        userId: session.user.id,
        startTime: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        note: note || null,
      };
      const { createShift } = await request(
        GRAPHQL_ENDPOINT,
        mutation,
        variables
      );
      setActiveShiftId(createShift.id);
      setStartTime(createShift.startTime);
      setNote("");
      toast.success("Clocked in successfully!", {
        description: `Your shift started at ${new Date(
          createShift.startTime
        ).toLocaleTimeString()}`,
        icon: <FiCheckCircle />,
      });
    } catch (err) {
      console.error("Clock-in error:", err);
      const errorMessage =
        err.response?.errors?.[0]?.message || "Failed to clock in.";
      setError(errorMessage);
      toast.error("Clock-in failed", {
        description: errorMessage,
        icon: <FiAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async (e) => {
    e.preventDefault();
    if (!session) {
      setError("Please log in first.");
      return;
    }
    if (!locationPermissionGranted || !location) {
      setError("Location not available.");
      return;
    }
    if (!activeShiftId) {
      setError("No active shift to clock out from.");
      return;
    }

    setLoading(true);
    try {
      const mutation = `
        mutation ($id: String!, $endTime: DateTime!, $note: String) {
          updateShift(id: $id, endTime: $endTime, note: $note) {
            id
            endTime
            startTime
          }
        }
      `;
      const variables = {
        id: activeShiftId,
        endTime: new Date().toISOString(),
        note: note || null,
      };
      const { updateShift } = await request(
        GRAPHQL_ENDPOINT,
        mutation,
        variables
      );
      setActiveShiftId(null);
      setStartTime(null);
      setNote("");
      setShiftDuration("");

      // Calculate duration for the toast
      const start = new Date(updateShift.startTime);
      const end = new Date(updateShift.endTime);
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      toast.success("Clocked out successfully!", {
        description: `Shift duration: ${hours}h ${minutes}m`,
        icon: <FiCheckCircle />,
      });
    } catch (err) {
      console.error("Clock-out error:", err);
      const errorMessage =
        err.response?.errors?.[0]?.message || "Failed to clock out.";
      setError(errorMessage);
      toast.error("Clock-out failed", {
        description: errorMessage,
        icon: <FiAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    toast.info("Signing out...");
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FiClock className="text-blue-500 text-xl animate-spin" />
          </div>
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
        <div className="max-w-sm w-full mx-4 overflow-hidden">
          <div className="p-8 bg-white rounded-2xl shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <FiClock className="text-blue-600 text-2xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">
              Healthcare Clock
            </h2>
            <p className="text-slate-500 text-center mb-8">
              Please sign in to track your work hours securely
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <button
              onClick={() => signIn()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <FiLogIn className="mr-2" />
              Sign In
            </button>
          </div>
          <p className="text-center text-slate-400 text-xs mt-4">
            © {new Date().getFullYear()} Healthcare Provider Systems
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <FiUser className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Welcome</p>
              <p className="font-medium text-slate-800">{session.user.name}</p>
            </div>
          </div>
          <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            {session.user.role === "MANAGER" ? "Manager" : "Healthcare Staff"}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-5 bg-blue-600">
            <h1 className="text-xl font-bold text-white flex items-center">
              <FiClock className="mr-2" />
              Shift Clock
            </h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-5 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-start">
                <FiMap className="text-slate-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Current Location
                  </p>
                  {location ? (
                    <p className="text-slate-500 text-sm">
                      {location.latitude.toFixed(4)},{" "}
                      {location.longitude.toFixed(4)}
                      <span className="block text-xs text-slate-400 mt-1">
                        Accuracy: {location.accuracy?.toFixed(0) || "N/A"}m
                      </span>
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                      Awaiting location data...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {activeShiftId && startTime && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <FiCheckCircle className="text-green-600" />
                  </div>
                  <p className="text-green-800 font-medium">Active Shift</p>
                </div>
                <p className="text-green-700 text-sm mb-1">
                  Started:{" "}
                  {new Date(startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="font-mono text-green-700 text-xl">
                  {shiftDuration}
                </p>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center">
                  <FiClipboard className="mr-2" />
                  Shift Notes
                </div>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add optional notes about your shift"
                rows="2"
                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-600 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <button
                onClick={handleClockIn}
                disabled={loading || activeShiftId}
                className={`py-3 rounded-xl text-white transition-all flex items-center justify-center ${
                  loading || activeShiftId
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                }`}
              >
                <FiLogIn className="mr-2" />
                Clock In
              </button>
              <button
                onClick={handleClockOut}
                disabled={loading || !activeShiftId}
                className={`py-3 rounded-xl text-white transition-all flex items-center justify-center ${
                  loading || !activeShiftId
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg"
                }`}
              >
                <FiLogOut className="mr-2" />
                Clock Out
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a href="/history">
            <button className="w-full py-4 px-4  bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all flex items-center justify-center shadow-sm">
              <FiClock className="mr-2" />
              View Shift History
              <FiChevronRight className="ml-auto" />
            </button>
          </a>

          {/* Conditional navigation options based on user role */}
          {session.user.role === "MANAGER" ? (
            <a href="/dashboard/manager">
              <button className="w-full py-3 px-4 my-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all flex items-center justify-center shadow-sm">
                <FiUser className="mr-2" />
                Manager Dashboard
                <FiChevronRight className="ml-auto" />
              </button>
            </a>
          ) : (
            session.user.role === "CARE_WORKER" && (
              <a href="/care-worker/dashboard">
                <button className="w-full py-3 px-4 my-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all flex items-center justify-center shadow-sm">
                  <FiCalendar className="mr-2" />
                  Care Schedule
                  <FiChevronRight className="ml-auto" />
                </button>
              </a>
            )
          )}

        

          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-red-100 border border-red-100 text-red-500 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all flex items-center mt-4 justify-center"
          >
            <FiPower className="mr-2 " />
            Sign Out
          </button>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          © {new Date().getFullYear()} Healthcare Provider Systems
        </p>
      </div>
    </div>
  );
}
