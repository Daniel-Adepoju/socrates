"use client"

import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative m-0 p-0 min-w-full min-h-[70vh] rounded overflow-hidden bg-yellow-800 text-white py-20">
      
      {/* subtle gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,390,0,0.15),transparent_80%)]" />

      <div className="wrapper relative mx-auto grid gap-12 lg:grid-cols-3">
        
        {/* LEFT */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Your <span className="text-yellow-500 ml-1">Library</span>
          </h1>

          <p className="text-base md:text-lg text-gray-300 max-w-md">
            Store, search, and interact with your PDFs using AI.
          </p>

          <div className="flex gap-4">
            <Link
              href="/books/add-new"
              className="rounded-lg bg-yellow-600 px-6 py-3 text-sm font-semibold text-white hover:bg-yellow-500 transition shadow-lg shadow-yellow-500/20"
            >
              Add Book
            </Link>

            <Link
              href="/library"
              className="rounded-lg border border-white/10 px-6 py-3 text-sm text-gray-300 hover:bg-white/5 transition"
            >
              View Library
            </Link>
          </div>
        </div>

        {/* CENTER (Book Card) */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-80 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            
            {/* glow */}
            <div className="absolute -inset-1 bg-linear-to-br from-yellow-500/20 to-transparent blur-xl opacity-60" />

            <div className="relative h-full p-6 flex flex-col justify-between">
              <div className="h-2 w-16 bg-white/80 rounded" />

              <div className="space-y-2">
                <div className="h-3 w-28 bg-white/60 rounded"></div>
                <div className="h-3 w-24 bg-white/60 rounded"></div>
                <div className="h-3 w-20 bg-white/60 rounded"></div>
              </div>

              <div className="h-4 w-20 bg-yellow-400 rounded" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-gray-200">
            How it works
          </h2>

          <div className="space-y-4">
            {[
              "Upload your PDF",
              "AI processes & indexes content",
              "Chat with your documents"
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm list-style">{step}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}