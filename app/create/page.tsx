"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  ImageUpload,
  EventVisibilitySelector,
  DateTimeRangePicker,
  TimezoneSelector,
  useUserTimezone,
  TimeValue,
} from "../components/create-event";

export default function CreateEventPage() {
  // Form state
  const [eventImage, setEventImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [eventVisibility, setEventVisibility] = React.useState<"public" | "private">("public");
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [timeFrom, setTimeFrom] = React.useState<TimeValue>({
    hour: "10",
    minute: "00",
    period: "AM",
  });
  const [timeTo, setTimeTo] = React.useState<TimeValue>({
    hour: "12",
    minute: "00",
    period: "PM",
  });

  const userTimezone = useUserTimezone();
  const [timezone, setTimezone] = React.useState(userTimezone);

  const handleImageChange = (file: File | null, preview: string | null) => {
    setEventImage(file);
    setImagePreview(preview);
  };

  return (
    <main>
      <div className="max-w-[1024px] px-4 mx-auto">
        <div className="pt-[60px]">
          <FieldGroup>
            <div className="grid grid-cols-[264px_1fr] gap-6">
              {/* Left Column - Image Upload */}
              <div>
                <ImageUpload
                  value={eventImage}
                  preview={imagePreview}
                  onChange={handleImageChange}
                />
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_200px]  gap-2">
                  {/* Event Name */}
                  <Field>
                    <FieldLabel>Event Name</FieldLabel>
                    <Input type="text" placeholder="Enter event name" />
                  </Field>
                  <div className="flex items-end">
                    {/* Event Visibility */}
                    <EventVisibilitySelector
                      value={eventVisibility}
                      onChange={setEventVisibility}
                    />
                  </div>
                </div>
                {/* Event Description */}
                <Field>
                  <FieldLabel>Event Description</FieldLabel>
                  <Textarea placeholder="Enter event description" rows={4} />
                </Field>

                {/* Date & Time Range */}
                <DateTimeRangePicker
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  timeFrom={timeFrom}
                  timeTo={timeTo}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                  onTimeFromChange={setTimeFrom}
                  onTimeToChange={setTimeTo}
                />

                {/* Timezone */}
                <TimezoneSelector value={timezone} onChange={setTimezone} />

                {/* Action Buttons */}
                <div className="flex justify-end pt-4">
                  <Button value="default" className="w-full">Create Event</Button>
                </div>
              </div>
            </div>
          </FieldGroup>
        </div>
      </div>
    </main>
  );
}
