import { MAX_FILE_SIZE } from "@/lib/constants"
import { auth } from "@clerk/nextjs/server"
import { handleUpload, HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
  const body = (await req.json()) as HandleUploadBody
  try {
    const jsonResponse = await handleUpload({
      token: process.env.socratesBlob_READ_WRITE_TOKEN!,
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        const { userId } = await auth()
        if (!userId) {
          throw new Error("Unauthorized: User not authenticated")
        }
        return {
          allowedContentTypes: [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_FILE_SIZE,
          tokenPayload: JSON.stringify({ userId }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("File Upload completed:", blob.url)
        const payload = tokenPayload ? JSON.parse(tokenPayload) : null
        const userId = payload?.userId
        // todo: posthog
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (e) {
    console.log("Error in upload route:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
