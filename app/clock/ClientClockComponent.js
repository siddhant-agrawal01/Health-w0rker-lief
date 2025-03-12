// app/clock/ClientClockComponent.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { request } from "graphql-request";

export default function ClientClockComponent() {
  const { data: session, status } = useSession();
  const [location, setLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState("");

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

  useEffect(() => {
    if (session?.user?.id) checkActiveShift();
  }, [session]);

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
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
      const { shifts } = await request("http://localhost:3000/api/graphql", query, variables);
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
      const userResult = await request("http://localhost:3000/api/graphql", userQuery, { id: session.user.id });
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
      const { hospitals } = await request("http://localhost:3000/api/graphql", hospitalQuery);
      if (!hospitals?.length) {
        setError("No hospitals configured.");
        setLoading(false);
        return;
      }

      const withinPerimeter = hospitals.some(hospital => {
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
      const { createShift } = await request("http://localhost:3000/api/graphql", mutation, variables);
      setActiveShiftId(createShift.id);
      setStartTime(createShift.startTime);
      setNote("");
      alert("Clocked in successfully!");
    } catch (err) {
      console.error("Clock-in error:", err);
      setError(err.response?.errors?.[0]?.message || "Failed to clock in.");
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
          }
        }
      `;
      const variables = {
        id: activeShiftId,
        endTime: new Date().toISOString(),
        note: note || null,
      };
      await request("http://localhost:3000/api/graphql", mutation, variables);
      setActiveShiftId(null);
      setStartTime(null);
      setNote("");
      setShiftDuration("");
      alert("Clocked out successfully!");
    } catch (err) {
      console.error("Clock-out error:", err);
      setError(err.response?.errors?.[0]?.message || "Failed to clock out.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p className="text-center text-gray-500">Loading...</p>;

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-blue-300">
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
          <p className="text-red-500 mb-4">{error || "Please log in first."}</p>
          <button
            onClick={() => signIn()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Healthcare Shift Clock</h1>
        <p className="text-gray-600 mb-2">Welcome, {session.user.name}!</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {location ? (
          <p className="text-gray-600 mb-4">
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} (Accuracy: {location.accuracy?.toFixed(0) || "N/A"}m)
          </p>
        ) : (
          <p className="text-gray-600 mb-4">Fetching location...</p>
        )}
        {activeShiftId && startTime && (
          <div className="mb-4 p-4 bg-green-100 rounded-lg">
            <p className="text-green-700 font-semibold">
              Active Shift: Started at {new Date(startTime).toLocaleString()}
            </p>
            <p className="text-green-700">Duration: {shiftDuration}</p>
          </div>
        )}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
          className="mb-4 p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleClockIn}
            disabled={loading || activeShiftId}
            className={`flex-1 px-4 py-2 rounded-lg text-white ${loading || activeShiftId ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !activeShiftId}
            className={`flex-1 px-4 py-2 rounded-lg text-white ${loading || !activeShiftId ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
          >
            Clock Out
          </button>
        </div>
        <a href="/history">
          <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            View History
          </button>
        </a>
      </div>
    </div>
  );
}