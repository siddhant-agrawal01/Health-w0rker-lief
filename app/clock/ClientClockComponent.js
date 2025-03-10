"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { request } from "graphql-request";

export default function ClientClockComponent() {
  const { data: session, status } = useSession();
  const [location, setLocation] = useState(null);
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
      console.log("Raw Geolocation:", position);
      const { latitude, longitude, accuracy } = position.coords;
      setLocation({
        latitude,
        longitude,
        accuracy,
      });
      setError(null);
    };

    const handleGeolocationError = (err) => {
      console.error("Geolocation Error:", err);
      setError(
        `Geolocation failed: ${err.message}. Please enable location permissions or use a device with GPS.`
      );
    };

    const watchId = navigator.geolocation.watchPosition(
      handleGeolocation,
      handleGeolocationError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      checkActiveShift();
    }
  }, [session]);

  useEffect(() => {
    if (!activeShiftId || !startTime) {
      setShiftDuration("");
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setShiftDuration(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShiftId, startTime]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
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

  const checkActiveShift = async () => {
    try {
      const query = `
        query ($where: ShiftWhereInput!) {
          shifts(where: $where) {
            id
            startTime
          }
        }
      `;
      const variables = {
        where: {
          userId: session.user.id,
          endTime: null,
        },
      };
      const { shifts } = await request(
        "http://localhost:3000/api/graphql",
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
      console.error("Error checking active shift:", err);
    }
  };

  const handleClockIn = async () => {
    if (!session) {
      setError("Please log in first.");
      return;
    }
    if (!location) {
      setError("Location not available yet.");
      return;
    }
    if (activeShiftId) {
      setError("You are already clocked in.");
      return;
    }

    setLoading(true);
    try {
      const query = `
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
        "http://localhost:3000/api/graphql",
        query
      );
      console.log("Fetched Hospitals:", hospitals);

      if (!hospitals || hospitals.length === 0) {
        setError("No hospitals found in the database.");
        setLoading(false);
        return;
      }

      let withinPerimeter = false;
      for (const hospital of hospitals) {
        console.log(
          "Hospital Coords:",
          parseFloat(hospital.latitude),
          parseFloat(hospital.longitude)
        );
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(hospital.latitude),
          parseFloat(hospital.longitude)
        );
        console.log(
          `Distance to ${hospital.id}: ${distance} km (Radius: ${hospital.radius} km)`
        );
        if (distance <= hospital.radius) {
          withinPerimeter = true;
          break;
        }
      }

      if (!withinPerimeter) {
        setError(
          `You are not within the required radius of any hospital. Closest hospital radius: ${
            hospitals[0]?.radius || "unknown"
          } km`
        );
        setLoading(false);
        return;
      }

      const currentTime = new Date().toISOString().replace(/\0/g, "");
      console.log("Generated startTime:", currentTime);
      console.log("User ID:", session.user.id);
      console.log("Latitude:", location.latitude);
      console.log("Longitude:", location.longitude);
      console.log("Note:", note || null);

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
        startTime: currentTime,
        latitude: location.latitude,
        longitude: location.longitude,
        note: note || null,
      };
      console.log("User ID from session:", session.user.id); // Add this line
      console.log("Mutation variables:", variables);
      const userQuery = `
  query ($id: String!) {
    user(id: $id) {
      id
      name
    }
  }
`;
const userResult = await request("http://localhost:3000/api/graphql", userQuery, { id: session.user.id });
console.log("User from database:", userResult.user);

      const { createShift } = await request(
        "http://localhost:3000/api/graphql",
        mutation,
        variables
      );
      setActiveShiftId(createShift.id);
      setStartTime(createShift.startTime);
      alert("Clocked in successfully!");
      setNote("");
    } catch (err) {
      console.error("Error during clock-in:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!session) {
      setError("Please log in first.");
      return;
    }
    if (!location) {
      setError("Location not available yet.");
      return;
    }
    if (!activeShiftId) {
      setError("You are not clocked in.");
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
      alert("Clocked out successfully!");
      setNote("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-blue-300">
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
          <p className="text-red-500 mb-4">{error || "Please log in first."}</p>
          <button
            onClick={() => signIn()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Healthcare Shift Clock
        </h1>
        <p className="text-gray-600 mb-2">Welcome, {session.user.name}!</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {location ? (
          <p className="text-gray-600 mb-4">
            Location: {location.latitude.toFixed(4)},{" "}
            {location.longitude.toFixed(4)} (Accuracy:{" "}
            {location.accuracy ? `${location.accuracy.toFixed(0)}m` : "N/A"})
          </p>
        ) : (
          <p className="text-gray-600 mb-4">Fetching location...</p>
        )}
        {activeShiftId && startTime && (
          <div className="mb-4 p-4 bg-green-100 rounded-lg">
            <p className="text-green-700 font-semibold">
              Active Shift: Started at {new Date(startTime).toLocaleString()}
            </p>
            <p className="text-green-700">Shift Duration: {shiftDuration}</p>
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
            className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition duration-200 ${
              loading || activeShiftId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !activeShiftId}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition duration-200 ${
              loading || !activeShiftId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Clock Out
          </button>
        </div>
        <a href="/history">
          <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200">
            View History
          </button>
        </a>
      </div>
    </div>
  );
}