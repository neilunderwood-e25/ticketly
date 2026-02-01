"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ImageCropDialog } from "./image-crop-dialog";

interface ImageUploadProps {
  value: File | null;
  preview: string | null;
  onChange: (file: File | null, preview: string | null) => void;
}

export function ImageUpload({ value, preview, onChange }: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [tempImageSrc, setTempImageSrc] = React.useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = React.useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl: string, croppedImageFile: File) => {
    onChange(croppedImageFile, croppedImageUrl);
    setTempImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropCancel = () => {
    setShowCropDialog(false);
    setTempImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Field>
        <div className="space-y-4">
          {preview ? (
            <div className="relative w-[264px] h-[264px] rounded-lg overflow-hidden border border-input">
              <img
                src={preview}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-[264px] h-[264px] rounded-lg border-2 border-dashed border-input hover:border-ring transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 bg-background px-4"
            >
              <Upload className="h-10 w-10 text-gray-700 dark:text-gray-200" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Click to upload
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-200 opacity-60">
                  PNG, JPG or WEBP (max. 5MB)
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-200 opacity-60">
                  Will be cropped to 400x400
                </p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </Field>

      {tempImageSrc && (
        <ImageCropDialog
          open={showCropDialog}
          imageSrc={tempImageSrc}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
