"use client";

import { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import FileUploader from "@/components/FileUploader";
import VoiceSelector from "@/components/VoiceSelector";




// ==========================
// Schema
// ==========================
const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  author: z.string().min(2, "Author is required"),
  voice: z.string(),
  pdf: z
    .any()
    .refine((file) => file?.length === 1, "PDF is required")
    .refine((file) => file?.[0]?.size <= 50 * 1024 * 1024, "Max file size is 50MB"),
  cover: z.any().optional(),
});

// ==========================
// Main Page
// ==========================
export default function AddBookPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: "male1",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Submitting...", data);

    // simulate network request
    await new Promise((r) => setTimeout(r, 1500));

    console.log("Submitted:", data);
    setIsSubmitting(false);
  };

  const voices = [
    { id: "male1", label: "Male 1", description: "Deep and calm voice" },
    { id: "male2", label: "Male 2", description: "Bright and energetic" },
    { id: "male3", label: "Male 3", description: "Soft and warm tone" },
    { id: "female1", label: "Female 1", description: "Clear and friendly" },
    { id: "female2", label: "Female 2", description: "Smooth and calm" },
  ];

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-brown">
            Upload New Book
          </CardTitle>
          <CardDescription>
            Turn your book into an AI-powered audio experience.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isMounted && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* PDF */}
              <Controller
                name="pdf"
                control={control}
                render={({ field }) => <FileUploader field={field} label="Book PDF File" accept="application/pdf" isSubmitting={isSubmitting} />}
              />

              {/* Cover */}
              <Controller
                name="cover"
                control={control}
                render={({ field }) => <FileUploader field={field} label="Cover Image (Optional)" accept="image/*" isSubmitting={isSubmitting} />}
              />

              {/* Title */}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-brown">Title</FieldLabel>
                    <Input {...field} placeholder="e.g Rich Dad Poor Dad" disabled={isSubmitting} />
                    {errors.title && <FieldError>{errors.title.message}</FieldError>}
                  </Field>
                )}
              />

              {/* Author */}
              <Controller
                name="author"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-brown">Author</FieldLabel>
                    <Input {...field} placeholder="e.g Robert Kiyosaki" disabled={isSubmitting} />
                    {errors.author && <FieldError>{errors.author.message}</FieldError>}
                  </Field>
                )}
              />

              {/* Voice */}
              <Controller
                name="voice"
                control={control}
                render={({ field }) => <VoiceSelector field={field} voices={voices} isSubmitting={isSubmitting} />}
              />

              <Button type="submit" className="w-full bg-brown text-white py-6 text-lg rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Begin Processing"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}