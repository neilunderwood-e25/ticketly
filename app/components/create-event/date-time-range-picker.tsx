"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker, TimeValue } from "./time-picker";

interface DateTimeRangePickerProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  timeFrom: TimeValue;
  timeTo: TimeValue;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onTimeFromChange: (time: TimeValue) => void;
  onTimeToChange: (time: TimeValue) => void;
}

export function DateTimeRangePicker({
  dateFrom,
  dateTo,
  timeFrom,
  timeTo,
  onDateFromChange,
  onDateToChange,
  onTimeFromChange,
  onTimeToChange,
}: DateTimeRangePickerProps) {
  const [openFrom, setOpenFrom] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);

  return (
    <Field>
      <FieldLabel>Event Date & Time</FieldLabel>
      <div className="flex w-full flex-col gap-6">
        {/* Start Date & Time */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-3">
            <FieldLabel htmlFor="date-from" className="px-1 text-xs">
              Start Date
            </FieldLabel>
            <Popover open={openFrom} onOpenChange={setOpenFrom}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-from"
                  className="w-full justify-between font-normal"
                >
                  {dateFrom
                    ? dateFrom.toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    onDateFromChange(date);
                    setOpenFrom(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <FieldLabel htmlFor="time-from" className="px-1 text-xs">
              Start Time
            </FieldLabel>
            <TimePicker id="time-from" value={timeFrom} onChange={onTimeFromChange} />
          </div>
        </div>

        {/* End Date & Time */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-3">
            <FieldLabel htmlFor="date-to" className="px-1 text-xs">
              End Date
            </FieldLabel>
            <Popover open={openTo} onOpenChange={setOpenTo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-to"
                  className="w-full justify-between font-normal"
                >
                  {dateTo
                    ? dateTo.toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    onDateToChange(date);
                    setOpenTo(false);
                  }}
                  disabled={dateFrom ? { before: dateFrom } : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <FieldLabel htmlFor="time-to" className="px-1 text-xs">
              End Time
            </FieldLabel>
            <TimePicker id="time-to" value={timeTo} onChange={onTimeToChange} />
          </div>
        </div>
      </div>
    </Field>
  );
}
