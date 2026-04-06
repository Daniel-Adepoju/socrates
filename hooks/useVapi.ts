import { endVoiceSession, startVoiceSession } from "@/lib/actions/session.action"
import { DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constants"
import { getVoice } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import Vapi from "@vapi-ai/web"

import { useEffect, useRef, useState } from "react"

export type CallStatus =
  | "idle"
  | "connecting..."
  | "listening"
  | "starting"
  | "thinking"
  | "speaking"
  | "ended"
  | "error"

const useLatestRef = <T>(value: T) => {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}

const ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID || ""
const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_KEY || ""

let vapi: InstanceType<typeof Vapi>

const getVapi = () => {
  if (!vapi) {
    if (!VAPI_API_KEY) {
      throw new Error("VAPI API key is not set in environment variables.")
    }
    vapi = new Vapi(VAPI_API_KEY)
  }
  return vapi
}

export const useVapi = (book: Book) => {
  const { userId } = useAuth()
  //  todo: limit billing

  const [status, setStatus] = useState<CallStatus>("idle")
  const [messages, setMessages] = useState<any[]>([])
  const [currentMessage, setCurrentMessage] = useState<string>("")
  const [currentUserMessage, setCurrentUserMessage] = useState<string>("")
  const [duration, setDuration] = useState<number>(0)
  //   const [limitError, setLimitError] = useState<string | null>(null)
  const [customError, setCustomError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const isStoppingRef = useRef<boolean>(false)

  const bookRef = useLatestRef(book)
  const durationRef = useLatestRef(duration)
  const voice = book.persona || DEFAULT_VOICE

  const isActive =
    status === "listening" ||
    status === "thinking" ||
    status === "speaking" ||
    status === "starting"

  //* Limits
  //    const maxDurationRef = useLatestRef(limits.maxDuration * 60)

  //   Vapi Effects
  useEffect(() => {
    const vapi = getVapi()

    // 🟢 CALL START
    const handleCallStart = () => {
      isStoppingRef.current = false
      setStatus("starting")
      setCurrentMessage("")
      setCurrentUserMessage("")
      setDuration(0)

      startTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }

    //  CALL END
    const handleCallEnd = () => {
      setStatus("idle")
      setCurrentMessage("")
      setCurrentUserMessage("")
      if (startTimerRef.current) {
        clearInterval(startTimerRef.current)
      }
    }

    // 🎙 USER STARTS TALKING
    const handleSpeechStart = () => {
      if (!isStoppingRef.current) {
        setStatus("speaking")
      }
      // setCurrentUserMessage("")
    }

    // 🎙 USER STOPS TALKING (optional)
    const handleSpeechEnd = () => {
      if (!isStoppingRef.current) {
        setStatus("listening")
      }
    }

    //  MAIN MESSAGE HANDLER
    const handleMessage = (msg: any) => {
      /**
   Vapi 2026 message structure (strict roles):
   {
     role: "user" | "assistant",
     type: "transcript" | "response",
     transcript?: string,
     transcriptType?: "partial" | "final",
     response?: { output_text: string; finish_reason: "stop" | "continue" }
   }
  */

      // USER PARTIAL
      if (msg.role === "user" && msg.transcriptType === "partial") {
        setCurrentUserMessage(msg.transcript)
      }

      // USER FINAL
      if (msg.role === "user" && msg.transcriptType === "final") {
        setMessages((prev) => [...prev, { role: "user", content: msg.transcript }])
        setCurrentUserMessage("")
        setStatus("thinking") // AI is now generating response
        return
      }

      if (msg.role === "assistant" && msg.transcriptType === "partial") {
        setCurrentMessage(msg.transcript)
        return
      }

      if (msg.role === "assistant" && msg.transcriptType === "final") {
        setMessages((prev) => [...prev, { role: "assistant", content: msg.transcript }])
      }

    }
    //  ERROR
    const handleError = (e: any) => {
      console.error("Vapi error:", e)
      setCustomError("Something went wrong with the voice session.")
      setStatus("error")
    }

    // ✅ REGISTER
    vapi.on("call-start", handleCallStart)
    vapi.on("call-end", handleCallEnd)
    vapi.on("speech-start", handleSpeechStart)
    vapi.on("speech-end", handleSpeechEnd)
    vapi.on("message", handleMessage)
    vapi.on("error", handleError)

    // CLEANUP (SAFE)
    return () => {
      vapi.off("call-start", handleCallStart)
      vapi.off("call-end", handleCallEnd)
      vapi.off("speech-start", handleSpeechStart)
      vapi.off("speech-end", handleSpeechEnd)
      vapi.off("message", handleMessage)
      vapi.off("error", handleError)
    }
  }, [])

  const start = async () => {
    if (!userId) {
      setCustomError("You must be logged in to use this feature.")
      return
    }

    setCustomError(null)
    // setStatus("connecting")

    try {
      const result = await startVoiceSession(userId, book._id)
      if (!result.success) {
        setCustomError(result.error || "Session Limit Reached.")
        setStatus("idle")
        return
      }

      sessionIdRef.current = result.sessionId || null

      const firstMessage = `Hey, good to meet you. Quick question before we start have you read ${book.title} before?. Or are we starting afresh?`

      //   Vapi
      setStatus("connecting...")
      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: {
          author: book.author,
          title: book.title,
          bookId: book._id,
        },
        voice: {
         provider: "11labs",
            voiceId: getVoice(voice).id,
            model:"eleven_turbo_v2_5",
            stability: VOICE_SETTINGS.stability,
            similarityBoost: VOICE_SETTINGS.similarityBoost,
            style: VOICE_SETTINGS.style,
            useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
        },
      })
    } catch (e) {
      console.log("Error starting VAPI session:", e)
      setCustomError("Failed to start the session. Please try again.")
      if (sessionIdRef.current) {
         endVoiceSession(sessionIdRef.current,0).catch((endErr) => {
            console.log("Error ending session after failed start:", endErr) 
      })
      }
      sessionIdRef.current = null
      setStatus("idle")
    }
  }

  const stop = async () => {
    isStoppingRef.current = true
    await getVapi().stop()
    setStatus("idle")
  }

  const clearErrors = async () => {}

  return {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    // limitError,
    isActive,
    customError,
    start,
    stop,
    clearErrors,
    // maxDurationSeconds,
    // remainingSeconds,
    // showTimeWarning
  }
}

export default useVapi
