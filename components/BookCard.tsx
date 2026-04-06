"use client"

import Link from "next/link"
import Image from "next/image"
import type { Book } from "@/lib/constants"

type BookCardProps = {
  book: Book
  index: number
}

const BookCard = ({ book, index }: BookCardProps) => {
  const hasCover = Boolean(book.coverURL)

  return (
    <article className="w-60 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-200/50 p-4 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-2xl">
      <Link href={`/books/${book.slug}`} className="block">
        
        {/* COVER */}
        <div
          className="relative h-48 w-full overflow-hidden rounded-lg"
        >
          {hasCover ? (
            <Image
              src={book.coverURL}
              alt={`${book.title} cover`}
              fill
            // width={100}
            // height={100}
              className="object-cover transition-transform duration-300 group-hover:scale-99"
              sizes="(max-width: 768px) 100vw, 300px"
              priority={index < 4} // preload first few
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center px-4">
              <span className="text-sm font-bold text-slate-600">
                No Cover Available
              </span>
            </div>
          )}

          {/* subtle overlay for readability */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* TEXT */}
        <div className="mt-4 space-y-1">
          <h3 className="text-lg text-center font-semibold text-slate-600 line-clamp-1">
            {book.title}
          </h3>
          <p className="text-sm text-center text-slate-500 line-clamp-1">
            by {book.author}
          </p>
        </div>
      </Link>

      {/* FOOTER */}
      <div className="ml-auto mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-600 font-bold">
          #{index + 1}
        </span>
      </div>
    </article>
  )
}

export default BookCard