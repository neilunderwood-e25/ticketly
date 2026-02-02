"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { createEvent, uploadEventImage } from "../actions/events";
import { useToast } from "@/hooks/use-toast";

export default function CreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [eventName, setEventName] = React.useState("");
  const [eventDescription, setEventDescription] = React.useState("");
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleImageChange = (file: File | null, preview: string | null) => {
    setEventImage(file);
    setImagePreview(preview);
  };

  const convertTimeToDate = (date: Date, time: TimeValue): Date => {
    const newDate = new Date(date);
    let hour = parseInt(time.hour);
    if (time.period === "PM" && hour !== 12) hour += 12;
    if (time.period === "AM" && hour === 12) hour = 0;
    newDate.setHours(hour, parseInt(time.minute), 0, 0);
    return newDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!eventName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event name",
        variant: "destructive",
      });
      return;
    }

    if (!dateFrom || !dateTo) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if provided
      let imageUrl: string | undefined;
      if (eventImage) {
        const formData = new FormData();
        formData.append("file", eventImage);
        const uploadResult = await uploadEventImage(formData);

        if (!uploadResult.success) {
          toast({
            title: "Error",
            description: uploadResult.error || "Failed to upload image",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        imageUrl = uploadResult.data?.url;
      }

      // Combine date and time
      const startDateTime = convertTimeToDate(dateFrom, timeFrom);
      const endDateTime = convertTimeToDate(dateTo, timeTo);

      // Create event
      const result = await createEvent({
        name: eventName,
        description: eventDescription || undefined,
        image_url: imageUrl,
        visibility: eventVisibility,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        timezone,
      });

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to create event",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      // Redirect to events page
      router.push("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="max-w-[1024px] px-4 mx-auto">
        <div className="pt-[60px]">
          <form onSubmit={handleSubmit}>
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
                      <Input
                        type="text"
                        placeholder="Enter event name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                      />
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
                    <Textarea
                      placeholder="Enter event description"
                      rows={4}
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                    />
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
                    <Button
                      type="submit"
                      value="default"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </div>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    </main>
  );
}
