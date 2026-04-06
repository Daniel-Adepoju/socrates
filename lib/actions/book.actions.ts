"use server"
import { connectToDatabase } from "@/app/database/mongoose"
import { escapeRegex, generateSlug, serializeData } from "../utils"
import Book from "@/app/database/models/book.model"
import BookSegment from "@/app/database/models/book-segment.model"
import mongoose from "mongoose"

// # Get Book Actions

export const getAllBooks = async () => {
  try {
    await connectToDatabase()
    const books = await Book.find().sort({ createdAt: -1 }).lean()
    return { success: true, data: serializeData(books) }
  } catch (e) {
    console.log("Error fetching books:", e)
    return { success: false, error: e instanceof Error ? serializeData(e) : "Unknown error" }
  }
}

export const getBookBySlug = async (slug: string) => {
  try {
    await connectToDatabase()
    const book = await Book.findOne({ slug }).lean()
    if (!book) {
      return { success: false, error: "Book not found" }
    }
    return { success: true, data: serializeData(book) }
  } catch (e) {
    console.log("Error fetching book by slug:", e)
    return { success: false, error: e instanceof Error ? serializeData(e) : "Unknown error" }
  }
}

// # Create Book Actions
export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase()
    const slug = generateSlug(title)
    const existingBook = await Book.findOne({ slug }).lean()
    return { exists: !!existingBook, book: existingBook ? serializeData(existingBook) : null }
  } catch (e) {
    console.log("Error checking book existence:", e)
    return { exists: false, error: serializeData(e) }
  }
}

export const createBook = async (data: any) => {
  try {
    await connectToDatabase()

    const slug = generateSlug(data.title)

    const existingBook = await Book.findOne({ slug }).lean()
    if (existingBook) {
      return {
        success: false,
        alreadyExists: true,
        book: serializeData(existingBook),
        error: "A book with the same slug already exists.",
      }
    }

    const book = new Book({
      ...data,
      slug: slug,
      totalSegments: 0,
    })

    await book.save()

    return { success: true, book: serializeData(book) }
  } catch (e) {
    console.log("Error creating book:", e)
    return { success: false, error: e instanceof Error ? serializeData(e) : "Unknown error" }
  }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: any[]) => {
  try {
    await connectToDatabase()
    // console.log("Saving book segments... ", segments)
    const segmentsToInsert = segments.map((segment: any) => ({
      bookId,
      clerkId,
      ...segment,
    }))
    await BookSegment.insertMany(segmentsToInsert)
    await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length })
    console.log("Book segments saved successfully.")
    return { success: true, data: { segmentsCreated: segments.length } }
  } catch (e) {
    console.log("Error saving book segments:", e)
    await BookSegment.deleteMany({ bookId, clerkId })
    await Book.deleteOne({ bookId, clerkId })
    console.log("Deleted book and segments due to error.")
    return { success: false, error: e instanceof Error ? serializeData(e) : "Unknown error" }
  }
}

export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
  try {
    await connectToDatabase()

    console.log(`Searching for: "${query}" in book ${bookId}`)

    const bookObjectId = new mongoose.Types.ObjectId(bookId)

    // Try MongoDB text search first (requires text index)
    let segments: Record<string, unknown>[] = []
    try {
      segments = await BookSegment.find({
        bookId: bookObjectId,
        $text: { $search: query },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean()
    } catch {
      // Text index may not exist — fall through to regex fallback
      segments = []
    }

    // Fallback: regex search matching ANY keyword
    if (segments.length === 0) {
      const keywords = query.split(/\s+/).filter((k) => k.length > 2)
      const pattern = keywords.map(escapeRegex).join("|")
      if (keywords.length === 0) {
        return {
          success: true,
          data: [],
        }
      }

      segments = await BookSegment.find({
        bookId: bookObjectId,
        content: { $regex: pattern, $options: "i" },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ segmentIndex: 1 })
        .limit(limit)
        .lean()
    }

    console.log(`Search complete. Found ${segments.length} results`)

    return {
      success: true,
      data: serializeData(segments),
    }
  } catch (error) {
    console.error("Error searching segments:", error)
    return {
      success: false,
      error: (error as Error).message,
      data: [],
    }
  }
}

// # Delete Book Actions
