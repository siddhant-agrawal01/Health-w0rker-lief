// app/clock/page.js
'use client'
import ClientClockComponent from './ClientClockComponent';

export default function ClockPage() {
  return (
    <div className="flex justify-center items-center  h-screen">
      <div className="text-center  w-full rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Clock In/Out</h1>
        <ClientClockComponent />
      </div>
    </div>
  );
}