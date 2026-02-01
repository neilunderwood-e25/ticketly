"use client";

import { useEffect, useState } from "react";

export function CurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      // Get timezone offset in hours and minutes
      // getTimezoneOffset() returns offset in minutes, negative means ahead of UTC
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetMins = Math.abs(offsetMinutes) % 60;
      const offsetSign = offsetMinutes >= 0 ? "+" : "-";

      const timezoneString = `GMT${offsetSign}${offsetHours}:${String(offsetMins).padStart(2, "0")}`;
      setTime(`${hours}:${minutes} ${timezoneString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 pt-1">
      {time}
    </span>
  );
}
