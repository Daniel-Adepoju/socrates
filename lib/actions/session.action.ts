"use server"

import VoiceSession from "@/app/database/models/voice-session.model"
import { connectToDatabase } from "@/app/database/mongoose"
import { getBillingPeriodStart } from "../subscription-constants"

export const startVoiceSession = async (clerkId: string, bookId: string) => {
  try {
    await connectToDatabase()
    // todo: limit based on billing plan

    const session = await VoiceSession.create({
      clerkId,
      bookId,
      startedAt: new Date(),
      durationSeconds: 0,
      billingPeriodStart: getBillingPeriodStart(),
    })
    return {
      success: true,
      sessionId: session._id.toString(),
      //  maxDurationMinutes:60
    }
  } catch (e) {
    console.log("Error starting Voice session:", e)
    return { success: false, error: "Failed to start the session. Please try again." }
  }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number) => {
  try {
    await connectToDatabase()
    const session = await VoiceSession.findByIdAndUpdate(
      sessionId,
      { endedAt: new Date(), durationSeconds },
      { new: true },
    )

    if (!session) {
      return { success: false, error: "Session not found." }
    }

    return { success: true, sessionId: session._id.toString() }
  } catch (e) {
    console.log("Error ending Voice session:", e)
    return { success: false, error: "Failed to end the session. Please try again." }
  }
}
