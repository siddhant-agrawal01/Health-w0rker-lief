// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { request } from 'graphql-request';

// export default function ClockPage() {
//   const [location, setLocation] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [note, setNote] = useState('');
//   const router = useRouter();

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError('Geolocation is not supported by your browser.');
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//       },
//       (err) => setError(err.message),
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );
//   }, []);

//   // useEffect(() => {
//   //   if (!navigator.geolocation) {
//   //     setError('Geolocation is not supported by your browser.');
//   //     return;
//   //   }
//   //   // Simulate your real location
//   //   setLocation({
//   //     latitude: 22.956992, // Your actual location
//   //     longitude: 79.188946, // Your actual location
//   //   });
  
//   //   // Uncomment below to use real geolocation once fixed
//   //   /*
//   //   navigator.geolocation.getCurrentPosition(
//   //     (position) => {
//   //       setLocation({
//   //         latitude: position.coords.latitude,
//   //         longitude: position.coords.longitude,
//   //       });
//   //     },
//   //     (err) => setError(err.message)
//   //   );
//   //   */
//   // }, []);


//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Earth's radius in km
//     const dLat = (lat2 - lat1) * (Math.PI / 180);
//     const dLon = (lon2 - lon1) * (Math.PI / 180);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(lat1 * (Math.PI / 180)) *
//         Math.cos(lat2 * (Math.PI / 180)) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c; // Distance in km
//   };

//   // const handleClockIn = async () => {
//   //   if (!location) {
//   //     setError('Location not available yet.');
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     const query = `
//   //       query {
//   //         hospitals {
//   //           id
//   //           latitude
//   //           longitude
//   //           radius
//   //         }
//   //       }
//   //     `;
//   //     const { hospitals } = await request('http://localhost:3000/api/graphql', query);

//   //     let withinPerimeter = false;
//   //     for (const hospital of hospitals) {
//   //       const distance = calculateDistance(
//   //         location.latitude,
//   //         location.longitude,
//   //         parseFloat(hospital.latitude),
//   //         parseFloat(hospital.longitude)
//   //       );
//   //       if (distance <= hospital.radius) {
//   //         withinPerimeter = true;
//   //         break;
//   //       }
//   //     }

//   //     if (!withinPerimeter) {
//   //       setError('You are not within 2 km of any hospital.');
//   //       setLoading(false);
//   //       return;
//   //     }

//   //     const mutation = `
//   //       mutation ($userId: String!, $startTime: String!, $latitude: Float!, $longitude: Float!, $note: String) {
//   //         createShift(userId: $userId, startTime: $startTime, latitude: $latitude, longitude: $longitude, note: $note) {
//   //           id
//   //           startTime
//   //         }
//   //       }
//   //     `;
//   //     const variables = {
//   //       userId: 'temp-user-id', // Replace with actual user ID later
//   //       startTime: new Date().toISOString(),
//   //       latitude: location.latitude,
//   //       longitude: location.longitude,
//   //       note: note || null,
//   //     };
//   //     await request('http://localhost:3000/api/graphql', mutation, variables);
//   //     alert('Clocked in successfully!');
//   //     setNote('');
//   //   } catch (err) {
//   //     setError(err.message);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleClockIn = async () => {
//     if (!location) {
//       setError('Location not available yet.');
//       return;
//     }
  
//     setLoading(true);
//     try {
//       const query = `
//         query {
//           hospitals {
//             id
//             latitude
//             longitude
//             radius
//           }
//         }
//       `;
//       const { hospitals } = await request('http://localhost:3000/api/graphql', query);
  
//       let withinPerimeter = false;
//       for (const hospital of hospitals) {
//         const distance = calculateDistance(
//           location.latitude,
//           location.longitude,
//           parseFloat(hospital.latitude),
//           parseFloat(hospital.longitude)
//         );
//         console.log(`Distance to ${hospital.id}: ${distance} km (Radius: ${hospital.radius} km)`);
//         if (distance <= hospital.radius) {
//           withinPerimeter = true;
//           break;
//         }
//       }
  
//       if (!withinPerimeter) {
//         setError('You are not within 5 km of any hospital.');
//         setLoading(false);
//         return;
//       }
  
//       const mutation = `
//         mutation ($userId: String!, $startTime: String!, $latitude: Float!, $longitude: Float!, $note: String) {
//           createShift(userId: $userId, startTime: $startTime, latitude: $latitude, longitude: $longitude, note: $note) {
//             id
//             startTime
//           }
//         }
//       `;
//       const variables = {
//         userId: 'temp-user-id',
//         startTime: new Date().toISOString(),
//         latitude: location.latitude,
//         longitude: location.longitude,
//         note: note || null,
//       };
//       await request('http://localhost:3000/api/graphql', mutation, variables);
//       alert('Clocked in successfully!');
//       setNote('');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleClockOut = async () => {
//     if (!location) {
//       setError('Location not available yet.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const mutation = `
//         mutation ($id: String!, $endTime: String!, $note: String) {
//           updateShift(id: $id, endTime: $endTime, note: $note) {
//             id
//             endTime
//           }
//         }
//       `;
//       const variables = {
//         id: 'temp-shift-id', // Replace with actual shift ID later
//         endTime: new Date().toISOString(),
//         note: note || null,
//       };
//       await request('http://localhost:3000/api/graphql', mutation, variables);
//       alert('Clocked out successfully!');
//       setNote('');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="text-center p-6 bg-gray-600 rounded-lg shadow-lg">
//         <h1 className="text-2xl font-bold mb-4">Clock In/Out</h1>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {location ? (
//           <p className="mb-4">
//             Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
//           </p>
//         ) : (
//           <p className="mb-4">Fetching location...</p>
//         )}
//         <input
//           type="text"
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           placeholder="Optional note"
//           className="mb-4 p-2 border rounded w-full"
//         />
//         <div className="space-x-4">
//           <button
//             onClick={handleClockIn}
//             disabled={loading}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
//           >
//             Clock In
//           </button>
//           <button
//             onClick={handleClockOut}
//             disabled={loading}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
//           >
//             Clock Out
//           </button>
//         </div>
//         <button
//           onClick={() => router.push('/')}
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Back to Home
//         </button>
//       </div>
//     </div>
//   );
// }







'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { request } from 'graphql-request';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function ClockPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [activeShiftId, setActiveShiftId] = useState(null);
  const router = useRouter();
  const { user, error: authError, isLoading: authLoading } = useUser();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (user) {
      checkActiveShift();
    }
  }, [user]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const checkActiveShift = async () => {
    if (!user) return;
    try {
      const query = `
        query ($userId: String!) {
          shifts(where: { userId: $userId, endTime: null }) {
            id
          }
        }
      `;
      const variables = { userId: user.sub };
      const { shifts } = await request('http://localhost:3000/api/graphql', query, variables);
      if (shifts.length > 0) {
        setActiveShiftId(shifts[0].id);
      }
    } catch (err) {
      console.error('Error checking active shift:', err);
    }
  };

  const handleClockIn = async () => {
    if (!user) {
      setError('Please log in first.');
      return;
    }
    if (!location) {
      setError('Location not available yet.');
      return;
    }
    if (activeShiftId) {
      setError('You are already clocked in.');
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
      const { hospitals } = await request('http://localhost:3000/api/graphql', query);

      let withinPerimeter = false;
      for (const hospital of hospitals) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(hospital.latitude),
          parseFloat(hospital.longitude)
        );
        console.log(`Distance to ${hospital.id}: ${distance} km (Radius: ${hospital.radius} km)`);
        if (distance <= hospital.radius) {
          withinPerimeter = true;
          break;
        }
      }

      if (!withinPerimeter) {
        setError('You are not within 5 km of any hospital.');
        setLoading(false);
        return;
      }

      const mutation = `
        mutation ($userId: String!, $startTime: String!, $latitude: Float!, $longitude: Float!, $note: String) {
          createShift(userId: $userId, startTime: $startTime, latitude: $latitude, longitude: $longitude, note: $note) {
            id
            startTime
          }
        }
      `;
      const variables = {
        userId: user.sub, // Auth0 user ID
        startTime: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        note: note || null,
      };
      const { createShift } = await request('http://localhost:3000/api/graphql', mutation, variables);
      setActiveShiftId(createShift.id);
      alert('Clocked in successfully!');
      setNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) {
      setError('Please log in first.');
      return;
    }
    if (!location) {
      setError('Location not available yet.');
      return;
    }
    if (!activeShiftId) {
      setError('You are not clocked in.');
      return;
    }

    setLoading(true);
    try {
      const mutation = `
        mutation ($id: String!, $endTime: String!, $note: String) {
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
      await request('http://localhost:3000/api/graphql', mutation, variables);
      setActiveShiftId(null);
      alert('Clocked out successfully!');
      setNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div>Loading authentication...</div>;
  if (authError) return <div>Error: {authError.message}</div>;
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <a href="/api/auth/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Clock In/Out</h1>
        <p className="mb-2">Welcome, {user.name}!</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {location ? (
          <p className="mb-4">
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        ) : (
          <p className="mb-4">Fetching location...</p>
        )}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
          className="mb-4 p-2 border rounded w-full"
        />
        <div className="space-x-4">
          <button
            onClick={handleClockIn}
            disabled={loading || activeShiftId}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !activeShiftId}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            Clock Out
          </button>
        </div>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}