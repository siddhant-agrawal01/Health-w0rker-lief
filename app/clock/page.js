// app/clock/page.js
"use client";
import ClientClockComponent from "./ClientClockComponent";

export default function ClockPage() {
  // Remove the container div entirely since ClientClockComponent
  // already has its own professional layout
  return <ClientClockComponent />;
}
