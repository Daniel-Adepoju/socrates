"use client";

import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useRef } from "react";

interface FileUploaderProps {
  field: any; // comes from RHF Controller
  fieldState?: any; // contains error info
  label: string;
  accept: string;
  isSubmitting?: boolean;
}

export default function FileUploader({
  field,
  fieldState,
  label,
  accept,
  isSubmitting,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Field>
      <FieldLabel className="text-brown">{label}</FieldLabel>

      <div
        onClick={() => !isSubmitting && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted transition ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <p className="text-sm text-gray-600">
          {field.value?.[0]?.name ?? `Click to upload ${label.toLowerCase()}`}
        </p>

        <Input
          type="file"
          accept={accept}
          ref={inputRef}
          className="hidden"
          multiple={false}
          onChange={(e) => {
            const file = e?.target?.files; // safe null fallback
            field.onChange(file);
            console.log("Selected file:", field);
          }}
          disabled={isSubmitting}
        />
      </div>

      {fieldState?.error && <FieldError>{fieldState.error.message}</FieldError>}
    </Field>
  );
}