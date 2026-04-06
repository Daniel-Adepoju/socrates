// "use client"

// import { useParams } from "next/navigation"

import { getBookBySlug } from "@/lib/actions/book.actions"
import VapiContorls from "@/components/VapiContorls"
// import { Button } from "@/components/ui/button"

const SingleBook = async ({ params }: any) => {
  const { slug } = await params
  const getBook = await getBookBySlug(slug as string)
  const book = getBook.success && getBook.data ? getBook.data : null

  return (
    <div className="wrapper  md:w-[90%] lg:w-[60%] mx-auto mt-22 pb-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
     
     
       <VapiContorls book={book}/>
      </div>
    </div>
  )
}

export default SingleBook
