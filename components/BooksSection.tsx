import { sampleBooks } from "@/lib/constants"
import BookCard from "./BookCard"

const BooksSection = () => {
  return (
    <section className="wrapper mx-auto py-12">
      <h2 className="mb-6 text-2xl font-bold tracking-widest text-yellow-700">Your List</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 place-items-center  px-2">
        {sampleBooks.map((book,index) => (
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
