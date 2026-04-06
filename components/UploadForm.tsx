"use client"

import { useRef, useState, useEffect } from "react"
import { useForm, Controller, appendErrors } from "react-hook-form"
import { file, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import FileUploader from "@/components/FileUploader"
import VoiceSelector from "@/components/VoiceSelector"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { checkBookExists, createBook, saveBookSegments } from "@/lib/actions/book.actions"
import { useRouter } from "next/navigation"
import { parsePDFFile } from "@/lib/utils"
import { upload } from "@vercel/blob/client"
import {DEFAULT_VOICE, voiceOptions} from "@/lib/constants"

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  author: z.string().min(2, "Author is required"),
  persona: z.string(),
  pdfFile: z
    .any()
    .refine((file) => file?.length === 1, "PDF is required")
    .refine((file) => file?.[0]?.size <= 50 * 1024 * 1024, "Max file size is 50MB"),
  coverImage: z.any().optional(),
})

export default function AddBookPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { userId } = useAuth()
  const router = useRouter()
  useEffect(() => setIsMounted(true), [])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      persona: DEFAULT_VOICE, 
      // capitalize default voice,
    },
  })

  const onSubmit = async (data: any) => {
    if (!userId) {
      return toast.error("You must be logged in to upload.")
    }

    setIsSubmitting(true)
    // posthog = track actions
    console.log("Submitting...", data)

    try {
      // check if book with same title already exists
      const existsCheck = await checkBookExists(data.title)
      if (existsCheck.exists && existsCheck.book) {
        toast.info("A book with the same title already exists.")
        reset()
        router.push(`/books/${existsCheck.book.slug}`)
        return
      }

      // If it doesn't exist, proceed with the upload and processing

      const fileTitle = data.title.replace(/\s+/g, "_").toLowerCase()
      const pdfFile = data.pdfFile[0]

      const parsedPDF = await parsePDFFile(pdfFile)

      if (parsedPDF.content.length === 0) {
        toast.error("Failed to parse PDF. Please try again with a different file.")
        setIsSubmitting(false)
        return
      }

      const uploadedPdfBlob = await upload(fileTitle + ".pdf", pdfFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: "application/pdf",
      })

      let coverUrl

      if (data.coverImage && data.coverImage.length > 0) {
        const coverFile = data.coverImage[0]
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: coverFile.type,
        })
        coverUrl = uploadedCoverBlob.url
      } else {
        const response = await fetch(parsedPDF.cover)
        const blob = await response.blob()
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: "image/png",
        })
        coverUrl = uploadedCoverBlob.url
      }

      // Create book in database
      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.persona,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        fileSize: pdfFile.size,
      })

      if (!book.success) {
        throw new Error(JSON.stringify(book.error))
      }
      if (book.alreadyExists) {
        toast.info("A book with the same title already exists.")
        reset()
        router.push(`/books/${book?.book?.slug || ""}`)
        return
      }

   const segments = await saveBookSegments(book.book._id, userId, parsedPDF.content)
      
   if (!segments.success) {
   toast.error("Failed to save book segments")
   throw new Error("Failed book segments")
      }
  reset()
  router.push(`/`)
  // router.push(`/book/${book.book.slug}`)
  
    } catch (e) {
      console.log("Error submitting form:", e)
      toast.error("An error occurred while processing your book. Please try again.")
    } finally {
      setIsSubmitting(false)
    }

  }

 

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-6 w-full">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-brown">Upload New Book</CardTitle>
          <CardDescription>Turn your book into an AI-powered audio experience.</CardDescription>
        </CardHeader>

        <CardContent>
          {isMounted && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* PDF */}
              <Controller
                name="pdfFile"
                control={control}
                render={({ field }) => (
                  <FileUploader
                    field={field}
                    label="Book PDF File"
                    accept="application/pdf"
                    isSubmitting={isSubmitting}
                  />
                )}
              />

              {/* Cover */}
              <Controller
                name="coverImage"
                control={control}
                render={({ field }) => (
                  <FileUploader
                    field={field}
                    label="Cover Image (Optional)"
                    accept="image/*"
                    isSubmitting={isSubmitting}
                  />
                )}
              />

              {/* Title */}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-brown">Title</FieldLabel>
                    <Input
                      {...field}
                      placeholder="e.g Rich Dad Poor Dad"
                      disabled={isSubmitting}
                    />
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
                    <Input
                      {...field}
                      placeholder="e.g Robert Kiyosaki"
                      disabled={isSubmitting}
                    />
                    {errors.author && <FieldError>{errors.author.message}</FieldError>}
                  </Field>
                )}
              />

              {/*persona */}
              <Controller
                name="persona"
                control={control}
                render={({ field }) => (
                  <VoiceSelector
                    field={field}
                    voiceOptions={voiceOptions}
                    isSubmitting={isSubmitting}
                  />
                )}
              />

              <Button
                type="submit"
                className="w-full bg-brown text-white py-6 text-lg rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Begin Processing"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
