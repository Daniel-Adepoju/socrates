"use client"

import useVapi from "@/hooks/useVapi"
import { DEFAULT_VOICE, voiceOptions } from "@/lib/constants"
import { Mic, MicOff, StopCircle } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef } from "react"

// const messages = [
//   {
//     role: "assistant",
//     content: "Hello 👋 I'm ready to talk about this book. What would you like to know?",
//   },
//   {
//     role: "user",
//     content: "Can you summarize the first chapter?",
//   },
//   {
//     role: "assistant",
//     content: "Sure! The first chapter introduces the main character and sets up the central conflict of the story.",
//   },
//   {
//     role: "user",
//     content: "What’s the main theme?",
//   },
//   {
//     role: "assistant",
//     content: "The main theme revolves around self-discovery and the struggle between tradition and personal freedom.",
//   },
//   {
//     role: "user",
//     content: "Give me a quick quote from it",
//   },
//   {
//     role: "assistant",
//     content: "“Sometimes the path forward is hidden in the stories we’re afraid to tell.”",
//   },
// ]

const VapiContorls = ({ book }: { book: Book }) => {
  const {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    isActive,
    customError,
    start,
    stop,
    clearErrors,
  } = useVapi(book)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const isEmpty = messages.length === 0

  const breakDownVoiceOptions = Object.values(voiceOptions).map((v: any) => ({
    id: v.id,
    label: v.name,
    description: v.description,
  }))

  const bookVoice = breakDownVoiceOptions.find((v) => v.id === book?.persona)?.label
  console.log(messages)
  return (
    <>
      {/* BOOK AREA */}
      <div className="bg-brown/20 rounded-2xl shadow-lg p-6 flex flex-col items-center relative">
        {/* Book Cover */}
        <div className="relative w-52 h-64 rounded-xl overflow-hidden shadow-md bg-gray-200">
          <Image
            src={book?.coverURL || "/placeholder-cover.png"}
            alt={`${book?.title || "Book"}' cover`}
            fill
            className="object-cover absolute inset-0"
          />
          <button
            onClick={isActive ? stop : start}
            disabled={status === "connecting..."}
            className={`flex items-center justify-center
    absolute bottom-1 -right-4 -translate-x-1/2
    p-3 rounded-full shadow-lg transition-all duration-300
    cursor-pointer text-white
bg-amber-700/70 hover:bg-amber-800`}
          >
            {isActive && (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-brown opacity-75 animate-ping"></span>
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-50 animate-pulse"></span>
              </>
            )}

            <span
              className={`
      relative z-10
      ${status === 'connecting...' && 'opacity-45'} 
      ${isActive ? "animate-bounce-fast" : ""}
    `}
            >
              {isActive ? <Mic size={20} /> : <MicOff size={20} />}
            </span>
          </button>
        </div>

        {/* Book Info */}
        <div className="mt-10 text-center space-y-2">
          <h2 className="text-xl font-bold text-yellow-900">{book?.title || "Book Title"}</h2>
          <p className="text-sm text-yellow-700">by {book?.author || "Author Name"}</p>
        </div>

        {/* Stats */}
        <div className="w-full flex flex-wrap gap-3 items-center justify-around mt-6  py-2 rounded-lg text-xs md:text-xs text-yellow-800">
          <div className={`
          ${status === "listening" ? "bg-yellow-200" : status === "thinking" ? "bg-yellow-300" : status === "speaking" ? "bg-yellow-400" : "bg-white"}
          rounded-sm p-2 px-4 flex items-center gap-1 font-semibold`}>
            {" "}
            <StopCircle size={20} /> <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </div>
          <div className=" bg-white rounded-sm p-2 px-4 flex items-center gap-1 font-semibold">
            <span> Voice: </span>
            <span>{bookVoice}</span>
          </div>
          <div className=" bg-white rounded-sm p-2 px-4 flex items-center gap-1 font-semibold">
            <span>0:00 /</span> <span>15:00 </span>
          </div>
        </div>

        {/* Progress bar */}
        {/* <div className="w-full h-2 bg-yellow-200 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-yellow-600"></div>
            </div> */}

        {/* Error Display */}
        {customError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {customError}
          </div>
        )}
      </div>

      {/* TRANSCRIPT AREA */}
      <div className="lg:col-span-1 bg-slate-100/40 rounded-2xl shadow-md p-6 pr-2 flex flex-col h-[500px]">
        {/* 🟡 EMPTY STATE */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="bg-amber-700/60 p-6 rounded-full shadow-md mb-4">
              <Mic
                className="text-white"
                size={32}
              />
            </div>

            <h3 className="text-lg font-bold text-yellow-900">No conversation yet</h3>

            <p className="text-sm text-yellow-700 mt-2">
              Click the mic on the book cover to start talking
            </p>
          </div>
        ) : (
          <>
            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2    transcript-messages">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user"

                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                      max-w-[75%] px-4 py-3 text-sm shadow-md
                      ${
                        isUser
                          ? "bg-amber-900/80 text-white rounded-2xl rounded-br-md"
                          : "bg-brown/20 text-yellow-900 rounded-2xl rounded-bl-md"
                      }
                    `}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}

              {/* 👇 scroll anchor */}
              <div ref={bottomRef} />
            </div>

            {/* INPUT / MIC AREA */}
            <div className="pt-4 flex justify-center">
              <button className="bg-amber-700 hover:bg-amber-800 text-white p-4 rounded-full shadow-lg transition">
                <Mic size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default VapiContorls
