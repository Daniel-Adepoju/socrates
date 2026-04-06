// import { sampleBooks } from "@/lib/constants"
import { getAllBooks } from "@/lib/actions/book.actions"
import BookCard from "./BookCard"


const BooksSection = async () => {
   const bookResults = await getAllBooks()
   const books = bookResults.success && bookResults.data ? bookResults.data : []
  return (
    <section className="wrapper px-4 mx-auto py-12">
      <h2 className="w-50 text-center mb-6 mx-auto text-2xl font-bold tracking-widest text-yellow-700">Your List</h2>
      <div className="grid gap-8 xl:gap-60 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 place-items-center  px-2">
        {books.map((book,index) => (
          <BookCard
            key={book._id}
            book={book}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

export default BooksSection
