import { Button } from "@/components/ui/button"
import HeroSection from "@/components/HeroSection"
import BooksSection from "@/components/BooksSection"

export const dynamic = "force-dynamic"

const Page = () => {
  return (
    <div className="mt-16">
      <HeroSection />
      <BooksSection/>
    </div>
  )
}

export default Page