
interface Book {
    _id:string,
    clerkId:string,
    title:string,
    slug?:string,
    author:string,
    persona?:string,
    fileUrl:string,
    fileSize:number,
    fileBlobkey?:string,
    coverURL?:string,
    coverBlobkey?:string,
    totalSegments?:number,
    createdAt:Date,
    updatedAt:Date
}

interface Message {
  role: "user" | "assistant"
  content: string
}