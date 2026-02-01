"use client";

import * as React from "react";
import { getAllTimezones } from "countries-and-timezones";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";

// Format timezone offset in GMT format
function formatOffset(offset: number): string {
  const hours = Math.floor(Math.abs(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset >= 0 ? "+" : "-";
  return `GMT${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

interface TimezoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimezoneSelector({ value, onChange }: TimezoneSelectorProps) {
  // Get all timezones and format them
  const timezones = React.useMemo(() => {
    const allTimezones = getAllTimezones();
    return Object.entries(allTimezones)
      .map(([id, tz]) => ({
        id,
        name: tz.name,
        offset: tz.utcOffset,
        displayName: `${tz.name.replace(/_/g, " ")} (${formatOffset(
          tz.utcOffset
        )})`,
      }))
      .sort((a, b) => a.offset - b.offset);
  }, []);

  return (
    <Field>
      <FieldLabel>Timezone</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {timezones.map((tz) => (
            <SelectItem key={tz.id} value={tz.id}>
              {tz.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

// Hook to get user's current timezone
export function useUserTimezone(): string {
  return React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }, []);
}
