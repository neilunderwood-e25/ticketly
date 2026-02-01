"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";

interface EventVisibilitySelectorProps {
  value: "public" | "private";
  onChange: (value: "public" | "private") => void;
}

export function EventVisibilitySelector({
  value,
  onChange,
}: EventVisibilitySelectorProps) {
  return (
    <Field>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as "public" | "private")}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">
            Public
          </SelectItem>
          <SelectItem value="private">
            Private
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}
