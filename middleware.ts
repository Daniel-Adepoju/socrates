import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware()

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // match all routes except static files
  ],
}
